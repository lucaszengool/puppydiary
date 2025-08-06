#!/bin/bash

echo "🚀 启动豆包 PopMart 图像生成后端"
echo "=================================="

# 停止所有现有进程
pkill -f "flux" 2>/dev/null || true
pkill -f "simple_flux.py" 2>/dev/null || true
pkill -f "local_flux_kontext.py" 2>/dev/null || true
pkill -f "doubao_backend.py" 2>/dev/null || true

echo "🔧 清理完成，正在启动豆包后端..."
sleep 2

# 启动豆包后端
cd /Users/James/Desktop/Pepmart/ai-backend
python doubao_backend.py