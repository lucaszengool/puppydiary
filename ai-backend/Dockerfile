FROM python:3.10-slim

WORKDIR /app

# Install minimal dependencies for Doubao backend (Lightweight API-only)
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0 \
    requests==2.31.0

# Copy ONLY the Doubao backend (no heavy models)
COPY doubao_backend.py .

# Railway will set PORT automatically
EXPOSE 8083

# Start Doubao API backend (NO model downloads)
CMD ["uvicorn", "doubao_backend:app", "--host", "0.0.0.0", "--port", "8083"]