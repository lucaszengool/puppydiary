#!/bin/bash

# Start FLUX.1-Kontext Local Backend
echo "🚀 Starting FLUX.1-Kontext Local Backend..."
echo "📍 Running completely locally without HuggingFace tokens"
echo "🔧 Models will be downloaded automatically on first generation"
echo ""

# Navigate to the FLUX directory and activate environment
cd ../flux
source .venv/bin/activate

# Add FLUX to Python path
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"

# Navigate back to ai-backend and run the local server
cd ../ai-backend
python local_flux_kontext.py