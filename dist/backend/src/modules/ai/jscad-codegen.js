"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJscadCode = generateJscadCode;
const design_spec_types_1 = require("./design-spec.types");
const INDUSTRIAL_COLORS = {
    dark: [0.28, 0.32, 0.38],
    mid: [0.48, 0.52, 0.58],
    blue: [0.22, 0.52, 0.88],
    orange: [0.95, 0.45, 0.10],
};
const COLORFUL_COLORS = {
    dark: [0.08, 0.08, 0.14],
    mid: [0.25, 0.28, 0.40],
    blue: [0.10, 0.78, 0.98],
    orange: [1.00, 0.42, 0.00],
};
function generateJscadCode(spec) {
    if (spec.type === 'mechanical_arm') {
        return generateMechanicalArm((0, design_spec_types_1.normalizeArmSpec)(spec));
    }
    if (spec.type === 'tank') {
        return generateTankCode(spec);
    }
    throw new Error(`不支持的模型类型: ${spec.type}`);
}
function generateMechanicalArm(spec) {
    const p = spec.params;
    const f = spec.features;
    const c = spec.style === 'colorful' ? COLORFUL_COLORS : INDUSTRIAL_COLORS;
    const mat = spec.material || 'silver';
    const col = (arr) => `[${arr.map(v => v.toFixed(2)).join(', ')}]`;
    const paramDecls = [
        `const baseWidth     = ${p.baseWidth}    // 底盘宽度 unit:mm min:60 max:180`,
        `const waistRadius   = ${p.waistRadius}   // 腰部半径 unit:mm min:20 max:55`,
        `const waistHeight   = ${p.waistHeight}   // 腰部高度 unit:mm min:25 max:80`,
        `const upperArmLen   = ${p.upperArmLength}    // 大臂长度 unit:mm min:60 max:180`,
        `const upperArmR     = ${p.upperArmRadius}    // 大臂半径 unit:mm min:8 max:22`,
        `const elbowR        = ${p.elbowRadius}    // 肘关节半径 unit:mm min:12 max:30`,
        `const foreArmLen    = ${p.foreArmLength}    // 小臂长度 unit:mm min:40 max:130`,
        `const foreArmR      = ${p.foreArmRadius}     // 小臂半径 unit:mm min:5 max:16`,
        `const wristR        = ${p.wristRadius}    // 腕关节半径 unit:mm min:8 max:20`,
        `const toolLen       = ${p.toolLength}    // 末端工具长度 unit:mm min:15 max:55`,
    ].join('\n');
    const baseSection = buildBase(f.cornerPillars);
    const waistSection = buildWaist(f.flanges);
    const shoulderSection = buildJoint('shoulder', 'sBall', 'sWingL', 'sWingR', 'shoulderR', 3, 14, 6, f.wingJoints);
    const upperArmSection = buildArm('upperArm', 'uaBody', 'uaRib', 'upperArmR', 'UA_H', 'upperArmR + 4', 5, 3, f.ribs);
    const elbowSection = buildJoint('elbow', 'eBall', 'eWingL', 'eWingR', 'elbowR', 2, 12, 5, f.wingJoints);
    const foreArmSection = buildArm('foreArm', 'faBody', 'faRib', 'foreArmR', 'FA_H', 'foreArmR + 3', 4, 3, f.ribs);
    const wristSection = buildJoint('wrist', 'wBall', 'wWingL', 'wWingR', 'wristR', 2, 10, 4, f.wingJoints);
    const endEffSection = buildEndEffector(f.toolType);
    return [
        `// ⚡ 由 AI-CAD 双阶段精准建模管线生成`,
        `// 结构：底盘 → 腰部 → 肩关节 → 大臂 → 肘关节 → 小臂 → 腕关节 → 末端执行器`,
        `// 定位：臂嵌入球关节 OV=6mm，翼半嵌入球体，消除分离感`,
        ``,
        paramDecls,
        ``,
        `function main() {`,
        `  // @material: ${mat}`,
        ``,
        `  const dark   = ${col(c.dark)}`,
        `  const mid    = ${col(c.mid)}`,
        `  const blue   = ${col(c.blue)}`,
        `  const orange = ${col(c.orange)}`,
        ``,
        `  // ─── 精确定位预计算（JS 表达式，参数滑块可实时联动）───`,
        `  const OV          = 6              // 臂嵌入球关节深度 mm`,
        `  const shoulderR   = elbowR + 5     // 肩关节球半径`,
        `  const WAIST_Y0    = 22             // 腰部起始 Y（底盘固定高 22mm）`,
        `  const WAIST_Y1    = WAIST_Y0 + waistHeight`,
        `  const SHOULDER_CY = WAIST_Y1 + shoulderR      // 肩球球心 Y`,
        `  const UA_Y0       = SHOULDER_CY + shoulderR - OV  // 大臂底 Y（嵌入肩球）`,
        `  const UA_H        = upperArmLen + OV * 2          // 大臂含两端延伸总高`,
        `  const ELBOW_CY    = SHOULDER_CY + shoulderR + upperArmLen + elbowR  // 肘球球心`,
        `  const FA_Y0       = ELBOW_CY + elbowR - OV    // 小臂底 Y（嵌入肘球）`,
        `  const FA_H        = foreArmLen + OV * 2           // 小臂含两端延伸总高`,
        `  const WRIST_CY    = ELBOW_CY + elbowR + foreArmLen + wristR  // 腕球球心`,
        `  const EE_Y0       = WRIST_CY + wristR - OV    // 末端执行器底 Y`,
        ``,
        indent(baseSection),
        ``,
        indent(waistSection),
        `  const waist    = translate([0, WAIST_Y0, 0], _waist)`,
        ``,
        `  // 肩关节（shoulderR 已在定位预计算中定义）`,
        indent(shoulderSection),
        `  const shoulder = translate([0, SHOULDER_CY, 0], _shoulder)`,
        ``,
        indent(upperArmSection),
        `  const upperArm = translate([0, UA_Y0, 0], _upperArm)`,
        ``,
        indent(elbowSection),
        `  const elbow    = translate([0, ELBOW_CY, 0], _elbow)`,
        ``,
        indent(foreArmSection),
        `  const foreArm  = translate([0, FA_Y0, 0], _foreArm)`,
        ``,
        indent(wristSection),
        `  const wrist    = translate([0, WRIST_CY, 0], _wrist)`,
        ``,
        indent(endEffSection),
        `  const endEff   = translate([0, EE_Y0, 0], _endEff)`,
        ``,
        `  // === 整体组合（所有部件已精确定位，无分离风险）===`,
        `  return union(base, waist, shoulder, upperArm, elbow, foreArm, wrist, endEff)`,
        `}`,
        ``,
        `module.exports = { main }`,
    ].join('\n');
}
function buildBase(cornerPillars) {
    const lines = [
        `// === 底盘：圆角方形基板 + 中心安装毂${cornerPillars ? ' + 四角支柱' : ''} ===`,
        `const plate = colorize(dark, roundedCuboid({ size: [baseWidth, 12, baseWidth], roundRadius: 6 }))`,
        `const hub   = colorize(mid, translate([0, 12, 0], cylinder({ radius: waistRadius - 3, height: 10 })))`,
    ];
    if (cornerPillars) {
        lines.push(`const d = baseWidth * 0.36`);
        lines.push(`const cp = (x, z) => colorize(dark, translate([x, 0, z], cylinder({ radius: 5, height: 16, segments: 8 })))`);
        lines.push(`const base = union(plate, hub, cp(d, d), cp(-d, d), cp(d, -d), cp(-d, -d))`);
    }
    else {
        lines.push(`const base = union(plate, hub)`);
    }
    return lines.join('\n');
}
function buildWaist(flanges) {
    const lines = [
        `// === 腰部旋转单元：主圆柱${flanges ? ' + 上下法兰盘' : ''} ===`,
        `const waistBody = colorize(mid, cylinder({ radius: waistRadius, height: waistHeight }))`,
    ];
    if (flanges) {
        lines.push(`const flangeBot = colorize(dark, cylinder({ radius: waistRadius + 9, height: 7 }))`);
        lines.push(`const flangeTop = colorize(dark, translate([0, waistHeight - 7, 0], cylinder({ radius: waistRadius + 9, height: 7 })))`);
        lines.push(`const _waist = union(waistBody, flangeBot, flangeTop)`);
    }
    else {
        lines.push(`const _waist = waistBody`);
    }
    return lines.join('\n');
}
function buildJoint(varName, ballVar, wingLVar, wingRVar, radiusExpr, wingXAdd, wingH, wingR, hasWings) {
    const halfH = Math.floor(wingH / 2);
    const comment = varName === 'shoulder' ? '肩' : varName === 'elbow' ? '肘' : '腕';
    const lines = [
        `// === ${comment}部关节：球体${hasWings ? ' + 半嵌入轴承翼' : ''} ===`,
        `const ${ballVar} = colorize(dark, sphere({ radius: ${radiusExpr} }))`,
    ];
    if (hasWings) {
        lines.push(`const ${wingLVar} = colorize(mid, translate([-(${radiusExpr}) - ${wingXAdd}, -${halfH}, 0], cylinder({ radius: ${wingR}, height: ${wingH}, segments: 12 })))`);
        lines.push(`const ${wingRVar} = colorize(mid, translate([ (${radiusExpr}) + ${wingXAdd}, -${halfH}, 0], cylinder({ radius: ${wingR}, height: ${wingH}, segments: 12 })))`);
        lines.push(`const _${varName} = union(${ballVar}, ${wingLVar}, ${wingRVar})`);
    }
    else {
        lines.push(`const _${varName} = ${ballVar}`);
    }
    return lines.join('\n');
}
function buildArm(varName, bodyVar, ribFunc, radiusExpr, heightExpr, ribRadiusExpr, ribH, ribCount, hasRibs) {
    const label = varName === 'upperArm' ? '大臂' : '小臂';
    const lines = [
        `// === ${label}：主圆柱${hasRibs ? ` + ${ribCount} 道加强箍` : ''} ===`,
        `const ${bodyVar} = colorize(blue, cylinder({ radius: ${radiusExpr}, height: ${heightExpr} }))`,
    ];
    if (hasRibs) {
        lines.push(`const ${ribFunc} = (y) => colorize(dark, translate([0, y, 0], cylinder({ radius: ${ribRadiusExpr}, height: ${ribH} })))`);
        if (ribCount === 3) {
            lines.push(`const _${varName} = union(${bodyVar}, ${ribFunc}(OV + 3), ${ribFunc}(${heightExpr} * 0.5), ${ribFunc}(${heightExpr} - OV - ${ribH + 3}))`);
        }
        else {
            lines.push(`const _${varName} = union(${bodyVar}, ${ribFunc}(OV + 3), ${ribFunc}(${heightExpr} - OV - ${ribH + 3}))`);
        }
    }
    else {
        lines.push(`const _${varName} = ${bodyVar}`);
    }
    return lines.join('\n');
}
function buildEndEffector(toolType) {
    const lines = [
        `// === 末端执行器：法兰盘 + ${toolType === 'gripper' ? '双指夹爪' : toolType === 'cylinder' ? '圆柱工具头' : '锥形工具尖'} ===`,
        `const eFlange = colorize(dark, cylinder({ radius: foreArmR + 5, height: 8 }))`,
        `const eTool   = colorize(orange, translate([0, 8, 0], cylinder({ radius: foreArmR, height: toolLen })))`,
    ];
    if (toolType === 'cone') {
        lines.push(`const eTip    = colorize(orange, translate([0, 8 + toolLen, 0], cone({ radius: foreArmR - 1, height: 18 })))`);
        lines.push(`const _endEff = union(eFlange, eTool, eTip)`);
    }
    else if (toolType === 'cylinder') {
        lines.push(`const eTip    = colorize(orange, translate([0, 8 + toolLen, 0], cylinder({ radius: foreArmR - 2, height: 14 })))`);
        lines.push(`const _endEff = union(eFlange, eTool, eTip)`);
    }
    else {
        lines.push(`const grip1   = colorize(orange, translate([foreArmR - 2, 8 + toolLen, 0], cylinder({ radius: 2.5, height: 22 })))`);
        lines.push(`const grip2   = colorize(orange, translate([-(foreArmR - 2), 8 + toolLen, 0], cylinder({ radius: 2.5, height: 22 })))`);
        lines.push(`const _endEff = union(eFlange, eTool, grip1, grip2)`);
    }
    return lines.join('\n');
}
function generateTankCode(spec) {
    const p = spec.params;
    const f = spec.features;
    const mat = spec.material || 'metal';
    const paramDecls = [
        `const hullLength   = ${p.hullLength}    // 车体长度 unit:mm min:60 max:250`,
        `const hullWidth    = ${p.hullWidth}     // 车体宽度 unit:mm min:40 max:150`,
        `const hullHeight   = ${p.hullHeight}    // 车体高度 unit:mm min:15 max:60`,
        `const turretDiam   = ${p.turretDiam}    // 炮塔直径 unit:mm min:25 max:100`,
        `const turretHeight = ${p.turretHeight}  // 炮塔高度 unit:mm min:10 max:45`,
        `const gunLength    = ${p.gunLength}     // 炮管长度 unit:mm min:40 max:180`,
        `const gunRadius    = ${p.gunRadius}     // 炮管半径 unit:mm min:2 max:12`,
        `const trackWidth   = ${p.trackWidth}    // 履带宽度 unit:mm min:6 max:30`,
        `const trackHeight  = ${p.trackHeight}   // 履带高度 unit:mm min:8 max:30`,
        `const wheelCount   = ${p.wheelCount}    // 每侧负重轮数 min:3 max:8`,
    ].join('\n');
    const lines = [
        `// ⚡ 由 AI-CAD 双阶段精准建模管线生成（坦克/装甲车辆）`,
        `// 坐标系：y=0 在地面，-Z=车头方向，X=车宽`,
        ``,
        paramDecls,
        ``,
        `function main() {`,
        `  // @material: ${mat}`,
        ``,
        `  // ─── 颜色 ───`,
        `  const olive   = [0.22, 0.30, 0.15]   // 车体/炮塔 军绿`,
        `  const dark    = [0.14, 0.14, 0.14]   // 履带 深黑`,
        `  const steel   = [0.40, 0.42, 0.45]   // 轮子/炮管 钢灰`,
        ``,
        `  // ─── 精确定位预计算 ───`,
        `  // Y 轴（纵向高度，y=0 在地面）`,
        `  const HULL_Y0   = trackHeight * 0.45       // 车体底面（嵌入履带 45%，增强整体感）`,
        `  const HULL_Y1   = HULL_Y0 + hullHeight     // 车体顶面 = 炮塔底面`,
        `  const TURRET_R  = turretDiam / 2           // 炮塔半径`,
        `  const GUN_CY    = HULL_Y1 + turretHeight * 0.45  // 炮管轴线高度（炮塔腰部）`,
        `  // Z 轴（前后方向，负 Z = 车头）`,
        `  const TURRET_CZ = -hullLength * 0.08       // 炮塔中心 Z（略偏车头）`,
        `  // X 轴（左右方向）`,
        `  const TRACK_CX  = hullWidth / 2 + trackWidth / 2 + 2  // 履带中心 X`,
        `  // 履带尺寸`,
        `  const TRACK_LEN = hullLength + 20          // 履带总长（比车体略长）`,
        `  const WHEEL_W   = trackWidth + 4           // 轮子宽度（略宽于履带）`,
        `  const END_R     = trackHeight / 2 + 1      // 驱动轮半径`,
        `  const ROAD_R    = trackHeight * 0.44       // 负重轮半径`,
        ``,
        `  // === 车体主体 ===`,
        `  // cuboid: Y 底面对齐（y=HULL_Y0），XZ 居中`,
        `  const hull = colorize(olive,`,
        `    translate([0, HULL_Y0, 0],`,
        `      cuboid({ size: [hullWidth, hullHeight, hullLength] })`,
        `    )`,
        `  )`,
    ];
    if (f.slopeArmor) {
        lines.push(``, `  // === 前/后斜甲 ===`, `  const frontSlope = colorize(olive,`, `    translate([0, HULL_Y0 + hullHeight * 0.3, -(hullLength / 2) - 5],`, `      rotate([degToRad(28), 0, 0],`, `        cuboid({ size: [hullWidth - 4, hullHeight * 0.8, 12] })`, `      )`, `    )`, `  )`, `  const rearSlope = colorize(olive,`, `    translate([0, HULL_Y0 + hullHeight * 0.25, hullLength / 2 + 3],`, `      rotate([degToRad(-20), 0, 0],`, `        cuboid({ size: [hullWidth - 4, hullHeight * 0.6, 9] })`, `      )`, `    )`, `  )`);
    }
    lines.push(``, `  // === 炮塔（垂直圆柱，站在车体顶部）===`, `  const turretBody = colorize(olive,`, `    translate([0, HULL_Y1, TURRET_CZ],`, `      cylinder({ radius: TURRET_R, height: turretHeight, segments: 32 })`, `    )`, `  )`, `  // 炮塔顶盖（加宽突出沿）`, `  const turretTop = colorize(olive,`, `    translate([0, HULL_Y1 + turretHeight - 3, TURRET_CZ],`, `      cylinder({ radius: TURRET_R + 3, height: 5, segments: 32 })`, `    )`, `  )`);
    if (f.cupola) {
        lines.push(``, `  // === 指挥塔（炮塔顶部小圆柱帽）===`, `  const cupola = colorize(steel,`, `    translate([TURRET_R * 0.28, HULL_Y1 + turretHeight + 1, TURRET_CZ - TURRET_R * 0.1],`, `      cylinder({ radius: TURRET_R * 0.26, height: TURRET_R * 0.32, segments: 16 })`, `    )`, `  )`);
    }
    lines.push(``, `  // === 炮管（rotateX(-90°) 使 Y 轴圆柱朝 -Z 即车头方向）===`, `  // rotateX(-90°): 变换 (x,y,z)→(x, z, -y)`, `  // 原圆柱 y=0..gunLength → 变换后 z=0..-gunLength`, `  // translate z=TURRET_CZ → 炮管 z: TURRET_CZ → TURRET_CZ-gunLength`, `  const gun = colorize(steel,`, `    translate([0, GUN_CY, TURRET_CZ],`, `      rotateX(degToRad(-90),`, `        cylinder({ radius: gunRadius, height: gunLength, segments: 16 })`, `      )`, `    )`, `  )`, `  // 炮口制退器：紧贴炮管末端（z = TURRET_CZ - gunLength）`, `  const muzzle = colorize(dark,`, `    translate([0, GUN_CY, TURRET_CZ - gunLength],`, `      rotateX(degToRad(-90),`, `        cylinder({ radius: gunRadius + 2.5, height: 8, segments: 16 })`, `      )`, `    )`, `  )`, `  // 炮管护盾（炮塔前侧面，居中对准炮管）`, `  const gunMask = colorize(steel,`, `    translate([0, GUN_CY - gunRadius * 2, TURRET_CZ - TURRET_R + 2],`, `      cuboid({ size: [gunRadius * 4.5, gunRadius * 4, 8] })`, `    )`, `  )`, ``, `  // === 左右履带（底面 y=0，落地）===`, `  // cuboid: Y 从 0 到 trackHeight（贴地），XZ 居中`, `  const trackL = colorize(dark,`, `    translate([-TRACK_CX, 0, 0],`, `      cuboid({ size: [trackWidth, trackHeight, TRACK_LEN] })`, `    )`, `  )`, `  const trackR = colorize(dark,`, `    translate([TRACK_CX, 0, 0],`, `      cuboid({ size: [trackWidth, trackHeight, TRACK_LEN] })`, `    )`, `  )`, ``, `  // === 驱动轮/诱导轮（履带前后端，X 轴圆盘）===`, `  // rotateZ(90°): 变换 (x,y,z)→(-y,x,z)，Y 轴圆柱 → X 方向圆盘`, `  // center:[0,-WHEEL_W/2,0] 使圆柱 y 从 -WHEEL_W/2 到 +WHEEL_W/2（Y 方向居中）`, `  // 旋转后 x 从 -WHEEL_W/2 到 +WHEEL_W/2（X 方向居中）`, `  const makeEndWheel = (side, zPos) => colorize(steel,`, `    translate([side * TRACK_CX, trackHeight / 2, zPos],`, `      rotateZ(degToRad(90),`, `        cylinder({ radius: END_R, height: WHEEL_W, center: [0, -WHEEL_W / 2, 0], segments: 16 })`, `      )`, `    )`, `  )`, `  const endWheelFL = makeEndWheel(-1, -TRACK_LEN / 2)`, `  const endWheelFR = makeEndWheel( 1, -TRACK_LEN / 2)`, `  const endWheelRL = makeEndWheel(-1,  TRACK_LEN / 2)`, `  const endWheelRR = makeEndWheel( 1,  TRACK_LEN / 2)`, ``, `  // === 负重轮（每侧 wheelCount 个，沿履带均匀分布）===`, `  const wheelSpacing = (TRACK_LEN - 20) / (wheelCount + 1)`, `  const wheels = []`, `  for (let i = 0; i < wheelCount; i++) {`, `    const wz = -TRACK_LEN / 2 + 10 + wheelSpacing * (i + 1)`, `    wheels.push(colorize(steel, translate([-TRACK_CX, trackHeight / 2, wz],`, `      rotateZ(degToRad(90), cylinder({ radius: ROAD_R, height: WHEEL_W, center: [0, -WHEEL_W / 2, 0], segments: 12 }))`, `    )))`, `    wheels.push(colorize(steel, translate([ TRACK_CX, trackHeight / 2, wz],`, `      rotateZ(degToRad(90), cylinder({ radius: ROAD_R, height: WHEEL_W, center: [0, -WHEEL_W / 2, 0], segments: 12 }))`, `    )))`, `  }`);
    if (f.exhaustPipe) {
        lines.push(``, `  // === 排气管（车体后部右侧，垂直圆柱）===`, `  const exhaustColor = [0.28, 0.25, 0.20]`, `  const ex1 = colorize(exhaustColor,`, `    translate([hullWidth * 0.28, HULL_Y1 - 5, hullLength / 2 - 10],`, `      cylinder({ radius: gunRadius * 0.75, height: hullHeight * 0.5, segments: 10 })`, `    )`, `  )`, `  const ex2 = colorize(exhaustColor,`, `    translate([hullWidth * 0.14, HULL_Y1 - 5, hullLength / 2 - 10],`, `      cylinder({ radius: gunRadius * 0.75, height: hullHeight * 0.5, segments: 10 })`, `    )`, `  )`);
    }
    if (f.antennas) {
        lines.push(``, `  // === 天线（车体后部左侧）===`, `  const antenna = colorize(steel,`, `    translate([-hullWidth * 0.28, HULL_Y1 + turretHeight * 0.2, hullLength * 0.28],`, `      cylinder({ radius: 1.2, height: hullHeight * 1.8, segments: 8 })`, `    )`, `  )`);
    }
    const allParts = ['hull'];
    if (f.slopeArmor)
        allParts.push('frontSlope', 'rearSlope');
    allParts.push('turretBody', 'turretTop');
    if (f.cupola)
        allParts.push('cupola');
    allParts.push('gun', 'muzzle', 'gunMask');
    allParts.push('trackL', 'trackR');
    allParts.push('endWheelFL', 'endWheelFR', 'endWheelRL', 'endWheelRR');
    allParts.push('...wheels');
    if (f.exhaustPipe)
        allParts.push('ex1', 'ex2');
    if (f.antennas)
        allParts.push('antenna');
    lines.push(``, `  // === 整体合并（所有部件精确定位，无分离风险）===`, `  return union(${allParts.join(', ')})`, `}`, ``, `module.exports = { main }`);
    return lines.join('\n');
}
function indent(block, spaces = 2) {
    const pad = ' '.repeat(spaces);
    return block
        .split('\n')
        .map(line => (line.trim() ? pad + line : ''))
        .join('\n');
}
//# sourceMappingURL=jscad-codegen.js.map