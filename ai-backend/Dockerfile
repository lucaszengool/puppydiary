FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-glx \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements-production.txt .

# Install Python dependencies with CPU-only torch
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-production.txt

# Copy application files
COPY enhanced_main.py .
COPY doubao_backend.py .

# Create a startup script to use the PORT environment variable
RUN echo '#!/bin/bash\nuvicorn enhanced_main:app --host 0.0.0.0 --port ${PORT:-8083}' > start.sh && \
    chmod +x start.sh

# Railway will set the PORT environment variable  
EXPOSE ${PORT:-8083}

# Use the startup script
CMD ["./start.sh"]