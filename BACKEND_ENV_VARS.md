# Backend Service (gleaming-truth) Environment Variables

Remove the Clerk variables from your backend and add these instead:

```env
# Hugging Face Configuration (for model downloads)
HF_TOKEN=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
HF_HOME=/app/models

# Model Cache Directories
TRANSFORMERS_CACHE=/app/models
DIFFUSERS_CACHE=/app/models
HF_DATASETS_CACHE=/app/models

# PyTorch Configuration (Memory optimization)
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
OMP_NUM_THREADS=4
MKL_NUM_THREADS=4

# Python Configuration
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1

# Disable telemetry
DISABLE_TELEMETRY=1
TRANSFORMERS_OFFLINE=0
HF_DATASETS_OFFLINE=0

# Doubao API (if using)
DOUBAO_API_KEY=d02d7827-d0c9-4e86-b99b-ba1952eeb25d

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