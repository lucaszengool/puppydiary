#!/bin/bash

# Pepmart AI Backend Startup Script
# This script sets up and runs the local AI backend

set -e  # Exit on any error

echo "🚀 Starting Pepmart AI Backend"
echo "==============================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ main.py not found. Please run this script from the ai-backend directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install requirements
echo "📥 Installing requirements..."
pip install -r requirements.txt --quiet

# Check GPU availability
echo "🔍 Checking system capabilities..."
python3 -c "
import torch
print(f'PyTorch version: {torch.__version__}')
if torch.cuda.is_available():
    print(f'✅ CUDA GPU detected: {torch.cuda.get_device_name(0)}')
    print(f'   CUDA version: {torch.version.cuda}')
    print(f'   GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
elif torch.backends.mps.is_available():
    print('✅ Apple Metal Performance Shaders (MPS) detected')
else:
    print('⚠️  No GPU detected, using CPU (generation will be slower)')
"

# Run fine-tuning if models don't exist
if [ ! -d "models/popmart-lora" ]; then
    echo "🎨 Setting up PopMart fine-tuning (first time only)..."
    python3 fine_tune.py
fi

# Start the server
echo ""
echo "🌟 Starting AI backend server..."
echo "   API will be available at: http://localhost:8000"
echo "   Health check: http://localhost:8000/health"
echo "   Documentation: http://localhost:8000/docs"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Run the FastAPI server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload