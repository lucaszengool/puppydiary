# Railway 环境变量完整配置指南

## 一、前端服务 (puppydiary-production) 环境变量

在 Railway 的前端服务中，进入 Variables 标签页，点击 "RAW Editor"，然后粘贴以下内容：

```env
# Clerk 认证配置（必需）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3V0ZS1ib25lZmlzaC04NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_UelifwMljvBicRm4UIOQqjqWoVs3akaK8h9pE3gZDF
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_3JdYlttIcnLRcm1fejLVOQiUyHZnqU+Y

# AI 后端配置（必需）- 指向你的 Railway AI 后端服务
AI_BACKEND_URL=https://gleaming-truth-production.up.railway.app

# Uploadthing 配置（用于图片云存储，可选但推荐）
# 请使用你在 .env.local 中的实际值
UPLOADTHING_SECRET=your-uploadthing-secret-key
UPLOADTHING_APP_ID=your-uploadthing-app-id  
UPLOADTHING_TOKEN=your-uploadthing-token

# 可选 API 密钥
OPENAI_API_KEY=sk-your-openai-api-key-here
ARK_API_KEY=your-volcano-engine-api-key-for-video
DOUBAO_API_KEY=your-doubao-api-key-here

# Node.js 配置
NODE_ENV=production
```

### 注意事项：
1. **Clerk 密钥**：这些是测试密钥。生产环境请在 https://clerk.dev 创建生产密钥
2. **AI_BACKEND_URL**：必须指向你的 Railway AI 后端服务 URL
3. **Uploadthing**：在 https://uploadthing.com/dashboard 注册并获取密钥
4. **不要设置 PORT**：Railway 会自动设置

---

## 二、AI 后端服务 (gleaming-truth) 环境变量

在 Railway 的 AI 后端服务中，进入 Variables 标签页，点击 "RAW Editor"，然后粘贴以下内容：

```env
# Hugging Face 配置（用于下载模型）
HF_TOKEN=hf_your_huggingface_token_here
HF_HOME=/app/models

# 模型缓存配置
TRANSFORMERS_CACHE=/app/models
DIFFUSERS_CACHE=/app/models
HF_DATASETS_CACHE=/app/models

# PyTorch 配置（优化内存使用）
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
OMP_NUM_THREADS=4
MKL_NUM_THREADS=4

# 禁用遥测
TRANSFORMERS_OFFLINE=0
HF_DATASETS_OFFLINE=0
DISABLE_TELEMETRY=1

# Python 配置
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# 服务配置（Railway 会自动设置 PORT）
# 不要手动设置 PORT，让 Railway 自动分配

# 可选：豆包 API（如果使用豆包模型）
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_MODEL_ENDPOINT=your-model-endpoint

# 可选：调试模式
DEBUG=false
LOG_LEVEL=INFO
```

### 重要配置说明：

1. **HF_TOKEN**：
   - 在 https://huggingface.co/settings/tokens 创建
   - 需要 read 权限来下载模型

2. **模型缓存目录**：
   - 所有设置为 `/app/models` 以便在容器中持久化

3. **内存优化**：
   - PyTorch 配置已优化为使用较少内存
   - 使用 CPU 版本的 PyTorch 以适应 Railway 的资源限制

---

## 三、Railway 服务配置步骤

### 前端服务设置：
1. 进入 `puppydiary-production` 服务
2. 点击 "Variables" 标签
3. 点击 "RAW Editor"
4. 粘贴上面的前端环境变量
5. 点击 "Save"
6. 服务会自动重新部署

### AI 后端服务设置：
1. 进入 `gleaming-truth-production` 服务
2. 点击 "Variables" 标签
3. 点击 "RAW Editor"
4. 粘贴上面的后端环境变量
5. 点击 "Save"
6. 确保以下设置正确：
   - **Root Directory**: `ai-backend`
   - **Port**: 8083（在 Networking 中设置）
   - **Build Command**: 默认（使用 Dockerfile）
   - **Start Command**: 默认（使用 Dockerfile 中的 CMD）

---

## 四、验证部署

### 前端验证：
1. 访问 `https://puppydiary-production.up.railway.app`
2. 应该能看到主页
3. 尝试上传图片并生成

### 后端验证：
1. 访问 `https://gleaming-truth-production.up.railway.app/health`
2. 应该返回：
```json
{
  "status": "healthy",
  "models_loaded": true,
  "provider": "Enhanced SDXL"
}
```

---

## 五、常见问题解决

### 1. 后端部署失败
- 检查 requirements-production.txt 是否正确
- 确保 Dockerfile 使用 CPU 版本的 PyTorch
- 检查内存限制，可能需要升级 Railway 计划

### 2. 前端无法连接后端
- 确保 AI_BACKEND_URL 正确指向后端服务
- 检查后端服务是否正常运行
- 确保后端的 CORS 设置允许前端域名

### 3. 图片生成失败
- 检查后端日志查看具体错误
- 可能是模型下载失败，检查 HF_TOKEN
- 可能是内存不足，考虑使用更小的模型

### 4. 环境变量不生效
- 确保点击了 "Save" 按钮
- 等待服务重新部署完成
- 检查日志确认环境变量已加载

---

## 六、生产环境优化建议

1. **使用生产版 Clerk 密钥**
2. **配置 Uploadthing** 用于图片存储
3. **使用 CDN** 加速静态资源
4. **配置自定义域名**
5. **启用 Railway 的自动扩展**
6. **设置健康检查路径** 为 `/api/health`
7. **配置监控和日志**