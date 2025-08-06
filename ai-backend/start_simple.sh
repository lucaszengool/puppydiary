#!/bin/bash

echo "🚀 Starting Simple FLUX.1-Kontext Backend..."

# Kill any existing processes
pkill -f "python.*flux" 2>/dev/null || true
pkill -f "simple_flux.py" 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to FLUX directory and activate environment
cd ../flux
source .venv/bin/activate

# Set Python path
export PYTHONPATH="$(pwd)/src:$PYTHONPATH"

# Navigate back and start simple backend
cd ../ai-backend
python simple_flux.py