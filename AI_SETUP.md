# 🎨 Pepmart - AI Pet Portrait Generator

Transform your pet photos into adorable PopMart-style collectible figures using **completely local AI** - no API costs, no cloud dependencies!

## ✨ Features

- 🆓 **100% Free** - No OpenAI or cloud API costs
- 🎯 **PopMart Style** - Fine-tuned for Labubu, Molly, and designer toy aesthetics  
- 🔒 **Privacy First** - All processing happens locally
- ⚡ **Fast Generation** - 2-5 seconds per image
- 📱 **No Sign-up Required** - Upload and generate instantly
- 🎮 **Pose Preservation** - Maintains your pet's exact position
- 🌟 **Production Ready** - Fully containerized and deployable

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI        │    │   Stable        │
│   Frontend      │◄──►│   Backend        │◄──►│   Diffusion     │
│   (Port 3000)   │    │   (Port 8000)    │    │   + LoRA        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
      │                         │                        │
      ▼                         ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Clerk Auth    │    │   ControlNet     │    │   PopMart       │
│   (Optional)    │    │   Pose Control   │    │   Fine-tuning   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 18+
- 8GB+ GPU (recommended) or Apple Silicon Mac

### 1. Setup AI Backend
```bash
cd ai-backend
chmod +x start.sh
./start.sh
```

This will:
- Create Python virtual environment
- Install all AI dependencies
- Download Stable Diffusion models (~4GB)
- Fine-tune for PopMart style
- Start API server on http://localhost:8000

### 2. Setup Frontend
```bash
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### 3. Test the System
1. Visit http://localhost:3000/create
2. Upload a pet photo
3. Watch as your pet transforms into an adorable PopMart figure!

## 🎯 How It Works

### Local AI Pipeline
1. **Pet Detection** - Simple image analysis (no API costs)
2. **Pose Extraction** - ControlNet detects pet positioning  
3. **Style Generation** - LoRA fine-tuned Stable Diffusion creates PopMart figures
4. **Result** - Cute collectible figure matching your pet's pose

### PopMart Fine-tuning
- **LoRA Method** - Efficient fine-tuning with small datasets
- **PopMart Dataset** - Trained on Labubu, Molly, Pucky, Dimoo styles
- **Pose Control** - ControlNet preserves original pet positions
- **Quality** - HD generation with kawaii aesthetics

## 📊 Performance

| Metric | Local AI | OpenAI DALL-E |
|--------|----------|---------------|
| **Cost** | $0 | $0.04-0.08 per image |
| **Speed** | 2-5 seconds | 15-30 seconds |
| **Privacy** | 100% local | Cloud processing |
| **Customization** | Full control | Limited prompts |
| **Offline** | ✅ Yes | ❌ No |

---

**Made with ❤️ for pet lovers and AI enthusiasts**

*Transform your pets into adorable collectibles with zero API costs!* 🐾