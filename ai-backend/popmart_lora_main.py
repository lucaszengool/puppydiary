from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionXLImg2ImgPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageEnhance
import io
import base64
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - PopMart LoRA", version="5.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
img2img_pipeline = None
executor = ThreadPoolExecutor(max_workers=1)

class PopMartLoRAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load SDXL img2img pipeline with PopMart LoRA"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading PopMart LoRA models on device: {self.device}")
        
        try:
            global img2img_pipeline
            
            # Load SDXL img2img pipeline (required for the LoRA)
            base_model = "stabilityai/stable-diffusion-xl-base-1.0"
            
            img2img_pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(
                base_model,
                torch_dtype=torch.float16,
                use_safetensors=True,
                low_cpu_mem_usage=True
            )
            
            # Load the PopMart LoRA
            logger.info("Loading PopMart blindbox LoRA...")
            img2img_pipeline.load_lora_weights("twn39/blindbox-popmart-xl")
            
            # Use DPM++ scheduler for quality
            img2img_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(img2img_pipeline.scheduler.config)
            
            # Memory optimizations for SDXL
            if self.device == "mps":
                img2img_pipeline.enable_attention_slicing(1)
                img2img_pipeline.vae.to("cpu")
                img2img_pipeline.unet.to(self.device)
                img2img_pipeline.text_encoder.to(self.device)
                img2img_pipeline.text_encoder_2.to(self.device)
            else:
                img2img_pipeline = img2img_pipeline.to(self.device)
                
            if self.device == "cuda":
                img2img_pipeline.enable_xformers_memory_efficient_attention()
                img2img_pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("PopMart LoRA models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading PopMart LoRA models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load PopMart LoRA models: {str(e)}")

# Initialize models
ai_models = PopMartLoRAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (PopMart LoRA Mode)...")
    await ai_models.load_models()

def convert_to_popmart_blindbox(image: Image.Image, style: str) -> Image.Image:
    """Convert image to authentic PopMart blindbox style using specialized LoRA"""
    
    # Use the exact trigger words from the LoRA documentation
    base_prompt = "blindbox, popmart, "
    
    # Create pet-specific prompts based on the LoRA examples
    if "poodle" in style or "dog" in style:
        # Adapt the LoRA style for a cute dog
        prompt = base_prompt + "cute cartoon dog, big shining eyes, adorable expression, chibi proportions, collectible figure, soft fur texture, kawaii aesthetic, vinyl toy finish, beautiful detailed features"
    elif "cat" in style:
        prompt = base_prompt + "cute cartoon cat, big shining eyes, adorable expression, chibi proportions, collectible figure, soft fur texture, kawaii aesthetic, vinyl toy finish, beautiful detailed features"
    else:
        prompt = base_prompt + "cute cartoon pet, big shining eyes, adorable expression, chibi proportions, collectible figure, soft fur texture, kawaii aesthetic, vinyl toy finish, beautiful detailed features"
    
    # Add pose-specific details
    if "sleeping" in style:
        prompt += ", sleeping peacefully, cozy resting pose, dreamy expression"
    elif "sitting" in style:
        prompt += ", sitting pose, alert and happy, charming stance"
    
    # Add quality enhancers from the examples
    prompt += ", masterpiece, best quality, super cute, solo"
    
    # Use the negative prompt from examples
    negative_prompt = "ugly, bad quality, blurry, distorted, deformed, realistic photography, human"
    
    try:
        logger.info(f"Converting to PopMart blindbox style: {prompt[:100]}...")
        
        # Resize for SDXL (1024x1024 or maintain aspect ratio)
        processed_img = image.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            img2img_pipeline.vae.to(ai_models.device)
        
        # Generate with PopMart LoRA
        with torch.no_grad():
            result_image = img2img_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=processed_img,
                strength=0.5,  # Medium strength for good LoRA effect
                num_inference_steps=30,  # Higher steps for SDXL quality
                guidance_scale=7.5,
                cross_attention_kwargs={"scale": 0.8},  # LoRA weight
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Enhance for PopMart aesthetic
        enhancer = ImageEnhance.Color(result_image)
        result_image = enhancer.enhance(1.2)
        
        enhancer = ImageEnhance.Contrast(result_image)
        result_image = enhancer.enhance(1.1)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return result_image
        
    except Exception as e:
        logger.error(f"PopMart LoRA conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"PopMart LoRA conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (PopMart LoRA Mode) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "popmart_lora",
        "model": "twn39/blindbox-popmart-xl",
        "trigger_words": ["blindbox", "popmart"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "popmart_lora",
        "lora_model": "twn39/blindbox-popmart-xl",
        "base_model": "SDXL"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = "sleeping_popmart_poodle"
):
    """Generate authentic PopMart blindbox style using specialized LoRA"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="PopMart LoRA models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run PopMart LoRA conversion
        loop = asyncio.get_event_loop()
        
        def popmart_lora_process():
            return convert_to_popmart_blindbox(input_image, style)
        
        start_time = time.time()
        result_image = await loop.run_in_executor(executor, popmart_lora_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include original for comparison
        orig_buffer = io.BytesIO()
        input_image.resize((1024, 1024), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"PopMart LoRA conversion completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "approach": "popmart_lora",
            "model": "twn39/blindbox-popmart-xl",
            "strength": 0.5,
            "analysis": f"Converted to authentic PopMart blindbox style in {generation_time:.1f}s using specialized LoRA"
        })
        
    except Exception as e:
        logger.error(f"PopMart LoRA generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PopMart LoRA generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)