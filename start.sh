#!/bin/bash
# Start script for Railway deployment

# Use Railway's PORT or default to 3000
PORT=${PORT:-3000}

echo "Starting Next.js app on port $PORT"
exec npm start