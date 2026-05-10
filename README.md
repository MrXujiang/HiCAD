<div align="center">

# ⬡ HiCAD

**AI 驱动的参数化 3D CAD 建模平台**

![](https://next.jitword.com/uploads/demo_19e108a1958.png)
![](demo.png)

*用自然语言描述你的想法，秒级生成可 3D 打印的参数化模型*

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=nodedotjs)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg?logo=vuedotjs)](https://vuejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/your-username/hicad/pulls)

[🚀 快速开始](#-快速开始) · [✨ 功能特性](#-功能特性) · [🤖 AI 配置](#-ai-适配器配置) · [🛠️ 技术栈](#️-技术栈) · [🤝 参与贡献](#-参与贡献)

</div>

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🤖 **AI 智能建模** | 自然语言输入，AI 自动生成参数化 JSCAD 3D 代码 |
| 🎯 **双阶段精准建模** | 机械臂/坦克等复杂模型：意图分析 → 确定性代码生成，零定位误差 |
| 👁️ **实时 3D 预览** | WebWorker 驱动零卡顿渲染，Three.js 360° 旋转交互 |
| ✏️ **Monaco 代码编辑器** | VS Code 同款编辑器，语法高亮 + 智能补全 |
| 🎛️ **参数化控制面板** | 滑块实时调节模型尺寸参数，所见即所得 |
| 📦 **STL / OBJ 导出** | 一键导出，直接导入切片软件开始 3D 打印 |
| 🏪 **模板市场** | 浏览、使用、发布社区共享的 3D 参数化模板 |
| 🔗 **模型分享** | 生成分享链接，他人无需登录即可预览你的模型 |
| 🔄 **多 AI 适配器** | 支持 DeepSeek · OpenAI · Qwen，`.env` 一行切换 |
| 📱 **响应式设计** | 完美适配桌面端与移动端 |

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0  
- **pnpm** >= 9.0.0

```bash
# 安装 pnpm（未安装时执行）
npm install -g pnpm
```

### 一键启动

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/hicad.git
cd hicad

# 2. 配置环境变量（填入你的 AI API Key）
cp backend/.env.example backend/.env
# ↑ 编辑 backend/.env，填写你的 DEEPSEEK_API_KEY

# 3. 安装依赖 & 启动
pnpm install && pnpm dev
```

🎉 启动成功后打开浏览器访问：

| 服务 | 地址 |
|------|------|
| 🌐 前端页面 | http://localhost:5173 |
| 🔌 后端 API | http://localhost:3000/api |

> **💡 获取注册激活码**：关注微信公众号 **「趣谈AI」**，回复 **「HiCAD」** 即可免费获得激活码，完成注册后即可使用 AI 建模功能。

---

## ⚙️ 环境变量说明

复制 `backend/.env.example` 为 `backend/.env` 并按需填写：

```env
# 服务端口
PORT=3000

# JWT 密钥（生产环境必须修改为随机字符串！）
JWT_ACCESS_SECRET=change-me-to-random-string-32chars
JWT_REFRESH_SECRET=change-me-to-random-string-32chars

# AI 适配器选择：deepseek | openai | qwen
AI_ADAPTER=deepseek

# 至少填写一个 API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
QWEN_API_KEY=your_qwen_api_key_here

# 数据存储目录（默认 ./data，无需修改）
DATA_DIR=./data

# 前端跨域地址
CORS_ORIGIN=http://localhost:5173
```

---

## 🤖 AI 适配器配置

| 适配器 | 推荐模型 | 特点 | 获取 Key |
|--------|----------|------|----------|
| `deepseek` ⭐ | DeepSeek V3 | **推荐**，性价比极高，代码能力强 | [platform.deepseek.com](https://platform.deepseek.com/) |
| `openai` | GPT-4o | 高质量，价格较高 | [platform.openai.com](https://platform.openai.com/) |
| `qwen` | Qwen-Max | 国内访问稳定 | [dashscope.aliyuncs.com](https://dashscope.aliyuncs.com/) |

修改 `backend/.env` 中的 `AI_ADAPTER` 字段即可切换，重启服务后生效。

---

## 🛠️ 技术栈

<details>
<summary><b>前端技术</b></summary>

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | 3.x | UI 框架，Composition API |
| [Vite](https://vitejs.dev/) | 5.x | 构建工具，极速热重载 |
| [Pinia](https://pinia.vuejs.org/) | 2.x | 状态管理 |
| [Three.js](https://threejs.org/) | 0.160+ | WebGL 3D 渲染 |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 0.45+ | 代码编辑器（VS Code 内核） |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | 原子化 CSS 样式 |
| JSCAD | - | CSG 3D 几何建模引擎（WebWorker） |

</details>

<details>
<summary><b>后端技术</b></summary>

| 技术 | 版本 | 用途 |
|------|------|------|
| [NestJS](https://nestjs.com/) | 10.x | Node.js 企业级框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Passport JWT](http://www.passportjs.org/) | - | 无状态身份认证 |
| [lowdb](https://github.com/typicode/lowdb) | 7.x | 轻量级 JSON 文件数据库 |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | 5.x | 密码安全哈希 |
| SSE (Server-Sent Events) | - | AI 流式输出实时推送 |

</details>

---

## 📁 项目结构

```
hicad/
├── backend/                    # NestJS 后端服务
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/             # AI 建模核心
│   │   │   │   ├── adapters/   # DeepSeek / OpenAI / Qwen 适配器
│   │   │   │   ├── design-prompt.ts   # 机械臂意图分析 Prompt
│   │   │   │   ├── tank-prompt.ts     # 坦克意图分析 Prompt
│   │   │   │   ├── jscad-codegen.ts   # 确定性 3D 代码生成器
│   │   │   │   └── prompt-builder.ts  # 通用建模 Prompt
│   │   │   ├── auth/           # JWT 认证 + 激活码注册
│   │   │   ├── model/          # 3D 模型 CRUD
│   │   │   ├── template/       # 模板市场
│   │   │   ├── user/           # 用户管理 + AI 配额
│   │   │   ├── admin/          # 管理后台
│   │   │   └── feedback/       # 意见反馈
│   │   └── database/           # lowdb JSON 数据库服务
│   ├── data/                   # 运行时数据（.gitignore 保护）
│   └── .env                    # 环境变量（.gitignore 保护）
│
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── pages/              # 页面：Home / Editor / Workspace / Market
│   │   ├── components/         # 组件：AI 聊天框 / 3D 预览 / 代码编辑器
│   │   ├── stores/             # Pinia：用户 / 编辑器 / AI 状态
│   │   ├── composables/        # useJscad / useThreeScene
│   │   └── utils/              # JSCAD 解析 / STL 导出
│   └── public/workers/         # JSCAD WebWorker
│
└── shared/                     # 前后端共享 TypeScript 类型
    └── src/types/              # User / Model / AI 类型定义
```

---

## 🏗️ 构建与部署

### 本地开发

```bash
pnpm dev              # 同时启动前端(5173) + 后端(3000)，支持热重载
pnpm build            # 构建生产版本（shared → backend → frontend）
pnpm start            # 生产模式启动后端
```

### 使用 PM2 部署到服务器

```bash
# 构建
pnpm build

# 将前端 dist 复制到后端 public 或 nginx 静态目录
# 使用 PM2 守护后端进程
pm2 start ecosystem.config.json
pm2 save && pm2 startup
```

### Nginx 反向代理配置参考

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/hicad/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 支持 SSE 流式响应
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }
}
```

---

## 🗺️ 路线图

- [x] AI 自然语言 → JSCAD 3D 模型
- [x] 双阶段精准建模（机械臂 / 坦克）
- [x] Monaco 代码编辑器 + 实时预览
- [x] 参数化控制面板
- [x] 模板市场
- [x] STL / OBJ 导出
- [x] 激活码注册系统
- [ ] Docker 一键部署支持
- [ ] 更多 AI 模型类型（人形机器人、建筑结构）
- [ ] 协同编辑
- [ ] 模型版本历史

---

## 📬 联系与支持

- 🔔 关注微信公众号 **「趣谈AI」** → 回复 **「HiCAD」** 获取激活码及最新动态
- 🐛 提交 [GitHub Issue](https://github.com/your-username/hicad/issues) 反馈 Bug 或功能建议

---

## 📄 开源协议

本项目基于 [GNU General Public License v3.0](LICENSE) 开源。

```
Copyright (C) 2025 HiCAD Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

**本协议要求**：基于本项目的衍生作品必须同样以 GPL v3 协议开源。

---

<div align="center">

如果这个项目对你有帮助，请点一个 ⭐ **Star** 支持一下！

**Made with ❤️ by [趣谈AI](https://github.com/your-username)**

</div>
