# 🧪 Quick FLUX Test Guide

## Current Issue
The FLUX generation is working but timing out due to model download and processing time.

## Quick Fixes Applied
1. ✅ Extended frontend timeout to 15 minutes
2. ✅ Reduced FLUX steps from 30 to 20 for faster generation
3. ✅ Added better logging to track progress
4. ✅ Fixed the prompt to be FLUX-Kontext specific

## Test Steps

### 1. Start the Backend
```bash
cd ai-backend
./start_flux.sh
```

### 2. Test Health Check
```bash
curl http://localhost:8003/health
```
Should return: `{"status":"healthy","models_loaded":true}`

### 3. Test with Simple Generation
Open another terminal and test with a simple curl:
```bash
curl -X POST "http://localhost:8003/test-generate" -H "Content-Type: application/json"
```

### 4. Monitor Backend Logs
Watch the backend terminal for progress. First generation will:
- Download models (~5-10 minutes)
- Generate image (~2-3 minutes)
- Total: ~8-13 minutes

### 5. Subsequent Generations
After the first generation, subsequent ones should be much faster (~2-3 minutes).

## Expected Behavior

**First time:**
- Models download automatically (no token needed)
- Takes 8-13 minutes total
- Models cached in `~/.cache/huggingface/hub/`

**After first time:**
- Uses cached models
- Takes 2-3 minutes per generation
- Much faster subsequent generations

## If Still Timing Out

Try increasing steps gradually:
- Start with 4 steps (fastest, lower quality)
- Then 10 steps (good balance)
- Finally 20 steps (better quality)

The frontend will wait up to 15 minutes now, which should be enough after models are downloaded.