# 🐕 小狗日记 (Puppy Diary)

一个温暖治愈的宫崎骏风格狗狗成长日记应用，使用 AI 将您的狗狗照片转化为手绘漫画风格。

A warm and healing Ghibli-style dog diary app that transforms your dog photos into hand-drawn manga style using AI.

## ✨ 功能特色 Features

- 🎨 **宫崎骏风格转换** - 将普通照片转化为温暖的手绘漫画风格
- 📸 **拍照/上传** - 支持相机拍摄或从相册上传
- 🎯 **风格微调** - 提供多种预设风格和自定义选项
- 💾 **云端相册** - 登录后可保存所有作品到云端
- 🌏 **中文界面** - 完全中文化的用户界面
- 📱 **响应式设计** - 支持桌面和移动设备

## 🚀 快速开始 Quick Start

### 本地开发 Local Development

1. **克隆仓库 Clone Repository**
```bash
git clone https://github.com/lucaszengool/puppydiary.git
cd puppydiary
```

2. **安装依赖 Install Dependencies**
```bash
npm install
```

3. **配置环境变量 Environment Variables**
创建 `.env.local` 文件：
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# AI Backend (豆包)
DOUBAO_API_KEY=your_doubao_api_key
```

4. **启动开发服务器 Start Development Server**
```bash
npm run dev
```

5. **打开浏览器 Open Browser**
访问 [http://localhost:3000](http://localhost:3000)

## 🚂 Railway 部署 Railway Deployment

### 一键部署 One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/lucaszengool/puppydiary)

### 手动部署 Manual Deployment

1. 在 [Railway](https://railway.app) 创建新项目
2. 连接 GitHub 仓库：`lucaszengool/puppydiary`
3. 添加环境变量（同上述 `.env.local` 中的变量）
4. Railway 会自动检测 Next.js 项目并部署

### 环境变量配置 Environment Variables

在 Railway 项目设置中添加以下环境变量：

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk 公开密钥
- `CLERK_SECRET_KEY` - Clerk 私密密钥
- `DOUBAO_API_KEY` - 豆包 API 密钥
- 其他 Clerk URL 配置

## 🎨 技术栈 Tech Stack

- **前端框架 Frontend**: Next.js 14 + TypeScript
- **样式 Styling**: Tailwind CSS + 自定义 Ghibli 风格
- **认证 Authentication**: Clerk
- **AI 后端 AI Backend**: 豆包大模型 (保持原有逻辑)
- **部署 Deployment**: Railway

## 📁 项目结构 Project Structure

```
puppydiary/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── create/       # 创作页面 - 拍照/上传/生成
│   │   ├── gallery/      # 相册页面
│   │   ├── sign-in/      # 登录页面
│   │   ├── sign-up/      # 注册页面
│   │   └── ...
│   ├── components/       # React 组件
│   │   ├── navigation.tsx # 导航栏
│   │   └── ui/           # UI 组件
│   └── lib/             # 工具函数
├── ai-backend/          # AI 后端代码（豆包）
├── railway.json         # Railway 配置
└── ...
```

## 🎯 使用流程 User Flow

1. **上传/拍照 Upload/Capture** - 选择或拍摄狗狗照片
2. **AI 生成 AI Generation** - 自动转换为宫崎骏风格漫画
3. **风格微调 Style Tuning** - 选择预设风格或自定义描述
   - 阳光明媚 🌞 
   - 梦幻云朵 ☁️
   - 森林冒险 🌲
   - 温馨时光 💝
   - 活泼欢乐 ✨
   - 艺术风格 🎨
4. **保存分享 Save/Share** - 下载或保存到云端相册

## 🔧 开发命令 Development Commands

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 生产模式运行
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 🎨 设计特色 Design Features

- **宫崎骏风格色彩**：温暖的森林绿、天空蓝、沙色调
- **手绘风格边框**：不规则圆角营造手绘感
- **漂浮动画**：轻柔的浮动效果增加生动感
- **水彩背景**：渐变色营造温馨氛围
- **中文手写字体**：Kalam 字体模拟手写效果

## 📝 注意事项 Important Notes

- AI 后端使用豆包大模型，需要配置相应的 API 密钥
- 首次部署可能需要等待依赖安装
- 确保所有环境变量都已正确配置
- 后端逻辑保持不变，只更新了前端界面

## 🤝 贡献 Contributing

欢迎提交 Issue 和 Pull Request！
Welcome to submit Issues and Pull Requests!

## 📄 许可证 License

MIT License

---

Made with 💚 by Puppy Diary Team

记录每一个美好瞬间 🐕✨