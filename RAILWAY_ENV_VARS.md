# Railway Environment Variables Configuration

## Required Environment Variables for Railway Deployment

Copy and paste these variables into your Railway service settings:

### 1. Clerk Authentication (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3V0ZS1ib25lZmlzaC04NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_UelifwMljvBicRm4UIOQqjqWoVs3akaK8h9pE3gZDF
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_3JdYlttIcnLRcm1fejLVOQiUyHZnqU+Y
```

### 2. AI Backend Configuration (Required)
```
AI_BACKEND_URL=https://gleaming-truth-production.up.railway.app
```
Note: This points to your Railway-deployed AI backend service.

### 3. Uploadthing Configuration (Required for image storage)
```
UPLOADTHING_SECRET=your-uploadthing-secret-key
UPLOADTHING_APP_ID=your-uploadthing-app-id
UPLOADTHING_TOKEN=your-uploadthing-token
```
Get these from: https://uploadthing.com/dashboard

### 4. Optional API Keys (for additional features)
```
# OpenAI API Key (for GPT-4 features - optional)
OPENAI_API_KEY=your-openai-key-here

# Hugging Face Token (for FLUX model - optional)
HF_TOKEN=your-huggingface-token-here

# 豆包视频生成 API Key (for video generation - optional)
ARK_API_KEY=your-ark-api-key-here

# 豆包图片生成 API Key (for image generation - optional)
DOUBAO_API_KEY=your-doubao-api-key-here
```

### 5. Node.js Configuration (Optional but recommended)
```
NODE_ENV=production
```

## How to Add These Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your service (puppydiary)
3. Go to the "Variables" tab
4. Click "RAW Editor"
5. Paste all the required variables above
6. Click "Save" 
7. Railway will automatically redeploy with the new variables

## Important Notes:

1. **Clerk Keys**: These are test keys. For production, create production keys at https://clerk.dev
2. **AI Backend URL**: The current configuration points to localhost which won't work in production. You need to:
   - Either deploy the Python backend separately (on Railway or another service)
   - Or use a cloud AI service directly
3. **Optional Keys**: The app will work without the optional keys but some features will be disabled
4. **Security**: Never commit these keys to Git. Always use environment variables.

## Testing After Deployment:

After adding the variables and redeploying:
1. Visit your Railway URL: `puppydiary-production.up.railway.app`
2. The app should load without errors
3. Test the image generation feature
4. Authentication should work with Clerk

## Troubleshooting:

If the app doesn't work after deployment:
1. Check Railway logs for specific errors
2. Ensure all required variables are set correctly
3. Make sure the PORT variable is not set (Railway sets it automatically)
4. Check that the build and start commands are correct in package.json