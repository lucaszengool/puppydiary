# Backend Service (gleaming-truth) Environment Variables

Replace ALL variables with these for Doubao-only backend:

```env
# Doubao API Configuration (Required)
VOLCENGINE_API_KEY=d02d7827-d0c9-4e86-b99b-ba1952eeb25d
DOUBAO_ENDPOINT_ID=ep-20250806185345-cvg4w

# Python Configuration
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Service Configuration
LOG_LEVEL=INFO
DEBUG=false

# PORT will be set automatically by Railway to 8083
```

## Steps to Update Backend Variables:

1. Go to your backend service (gleaming-truth) in Railway
2. Click on "Variables" tab
3. Delete all the Clerk-related variables (they belong to frontend only)
4. Click "RAW Editor"
5. Paste the variables above
6. Click "Save"

The backend will automatically redeploy with the correct configuration.