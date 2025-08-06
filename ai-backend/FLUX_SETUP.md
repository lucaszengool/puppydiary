# 🎨 FLUX.1-Kontext Local Setup

This setup allows you to run FLUX.1-Kontext completely locally without any HuggingFace tokens or authentication issues.

## ✅ What's Been Set Up

1. **Official FLUX Repository**: Cloned from Black Forest Labs
2. **Local Python Backend**: Integrated with your existing frontend
3. **No Token Required**: Models download automatically and cache locally

## 🚀 How to Start

### Option 1: Using the startup script
```bash
cd ai-backend
./start_flux.sh
```

### Option 2: Manual startup
```bash
# Activate FLUX environment
cd flux
source .venv/bin/activate
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"

# Run the backend
cd ../ai-backend
python local_flux_kontext.py
```

## 🔧 How It Works

1. **First Generation**: Models download automatically (takes a few minutes)
2. **Subsequent Generations**: Uses cached models (much faster)
3. **Frontend Integration**: Your existing frontend automatically detects and uses the local backend
4. **PopMart Style**: Automatically generates PopMart-style collectible figures

## 📡 API Endpoints

- **Health Check**: `GET http://localhost:8003/health`
- **Generate**: `POST http://localhost:8003/generate` (matches your frontend API)

## 🎯 Frontend Integration

Your frontend at `src/app/api/generate/route.ts` is already configured to:
- Check for local backend on port 8003
- Fall back to demo mode if backend is offline
- Pass all the right parameters (art_style, cuteness_level, etc.)

## 📋 Model Info

- **Model**: FLUX.1-Kontext-dev (12B parameters)
- **Purpose**: Image-to-image editing with text prompts
- **License**: Non-commercial use
- **Storage**: Models cached in `~/.cache/huggingface/hub/`

## 🐛 Troubleshooting

If the backend doesn't start:
1. Check that Python 3.11 is being used
2. Make sure PyTorch is installed: `pip list | grep torch`
3. Check the FLUX virtual environment: `cd flux && source .venv/bin/activate && python -c "import torch; print('OK')"`

Models will download from HuggingFace on first run, but no token is required.