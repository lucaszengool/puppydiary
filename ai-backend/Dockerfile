FROM python:3.10-slim

WORKDIR /app

# Install minimal dependencies for simple backend
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0

# Copy the simple backend
COPY simple_railway_backend.py .

# Use Railway's PORT environment variable
ENV PORT=8083

# Expose port
EXPOSE $PORT

# Run the simple backend directly
CMD uvicorn simple_railway_backend:app --host 0.0.0.0 --port $PORT