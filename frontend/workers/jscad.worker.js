/**
 * jscad.worker.js - WebWorker 中执行 jsCAD 代码并序列化几何数据
 * 注意：此文件为纯 JS，不使用 TS，放在 public/workers/ 供独立加载
 */

// Worker 接收消息：{ requestId, code }
self.onmessage = function (e) {
  const { requestId, code } = e.data

  try {
    const startTime = performance.now()

    // 1. 提取 jsCAD 代码（去掉 markdown 代码块包裹）
    const cleanCode = extractCode(code)

    // 2. 构建执行环境（模拟 require）
    const geometry = executeJscad(cleanCode)

    // 3. 三角化并序列化为分组数据（支持 colorize 多色）
    const { groups, triangleCount, hasColorize, warning } = serializeGeometry(geometry)

    const elapsed = performance.now() - startTime

    // 4. 零拷贝传输 Transferable Objects（每组的 positions/normals/indices buffer）
    const transferables = groups.flatMap(g => {
      const bufs = [g.positions.buffer, g.normals.buffer]
      if (g.indices) bufs.push(g.indices.buffer)
      return bufs
    })
    self.postMessage(
      {
        requestId,
        success: true,
        groups,
        triangleCount,
        hasColorize,
        elapsed,
        warning,
      },
      transferables,
    )
  } catch (err) {
    self.postMessage({
      requestId,
      success: false,
      error: err.message || String(err),
    })
  }
}

// 自动修复截断的代码：补全未闭合的花括号和 module.exports
function autoRepairTruncatedCode(code) {
  // 统计未匹配的左花括号
  let depth = 0
  let inString = false
  let strChar = ''
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < code.length; i++) {
    const ch = code[i]
    const next = code[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      continue
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++ }
      continue
    }
    if (inString) {
      if (ch === '\\') { i++; continue }
      if (ch === strChar) inString = false
      continue
    }
    if (ch === '/' && next === '/') { inLineComment = true; continue }
    if (ch === '/' && next === '*') { inBlockComment = true; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue }
    if (ch === '{') depth++
    if (ch === '}') depth--
  }

  // 花括号未闭合，说明代码被截断
  if (depth > 0) {
    // 追加缺失的闭合花括号
    code = code + '\n' + '}'.repeat(depth)
  }

  // 再次检查 module.exports
  if (/function\s+main\s*\(/.test(code) && !/module\.exports/.test(code)) {
    code = code + '\n\nmodule.exports = { main }'
  }

  return code
}

function extractCode(rawCode) {
  let code = rawCode || ''

  // 1. 去除 Markdown 代码块包裹（```javascript ... ``` 或 ```js ... ```）
  const fenceMatch = code.match(/```(?:javascript|js|typescript|ts)?\s*\n?([\s\S]*?)```/)
  if (fenceMatch) {
    code = fenceMatch[1]
  } else {
    // AI 截断时只有开头 ``` 没有结尾，手动去除开头的 fence 标记
    const openFence = code.match(/^```(?:javascript|js|typescript|ts)?\s*\n?/)
    if (openFence) code = code.slice(openFence[0].length)
  }

  code = code.trim()

  // 2. 去除开头可能残留的语言标识
  code = code.replace(/^(?:javascript|js)\s*\n/, '')

  // 3. 移除所有 require('@jscad/modeling') 的导入声明
  //    Worker 已将所有 API 函数注入为全局变量，无需 require，重复声明会导致
  //    "Identifier 'xxx' has already been declared" 错误
  //
  //    匹配模式示例：
  //      const { cuboid, sphere } = require('@jscad/modeling').primitives
  //      const transforms = require('@jscad/modeling').transforms
  //      const jscad = require('@jscad/modeling')
  code = code.replace(
    /^[ \t]*(?:const|let|var)\s+(?:\{[^}]*\}|\w+)\s*=\s*require\s*\(\s*['"]@jscad\/modeling[^'"]*['"]\s*\)[^\n]*\n?/gm,
    ''
  )
  // 处理多行解构（开头花括号在同一行，闭括号在下一行）
  code = code.replace(
    /^[ \t]*(?:const|let|var)\s*\{[\s\S]*?\}\s*=\s*require\s*\(\s*['"]@jscad\/modeling[^'"]*['"]\s*\)[^\n]*\n?/gm,
    ''
  )

  // 4. 处理 ES module 风格 export：export function main => function main + module.exports
  if (/export\s+(?:default\s+)?function\s+main/.test(code)) {
    code = code.replace(/export\s+default\s+function\s+main/, 'function main')
    code = code.replace(/export\s+function\s+main/, 'function main')
    if (!/module\.exports/.test(code)) {
      code = code + '\n\nmodule.exports = { main }'
    }
  }

  // 5. 处理 export default { main } 风格
  if (/export\s+default\s+\{/.test(code)) {
    code = code.replace(/export\s+default\s+(\{[^}]*\})/, 'module.exports = $1')
  }

  // 6. 如果有 function main 但缺少 module.exports，自动补全
  const hasMainFn = /function\s+main\s*\(/.test(code)
  const hasExport = /module\.exports\s*=/.test(code) || /exports\.main\s*=/.test(code)
  if (hasMainFn && !hasExport) {
    code = code + '\n\nmodule.exports = { main }'
  }

  // 7. AI 输出截断自动修复：检测代码中括号/花括号是否闭合
  //    如果未闭合（说明代码被截断），尝试追加缺失的闭合括号
  code = autoRepairTruncatedCode(code)

  // 8. 将所有 const / let 转为 var，避免 AI 生成代码因声明顺序问题导致
  //    "Cannot access 'xxx' before initialization" (TDZ 暂时性死区错误)
  //    var 有变量提升，在 JSCAD 执行沙箱中完全安全
  code = code.replace(/^([ \t]*)(const|let)\b/gm, '$1var')
  
  // 9. 检测并修复「局部变量名与注入函数同名」的覆盖问题
  //    例如：var sphere = sphere({ radius: 50 }) 执行后，sphere 变为几何体对象，
  //    后续调用 sphere({...}) 报 "sphere is not a function"
  //    修复：将冲突变量名在「非函数调用」位置全部替换为带前缀的别名
  var INJECTED_NAMES = [
    'sphere','cylinder','cuboid','cone','torus','ellipsoid',
    'union','subtract','intersect',
    'translate','rotate','scale','mirror','center',
    'rotateX','rotateY','rotateZ','translateX','translateY','translateZ',
    'extrudeLinear','extrudeRotate','linearExtrude','rotateExtrude','extrudeHelical',
    'colorize','stack','text3d','degToRad','radToDeg',
    'geodesicSphere','roundedCuboid','roundedCylinder','cylinderElliptic',
    'parametricSurface','kleinBottle','mobiusStrip','torusKnot',
    'polygon','arc','circle','rectangle','star','triangle','line',
  ]
  var shadowedNames = new Set()
  code.replace(/^[ \t]*var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm, function(_, name) {
    if (INJECTED_NAMES.indexOf(name) !== -1) shadowedNames.add(name)
  })
  shadowedNames.forEach(function(name) {
    var alias = '_g_' + name + '_'
    // 只替换「不是函数调用」的位置：name 后面不紧跟 ( 的都是变量引用
    code = code.replace(new RegExp('\\b' + name + '\\b(?!\\s*\\()', 'g'), alias)
  })
  
  return code
}

function executeJscad(code) {
  // 内置 jscad 基础几何 API（内联实现，无需 npm 包）
  const jscadApi = buildJscadApi()

  const moduleObj = { exports: {} }
  const require = (name) => {
    if (name === '@jscad/modeling') return jscadApi
    if (name.startsWith('@jscad/modeling/')) {
      const subPath = name.replace('@jscad/modeling/', '')
      const parts = subPath.split('/')
      let obj = jscadApi
      for (const part of parts) {
        if (obj && obj[part]) obj = obj[part]
      }
      return obj
    }
    // 容错：忽略未知模块
    return {}
  }

  // ──────────────────────────────────────────────────────────
  // 将所有 API 函数注入为沙箱全局变量
  // 无论 AI 是否写 require，这些函数都能直接调用
  // ──────────────────────────────────────────────────────────
  const { primitives, booleans, transforms, extrusions, maths, colors, expansions } = jscadApi
  const stack = jscadApi.stack
  const text3d = jscadApi.text3d

  // 几何原语
  const { cuboid, sphere, cylinder, cone, torus, cylinderElliptic,
          roundedCuboid, roundedCylinder, geodesicSphere, polygon,
          ellipsoid, line, arc, circle, rectangle, star, triangle,
          parametricSurface, kleinBottle, mobiusStrip, torusKnot } = primitives

  // 布尔运算
  const { union, subtract, intersect } = booleans

  // 变换
  const { translate, rotate, scale, mirror, center,
          rotateX, rotateY, rotateZ,
          translateX, translateY, translateZ } = transforms

  // 拉伸
  const { extrudeLinear, extrudeRotate, extrudeHelical } = extrusions
  // OpenSCAD 风格别名（AI 常用）
  const linearExtrude = extrudeLinear
  const rotateExtrude = extrudeRotate

  // 数学辅助
  const { degToRad, radToDeg } = maths

  // 颜色
  const { colorize } = colors

  // 新建 Function，把所有函数作为具名参数传入（相当于全局变量）
  const argNames = [
    'require', 'module', 'exports',
    // primitives
    'cuboid', 'sphere', 'cylinder', 'cone', 'torus', 'cylinderElliptic',
    'roundedCuboid', 'roundedCylinder', 'geodesicSphere', 'polygon',
    'ellipsoid', 'line', 'arc', 'circle', 'rectangle', 'star', 'triangle',
    'parametricSurface', 'kleinBottle', 'mobiusStrip', 'torusKnot',
    // booleans
    'union', 'subtract', 'intersect',
    // transforms
    'translate', 'rotate', 'scale', 'mirror', 'center',
    'rotateX', 'rotateY', 'rotateZ',
    'translateX', 'translateY', 'translateZ',
    // extrusions
    'extrudeLinear', 'extrudeRotate', 'extrudeHelical',
    'linearExtrude', 'rotateExtrude',
    // math
    'degToRad', 'radToDeg',
    // color
    'colorize',
    // stack helper
    'stack',
    // text3d 内置 3D 文字
    'text3d',
    // Math 全局（AI 经常直接使用）
    'Math',
  ]

  const argValues = [
    require, moduleObj, moduleObj.exports,
    cuboid, sphere, cylinder, cone, torus, cylinderElliptic,
    roundedCuboid, roundedCylinder, geodesicSphere, polygon,
    ellipsoid, line, arc, circle, rectangle, star, triangle,
    parametricSurface, kleinBottle, mobiusStrip, torusKnot,
    union, subtract, intersect,
    translate, rotate, scale, mirror, center,
    rotateX, rotateY, rotateZ,
    translateX, translateY, translateZ,
    extrudeLinear, extrudeRotate, extrudeHelical,
    linearExtrude, rotateExtrude,
    degToRad, radToDeg,
    colorize,
    stack,
    text3d,
    Math,
  ]

  try {
    const fn = new Function(...argNames, code)
    fn(...argValues)
  } catch (err) {
    throw new Error('代码执行错误: ' + err.message)
  }

  const exports = moduleObj.exports
  const mainFn = exports.main || exports.default
  if (typeof mainFn !== 'function') {
    throw new Error(
      'jsCAD 代码缺少导出：请确保代码末尾包含 module.exports = { main }\n' +
      '已检测到的导出键：' + (Object.keys(exports).join(', ') || '（无）')
    )
  }

  let result
  try {
    result = mainFn()
  } catch (err) {
    // 转化常见错误为更友好的提示
    let msg = err.message || String(err)
    if (/Cannot access '(\w+)' before initialization/.test(msg)) {
      const varName = msg.match(/Cannot access '(\w+)' before initialization/)?.[1] || ''
      msg = `变量“${varName}”在初始化前被引用（声明顺序错误）：请将变量 ${varName} 的赋值移到使用它的语句之前`
    } else if (/is not a function/.test(msg)) {
      msg = `函数调用错误：${msg}。请检查函数名是否拼写正确、是否已导入`
    } else if (/is not defined/.test(msg)) {
      msg = `未定义的变量或函数：${msg}`
    }
    throw new Error('main() 执行错误: ' + msg)
  }

  if (!result) throw new Error('main() 函数没有返回几何体，请确保 return 语句存在')
  return result
}

// ============================================================
// 5×7 块字体字形数据（内置，支持 A-Z, 0-9 及常用符号）
// 每个字符 = [ [x, y, w, h], ... ] 矩形笔划列表，坐标系 5×7 单位格
// ============================================================
const JSCAD_FONT = {
  ' ': [],
  '0': [[0,0,1,7],[4,0,1,7],[1,6,3,1],[1,0,3,1]],
  '1': [[1,5,2,1],[2,0,1,5],[0,0,5,1]],
  '2': [[0,6,5,1],[0,5,1,1],[4,4,1,2],[0,3,5,1],[0,1,1,2],[0,0,5,1]],
  '3': [[0,6,4,1],[4,4,1,3],[0,3,4,1],[4,0,1,3],[0,0,4,1]],
  '4': [[0,3,1,4],[4,0,1,7],[0,3,5,1]],
  '5': [[0,6,5,1],[0,4,1,2],[0,3,5,1],[4,1,1,2],[0,0,5,1]],
  '6': [[0,0,1,7],[0,6,4,1],[1,3,4,1],[4,1,1,2],[1,0,3,1]],
  '7': [[0,6,5,1],[4,0,1,6]],
  '8': [[0,0,1,7],[4,0,1,7],[1,6,3,1],[1,3,3,1],[1,0,3,1]],
  '9': [[0,3,1,4],[4,0,1,7],[1,6,3,1],[1,3,3,1],[1,0,3,1]],
  'A': [[0,0,1,7],[4,0,1,7],[1,6,3,1],[1,3,3,1]],
  'B': [[0,0,1,7],[0,6,4,1],[4,4,1,3],[0,3,4,1],[4,0,1,3],[1,0,3,1]],
  'C': [[0,0,1,7],[1,6,3,1],[1,0,3,1]],
  'D': [[0,0,1,7],[1,6,3,1],[4,1,1,5],[1,0,3,1]],
  'E': [[0,0,1,7],[0,6,5,1],[0,3,4,1],[0,0,5,1]],
  'F': [[0,0,1,7],[0,6,5,1],[0,3,4,1]],
  'G': [[0,0,1,7],[1,6,3,1],[1,3,4,1],[4,0,1,3],[1,0,3,1]],
  'H': [[0,0,1,7],[4,0,1,7],[1,3,3,1]],
  'I': [[0,6,5,1],[2,0,1,7],[0,0,5,1]],
  'J': [[1,6,4,1],[4,0,1,6],[0,0,4,1],[0,1,1,2]],
  'K': [[0,0,1,7],[1,3,3,1],[2,4,1,1],[3,5,1,1],[4,6,1,1],[2,2,1,1],[3,1,1,1],[4,0,1,1]],
  'L': [[0,0,1,7],[0,0,5,1]],
  'M': [[0,0,1,7],[4,0,1,7],[1,5,1,1],[3,5,1,1],[2,4,1,1]],
  'N': [[0,0,1,7],[4,0,1,7],[1,5,1,1],[2,4,1,1],[3,3,1,1]],
  'O': [[0,0,1,7],[4,0,1,7],[1,6,3,1],[1,0,3,1]],
  'P': [[0,0,1,7],[1,6,3,1],[4,4,1,3],[1,3,3,1]],
  'Q': [[0,0,1,7],[4,0,1,7],[1,6,3,1],[1,0,3,1],[3,0,2,2]],
  'R': [[0,0,1,7],[1,6,3,1],[4,4,1,3],[1,3,3,1],[2,2,1,1],[3,1,1,1],[4,0,1,1]],
  'S': [[0,4,1,3],[1,6,3,1],[1,3,3,1],[4,0,1,3],[1,0,3,1]],
  'T': [[0,6,5,1],[2,0,1,6]],
  'U': [[0,0,1,7],[4,0,1,7],[1,0,3,1]],
  'V': [[0,2,1,5],[1,1,1,1],[2,0,1,2],[3,1,1,1],[4,2,1,5]],
  'W': [[0,0,1,7],[4,0,1,7],[1,2,1,1],[2,1,1,2],[3,2,1,1]],
  'X': [[0,0,1,3],[4,0,1,3],[1,3,1,1],[2,3,1,1],[3,3,1,1],[0,4,1,3],[4,4,1,3]],
  'Y': [[0,4,1,3],[4,4,1,3],[1,3,1,1],[3,3,1,1],[2,0,1,4]],
  'Z': [[0,6,5,1],[3,4,1,2],[2,3,1,1],[1,2,1,1],[0,1,1,1],[0,0,5,1]],
  '.': [[2,0,1,1]],
  ',': [[2,0,1,2]],
  '!': [[2,2,1,5],[2,0,1,1]],
  '?': [[1,6,3,1],[3,4,1,2],[2,3,1,1],[2,1,1,2],[2,0,1,1]],
  '-': [[1,3,3,1]],
  '_': [[0,0,5,1]],
  ':': [[2,4,1,1],[2,1,1,1]],
  '/': [[3,5,1,2],[2,3,1,2],[1,1,1,2],[0,0,1,1]],

  // ══ 中文汉字（7×7 方格，宽度=7）════════════════════════
  '一': [[0,3,7,1]],
  '二': [[0,5,7,1],[0,1,7,1]],
  '三': [[0,6,7,1],[0,3,7,1],[0,0,7,1]],
  '四': [[0,0,1,7],[6,0,1,7],[0,6,7,1],[0,0,7,1],[2,0,1,4],[4,0,1,4],[0,4,7,1]],
  '五': [[0,6,7,1],[0,3,7,1],[0,0,7,1],[0,3,1,3],[6,0,1,3]],
  '六': [[3,5,1,2],[1,3,5,1],[0,0,1,3],[6,0,1,3]],
  '七': [[0,6,7,1],[4,3,1,3],[2,0,1,3],[2,3,3,1]],
  '八': [[2,0,1,7],[5,0,1,7],[3,5,2,1]],
  '九': [[0,0,1,4],[0,4,5,1],[4,0,1,6]],
  '十': [[0,3,7,1],[3,0,1,7]],
  '上': [[0,0,7,1],[3,0,1,6],[2,6,3,1]],
  '下': [[0,6,7,1],[3,1,1,6],[2,0,3,1]],
  '中': [[3,0,1,7],[1,5,5,1],[1,1,5,1],[1,1,1,4],[5,1,1,4]],
  '左': [[0,0,4,1],[0,0,1,7],[0,4,4,1],[0,6,4,1],[3,0,1,4]],
  '右': [[3,6,4,1],[3,4,4,1],[6,0,1,7],[3,0,4,1]],
  '口': [[0,0,7,1],[0,6,7,1],[0,0,1,7],[6,0,1,7]],
  '日': [[0,0,7,1],[0,6,7,1],[0,0,1,7],[6,0,1,7],[0,3,7,1]],
  '月': [[0,0,1,7],[0,6,6,1],[5,1,1,5],[1,0,4,1],[1,2,4,1],[1,4,4,1]],
  '田': [[0,0,7,1],[0,6,7,1],[0,0,1,7],[6,0,1,7],[0,3,7,1],[3,0,1,7]],
  '目': [[0,0,7,1],[0,6,7,1],[0,0,1,7],[6,0,1,7],[0,4,7,1],[0,2,7,1]],
  '国': [[0,0,1,7],[6,0,1,7],[0,6,7,1],[0,0,7,1],[2,2,3,1],[2,4,3,1],[2,2,1,2],[4,2,1,2]],
  '门': [[0,0,1,7],[6,0,1,7],[0,6,7,1],[2,0,1,6],[4,0,1,6]],
  '工': [[0,6,7,1],[3,1,1,5],[0,0,7,1]],
  '王': [[0,6,7,1],[0,3,7,1],[0,0,7,1],[3,0,1,7]],
  '土': [[0,0,7,1],[3,1,1,6],[1,3,5,1]],
  '山': [[0,0,7,1],[0,0,1,5],[3,0,1,7],[6,0,1,5]],
  '力': [[1,6,5,1],[1,1,1,5],[1,0,5,1],[5,2,1,2]],
  '大': [[0,4,7,1],[3,0,1,4],[1,5,2,1],[0,6,1,1],[4,5,2,1],[6,6,1,1]],
  '小': [[3,0,1,7],[1,4,2,1],[4,4,2,1],[0,5,1,1],[6,5,1,1]],
  '木': [[0,4,7,1],[3,0,1,7],[0,1,3,1],[4,1,3,1]],
  '火': [[3,0,1,7],[2,4,5,1],[0,6,2,1],[5,6,2,1]],
  '水': [[3,0,1,7],[1,5,5,1],[0,6,1,1],[6,6,1,1],[0,3,2,1],[5,3,2,1]],
  '金': [[3,5,1,2],[0,4,7,1],[1,2,5,1],[1,2,1,2],[5,2,1,2],[0,0,7,1]],
  '天': [[1,5,5,1],[3,0,1,5],[0,6,3,1],[4,6,3,1]],
  '人': [[3,3,1,4],[2,2,1,1],[1,1,1,1],[0,0,1,1],[4,2,1,1],[5,1,1,1],[6,0,1,1]],
}


function buildJscadApi() {
  // center 参数标准化：
  //   jsCAD 允许 center: true（居中）/ center: false（左下角）/ center: [x,y,z]
  //   我们的实现中几何体默认就在原点居中，所以 true → [0,0,0], false → [0,0,0]
  function nc(c) {
    if (!c || c === false) return [0, 0, 0]
    if (c === true) return [0, 0, 0]
    if (Array.isArray(c)) return c
    return [0, 0, 0]
  }

  const primitives = {
    cuboid: ({ size = [1, 1, 1], center = [0, 0, 0] } = {}) => ({
      type: 'cuboid',
      size: Array.isArray(size) ? size : [size, size, size],
      center: nc(center),
    }),
    sphere: ({ radius = 1, center = [0, 0, 0], segments = 32 } = {}) => ({
      type: 'sphere', radius, center: nc(center), segments,
    }),
    cylinder: ({ radius = 1, height = 1, center = [0, 0, 0], segments = 32,
                  radiusTop, radiusBottom } = {}) => {
      // 支持 radiusTop / radiusBottom 参数（jsCAD 标准 API）
      const rb = (radiusBottom !== undefined) ? radiusBottom : radius
      const rt = (radiusTop !== undefined) ? radiusTop : radius
      if (rb !== rt) {
        // 两端半径不同：转为 cylinderElliptic 实现（支持圆锥、截锥）
        return {
          type: 'cylinderElliptic',
          startRadius: [rb, rb],
          endRadius: [rt, rt],
          height,
          center: nc(center),
          segments,
        }
      }
      return { type: 'cylinder', radius: rb, height, center: nc(center), segments }
    },
    // cone：圆锥（jsCAD 没有原生 cone，此为便捷别名）
    cone: ({ radius = 1, height = 1, center = [0, 0, 0], segments = 32 } = {}) => ({
      type: 'cylinderElliptic',
      startRadius: [radius, radius],
      endRadius: [0, 0],
      height,
      center: nc(center),
      segments,
    }),
    cylinderElliptic: ({ startRadius = [1, 1], endRadius = [1, 1], height = 1, center = [0, 0, 0], segments = 32 } = {}) => ({
      type: 'cylinderElliptic', startRadius, endRadius, height, center: nc(center), segments,
    }),
    torus: ({ innerRadius = 0.5, outerRadius = 2, innerSegments = 16, outerSegments = 32 } = {}) => ({
      type: 'torus', innerRadius, outerRadius, innerSegments, outerSegments,
    }),

    // ── 参数曲面（通用）──────────────────────────────────────
    parametricSurface: ({ fn, uMin = 0, uMax = Math.PI * 2, vMin = 0, vMax = Math.PI * 2, uSegments = 40, vSegments = 24 } = {}) => ({
      type: 'parametricSurface', fn, uMin, uMax, vMin, vMax, uSegments, vSegments,
    }),

    // ── 克莱因瓶（经典拓扑曲面，在3D中自交）─────────────────
    kleinBottle: ({ size = 50, uSegments = 60, vSegments = 30 } = {}) => {
      const s = size / 14
      return {
        type: 'parametricSurface',
        fn: (u, v) => {
          let x, y, z
          if (u < Math.PI) {
            x = 3 * Math.cos(u) * (1 + Math.sin(u)) + 2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v)
            y = 8 * Math.sin(u) + 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v)
            z = 2 * (1 - Math.cos(u) / 2) * Math.sin(v)
          } else {
            x = 3 * Math.cos(u) * (1 + Math.sin(u)) - 2 * (1 - Math.cos(u) / 2) * Math.cos(v)
            y = 8 * Math.sin(u)
            z = 2 * (1 - Math.cos(u) / 2) * Math.sin(v)
          }
          return [x * s, z * s, y * s]
        },
        uMin: 0, uMax: Math.PI * 2, vMin: 0, vMax: Math.PI * 2, uSegments, vSegments,
      }
    },

    // ── 莫比乌斯带 ────────────────────────────────────────────
    mobiusStrip: ({ radius = 40, width = 20, segments = 64, widthSegments = 8 } = {}) => ({
      type: 'parametricSurface',
      fn: (u, v) => {
        const t = v - 0.5
        const x = (radius + width * t * Math.cos(u / 2)) * Math.cos(u)
        const y = width * t * Math.sin(u / 2)
        const z = (radius + width * t * Math.cos(u / 2)) * Math.sin(u)
        return [x, y, z]
      },
      uMin: 0, uMax: Math.PI * 2, vMin: 0, vMax: 1, uSegments: segments, vSegments: widthSegments,
    }),

    // ── 环面结（Torus Knot）─────────────────────────────────────
    torusKnot: ({ radius = 40, tube = 6, p = 2, q = 3, tubularSegments = 96, radialSegments = 8 } = {}) => ({
      type: 'parametricSurface',
      fn: (u, v) => {
        const R = radius, r = radius * 0.4, t = tube
        const getP = (a) => [
          (R + r * Math.cos(q * a)) * Math.cos(p * a),
          (R + r * Math.cos(q * a)) * Math.sin(p * a),
          r * Math.sin(q * a)
        ]
        const pt = getP(u), pt2 = getP(u + 0.001)
        let tx = pt2[0]-pt[0], ty = pt2[1]-pt[1], tz = pt2[2]-pt[2]
        const tl = Math.sqrt(tx*tx+ty*ty+tz*tz) || 1
        tx/=tl; ty/=tl; tz/=tl
        const useZ = Math.abs(tz) < 0.9
        let bx = useZ ? -tz*0 - 0*ty : ty, by = useZ ? tz*1 - tx*0 : 0, bz = useZ ? tx*0 - ty*1 : -tx
        if (!useZ) { bx = ty; by = -tx; bz = 0 }
        else { bx = ty*1 - tz*0; by = tz*0 - tx*1; bz = tx*0 - ty*0 }
        // simpler: always use (0,0,1) cross tangent unless near parallel
        if (Math.abs(tx) < 0.9) { bx = 0; by = tz; bz = -ty }
        else { bx = -tz; by = 0; bz = tx }
        const bl = Math.sqrt(bx*bx+by*by+bz*bz) || 1
        bx/=bl; by/=bl; bz/=bl
        const nx = by*tz-bz*ty, ny = bz*tx-bx*tz, nz = bx*ty-by*tx
        return [
          pt[0] + t * (Math.cos(v) * nx + Math.sin(v) * bx),
          pt[1] + t * (Math.cos(v) * ny + Math.sin(v) * by),
          pt[2] + t * (Math.cos(v) * nz + Math.sin(v) * bz),
        ]
      },
      uMin: 0, uMax: Math.PI * 2, vMin: 0, vMax: Math.PI * 2, uSegments: tubularSegments, vSegments: radialSegments,
    }),

    ellipsoid: ({ radius = [1, 1, 1], center = [0, 0, 0], segments = 32 } = {}) => ({
      type: 'ellipsoid', radius, center: nc(center), segments,
    }),
    polygon: ({ points } = {}) => ({ type: 'polygon', points }),
    roundedCuboid: ({ size = [1, 1, 1], roundRadius = 0.1, segments = 16 } = {}) => ({
      type: 'roundedCuboid', size, roundRadius, segments,
    }),
    roundedCylinder: ({ radius = 1, height = 1, roundRadius = 0.1, segments = 32 } = {}) => ({
      type: 'roundedCylinder', radius, height, roundRadius, segments,
    }),
    geodesicSphere: ({ radius = 1, frequency = 2 } = {}) => ({
      type: 'geodesicSphere', radius, frequency,
    }),
    // 2D 原语（通过 extrudeLinear 变为 3D）
    circle: ({ radius = 1, center = [0, 0], segments = 32 } = {}) => ({
      type: 'circle', radius, center: nc(center), segments,
    }),
    rectangle: ({ size = [1, 1], center = [0, 0] } = {}) => ({
      type: 'rectangle', size, center: nc(center),
    }),
    arc: ({ radius = 1, startAngle = 0, endAngle = Math.PI, segments = 32 } = {}) => ({
      type: 'arc', radius, startAngle, endAngle, segments,
    }),
    line: (points) => ({ type: 'line', points }),
    star: ({ outerRadius = 1, innerRadius = 0.5, vertices = 5 } = {}) => ({
      type: 'star', outerRadius, innerRadius, vertices,
    }),
    triangle: ({ type: triType = 'SSS', values = [3, 4, 5] } = {}) => ({
      type: 'triangle', triType, values,
    }),
  }

  const transforms = {
    translate: ([x, y, z], ...geoms) => ({ type: 'translate', offset: [x, y, z], children: geoms.flat() }),
    rotate: ([x, y, z], ...geoms) => ({ type: 'rotate', angles: [x, y, z], children: geoms.flat() }),
    scale: ([x, y, z], ...geoms) => ({ type: 'scale', factors: [x, y, z], children: geoms.flat() }),
    mirror: (opts, ...geoms) => ({ type: 'mirror', ...opts, children: geoms.flat() }),
    center: (opts, ...geoms) => ({ type: 'center', ...opts, children: geoms.flat() }),
    rotateX: (angle, ...geoms) => transforms.rotate([angle, 0, 0], ...geoms),
    rotateY: (angle, ...geoms) => transforms.rotate([0, angle, 0], ...geoms),
    rotateZ: (angle, ...geoms) => transforms.rotate([0, 0, angle], ...geoms),
    translateX: (d, ...geoms) => transforms.translate([d, 0, 0], ...geoms),
    translateY: (d, ...geoms) => transforms.translate([0, d, 0], ...geoms),
    translateZ: (d, ...geoms) => transforms.translate([0, 0, d], ...geoms),
  }

  const booleans = {
    union: (...geoms) => ({ type: 'union', children: geoms.flat() }),
    subtract: (...geoms) => ({ type: 'subtract', children: geoms.flat() }),
    intersect: (...geoms) => ({ type: 'intersect', children: geoms.flat() }),
  }

  // ──────────────────────────────────────────────────
  // getBoundsY: 计算几何体在 Y 轴的包围盒（底部对齐约定）
  // ──────────────────────────────────────────────────
  function getBoundsY(g) {
    if (!g) return { min: 0, max: 0 }
    if (Array.isArray(g)) {
      let mn = Infinity, mx = -Infinity
      g.forEach(item => { const b = getBoundsY(item); if (b.min < mn) mn = b.min; if (b.max > mx) mx = b.max })
      return (mn === Infinity) ? { min: 0, max: 0 } : { min: mn, max: mx }
    }
    const cy = g.center ? (g.center[1] || 0) : 0
    switch (g.type) {
      case 'cylinder': case 'cylinderElliptic': case 'roundedCylinder':
        return { min: cy, max: cy + (g.height || 1) }
      case 'cuboid': case 'roundedCuboid': {
        const h = g.size ? (Array.isArray(g.size) ? g.size[1] : g.size) : 1
        return { min: cy, max: cy + h }
      }
      case 'sphere': case 'geodesicSphere': {
        const r = g.radius || 1; return { min: cy - r, max: cy + r }
      }
      case 'ellipsoid': {
        const ry = Array.isArray(g.radius) ? g.radius[1] : (g.radius || 1)
        return { min: cy - ry, max: cy + ry }
      }
      case 'torus': return { min: -(g.innerRadius || 0.5), max: (g.innerRadius || 0.5) }
      case 'translate': {
        const dy = g.offset ? (g.offset[1] || 0) : 0
        let mn2 = Infinity, mx2 = -Infinity
        ;(g.children || []).forEach(c => { const b = getBoundsY(c); if (b.min+dy < mn2) mn2 = b.min+dy; if (b.max+dy > mx2) mx2 = b.max+dy })
        return (mn2 === Infinity) ? { min: 0, max: 0 } : { min: mn2, max: mx2 }
      }
      case 'union': case 'subtract': case 'intersect': case 'colorize': {
        let mn3 = Infinity, mx3 = -Infinity
        ;(g.children || []).forEach(c => { const b = getBoundsY(c); if (b.min < mn3) mn3 = b.min; if (b.max > mx3) mx3 = b.max })
        return (mn3 === Infinity) ? { min: 0, max: 0 } : { min: mn3, max: mx3 }
      }
      case 'rotate': {
        const [rx, ry, rz] = g.angles || [0, 0, 0]
        let mn4 = Infinity, mx4 = -Infinity
        ;(g.children || []).forEach(c => { const b = getBoundsY(c); if (b.min < mn4) mn4 = b.min; if (b.max > mx4) mx4 = b.max })
        if (mn4 === Infinity) return { min: 0, max: 0 }

        // 纯 Z 轴旋转（最常见：机械臂弯折）：精确估算 Y 边界
        // rotateZ(theta): y' = x*sin(theta) + y*cos(theta)
        // 子几何体在 Y 方向范围 [mn4, mx4]，X 方向估算为 ±halfH（保守但精度可接受）
        if (!rx && !ry && rz) {
          const cosA = Math.abs(Math.cos(rz))
          const sinA = Math.abs(Math.sin(rz))
          const halfH = (mx4 - mn4) / 2  // 用高度一半估算 X 方向范围
          // 旋转后 y' 最小 = mn4*cosA - halfH*sinA（可能为负，即底部被旋转到 Y 轴下方）
          // 旋转后 y' 最大 = mx4*cosA + halfH*sinA
          return {
            min: mn4 * cosA - halfH * sinA,
            max: mx4 * cosA + halfH * sinA,
          }
        }

        // 其他旋转轴：保守估算（不常用）
        const d = Math.max(Math.abs(mn4), Math.abs(mx4), (mx4 - mn4) / 2)
        return { min: -d, max: d }
      }
      default: return { min: cy - 1, max: cy + 1 }
    }
  }

  // ──────────────────────────────────────────────────
  // stack(...geoms): 自动将几何体按 Y 轴从下到上依次堆叠
  // 每个几何体的底部紧贴上一个几何体的顶部，不需要手动计算偏移
  // ──────────────────────────────────────────────────
  const stack = (...geoms) => {
    const flat = geoms.flat()
    if (flat.length === 0) return null
    if (flat.length === 1) return flat[0]
    const positioned = []
    let topY = 0
    for (const geom of flat) {
      const b = getBoundsY(geom)
      const dy = topY - b.min
      positioned.push(Math.abs(dy) > 1e-6 ? transforms.translate([0, dy, 0], geom) : geom)
      topY += (b.max - b.min)
    }
    return booleans.union(...positioned)
  }

  // ──────────────────────────────────────────────────
  // text3d(str, size, depth, spacing)：内置 3D 文字生成器
  // - str：字符串（自动转大写）
  // - size：字符高度 mm（默认 20）
  // - depth：拉伸厂度 mm（默认 5）
  // - spacing：字符间距 mm（默认按字体比例自动）
  // ──────────────────────────────────────────────────
  const text3d = (str, size, depth, spacing) => {
    const s = str ? String(str) : ''
    if (s.length === 0) {
      // 空字符串：返回问号占位符
      return text3d('?', size, depth, spacing)
    }
    size    = (size    == null) ? 20 : size
    depth   = (depth   == null) ? 5  : depth
    const GRID_H   = 7   // 所有字符高度=7
    const GRID_W   = 5   // 拉丁字母/数字宽度
    const GRID_CJK = 7   // 中文汉字宽度（方格）
    const scale = size / GRID_H
    // 检测 CJK 字符：基本汉字区
    const isCJK = (c) => { const code = c.charCodeAt(0); return code >= 0x4e00 && code <= 0x9fff }
    if (spacing == null) spacing = scale * 1.5

    const parts = []
    let xOffset = 0

    // 预处理：不支持的字符用 ? 替代，避免渲染为小矩形
    const safeStr = s.split('').map(c => JSCAD_FONT[c.toUpperCase()] !== undefined || JSCAD_FONT[c] !== undefined ? c : '?').join('')

    for (const rawChar of safeStr) {
      // Latin 字母转大写；中文保持原字
      const lookupChar = isCJK(rawChar) ? rawChar : rawChar.toUpperCase()
      const strokes = JSCAD_FONT[lookupChar]
      const charW = isCJK(rawChar) ? GRID_CJK : GRID_W  // 中文宽7，拉丁宽5
      if (strokes) {
        for (const [sx, sy, sw, sh] of strokes) {
          // cuboid 是 X 居中、Y 底部对齐、Z 居中
          parts.push(transforms.translate(
            [xOffset + (sx + sw / 2) * scale, sy * scale, 0],
            primitives.cuboid({ size: [sw * scale, sh * scale, depth] })
          ))
        }
      }
      xOffset += charW * scale + spacing
    }

    if (parts.length === 0) return primitives.cuboid({ size: [size, size, depth] })

    // 将文字居中对齐到原点：X 居中，Y 底部对齐
    const totalWidth = xOffset - spacing  // 去掉最后多余的 spacing
    const centerX = totalWidth / 2
    const geom = parts.length === 1 ? parts[0] : booleans.union(...parts)
    // 居中轴中（X 居中，Y 保持底部对齐）
    return transforms.translate([-centerX, 0, 0], geom)
  }

  const maths = {
    degToRad: (deg) => (deg * Math.PI) / 180,
    radToDeg: (rad) => (rad * 180) / Math.PI,
    vec3: {
      create: () => [0, 0, 0],
      fromValues: (x, y, z) => [x, y, z],
    },
  }

  const colors = {
    // colorize(color, ...geoms[, materialId])
    // 如果最后一个参数是字符串，将其视为材质 ID——该组沨射指定材质
    colorize: (color, ...args) => {
      let material = undefined
      let geoms = args
      if (args.length > 0 && typeof args[args.length - 1] === 'string') {
        material = args[args.length - 1]
        geoms = args.slice(0, -1)
      }
      return { type: 'colorize', color, material, children: geoms.flat() }
    },
  }

  const expansions = {
    expand: (opts, ...geoms) => ({ type: 'expand', ...opts, children: geoms.flat() }),
    offset: (opts, ...geoms) => ({ type: 'offset', ...opts, children: geoms.flat() }),
  }

  const extrusions = {
    extrudeLinear: (opts, ...geoms) => ({ type: 'extrudeLinear', ...opts, children: geoms.flat() }),
    extrudeRotate: (opts, ...geoms) => ({ type: 'extrudeRotate', ...opts, children: geoms.flat() }),
    extrudeHelical: (opts, ...geoms) => ({ type: 'extrudeHelical', ...opts, children: geoms.flat() }),
  }

  return {
    primitives,
    transforms,
    booleans,
    stack,
    text3d,
    maths,
    colors,
    expansions,
    extrusions,
    utils: { degToRad: maths.degToRad, radToDeg: maths.radToDeg },
  }
}

// ============================================================
// 4×4 矩阵工具（行优先，用于传播 translate/rotate/scale 变换）
// ============================================================
function mat4Id() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] }
function mat4IsId(m) {
  return m[0]===1&&m[1]===0&&m[2]===0&&m[3]===0&&
         m[4]===0&&m[5]===1&&m[6]===0&&m[7]===0&&
         m[8]===0&&m[9]===0&&m[10]===1&&m[11]===0&&
         m[12]===0&&m[13]===0&&m[14]===0&&m[15]===1
}
function mat4Mul(a, b) {
  const r = new Array(16).fill(0)
  for (let i=0;i<4;i++) for(let j=0;j<4;j++) for(let k=0;k<4;k++) r[i*4+j]+=a[i*4+k]*b[k*4+j]
  return r
}
function mat4T(x,y,z){ return [1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1] }
function mat4Rx(a){ const c=Math.cos(a),s=Math.sin(a); return [1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1] }
function mat4Ry(a){ const c=Math.cos(a),s=Math.sin(a); return [c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1] }
function mat4Rz(a){ const c=Math.cos(a),s=Math.sin(a); return [c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1] }
function mat4S(sx,sy,sz){ return [sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1] }
function applyMat4P(m,x,y,z){ return [m[0]*x+m[1]*y+m[2]*z+m[3], m[4]*x+m[5]*y+m[6]*z+m[7], m[8]*x+m[9]*y+m[10]*z+m[11]] }
function applyMat4D(m,x,y,z){ return [m[0]*x+m[1]*y+m[2]*z, m[4]*x+m[5]*y+m[6]*z, m[8]*x+m[9]*y+m[10]*z] }
function applyMatRange(posArr, normArr, sp, sn, mat) {
  for (let i=sp; i<posArr.length; i+=3) {
    const [x,y,z] = applyMat4P(mat, posArr[i], posArr[i+1], posArr[i+2])
    posArr[i]=x; posArr[i+1]=y; posArr[i+2]=z
  }
  for (let i=sn; i<normArr.length; i+=3) {
    const [x,y,z] = applyMat4D(mat, normArr[i], normArr[i+1], normArr[i+2])
    const len = Math.sqrt(x*x+y*y+z*z)
    if (len > 1e-6) { normArr[i]=x/len; normArr[i+1]=y/len; normArr[i+2]=z/len }
  }
}

// ============================================================
// 顶点合并：在 Worker 中将重复位置的顶点去重，返回 indexed geometry
// 这个操作移入 Worker 后，主线程可跳过 Three.js mergeVertices（CPU繁重操作）
// ============================================================
function mergeGroupVertices(posArr, normArr) {
  const vertexMap = new Map()
  const outPos = []
  const outNorm = []
  const indices = []
  let nextIdx = 0

  for (let i = 0; i < posArr.length; i += 3) {
    const x = posArr[i], y = posArr[i + 1], z = posArr[i + 2]
    // 用固定精度作为 key，合并距离 < 0.0001 的重叠顶点
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`
    let idx = vertexMap.get(key)
    if (idx === undefined) {
      idx = nextIdx++
      vertexMap.set(key, idx)
      outPos.push(x, y, z)
      // 暨时写入原始法向（主线程会调用 computeVertexNormals 重新计算平滑法向）
      outNorm.push(normArr[i], normArr[i + 1], normArr[i + 2])
    }
    indices.push(idx)
  }

  return {
    positions: new Float32Array(outPos),
    normals:   new Float32Array(outNorm),
    indices:   new Uint32Array(indices),
  }
}

// ============================================================
// 几何体三角化 → 按颜色分组序列化（支持 colorize 多色）
// ============================================================

// 解析颜色为 [r, g, b] 0~1 浮点数组
function normalizeColor(c) {
  if (!c) return null
  if (Array.isArray(c)) return [c[0] || 0, c[1] || 0, c[2] || 0]
  if (typeof c === 'string') {
    const hex = c.replace('#', '')
    if (hex.length === 6) {
      return [
        parseInt(hex.substring(0, 2), 16) / 255,
        parseInt(hex.substring(2, 4), 16) / 255,
        parseInt(hex.substring(4, 6), 16) / 255,
      ]
    }
  }
  return null
}

function serializeGeometry(geom) {
  // 默认颜色：CAD 蓝 #2d7bd6
  const DEFAULT_COLOR = [0.176, 0.482, 0.839]

  // 颜色分组 Map："r,g,b[|materialId]" -> { posArr, normArr, color, material }
  const groupMap = new Map()
  let hasColorize = false

  function getOrCreateGroup(color, material) {
    const key = color.map(v => v.toFixed(3)).join(',') + (material ? '|' + material : '')
    if (!groupMap.has(key)) {
      groupMap.set(key, { posArr: [], normArr: [], color: [...color], material: material || undefined })
    }
    return groupMap.get(key)
  }

  function triangulate(g, mat, color, material) {
    if (!g) return
    if (!mat) mat = mat4Id()
    if (!color) color = DEFAULT_COLOR

    if (Array.isArray(g)) { g.forEach(item => triangulate(item, mat, color, material)); return }

    // ── colorize 节点：更新颜色后递归子节点 ─────────────────
    if (g.type === 'colorize') {
      hasColorize = true
      const newColor = normalizeColor(g.color) || color
      const newMaterial = g.material || material
      if (g.children) g.children.forEach(c => triangulate(c, mat, newColor, newMaterial))
      return
    }

    // ── 变换节点：累积矩阵后递归子节点 ──────────────────────
    if (g.type === 'translate') {
      const [x,y,z] = g.offset || [0,0,0]
      const m = mat4Mul(mat, mat4T(x,y,z))
      if (g.children) g.children.forEach(c => triangulate(c, m, color, material))
      return
    }
    if (g.type === 'rotate') {
      const [rx,ry,rz] = g.angles || [0,0,0]
      let m = mat
      if (rx) m = mat4Mul(m, mat4Rx(rx))
      if (ry) m = mat4Mul(m, mat4Ry(ry))
      if (rz) m = mat4Mul(m, mat4Rz(rz))
      if (g.children) g.children.forEach(c => triangulate(c, m, color, material))
      return
    }
    if (g.type === 'scale') {
      const [sx,sy,sz] = g.factors || [1,1,1]
      const m = mat4Mul(mat, mat4S(sx,sy,sz))
      if (g.children) g.children.forEach(c => triangulate(c, m, color, material))
      return
    }

    // ── 透传节点：直接递归，矩阵/颜色不变 ───────────────────
    const PASSTHROUGH = ['union','subtract','intersect','mirror','center','expand','offset']
    if (PASSTHROUGH.includes(g.type)) {
      if (g.children) g.children.forEach(c => triangulate(c, mat, color, material))
      return
    }

    // ── 叶子节点：三角化后写入对应颜色分组 ──────────────────
    const group = getOrCreateGroup(color, material)
    const { posArr, normArr } = group
    const sp = posArr.length
    const sn = normArr.length

    switch (g.type) {
      case 'cuboid':           triangulateCuboid(g, posArr, normArr); break
      case 'sphere':           triangulateSphere(g, posArr, normArr); break
      case 'cylinder':         triangulateCylinder(g, posArr, normArr); break
      case 'torus':            triangulateTorus(g, posArr, normArr); break
      case 'ellipsoid':        triangulateEllipsoid(g, posArr, normArr); break
      case 'cylinderElliptic': triangulateCylinderElliptic(g, posArr, normArr); break
      case 'roundedCuboid':    triangulateCuboid({ ...g, type: 'cuboid' }, posArr, normArr); break
      case 'roundedCylinder':  triangulateCylinder({ ...g, type: 'cylinder' }, posArr, normArr); break
      case 'geodesicSphere':   triangulateSphere({ ...g, type: 'sphere' }, posArr, normArr); break
      case 'extrudeLinear':    triangulateExtrudeLinear(g, posArr, normArr); break
      case 'extrudeRotate':    triangulateExtrudeRotate(g, posArr, normArr); break
      case 'parametricSurface': triangulateParametricSurface(g, posArr, normArr); break
      default:
        if (g.children) g.children.forEach(c => triangulate(c, mat, color, material))
        return  // 未知节点：直接递归，不再应用矩阵
    }

    // 将变换矩阵应用到刚生成的顶点/法向量
    if (!mat4IsId(mat)) {
      applyMatRange(posArr, normArr, sp, sn, mat)
    }
  }

  triangulate(geom, mat4Id(), DEFAULT_COLOR, undefined)

  // 将分组 Map 转为数组，每组生成 Float32Array，并做顶点合并（移至 Worker，减轻主线程）
  const groups = []
  let totalTriangles = 0
  for (const [, group] of groupMap) {
    if (group.posArr.length === 0) continue
    const tc = group.posArr.length / 9
    const { positions, normals, indices } = mergeGroupVertices(group.posArr, group.normArr)
    groups.push({
      positions,
      normals,
      indices,
      color: group.color,
      material: group.material,  // per-group 材质 ID
      triangleCount: tc,
    })
    totalTriangles += tc
  }

  // 顶点数量过多时追加警告（不阻断，正常返回）
  const warning = totalTriangles > 200000
    ? `模型较复杂（${totalTriangles.toLocaleString()} 个三角面），渲染可能较慢`
    : null

  return { groups, triangleCount: totalTriangles, hasColorize, warning }
}

function triangulateCuboid({ size = [1, 1, 1], center = [0, 0, 0] }, posArr, normArr) {
  const [w, h, d] = size
  const [cx, cy, cz] = center
  const hw = w / 2, hd = d / 2
  // 底部对齐：底面 y=cy，顶面 y=cy+h（XZ 方向仍以 cx,cz 为中心）

  const v = [
    [cx - hw, cy,     cz - hd],
    [cx + hw, cy,     cz - hd],
    [cx + hw, cy + h, cz - hd],
    [cx - hw, cy + h, cz - hd],
    [cx - hw, cy,     cz + hd],
    [cx + hw, cy,     cz + hd],
    [cx + hw, cy + h, cz + hd],
    [cx - hw, cy + h, cz + hd],
  ]

  const faces = [
    [0, 1, 2, 0, 2, 3, [0, 0, -1]],
    [5, 4, 7, 5, 7, 6, [0, 0, 1]],
    [4, 0, 3, 4, 3, 7, [-1, 0, 0]],
    [1, 5, 6, 1, 6, 2, [1, 0, 0]],
    [3, 2, 6, 3, 6, 7, [0, 1, 0]],
    [4, 5, 1, 4, 1, 0, [0, -1, 0]],
  ]

  for (const [i0, i1, i2, i3, i4, i5, n] of faces) {
    for (const idx of [i0, i1, i2, i3, i4, i5]) {
      posArr.push(...v[idx])
      normArr.push(...n)
    }
  }
}

function triangulateSphere({ radius = 1, center = [0, 0, 0], segments = 32 }, posArr, normArr) {
  segments = Math.min(segments, 48)  // 上限 48 段，防止顶点爆炸
  const [cx, cy, cz] = center
  const latBands = Math.max(8, Math.floor(segments / 2))
  const lonBands = segments

  for (let lat = 0; lat < latBands; lat++) {
    const theta1 = (lat / latBands) * Math.PI
    const theta2 = ((lat + 1) / latBands) * Math.PI

    for (let lon = 0; lon < lonBands; lon++) {
      const phi1 = (lon / lonBands) * 2 * Math.PI
      const phi2 = ((lon + 1) / lonBands) * 2 * Math.PI

      const p = (theta, phi) => {
        const nx = Math.sin(theta) * Math.cos(phi)
        const ny = Math.cos(theta)
        const nz = Math.sin(theta) * Math.sin(phi)
        return { pos: [cx + radius * nx, cy + radius * ny, cz + radius * nz], norm: [nx, ny, nz] }
      }

      const v1 = p(theta1, phi1), v2 = p(theta1, phi2)
      const v3 = p(theta2, phi1), v4 = p(theta2, phi2)

      if (lat !== 0) {
        posArr.push(...v1.pos, ...v3.pos, ...v2.pos)
        normArr.push(...v1.norm, ...v3.norm, ...v2.norm)
      }
      if (lat !== latBands - 1) {
        posArr.push(...v2.pos, ...v3.pos, ...v4.pos)
        normArr.push(...v2.norm, ...v3.norm, ...v4.norm)
      }
    }
  }
}

function triangulateCylinder({ radius = 1, height = 1, center = [0, 0, 0], segments = 32 }, posArr, normArr) {
  segments = Math.min(segments, 64)  // 上限 64 段
  const [cx, cy, cz] = center
  // 底部对齐：底面 y=cy，顶面 y=cy+height
  const yBot = cy
  const yTop = cy + height

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * 2 * Math.PI
    const a2 = ((i + 1) / segments) * 2 * Math.PI

    const x1 = cx + radius * Math.cos(a1), z1 = cz + radius * Math.sin(a1)
    const x2 = cx + radius * Math.cos(a2), z2 = cz + radius * Math.sin(a2)

    // 侧面
    const nx1 = Math.cos(a1), nz1 = Math.sin(a1)
    const nx2 = Math.cos(a2), nz2 = Math.sin(a2)
    posArr.push(x1, yBot, z1, x2, yBot, z2, x2, yTop, z2)
    normArr.push(nx1, 0, nz1, nx2, 0, nz2, nx2, 0, nz2)
    posArr.push(x1, yBot, z1, x2, yTop, z2, x1, yTop, z1)
    normArr.push(nx1, 0, nz1, nx2, 0, nz2, nx1, 0, nz1)

    // 顶面
    posArr.push(cx, yTop, cz, x1, yTop, z1, x2, yTop, z2)
    normArr.push(0, 1, 0, 0, 1, 0, 0, 1, 0)
    // 底面
    posArr.push(cx, yBot, cz, x2, yBot, z2, x1, yBot, z1)
    normArr.push(0, -1, 0, 0, -1, 0, 0, -1, 0)
  }
}

function triangulateTorus({ innerRadius = 0.5, outerRadius = 2, innerSegments = 16, outerSegments = 32 }, posArr, normArr) {
  for (let i = 0; i < outerSegments; i++) {
    for (let j = 0; j < innerSegments; j++) {
      const u1 = (i / outerSegments) * 2 * Math.PI
      const u2 = ((i + 1) / outerSegments) * 2 * Math.PI
      const v1 = (j / innerSegments) * 2 * Math.PI
      const v2 = ((j + 1) / innerSegments) * 2 * Math.PI

      const pt = (u, v) => {
        const x = (outerRadius + innerRadius * Math.cos(v)) * Math.cos(u)
        const y = innerRadius * Math.sin(v)
        const z = (outerRadius + innerRadius * Math.cos(v)) * Math.sin(u)
        const nx = Math.cos(v) * Math.cos(u)
        const ny = Math.sin(v)
        const nz = Math.cos(v) * Math.sin(u)
        return { pos: [x, y, z], norm: [nx, ny, nz] }
      }

      const p1 = pt(u1, v1), p2 = pt(u2, v1), p3 = pt(u1, v2), p4 = pt(u2, v2)

      posArr.push(...p1.pos, ...p2.pos, ...p3.pos)
      normArr.push(...p1.norm, ...p2.norm, ...p3.norm)
      posArr.push(...p2.pos, ...p4.pos, ...p3.pos)
      normArr.push(...p2.norm, ...p4.norm, ...p3.norm)
    }
  }
}

function triangulateEllipsoid({ radius = [1, 1, 1], center = [0, 0, 0], segments = 32 }, posArr, normArr) {
  const [rx, ry, rz] = Array.isArray(radius) ? radius : [radius, radius, radius]
  const [cx, cy, cz] = center
  const latBands = Math.max(8, Math.floor(segments / 2))
  const lonBands = segments

  for (let lat = 0; lat < latBands; lat++) {
    const theta1 = (lat / latBands) * Math.PI
    const theta2 = ((lat + 1) / latBands) * Math.PI

    for (let lon = 0; lon < lonBands; lon++) {
      const phi1 = (lon / lonBands) * 2 * Math.PI
      const phi2 = ((lon + 1) / lonBands) * 2 * Math.PI

      const p = (theta, phi) => {
        const nx = Math.sin(theta) * Math.cos(phi)
        const ny = Math.cos(theta)
        const nz = Math.sin(theta) * Math.sin(phi)
        return { pos: [cx + rx * nx, cy + ry * ny, cz + rz * nz], norm: [nx, ny, nz] }
      }

      const v1 = p(theta1, phi1), v2 = p(theta1, phi2)
      const v3 = p(theta2, phi1), v4 = p(theta2, phi2)

      if (lat !== 0) {
        posArr.push(...v1.pos, ...v3.pos, ...v2.pos)
        normArr.push(...v1.norm, ...v3.norm, ...v2.norm)
      }
      if (lat !== latBands - 1) {
        posArr.push(...v2.pos, ...v3.pos, ...v4.pos)
        normArr.push(...v2.norm, ...v3.norm, ...v4.norm)
      }
    }
  }
}

function triangulateCylinderElliptic({ startRadius = [1, 1], endRadius = [1, 1], height = 1, center = [0, 0, 0], segments = 32 }, posArr, normArr) {
  const [cx, cy, cz] = center
  // 底部对齐：底面 y=cy，顶面 y=cy+height
  const yBot = cy
  const yTop = cy + height
  const [srx, sry] = startRadius
  const [erx, ery] = endRadius

  const hasTopTip    = (erx === 0 && ery === 0)
  const hasBottomTip = (srx === 0 && sry === 0)

  const avgStartR = (srx + sry) / 2
  const avgEndR   = (erx + ery) / 2
  const dr = avgStartR - avgEndR
  const slantLen = Math.sqrt(dr * dr + height * height)
  const nRadial = (slantLen > 0) ? height / slantLen : 1
  const nVert   = (slantLen > 0) ? dr / slantLen : 0

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * 2 * Math.PI
    const a2 = ((i + 1) / segments) * 2 * Math.PI
    const aM = (a1 + a2) / 2

    const bx1 = cx + srx * Math.cos(a1), bz1 = cz + sry * Math.sin(a1)
    const bx2 = cx + srx * Math.cos(a2), bz2 = cz + sry * Math.sin(a2)
    const tx1 = cx + erx * Math.cos(a1), tz1 = cz + ery * Math.sin(a1)
    const tx2 = cx + erx * Math.cos(a2), tz2 = cz + ery * Math.sin(a2)

    const Nx1 = Math.cos(a1) * nRadial, Nz1 = Math.sin(a1) * nRadial
    const Nx2 = Math.cos(a2) * nRadial, Nz2 = Math.sin(a2) * nRadial
    const NxM = Math.cos(aM) * nRadial, NzM = Math.sin(aM) * nRadial

    if (hasTopTip) {
      posArr.push(bx1, yBot, bz1,  bx2, yBot, bz2,  cx, yTop, cz)
      normArr.push(Nx1, nVert, Nz1,   Nx2, nVert, Nz2,   NxM, nVert, NzM)
    } else if (hasBottomTip) {
      posArr.push(cx, yBot, cz,   tx2, yTop, tz2,  tx1, yTop, tz1)
      normArr.push(NxM, -nVert, NzM,  Nx2, -nVert, Nz2,   Nx1, -nVert, Nz1)
    } else {
      posArr.push(bx1, yBot, bz1,  bx2, yBot, bz2,  tx2, yTop, tz2)
      normArr.push(Nx1, nVert, Nz1,   Nx2, nVert, Nz2,   Nx2, nVert, Nz2)
      posArr.push(bx1, yBot, bz1,  tx2, yTop, tz2,  tx1, yTop, tz1)
      normArr.push(Nx1, nVert, Nz1,   Nx2, nVert, Nz2,   Nx1, nVert, Nz1)
    }

    if (!hasTopTip) {
      posArr.push(cx, yTop, cz,  tx1, yTop, tz1,  tx2, yTop, tz2)
      normArr.push(0, 1, 0,  0, 1, 0,  0, 1, 0)
    }

    if (!hasBottomTip) {
      posArr.push(cx, yBot, cz,  bx2, yBot, bz2,  bx1, yBot, bz1)
      normArr.push(0, -1, 0,  0, -1, 0,  0, -1, 0)
    }
  }
}

function triangulateExtrudeLinear(g, posArr, normArr) {
  // extrudeLinear 作用于 2D 子几何体，沿 Y 轴线性拉伸
  if (!g.children || g.children.length === 0) return
  const height = g.height || g.height_ || 10
  const child = g.children[0]
  if (child.type === 'circle') {
    triangulateCylinder({ radius: child.radius, height, center: [0, 0, 0], segments: child.segments || 32 }, posArr, normArr)
  } else if (child.type === 'rectangle') {
    const [w, d] = child.size || [1, 1]
    triangulateCuboid({ size: [w, d, height], center: [0, 0, 0] }, posArr, normArr)
  } else if (child.type === 'polygon' && child.points && child.points.length >= 3) {
    // ── 多边形截面拉伸（齿轮、异形零件等）─────────────────────────────
    // polygon.points 为 [x, z] 二元组，定义 XZ 平面截面，沿 Y 轴拉伸
    triangulateExtrudedPolygon(child.points, height, posArr, normArr)
  } else {
    g.children.forEach(c => triangulate(c))
  }
}

/**
 * triangulateExtrudedPolygon
 * 将 XZ 平面上的 2D 多边形（points: [[x,z], ...]）沿 Y 轴拉伸 height 高度
 *
 * 算法：以质心为扇面中心（fan triangulation），适用于星形多边形（如齿轮轮廓）。
 * 对凹多边形（如齿根），fan 可能产生重叠，但对标准齿轮轮廓质心可见性成立。
 *
 * 坐标约定（与 worker 一致）：
 *   - 截面在 XZ 平面（y=0 底面，y=height 顶面）
 *   - 顶面法线 (0,1,0)，底面法线 (0,-1,0)
 *   - 多边形 CCW（从 +Y 俯视逆时针）时采用标准扇面方向
 */
function triangulateExtrudedPolygon(pts, height, posArr, normArr) {
  if (!pts || pts.length < 3) return
  const n = pts.length

  // ── Step 1: 确定绕向（面积正负法，XZ 平面 Shoelace）
  let area2 = 0
  for (let i = 0; i < n; i++) {
    const [x0, z0] = pts[i]
    const [x1, z1] = pts[(i + 1) % n]
    area2 += x0 * z1 - x1 * z0
  }
  // area2 > 0 → CCW（从 +Y 俯视逆时针）
  // 若 CW，将点序颠倒使其 CCW
  const ordPts = area2 >= 0 ? pts : pts.slice().reverse()

  // ── Step 2: 质心（用于扇面三角化上下盖面）
  let cx = 0, cz = 0
  for (const [x, z] of ordPts) { cx += x; cz += z }
  cx /= n; cz /= n

  // ── Step 3: 三角化上下盖 + 侧面
  for (let i = 0; i < n; i++) {
    const [x1, z1] = ordPts[i]
    const [x2, z2] = ordPts[(i + 1) % n]

    // 底盖（y=0，法线 0,-1,0）：从 +Y 俯视 CW → 从 -Y 仰视 CCW
    posArr.push(cx, 0, cz,  x2, 0, z2,  x1, 0, z1)
    normArr.push(0, -1, 0,  0, -1, 0,  0, -1, 0)

    // 顶盖（y=height，法线 0,1,0）：从 +Y 俯视 CCW
    posArr.push(cx, height, cz,  x1, height, z1,  x2, height, z2)
    normArr.push(0, 1, 0,  0, 1, 0,  0, 1, 0)

    // 侧面（两个三角形组成一个侧边矩形）
    // 对 CCW 多边形，向外法线 = 行进方向的右侧垂直向量
    const edgeX = x2 - x1, edgeZ = z2 - z1
    const len = Math.sqrt(edgeX * edgeX + edgeZ * edgeZ) || 1
    const nx = edgeZ / len, nz = -edgeX / len

    posArr.push(x1, 0, z1,  x1, height, z1,  x2, height, z2)
    normArr.push(nx, 0, nz,  nx, 0, nz,  nx, 0, nz)

    posArr.push(x1, 0, z1,  x2, height, z2,  x2, 0, z2)
    normArr.push(nx, 0, nz,  nx, 0, nz,  nx, 0, nz)
  }
}

// ============================================================
// triangulateExtrudeRotate: 将 2D 轮廓绕 Y 轴旋转生成旋转体（花瓶/酒杯/弹壳等）
// child 应为 polygon({ points: [[r0,h0],[r1,h1],...] })， r 为富径, h 为高度
// ============================================================
function triangulateExtrudeRotate(g, posArr, normArr) {
  const totalAngle = (g.angle !== undefined) ? g.angle : Math.PI * 2
  const segments = g.segments || 48
  if (!g.children || g.children.length === 0) return

  let profile = []  // [[r, h], ...]
  const child = g.children[0]
  if (child.type === 'polygon' && child.points) {
    profile = child.points.map(p => Array.isArray(p) ? [Math.max(0, p[0]), p[1]] : [0, 0])
  } else if (child.type === 'rectangle') {
    const [w, h] = child.size || [1, 1]
    profile = [[0, 0], [w, 0], [w, h], [0, h]]
  } else {
    return
  }
  if (profile.length < 2) return

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * totalAngle
    const a2 = ((i + 1) / segments) * totalAngle
    const c1 = Math.cos(a1), s1 = Math.sin(a1)
    const c2 = Math.cos(a2), s2 = Math.sin(a2)

    for (let j = 0; j < profile.length; j++) {
      const [r1, h1] = profile[j]
      const [r2, h2] = profile[(j + 1) % profile.length]
      if (r1 < 1e-8 && r2 < 1e-8) continue

      const p1 = [r1*c1, h1, r1*s1]
      const p2 = [r1*c2, h1, r1*s2]
      const p3 = [r2*c2, h2, r2*s2]
      const p4 = [r2*c1, h2, r2*s1]

      const dr = r2 - r1, dh = h2 - h1
      const el = Math.sqrt(dr*dr + dh*dh) || 1
      const nr = dh / el, nh = -dr / el
      const n1 = [nr*c1, nh, nr*s1]
      const n2 = [nr*c2, nh, nr*s2]

      if (r1 < 1e-8) {
        posArr.push(...p1, ...p2, ...p3)
        normArr.push(...n2, ...n2, ...n2)
      } else if (r2 < 1e-8) {
        posArr.push(...p1, ...p2, ...p4)
        normArr.push(...n1, ...n1, ...n1)
      } else {
        posArr.push(...p1, ...p2, ...p3)
        normArr.push(...n1, ...n2, ...n2)
        posArr.push(...p1, ...p3, ...p4)
        normArr.push(...n1, ...n2, ...n1)
      }
    }
  }
}

// ============================================================
// triangulateParametricSurface: 通用参数曲面三角化
// fn(u, v) => [x, y, z]， u 和 v 分别在 [uMin,uMax] 和 [vMin,vMax] 范围内
// ============================================================
function triangulateParametricSurface(g, posArr, normArr) {
  const uSegOrig = Math.min(g.uSegments ?? 40, 30)  // 上限 30
  const vSegOrig = Math.min(g.vSegments ?? 24, 20)  // 上限 20
  const { fn, uMin = 0, uMax = Math.PI * 2, vMin = 0, vMax = Math.PI * 2, uSegments = uSegOrig, vSegments = vSegOrig } = { ...g, uSegments: uSegOrig, vSegments: vSegOrig }
  if (typeof fn !== 'function') return

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const u1 = uMin + (i / uSegments) * (uMax - uMin)
      const u2 = uMin + ((i + 1) / uSegments) * (uMax - uMin)
      const v1 = vMin + (j / vSegments) * (vMax - vMin)
      const v2 = vMin + ((j + 1) / vSegments) * (vMax - vMin)

      const p1 = fn(u1, v1), p2 = fn(u2, v1)
      const p3 = fn(u1, v2), p4 = fn(u2, v2)

      // 三角形1: p1,p2,p3
      const ax1 = p2[0]-p1[0], ay1 = p2[1]-p1[1], az1 = p2[2]-p1[2]
      const bx1 = p3[0]-p1[0], by1 = p3[1]-p1[1], bz1 = p3[2]-p1[2]
      const cnx1 = ay1*bz1-az1*by1, cny1 = az1*bx1-ax1*bz1, cnz1 = ax1*by1-ay1*bx1
      const cl1 = Math.sqrt(cnx1*cnx1+cny1*cny1+cnz1*cnz1) || 1
      const n1 = [cnx1/cl1, cny1/cl1, cnz1/cl1]

      posArr.push(...p1, ...p2, ...p3)
      normArr.push(...n1, ...n1, ...n1)

      // 三角形2: p2,p4,p3
      const ax2 = p4[0]-p2[0], ay2 = p4[1]-p2[1], az2 = p4[2]-p2[2]
      const bx2 = p3[0]-p2[0], by2 = p3[1]-p2[1], bz2 = p3[2]-p2[2]
      const cnx2 = ay2*bz2-az2*by2, cny2 = az2*bx2-ax2*bz2, cnz2 = ax2*by2-ay2*bx2
      const cl2 = Math.sqrt(cnx2*cnx2+cny2*cny2+cnz2*cnz2) || 1
      const n2 = [cnx2/cl2, cny2/cl2, cnz2/cl2]

      posArr.push(...p2, ...p4, ...p3)
      normArr.push(...n2, ...n2, ...n2)
    }
  }
}
