from fastapi import FastAPI, File, UploadFile, HTTPException, Form
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

app = FastAPI(title="Pepmart AI Backend - Juggernaut XL", version="6.0.0")

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

class JuggernautXLAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load Juggernaut XL v9 pipeline for high-quality pet portraits"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading Juggernaut XL v9 models on device: {self.device}")
        
        try:
            global img2img_pipeline
            
            # Load Juggernaut XL v9 - specialized for photorealistic portraits
            model_id = "RunDiffusion/Juggernaut-XL-v9"
            
            img2img_pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                use_safetensors=True,
                low_cpu_mem_usage=True
            )
            
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
            logger.info("Juggernaut XL v9 models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading Juggernaut XL models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load Juggernaut XL models: {str(e)}")

# Initialize models
ai_models = JuggernautXLAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Juggernaut XL Mode)...")
    await ai_models.load_models()

def analyze_image_features(image: Image.Image) -> str:
    """Analyze the image to extract key visual features for better preservation"""
    import numpy as np
    
    # Convert to numpy for analysis
    img_array = np.array(image)
    
    # Simple color analysis
    avg_color = np.mean(img_array, axis=(0, 1))
    
    # Determine dominant color
    if avg_color[0] > avg_color[1] and avg_color[0] > avg_color[2]:
        dominant_color = "brown" if avg_color[0] < 180 else "light brown"
    elif avg_color[1] > avg_color[2]:
        dominant_color = "golden"
    else:
        dominant_color = "cream"
    
    # Simple texture analysis based on variance
    gray = np.dot(img_array[...,:3], [0.2989, 0.5870, 0.1140])
    texture_variance = np.var(gray)
    
    if texture_variance > 1000:
        texture = "curly fluffy fur"
    elif texture_variance > 500:
        texture = "soft fluffy fur"
    else:
        texture = "smooth fur"
    
    return f"{dominant_color} {texture}"

def get_art_style_prompts(art_style: str, cuteness_level: str, color_palette: str) -> tuple[str, str, str]:
    """Generate style-specific prompts optimized for Juggernaut XL"""
    
    # Art style definitions optimized for Juggernaut XL
    art_styles = {
        "popmart": "popmart style, blindbox collectible, chibi proportions, kawaii, cute vinyl toy",
        "watercolor": "watercolor painting, soft artistic brushstrokes, dreamy watercolor effect",
        "oil_painting": "oil painting, classical fine art, rich textured brushwork, renaissance style",
        "cartoon": "cartoon illustration, disney pixar style, 3d animated character",
        "anime": "anime art style, manga illustration, cel shading, japanese animation",
        "realistic": "photorealistic portrait, professional photography, sharp detailed focus",
        "sketch": "pencil sketch portrait, hand drawn artistic style, detailed linework",
        "digital_art": "digital art portrait, concept art style, modern digital painting"
    }
    
    # Cuteness level modifiers
    cuteness_levels = {
        "low": "natural expression, realistic proportions",
        "medium": "cute and adorable, charming expression",
        "high": "very cute, big expressive eyes, kawaii aesthetic",
        "maximum": "ultra cute, huge sparkling eyes, maximum adorability"
    }
    
    # Color palette options
    color_palettes = {
        "vibrant": "vibrant saturated colors, bright vivid tones",
        "pastel": "soft pastel colors, gentle muted tones",
        "warm": "warm golden colors, cozy amber lighting",
        "cool": "cool blue tones, serene purple hues",
        "monochrome": "monochrome grayscale, artistic black and white",
        "natural": "natural earth tones, realistic color palette"
    }
    
    base_style = art_styles.get(art_style, art_styles["popmart"])
    cuteness = cuteness_levels.get(cuteness_level, cuteness_levels["high"])
    colors = color_palettes.get(color_palette, color_palettes["vibrant"])
    
    return base_style, cuteness, colors

def convert_to_pet_portrait(image: Image.Image, style: str, art_style: str = "popmart", 
                          cuteness_level: str = "high", color_palette: str = "vibrant",
                          custom_prompt: str = None, custom_negative: str = None) -> Image.Image:
    """Convert image to high-quality pet portrait using Juggernaut XL"""
    
    # Use custom prompt if provided, otherwise generate optimized prompt
    if custom_prompt:
        prompt = custom_prompt
        logger.info(f"Using custom prompt: {prompt[:100]}...")
    else:
        # Get style-specific prompts
        base_style, cuteness, colors = get_art_style_prompts(art_style, cuteness_level, color_palette)
        
        # Analyze the input image for better feature preservation
        image_features = analyze_image_features(image)
        
        # Build optimized prompt for Juggernaut XL
        if "poodle" in style or "dog" in style:
            animal_type = f"adorable poodle dog with {image_features}"
        elif "cat" in style:
            animal_type = f"beautiful cat with {image_features}"
        else:
            animal_type = f"cute pet with {image_features}"
        
        # Add pose details
        if "sleeping" in style:
            pose_details = "sleeping peacefully, cozy resting pose"
        elif "sitting" in style:
            pose_details = "sitting elegantly, alert and happy"
        else:
            pose_details = "natural pose, same position as original"
        
        # Optimized prompt for Juggernaut XL (known to work well with detailed descriptions)
        prompt = f"portrait of {animal_type}, {base_style}, {cuteness}, {pose_details}, {colors}, masterpiece, best quality, highly detailed, professional artwork, sharp focus"
    
    # Use custom negative prompt if provided, otherwise use optimized default
    if custom_negative:
        negative_prompt = custom_negative
        logger.info(f"Using custom negative prompt: {negative_prompt[:100]}...")
    else:
        # Optimized negative prompt for Juggernaut XL
        negative_prompt = "ugly, bad quality, blurry, distorted, deformed, low resolution, pixelated, artifacts, overexposed, underexposed, bad anatomy, missing limbs, extra limbs, duplicate, malformed, scary, dark, human, realistic photography when cartoon style requested"
    
    try:
        logger.info(f"Art Style: {art_style}, Cuteness: {cuteness_level}, Colors: {color_palette}")
        logger.info(f"Using optimized Juggernaut XL prompt: {prompt[:150]}...")
        
        # Resize to optimal size for SDXL (1024x1024 or maintain aspect ratio)
        processed_img = image.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            img2img_pipeline.vae.to(ai_models.device)
        
        # Generate with Juggernaut XL optimized settings
        with torch.no_grad():
            result_image = img2img_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=processed_img,
                strength=0.4,  # Balanced strength for good transformation while preserving identity
                num_inference_steps=25,  # Optimal steps for quality/speed balance
                guidance_scale=7.0,  # Juggernaut XL works well with this guidance
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Enhanced post-processing for different art styles
        if art_style == "popmart" or art_style == "cartoon":
            # Enhance colors and contrast for cartoon styles
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.3)
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(1.2)
            
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.1)
        elif art_style == "watercolor":
            # Softer enhancement for watercolor
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.1)
        elif art_style == "realistic":
            # Minimal enhancement for realistic style
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.05)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return result_image
        
    except Exception as e:
        logger.error(f"Juggernaut XL conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Juggernaut XL conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Juggernaut XL v9) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "juggernaut_xl_v9",
        "model": "RunDiffusion/Juggernaut-XL-v9",
        "strength": "0.4 - balanced transformation",
        "available_styles": ["popmart", "watercolor", "oil_painting", "cartoon", "anime", "realistic", "sketch", "digital_art"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "juggernaut_xl_v9",
        "model": "RunDiffusion/Juggernaut-XL-v9",
        "approach": "High-quality pet portrait generation with photorealistic capabilities"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"),
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None)
):
    """Generate high-quality pet portrait using Juggernaut XL v9"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="Juggernaut XL models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run Juggernaut XL conversion
        loop = asyncio.get_event_loop()
        
        def juggernaut_process():
            return convert_to_pet_portrait(input_image, style, art_style, cuteness_level, color_palette, prompt, negative_prompt)
        
        start_time = time.time()
        result_image = await loop.run_in_executor(executor, juggernaut_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include original for comparison
        orig_buffer = io.BytesIO()
        input_image.resize((1024, 1024), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"Juggernaut XL conversion completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "approach": "juggernaut_xl_v9",
            "selected_art_style": art_style,
            "cuteness_level": cuteness_level,
            "color_palette": color_palette,
            "model": "RunDiffusion/Juggernaut-XL-v9",
            "strength": 0.4,
            "analysis": f"Generated high-quality {art_style} pet portrait in {generation_time:.1f}s using Juggernaut XL v9"
        })
        
    except Exception as e:
        logger.error(f"Juggernaut XL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Juggernaut XL generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)