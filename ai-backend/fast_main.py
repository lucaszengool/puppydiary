from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageEnhance
import io
import base64
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - Ultra Fast", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
pipeline = None
executor = ThreadPoolExecutor(max_workers=1)

class FastAIModels:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load optimized fast generation model"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading fast generation models on device: {self.device}")
        
        try:
            global pipeline
            
            # Use SD 1.5 with LCM for ultra-fast generation
            model_id = "runwayml/stable-diffusion-v1-5"
            
            pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                safety_checker=None,
                requires_safety_checker=False,
                low_cpu_mem_usage=True
            )
            
            # Use DPM++ scheduler for balanced speed/quality
            pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
            
            # Aggressive memory optimizations
            if self.device == "mps":
                pipeline.enable_attention_slicing(1)
                pipeline.vae.to("cpu")  # Keep VAE on CPU
                pipeline.unet.to(self.device)
                pipeline.text_encoder.to(self.device)
            else:
                pipeline = pipeline.to(self.device)
                
            if self.device == "cuda":
                pipeline.enable_xformers_memory_efficient_attention()
                pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("Fast generation models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load AI models: {str(e)}")

# Initialize models
ai_models = FastAIModels()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Ultra Fast Mode)...")
    await ai_models.load_models()

def analyze_pet_type(image: Image.Image) -> str:
    """Simple pet type detection based on image aspect ratio and size"""
    width, height = image.size
    aspect_ratio = width / height
    
    # Simple heuristic based on common pet photo characteristics
    if aspect_ratio > 1.2:  # Wide image, likely cat lying down
        return "cat"
    elif aspect_ratio < 0.8:  # Tall image, likely dog sitting/standing
        return "dog"
    else:  # Square-ish, could be either
        return "pet"

def generate_popmart_figure(pet_type: str, style: str) -> Image.Image:
    """Generate PopMart-style figure with balanced quality and speed"""
    
    # Better prompts for quality while keeping them concise
    base_prompts = {
        "cat": "cute kawaii cat, PopMart collectible figure, Molly style, big sparkling eyes, vinyl toy, chibi",
        "dog": "cute kawaii dog, PopMart collectible figure, Molly style, big sparkling eyes, vinyl toy, chibi", 
        "pet": "cute kawaii pet, PopMart collectible figure, Molly style, big sparkling eyes, vinyl toy, chibi"
    }
    
    style_modifiers = {
        "sleeping_popmart_poodle": "sleeping pose, curly poodle fur, peaceful expression",
        "sitting_popmart_cat": "sitting pose, fluffy fur, alert expression",
        "default": "adorable pose, soft fur"
    }
    
    # Build optimized prompt
    base_prompt = base_prompts.get(pet_type, base_prompts["pet"])
    style_mod = style_modifiers.get(style, style_modifiers["default"])
    
    prompt = f"{base_prompt}, {style_mod}, smooth finish, pastel colors, high quality"
    negative_prompt = "realistic, human, photo, ugly, blurry, low quality, distorted, deformed, bad anatomy"
    
    try:
        logger.info(f"Fast generating: {prompt}")
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            pipeline.vae.to(ai_models.device)
        
        # Balanced generation - faster than original but good quality
        with torch.no_grad():
            image = pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=12,  # Balanced: faster than 20, better than 4
                guidance_scale=7.5,      # Standard guidance for quality
                width=512,
                height=512,
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Quick enhancement
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.3)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return image
        
    except Exception as e:
        logger.error(f"Fast generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Ultra Fast Mode) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "ultra_fast"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "ultra_fast",
        "generation_time": "~10-20 seconds"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = "sleeping_popmart_poodle"
):
    """Ultra-fast PopMart-style pet portrait generation"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="AI models are still loading. Please wait...")
    
    try:
        # Read and process image quickly
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Quick pet type detection
        pet_type = analyze_pet_type(input_image)
        
        # Run ultra-fast generation
        loop = asyncio.get_event_loop()
        
        def fast_process():
            return generate_popmart_figure(pet_type, style)
        
        start_time = time.time()
        generated_image = await loop.run_in_executor(executor, fast_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        generated_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        logger.info(f"Ultra-fast generation completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "petType": pet_type,
            "analysis": f"Generated PopMart-style {pet_type} in {generation_time:.1f}s using ultra-fast AI (deployment ready!)"
        })
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)