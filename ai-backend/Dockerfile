FROM python:3.10-slim

WORKDIR /app

# Install only minimal dependencies for demo backend
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0

# Copy only the demo backend
COPY demo_backend.py .

# Use Railway's PORT environment variable
ENV PORT=8003

# Expose port
EXPOSE ${PORT}

# Run the demo application
CMD uvicorn demo_backend:app --host 0.0.0.0 --port $PORT