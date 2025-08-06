#!/bin/bash

echo "🚀 Starting FLUX Backend with Visible Logs"
echo "=================================="

# Kill any existing processes
pkill -f "simple_flux.py" 2>/dev/null || true
pkill -f "local_flux_kontext.py" 2>/dev/null || true
sleep 2

# Set up environment
cd ../flux
source .venv/bin/activate
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"

# Suppress warnings
export TOKENIZERS_PARALLELISM=false
export TRANSFORMERS_VERBOSITY=error

# Navigate back and run
cd ../ai-backend

echo "🔧 Environment ready, starting backend..."
echo "🗂️ Logs will be visible here:"
echo "=================================="

# Run with visible output
python simple_flux.py