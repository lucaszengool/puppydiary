#!/usr/bin/env python3
"""
豆包 (Doubao) 演示后端 - 当API配置不正确时使用演示模式
"""
import os
import json
import time
import base64
import logging
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
import uvicorn
from PIL import Image, ImageDraw, ImageFont

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="豆包 PopMart 图像生成 API (演示模式)")

def create_demo_image(prompt: str) -> str:
    """
    创建演示图片，显示提示词信息
    """
    # 创建一个1024x1024的图片
    img = Image.new('RGB', (1024, 1024), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    try:
        # 尝试使用系统字体
        font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 40)
        title_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 60)
    except:
        # 如果没有中文字体，使用默认字体
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()
    
    # 绘制标题
    title = "豆包 PopMart 演示"
    draw.text((512, 200), title, font=title_font, fill='darkblue', anchor='mm')
    
    # 绘制提示词
    lines = [
        "🎨 生成提示词:",
        prompt[:40] + "..." if len(prompt) > 40 else prompt,
        "",
        "📝 配置说明:",
        "1. 在火山引擎控制台创建推理端点",
        "2. 获取正确的端点ID",
        "3. 更新API配置",
        "",
        "🚀 配置完成后将生成真实图像"
    ]
    
    y = 350
    for line in lines:
        if line:
            draw.text((512, y), line, font=font, fill='darkblue', anchor='mm')
        y += 60
    
    # 保存为base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    base64_img = base64.b64encode(img_data).decode('utf-8')
    
    return f"data:image/png;base64,{base64_img}"

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "models_loaded": True, "provider": "豆包 (Doubao) - 演示模式"}

@app.post("/generate")
async def generate_image(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"), 
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None)
):
    """
    演示模式：生成演示图片
    """
    start_time = time.time()
    
    try:
        # 构建中文Prompt
        if prompt and prompt.strip():
            final_prompt = prompt.strip()
        else:
            base_prompt = "可爱的泡泡玛特风格手办，"
            
            if art_style == "popmart":
                base_prompt += "Q版卡通造型，大眼睛，圆润造型，"
            else:
                base_prompt += "宫崎骏动画风格，柔和色彩，"
            
            if cuteness_level == "high":
                base_prompt += "超级可爱，萌萌的表情，"
            elif cuteness_level == "medium":
                base_prompt += "可爱友善的样子，"
            
            if color_palette == "vibrant":
                base_prompt += "鲜艳明亮的色彩，"
            elif color_palette == "pastel":
                base_prompt += "柔和的马卡龙色彩，"
            
            base_prompt += "高质量，精致细节"
            final_prompt = base_prompt
        
        logger.info(f"🎨 演示模式 - 生成提示词: {final_prompt}")
        
        # 模拟生成时间
        import random
        time.sleep(random.uniform(1, 3))
        
        # 创建演示图片
        demo_image = create_demo_image(final_prompt)
        
        generation_time = time.time() - start_time
        
        return JSONResponse({
            "success": True,
            "imageUrl": demo_image,
            "analysis": f"演示模式：显示豆包API配置信息，耗时 {generation_time:.1f}秒。请配置正确的API端点以生成真实图像。",
            "generationTime": f"{generation_time:.1f}",
            "prompt": final_prompt,
            "model": "豆包演示模式 - 需要配置API"
        })
            
    except Exception as e:
        logger.error(f"❌ 演示模式错误: {e}")
        raise HTTPException(status_code=500, detail=f"演示模式失败: {str(e)}")

@app.post("/test-generate")
async def test_generate():
    """测试演示模式"""
    try:
        test_prompt = "一个可爱的泡泡玛特风格小熊手办，Q版造型，大眼睛"
        demo_image = create_demo_image(test_prompt)
        
        return {
            "test": "completed",
            "success": True,
            "prompt": test_prompt,
            "demo_mode": True,
            "message": "演示模式工作正常，请配置正确的豆包API端点"
        }
        
    except Exception as e:
        logger.error(f"演示测试失败: {e}")
        return {"test": "failed", "error": str(e)}

if __name__ == "__main__":
    print("🚀 启动豆包 PopMart 图像生成后端 (演示模式)...")
    print("📝 这是演示模式，需要正确配置豆包API")
    print("")
    print("🔧 配置步骤：")
    print("1. 访问火山引擎控制台: https://console.volcengine.com/ark")
    print("2. 创建豆包图像生成推理端点")
    print("3. 获取端点ID (格式如: ep-20250806183012-xxxxx)")
    print("4. 更新 doubao_backend.py 中的配置")
    print("")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8003,
        log_level="info"
    )