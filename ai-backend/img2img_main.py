from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler
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

app = FastAPI(title="Pepmart AI Backend - Img2Img", version="4.0.0")

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

class Img2ImgAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load img2img pipeline for style transfer while preserving structure"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading img2img models on device: {self.device}")
        
        try:
            global img2img_pipeline
            
            # Load Stable Diffusion img2img pipeline
            model_id = "runwayml/stable-diffusion-v1-5"
            
            img2img_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                safety_checker=None,
                requires_safety_checker=False,
                low_cpu_mem_usage=True
            )
            
            # Use DPM++ scheduler for quality
            img2img_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(img2img_pipeline.scheduler.config)
            
            # Memory optimizations
            if self.device == "mps":
                img2img_pipeline.enable_attention_slicing(1)
                img2img_pipeline.vae.to("cpu")
                img2img_pipeline.unet.to(self.device)
                img2img_pipeline.text_encoder.to(self.device)
            else:
                img2img_pipeline = img2img_pipeline.to(self.device)
                
            if self.device == "cuda":
                img2img_pipeline.enable_xformers_memory_efficient_attention()
                img2img_pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("Img2img models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load img2img models: {str(e)}")

# Initialize models
ai_models = Img2ImgAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Img2Img Mode)...")
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

def get_art_style_prompts(art_style: str, cuteness_level: str, color_palette: str) -> tuple[str, str]:
    """Generate style-specific prompts based on user selections"""
    
    # Art style definitions - SHORTENED to avoid truncation
    art_styles = {
        "popmart": "blindbox, popmart, vinyl toy, chibi, kawaii",
        "watercolor": "watercolor painting, soft brushes, dreamy",
        "oil_painting": "oil painting, classical art, rich texture",
        "cartoon": "cartoon, disney style, 3d animated",
        "anime": "anime, manga style, cel shading",
        "realistic": "photorealistic, detailed, sharp focus",
        "sketch": "pencil sketch, hand drawn, artistic",
        "digital_art": "digital art, concept art, modern"
    }
    
    # Cuteness level modifiers - SHORTENED
    cuteness_levels = {
        "low": "natural, realistic",
        "medium": "cute, adorable",
        "high": "very cute, big eyes, kawaii",
        "maximum": "ultra cute, huge eyes, angelic"
    }
    
    # Color palette options - SHORTENED
    color_palettes = {
        "vibrant": "vibrant colors, bright",
        "pastel": "pastel colors, soft tones",
        "warm": "warm colors, golden",
        "cool": "cool blues, purple",
        "monochrome": "monochrome, grayscale",
        "natural": "natural colors, earth tones"
    }
    
    base_style = art_styles.get(art_style, art_styles["popmart"])
    cuteness = cuteness_levels.get(cuteness_level, cuteness_levels["high"])
    colors = color_palettes.get(color_palette, color_palettes["vibrant"])
    
    return base_style, cuteness, colors

def convert_to_popmart_style(image: Image.Image, style: str, art_style: str = "popmart", 
                           cuteness_level: str = "high", color_palette: str = "vibrant",
                           custom_prompt: str = None, custom_negative: str = None) -> Image.Image:
    """Convert image to specified art style with enhanced cuteness and attractiveness"""
    
    # Use custom prompt if provided, otherwise generate enhanced style-based prompt
    if custom_prompt:
        prompt = custom_prompt
        logger.info(f"Using custom prompt: {prompt[:100]}...")
    else:
        # Get style-specific prompts
        base_style, cuteness, colors = get_art_style_prompts(art_style, cuteness_level, color_palette)
        
        # Analyze the input image for better feature preservation
        image_features = analyze_image_features(image)
        
        # Build SHORT prompt to avoid truncation (keep under 60 tokens)
        if "poodle" in style or "dog" in style:
            animal_type = f"poodle dog, {image_features}"
        elif "cat" in style:
            animal_type = f"cat, {image_features}"
        else:
            animal_type = f"pet, {image_features}"
        
        # Add minimal pose details
        if "sleeping" in style:
            pose_details = "sleeping, same pose"
        elif "sitting" in style:
            pose_details = "sitting, same pose"
        else:
            pose_details = "same pose"
        
        # SHORT combined prompt (aim for <50 tokens)
        prompt = f"{base_style}, {animal_type}, {cuteness}, {pose_details}, {colors}, masterpiece"
    
    # Use custom negative prompt if provided, otherwise use default
    if custom_negative:
        negative_prompt = custom_negative
        logger.info(f"Using custom negative prompt: {negative_prompt[:100]}...")
    else:
        # Enhanced negative prompt for better ID preservation
        negative_prompt = "ugly, bad quality, blurry, distorted, deformed, realistic photography, human, scary, dark, different pose, changed position, different animal, wrong colors, missing features"
    
    try:
        logger.info(f"Art Style: {art_style}, Cuteness: {cuteness_level}, Colors: {color_palette}")
        logger.info(f"Using prompt: {prompt[:100]}...")
        
        # Resize to smaller size for faster processing
        processed_img = image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            img2img_pipeline.vae.to(ai_models.device)
        
        # Use img2img with ID preservation optimized settings
        with torch.no_grad():
            result_image = img2img_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=processed_img,
                strength=0.5,  # Higher strength for more dramatic transformations
                num_inference_steps=20,  # More steps for better ID preservation
                guidance_scale=6.0,  # Lower guidance to maintain original structure
                generator=torch.Generator(device=ai_models.device).manual_seed(int(time.time()) % 1000000)  # Random seed for variety
            ).images[0]
        
        # Enhanced post-processing for PopMart aesthetic
        enhancer = ImageEnhance.Color(result_image)
        result_image = enhancer.enhance(1.4)  # More vibrant colors
        
        enhancer = ImageEnhance.Contrast(result_image)
        result_image = enhancer.enhance(1.2)  # Better contrast
        
        # Add slight sharpness for cartoon clarity
        enhancer = ImageEnhance.Sharpness(result_image)
        result_image = enhancer.enhance(1.1)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return result_image
        
    except Exception as e:
        logger.error(f"PopMart conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"PopMart conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Img2Img Mode) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "multi_art_style",
        "strength": "0.3 - structure preservation",
        "available_styles": ["popmart", "watercolor", "oil_painting", "cartoon", "anime", "digital_art"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "popmart_blindbox_style",
        "approach": "PopMart blindbox style conversion with pose preservation"
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
    """Generate PopMart-style portrait while preserving original image structure"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="Img2img models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run img2img conversion
        loop = asyncio.get_event_loop()
        
        def img2img_process():
            return convert_to_popmart_style(input_image, style, art_style, cuteness_level, color_palette, prompt, negative_prompt)
        
        start_time = time.time()
        result_image = await loop.run_in_executor(executor, img2img_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include original for comparison
        orig_buffer = io.BytesIO()
        input_image.resize((512, 512), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"Img2img conversion completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "approach": "multi_art_style",
            "selected_art_style": art_style,
            "cuteness_level": cuteness_level,
            "color_palette": color_palette,
            "strength": 0.45,
            "analysis": f"Converted to authentic PopMart blindbox style in {generation_time:.1f}s using specialized prompts"
        })
        
    except Exception as e:
        logger.error(f"Img2img generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Img2img generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)