from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionPipeline, StableDiffusionControlNetPipeline, ControlNetModel
from diffusers import DPMSolverMultistepScheduler
from PIL import Image
import io
import base64
import cv2
import numpy as np
from controlnet_aux import OpenposeDetector
import logging
import os
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://puppydiary-production.up.railway.app",
        "https://petpoofficial.org",
        "https://gleaming-truth-production.up.railway.app",
        "*"  # Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
pipeline = None
controlnet_pipeline = None
pose_detector = None
executor = ThreadPoolExecutor(max_workers=1)

class AIModels:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load Stable Diffusion and ControlNet models"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading models on device: {self.device}")
        
        try:
            # Load base Stable Diffusion model
            model_id = "runwayml/stable-diffusion-v1-5"
            
            global pipeline
            pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            pipeline = pipeline.to(self.device)
            pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
            
            # Enable memory efficient attention
            if self.device == "cuda":
                pipeline.enable_xformers_memory_efficient_attention()
                pipeline.enable_model_cpu_offload()
            elif self.device == "mps":
                # MPS optimizations
                pipeline.enable_attention_slicing()
                # Move VAE to CPU to save memory
                pipeline.vae.cpu()
            
            # Load ControlNet for pose preservation
            controlnet = ControlNetModel.from_pretrained(
                "lllyasviel/sd-controlnet-openpose",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            global controlnet_pipeline
            controlnet_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
                model_id,
                controlnet=controlnet,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            controlnet_pipeline = controlnet_pipeline.to(self.device)
            controlnet_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(controlnet_pipeline.scheduler.config)
            
            if self.device == "cuda":
                controlnet_pipeline.enable_xformers_memory_efficient_attention()
                controlnet_pipeline.enable_model_cpu_offload()
            elif self.device == "mps":
                # MPS optimizations
                controlnet_pipeline.enable_attention_slicing()
                # Move VAE to CPU to save memory
                controlnet_pipeline.vae.cpu()
            
            # Load pose detector
            global pose_detector
            pose_detector = OpenposeDetector.from_pretrained("lllyasviel/Annotators")
            
            self.models_loaded = True
            logger.info("All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load AI models: {str(e)}")

# Initialize models
ai_models = AIModels()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend...")
    await ai_models.load_models()

def detect_pose(image: Image.Image) -> Image.Image:
    """Extract pose from image using OpenPose"""
    try:
        pose_image = pose_detector(image)
        return pose_image
    except Exception as e:
        logger.error(f"Pose detection failed: {e}")
        # Return a blank pose image if detection fails
        return Image.new('RGB', image.size, (0, 0, 0))

def generate_styled_image(prompt: str, pose_image: Optional[Image.Image] = None, style: str = "default") -> Image.Image:
    """Generate image with specific art style"""
    
    # Style-specific prompt enhancements
    style_enhancements = {
        "oil_painting": "oil painting, classical art, renaissance style, rich textures, detailed brushwork",
        "watercolor": "watercolor painting, soft washes, delicate brushstrokes, artistic illustration",
        "anime": "anime art style, Studio Ghibli inspired, hand-drawn animation, soft colors",
        "cartoon": "3D cartoon style, Disney Pixar animation, smooth surfaces, vibrant lighting",
        "photography": "vintage photography style, film grain, warm lighting, nostalgic mood",
        "minimalist": "minimalist art style, clean composition, simple forms, modern design"
    }
    
    enhancement = style_enhancements.get(style, "")
    enhanced_prompt = f"{prompt}, {enhancement}" if enhancement else prompt
    
    logger.info(f"Generating {style} style image with prompt: {enhanced_prompt[:100]}...")
    
    try:
        if pose_image is not None and controlnet_pipeline is not None:
            # Use ControlNet for pose-guided generation
            result = controlnet_pipeline(
                prompt=enhanced_prompt,
                image=pose_image,
                num_inference_steps=20,
                guidance_scale=7.5,
                controlnet_conditioning_scale=1.0
            ).images[0]
        else:
            # Use regular pipeline
            result = pipeline(
                prompt=enhanced_prompt,
                num_inference_steps=20,
                guidance_scale=7.5
            ).images[0]
            
        logger.info(f"Successfully generated {style} style image")
        return result
        
    except Exception as e:
        logger.error(f"Error generating {style} style image: {e}")
        # Fallback to a simple colored image
        return Image.new('RGB', (512, 512), (200, 200, 200))

def generate_popmart_image(prompt: str, pose_image: Optional[Image.Image] = None) -> Image.Image:
    """Generate PopMart-style image"""
    
    # PopMart-specific prompt enhancement
    enhanced_prompt = f"""
    {prompt}, PopMart collectible figure style, kawaii, chibi, vinyl toy, collectible figure,
    large round head, small body, big sparkling eyes with highlights, rosy cheeks, 
    smooth glossy finish, professional toy photography, clean pastel background,
    adorable expression, high quality, detailed, cute aesthetic, designer toy,
    Labubu style, Molly style, soft lighting, 8k resolution
    """
    
    negative_prompt = """
    realistic, human, photograph, dark, scary, horror, low quality, blurry, 
    distorted, ugly, bad anatomy, extra limbs, missing limbs, floating limbs,
    text, watermark, signature, logo, adult content
    """
    
    try:
        if pose_image is not None and controlnet_pipeline is not None:
            # Use ControlNet for pose preservation
            logger.info("Generating with pose control...")
            image = controlnet_pipeline(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                image=pose_image,
                num_inference_steps=20,
                guidance_scale=7.5,
                controlnet_conditioning_scale=1.0,
                width=512,
                height=512,
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        else:
            # Use standard generation
            logger.info("Generating without pose control...")
            image = pipeline(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=20,
                guidance_scale=7.5,
                width=512,
                height=512,
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        return image
        
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Pepmart AI Backend is running!", "device": ai_models.device, "models_loaded": ai_models.models_loaded}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "cuda_available": torch.cuda.is_available(),
        "mps_available": torch.backends.mps.is_available()
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"), 
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None)
):
    """Generate pet portrait with various art styles"""
    
    # Force debug output to file
    debug_info = f"""
🎨 ===== GENERATION REQUEST =====
   art_style: {art_style}
   cuteness_level: {cuteness_level}
   color_palette: {color_palette}
   prompt: {prompt[:50] if prompt else 'None'}...
================================
"""
    
    logger.info(debug_info)
    print(debug_info, flush=True)  # Force console output
    
    # Write to debug file
    with open('/Users/James/Desktop/Pepmart/debug_log.txt', 'a') as f:
        f.write(f"{debug_info}\n")
        f.flush()
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="AI models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Resize image for processing
        input_image = input_image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Run pose detection and generation in thread pool
        loop = asyncio.get_event_loop()
        
        def process_image():
            # Detect pose from input image
            pose_image = detect_pose(input_image)
            
            # Use custom prompt if provided, otherwise generate based on art_style
            if prompt:
                final_prompt = prompt
            else:
                # Generate style-specific prompt
                base_prompt = "adorable pet, cute and cuddly"
                
                # Add art style modifiers
                style_modifiers = {
                    "oil_painting": "classical oil painting style, rich paint texture, masterpiece",
                    "watercolor": "watercolor painting, soft brushstrokes, delicate colors",
                    "anime": "anime illustration style, Studio Ghibli inspired",
                    "cartoon": "Disney Pixar 3D animation style, vibrant colors",
                    "photography": "vintage photography style, warm tones, film grain",
                    "minimalist": "modern minimalist art style, clean lines, simple composition"
                }
                
                # Add cuteness level modifiers
                cuteness_modifiers = {
                    "maximum": "extremely cute, kawaii, adorable",
                    "high": "very cute, charming",
                    "medium": "pleasant, appealing"
                }
                
                # Add color palette modifiers
                color_modifiers = {
                    "warm": "warm colors, golden tones",
                    "pastel": "soft pastel colors",
                    "vibrant": "vibrant saturated colors",
                    "soft": "soft muted colors",
                    "sepia": "sepia tones, vintage colors",
                    "clean": "clean neutral colors"
                }
                
                final_prompt = f"{base_prompt}, {style_modifiers.get(art_style, '')}, {cuteness_modifiers.get(cuteness_level, '')}, {color_modifiers.get(color_palette, '')}"
            
            # Generate image with appropriate style
            if art_style == "oil_painting":
                generated_image = generate_styled_image(final_prompt, pose_image, "oil_painting")
            elif art_style in ["anime", "cartoon", "watercolor", "photography", "minimalist"]:
                generated_image = generate_styled_image(final_prompt, pose_image, art_style)
            else:
                # Fallback to PopMart style for unknown styles
                generated_image = generate_popmart_image(final_prompt, pose_image)
            
            return generated_image, pose_image
        
        start_time = time.time()
        generated_image, pose_image = await loop.run_in_executor(executor, process_image)
        generation_time = time.time() - start_time
        
        # Convert to base64 for response
        img_buffer = io.BytesIO()
        generated_image.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also convert pose image for debugging
        pose_buffer = io.BytesIO()
        pose_image.save(pose_buffer, format='PNG')
        pose_base64 = base64.b64encode(pose_buffer.getvalue()).decode()
        
        logger.info(f"Generation completed in {generation_time:.2f} seconds")
        
        # Create style-specific analysis message
        style_names = {
            "oil_painting": "古典油画风格",
            "watercolor": "水彩插画风格", 
            "anime": "宫崎骏动漫风格",
            "cartoon": "迪士尼卡通风格",
            "photography": "复古摄影风格",
            "minimalist": "现代简约风格"
        }
        
        style_display = style_names.get(art_style, art_style)
        analysis_message = f"已生成{style_display}图像，耗时 {generation_time:.1f}秒。您可以继续微调或尝试其他风格。"
        
        # Log the final result
        with open('/Users/James/Desktop/Pepmart/debug_log.txt', 'a') as f:
            f.write(f"📋 Generated: {style_display} (art_style={art_style})\n")
            f.flush()
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "poseImage": f"data:image/png;base64,{pose_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "art_style_used": art_style,
            "analysis": analysis_message
        })
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)