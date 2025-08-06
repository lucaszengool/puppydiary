FROM python:3.10-slim

WORKDIR /app

# Install minimal dependencies for Doubao backend
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0 \
    requests==2.31.0

# Copy the Doubao backend
COPY doubao_backend.py .

# Use Railway's PORT environment variable
ENV PORT=8083

# Expose port
EXPOSE $PORT

# Run the Doubao backend directly
CMD uvicorn doubao_backend:app --host 0.0.0.0 --port $PORT