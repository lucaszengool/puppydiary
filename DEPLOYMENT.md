# 🐕 小狗日记 - 部署指南

## 🎉 完成的功能

### ✨ 核心增强功能
- **铁的定义**：100%保留原有人物/宠物的面部表情、姿势、动作、大小、生物特征
- **动漫咖啡厅背景**：包含樱花飘落、云朵漂移、萤火虫飞舞、魔法星星等动画效果
- **自动保存缩略图**：每次生成后自动显示保存的图片缩略图
- **视频生成功能**：生成3张图片后可制作vlog短片
- **完全中文界面**：所有UI文本已转换为中文

### 🎨 视觉特效
- 飘落的樱花花瓣动画
- 漂移的动漫风格云朵
- 飞舞的萤火虫光点
- 旋转的魔法星星
- 飘动的音符
- 咖啡蒸汽效果
- 手绘风格边框和阴影

## 🚀 本地开发

### 1. 环境配置
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
```

### 2. 环境变量设置
在 `.env.local` 文件中配置：

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# 豆包视频生成 API
ARK_API_KEY=your_ark_api_key

# 豆包图片生成 API  
DOUBAO_API_KEY=your_doubao_api_key

# 本地AI后端
AI_BACKEND_URL=http://localhost:8003
```

### 3. 启动应用

```bash
# 启动前端
npm run dev

# 启动豆包AI后端 (新终端)
cd ai-backend
python doubao_backend.py
```

访问 http://localhost:3000

## 🚂 Railway 部署

### 1. 连接GitHub仓库
- 访问 [Railway](https://railway.app)
- 创建新项目
- 连接GitHub仓库：`lucaszengool/puppydiary`

### 2. 环境变量配置
在Railway项目设置中添加：

```env
# 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# API密钥
ARK_API_KEY=your_ark_api_key
DOUBAO_API_KEY=your_doubao_api_key
```

### 3. 自动部署
Railway会自动检测Next.js项目并部署。

## 🎬 豆包API配置

### 图片生成API
1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 创建豆包图像生成推理端点
3. 获取API密钥和端点ID
4. 更新 `ai-backend/doubao_backend.py` 中的配置

### 视频生成API
使用火山引擎视频生成服务：
- 端点：`https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`
- 模型：`ep-20250806195158-t2c5h`

## 🔧 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **认证**: Clerk
- **图片生成**: 豆包 Seedream-3.0
- **视频生成**: 豆包视频生成模型
- **部署**: Railway
- **字体**: Noto Sans SC (中文) + Kalam (手写效果)

## 🎯 用户流程

1. **上传/拍照** → 用户选择狗狗照片
2. **AI生成** → 严格保留原有特征，转换为宫崎骏风格
3. **自动保存** → 显示缩略图，追踪已生成图片
4. **风格微调** → 6种预设咖啡厅主题 + 自定义prompt
5. **视频制作** → 3张图片后可生成vlog短片
6. **下载分享** → 保存高质量图片和视频

## 📋 预设风格选项

1. **阳光明媚** ☀️ - 温暖咖啡厅阳光场景
2. **梦幻云朵** ☁️ - 柔和天空般咖啡厅
3. **森林咖啡厅** 🌲 - 自然绿植环绕
4. **温馨时光** 💝 - 家庭般温暖氛围  
5. **活泼咖啡厅** ✨ - 充满活力的色彩
6. **艺术咖啡厅** 🎨 - 创意艺术空间

## 🐛 故障排除

### AI后端连接问题
```bash
# 检查AI后端健康状态
curl http://localhost:8003/health

# 重启AI后端
cd ai-backend
python doubao_backend.py
```

### 环境变量问题
确保所有必需的环境变量都已正确配置，特别是：
- Clerk认证密钥
- 豆包API密钥
- 视频生成API密钥

### 字体加载问题
如果中文字体未正确加载：
1. 检查网络连接到Google Fonts
2. 确认 `Noto Sans SC` 和 `Kalam` 字体已正确导入

## 📞 支持

如有问题，请检查：
1. 控制台错误日志
2. 网络连接状态
3. API密钥配置
4. 豆包后端运行状态

---

🎨 **享受您的宫崎骏风格狗狗日记创作之旅！** 🐕✨