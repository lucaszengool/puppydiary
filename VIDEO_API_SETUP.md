# 视频生成API配置指南 / Video Generation API Setup Guide

## 问题说明 / Issue Description

当前视频生成功能失败是因为ARK_API_KEY配置问题。根据日志分析和API研究，需要正确配置Volcengine ARK平台的API密钥。

The video generation feature is failing due to ARK_API_KEY configuration issues. Based on log analysis and API research, you need to properly configure the Volcengine ARK platform API key.

## 修复步骤 / Fix Steps

### 1. 获取正确的API密钥 / Get Correct API Key

访问 Volcengine ARK 控制台：
Visit Volcengine ARK Console:
- 登录：https://ark.cn-beijing.volces.com/
- 前往：API密钥管理 (API Key Management)
- 创建新的API密钥或使用现有密钥
- 复制完整的API密钥

### 2. 更新环境变量 / Update Environment Variables

在 `.env.local` 文件中，将以下行：
In `.env.local` file, replace this line:
```
ARK_API_KEY=your-ark-api-key-here
```

替换为真实的API密钥：
With your real API key:
```
ARK_API_KEY=your_actual_volcengine_ark_api_key_here
```

### 3. 已修复的技术问题 / Fixed Technical Issues

我已经修复了以下问题：
I've fixed the following issues:

✅ **API端点更正** / API Endpoint Corrected
- 从: `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`
- 到: `https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks`

✅ **模型ID更正** / Model ID Corrected  
- 从: `doubao-seedance-1-0-pro-250528`
- 到: `seedance-1-0-lite-i2v-250428`

✅ **认证导入修复** / Auth Import Fixed
- 从: `@clerk/nextjs`
- 到: `@clerk/nextjs/server`

✅ **增强调试日志** / Enhanced Debug Logging
- 添加了详细的API密钥状态检查
- 添加了请求/响应调试信息

### 4. API密钥格式 / API Key Format

根据研究，Volcengine ARK API使用以下格式：
Based on research, Volcengine ARK API uses this format:

```
Authorization: Bearer YOUR_ARK_API_KEY
```

确保你的API密钥：
Ensure your API key:
- ✅ 来自Volcengine ARK控制台 (From Volcengine ARK Console)
- ✅ 具有视频生成权限 (Has video generation permissions)
- ✅ 支持Seedance模型 (Supports Seedance models)

### 5. 测试配置 / Test Configuration

配置完成后，启动应用并测试视频生成：
After configuration, start the app and test video generation:

```bash
npm run dev
```

检查控制台日志中的调试信息：
Check console logs for debug information:
- `🔑 [VIDEO API DEBUG] ARK_API_KEY status`
- `🎬 [VIDEO API DEBUG] Making request to Volcengine`
- `✅ [VIDEO API DEBUG] Video creation result`

### 6. 故障排除 / Troubleshooting

如果仍然遇到401错误：
If you still encounter 401 errors:

1. **验证API密钥权限** / Verify API Key Permissions
   - 确保密钥有视频生成权限
   - 检查密钥是否过期

2. **检查区域设置** / Check Region Settings
   - 确保使用ap-southeast区域端点
   - 验证账户区域匹配

3. **联系技术支持** / Contact Technical Support
   - Volcengine技术支持
   - 提供错误日志和API响应

## 当前API配置 / Current API Configuration

```typescript
// 端点 / Endpoint
https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks

// 模型 / Model  
seedance-1-0-lite-i2v-250428

// 认证 / Authentication
Authorization: Bearer ${ARK_API_KEY}

// 请求格式 / Request Format
{
  "model": "seedance-1-0-lite-i2v-250428",
  "content": [
    {
      "type": "text", 
      "text": "prompt --resolution 1080p --duration 5"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "image_url_here"
      }
    }
  ]
}
```

## 完成后的期待结果 / Expected Results After Fix

- ✅ 视频生成API将正常工作
- 
✅ 用户可以从3张图片创建视频
- ✅ 详细的调试日志帮助监控状态
- ✅ 错误处理提供清晰的问题描述

配置完成后，请重启应用并测试视频生成功能。
After configuration, please restart the app and test the video generation feature.