#!/usr/bin/env python3
"""
豆包 (Doubao) 图像生成后端
使用火山引擎方舟平台的豆包模型进行图像生成
"""
import os
import json
import time
import base64
import logging
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import requests
from PIL import Image

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="豆包 PopMart 图像生成 API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 火山引擎配置 - 从环境变量读取
VOLCENGINE_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
VOLCENGINE_API_KEY = os.environ.get("VOLCENGINE_API_KEY", "d02d7827-d0c9-4e86-b99b-ba1952eeb25d")
DOUBAO_ENDPOINT_ID = os.environ.get("DOUBAO_ENDPOINT_ID", "ep-20250806185345-cvg4w")

class DoubaoImageGenerator:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_image(self, prompt: str, image_path: str = None, size: str = "adaptive", guidance_scale: float = 5.5, seed: int = None) -> dict:
        """
        使用豆包模型生成/编辑图像
        """
        # 使用火山引擎图像生成端点
        url = f"{self.base_url}/images/generations"
        
        # 构建请求数据（按照你的API文档格式）
        data = {
            "model": DOUBAO_ENDPOINT_ID,
            "prompt": prompt,
            "response_format": "b64_json",  # 使用base64格式便于前端显示
            "size": size,
            "guidance_scale": guidance_scale,
            "watermark": False  # 关闭水印
        }
        
        # 如果提供了图像，添加图像编辑功能
        if image_path:
            data["image"] = image_path
        
        if seed is not None:
            data["seed"] = seed
        
        logger.info(f"🎨 正在使用豆包生成图像: {prompt[:50]}...")
        
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=120)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ 豆包API响应成功")
            
            # 处理火山引擎图像生成API响应 (OpenAI兼容格式)
            if "data" in result and len(result["data"]) > 0:
                image_item = result["data"][0]
                
                # 检查是否有base64数据
                if "b64_json" in image_item:
                    b64_json = image_item["b64_json"]
                    image_data = f"data:image/png;base64,{b64_json}"
                    return {
                        "success": True,
                        "image_data": image_data,
                        "prompt": prompt
                    }
                    
                # 检查是否有URL（备用方案）
                elif "url" in image_item:
                    # 如果是URL，我们需要下载并转换为base64
                    try:
                        img_response = requests.get(image_item["url"], timeout=30)
                        if img_response.status_code == 200:
                            img_base64 = base64.b64encode(img_response.content).decode('utf-8')
                            image_data = f"data:image/png;base64,{img_base64}"
                            return {
                                "success": True,
                                "image_data": image_data,
                                "prompt": prompt
                            }
                    except Exception as e:
                        logger.warning(f"下载图像URL失败: {e}")
                        # 如果下载失败，直接返回URL
                        return {
                            "success": True,
                            "image_data": image_item["url"],
                            "prompt": prompt
                        }
            
            logger.error(f"❌ 豆包API响应格式异常: {result}")
            return {
                "success": False,
                "error": "API响应格式异常",
                "response": result
            }
            
        except requests.exceptions.Timeout:
            logger.error("❌ 豆包API请求超时")
            return {
                "success": False,
                "error": "请求超时，请重试"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 豆包API请求失败: {e}")
            return {
                "success": False,
                "error": f"API请求失败: {str(e)}"
            }
        except Exception as e:
            logger.error(f"❌ 豆包图像生成异常: {e}")
            return {
                "success": False,
                "error": f"生成失败: {str(e)}"
            }

# 初始化豆包生成器
doubao_generator = DoubaoImageGenerator(VOLCENGINE_API_KEY, VOLCENGINE_BASE_URL)

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "models_loaded": True, "provider": "豆包 (Doubao)"}

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
    使用豆包生成PopMart风格图像
    """
    start_time = time.time()
    
    # 记录接收到的参数
    logger.info(f"📥 Received parameters: art_style={art_style}, cuteness_level={cuteness_level}, color_palette={color_palette}")
    logger.info(f"📝 Custom prompt: {prompt[:50] if prompt else 'None'}...")
    
    # DEBUG: 打印prompt的详细信息
    print(f"🔍 DEBUG - prompt type: {type(prompt)}")
    print(f"🔍 DEBUG - prompt value: {repr(prompt)}")
    print(f"🔍 DEBUG - prompt length: {len(prompt) if prompt else 0}")
    print(f"🔍 DEBUG - art_style: {art_style}")
    
    try:
        # 构建严格保留原有特征的中文Prompt（豆包支持中英双语）
        # 铁的定义：100%保留原有特征
        preservation_prompt = "重要：必须100%保留原始图片中的人物或宠物的所有特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、标记和任何独特特征都要完全一致。"
        
        # 定义不同艺术风格的转换
        style_prompts = {
            "oil_painting": "将图片转换为印象派油画风格，生动的色彩斑块，短促的笔触，捕捉光影变化，莫奈和雷诺阿式的浪漫，注重瞬间的光感和氛围",
            "watercolor": "将图片转换为水彩画风格，柔和的水彩晕染效果，透明的色彩层次，轻盈的笔触，清新淡雅的艺术风格",
            "anime": "将图片转换为宫崎骏风格的手绘漫画，温暖柔和的水彩色调，细腻的光影效果，梦幻氛围，手工绘制质感",
            "cartoon": "将图片转换为迪士尼皮克斯3D动画风格，圆润可爱的造型，鲜艳的色彩，光滑的表面质感，电影级渲染",
            "photography": "将图片转换为复古摄影风格，胶片质感，温暖的色调，颗粒感，怀旧的氛围，经典的构图",
            "minimalist": "将图片转换为现代简约风格，干净的线条，简洁的构图，有限的色彩，极简主义美学"
        }
        
        # 检查prompt是否包含前端自动添加的内容
        is_frontend_auto_prompt = prompt and "重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征" in prompt
        
        print(f"🔍 DEBUG - is_frontend_auto_prompt: {is_frontend_auto_prompt}")
        
        if is_frontend_auto_prompt:
            # 这是前端自动生成的prompt，根据art_style来生成合适的风格提示
            base_style = style_prompts.get(art_style, style_prompts["anime"])  # 默认使用anime风格
            final_prompt = f"{preservation_prompt} {base_style}"
            print(f"✅ Using art_style-based prompt for: {art_style}")
        elif prompt and prompt.strip():
            # 用户自定义prompt（不包含前端自动内容）
            final_prompt = f"{preservation_prompt} {prompt.strip()}"
            print(f"✅ Using custom user prompt")
        else:
            # 没有prompt，使用默认风格
            base_style = style_prompts.get(art_style, style_prompts["anime"])  # 默认使用anime风格
            final_prompt = f"{preservation_prompt} {base_style}"
            print(f"✅ No prompt, using art_style default: {art_style}")
        
        logger.info(f"🎨 生成提示词: {final_prompt}")
        
        # 将上传的图像转换为base64
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/jpeg;base64,{image_base64}"
        
        # 调用豆包API生成图像（图像编辑模式）
        result = doubao_generator.generate_image(
            prompt=f"将这个宠物图像转换为PopMart风格：{final_prompt}",
            image_path=image_data_url,  # 使用base64数据URL
            guidance_scale=5.5
        )
        
        generation_time = time.time() - start_time
        
        if result["success"]:
            # 定义风格名称映射
            style_names = {
                "oil_painting": "印象派油画风格",
                "watercolor": "水彩画风格",
                "anime": "宫崎骏动漫风格",
                "cartoon": "迪士尼卡通风格",
                "photography": "复古摄影风格",
                "minimalist": "现代简约风格"
            }
            
            style_display = style_names.get(art_style, "艺术风格")
            
            return JSONResponse({
                "success": True,
                "imageUrl": result["image_data"],
                "analysis": f"已生成{style_display}图像，耗时 {generation_time:.1f}秒。您可以继续微调或尝试其他风格。",
                "generationTime": f"{generation_time:.1f}",
                "art_style_used": art_style,  # 添加实际使用的art_style
                "prompt": final_prompt,
                "model": "豆包 Seedream-3.0 图像编辑",
                "showPromptInput": True,  # 显示提示词输入框
                "suggestedPrompts": [  # 建议的微调选项（已包含特征保留要求）
                    "在温暖的猫狗咖啡厅环境中，保持原有姿势和表情，变为可爱的泡泡玛特手办风格",
                    "在梦幻的森林咖啡厅背景中，保持所有原有特征，宫崎骏风格更加突出",
                    "在咖啡香气环绕的环境中，保持原有表情动作，变为柔美的水彩画风格",
                    "在温馨的咖啡厅角落，保持原有神态，变为印象派油画风格，光影斑驳",
                    "在静谧的咖啡厅氛围中，保持原有所有特征，变为精致的彩色素描风格"
                ]
            })
        else:
            logger.error(f"❌ 豆包生成失败: {result.get('error')}")
            raise HTTPException(
                status_code=500, 
                detail=f"豆包图像生成失败: {result.get('error', '未知错误')}"
            )
            
    except Exception as e:
        logger.error(f"❌ 生成图像时发生错误: {e}")
        raise HTTPException(status_code=500, detail=f"图像生成失败: {str(e)}")

@app.post("/test-generate")
async def test_generate():
    """测试豆包API连接"""
    try:
        test_prompt = "把这个图像变成可爱的泡泡玛特风格小熊手办，Q版造型，大眼睛"
        # 使用示例图像URL进行测试
        test_image_url = "https://ark-project.tos-cn-beijing.volces.com/doc_image/seededit_i2i.jpeg"
        result = doubao_generator.generate_image(test_prompt, test_image_url)
        
        return {
            "test": "completed",
            "success": result["success"],
            "prompt": test_prompt,
            "error": result.get("error") if not result["success"] else None
        }
        
    except Exception as e:
        logger.error(f"测试生成失败: {e}")
        return {"test": "failed", "error": str(e)}

if __name__ == "__main__":
    print("🚀 启动豆包 PopMart 图像生成后端...")
    print("🎨 使用火山引擎豆包模型 (Seedream-3.0)")
    print("🔑 API Key 已配置")
    print("🌐 支持中英双语提示词")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8083,
        log_level="info"
    )