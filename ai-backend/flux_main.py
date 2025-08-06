from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import FluxImg2ImgPipeline, FlowMatchEulerDiscreteScheduler
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

app = FastAPI(title="Pepmart AI Backend - FLUX.1", version="7.0.0")

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

class FLUXAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load FLUX.1 pipeline for high-quality pet portraits"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading FLUX.1 models on device: {self.device}")
        
        try:
            global img2img_pipeline
            
            # Load FLUX.1 Dev - state-of-the-art image generation
            model_id = "black-forest-labs/FLUX.1-dev"
            
            img2img_pipeline = FluxImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
                low_cpu_mem_usage=True
            )
            
            # Memory optimizations
            if self.device == "mps":
                img2img_pipeline.enable_attention_slicing(1)
                img2img_pipeline.vae.to("cpu")
                img2img_pipeline.transformer.to(self.device)
                img2img_pipeline.text_encoder.to(self.device)
                img2img_pipeline.text_encoder_2.to(self.device)
            else:
                img2img_pipeline = img2img_pipeline.to(self.device)
                
            if self.device == "cuda":
                img2img_pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("FLUX.1 models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading FLUX.1 models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load FLUX.1 models: {str(e)}")

# Initialize models
ai_models = FLUXAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (FLUX.1 Mode)...")
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
    """Generate style-specific prompts optimized for FLUX.1"""
    
    # Art style definitions optimized for FLUX.1's excellent understanding
    art_styles = {
        "popmart": "popmart style collectible figure, chibi proportions, kawaii vinyl toy design, cute blindbox character",
        "watercolor": "watercolor painting, soft artistic brushstrokes, dreamy watercolor effect, delicate paint texture",
        "oil_painting": "oil painting masterpiece, classical fine art technique, rich impasto brushwork, renaissance portrait style",
        "cartoon": "cartoon illustration, disney pixar animation style, 3d rendered character, vibrant cartoon aesthetics",
        "anime": "anime art style, manga illustration, cel shading technique, japanese animation character design",
        "realistic": "photorealistic portrait, professional studio photography, sharp detailed focus, lifelike rendering",
        "sketch": "pencil sketch portrait, hand drawn artistic style, detailed graphite linework, traditional drawing",
        "digital_art": "digital art portrait, concept art style, modern digital painting, professional illustration"
    }
    
    # Cuteness level modifiers
    cuteness_levels = {
        "low": "natural expression, realistic proportions, subtle charm",
        "medium": "cute and adorable features, charming expression, endearing qualities",
        "high": "very cute appearance, big expressive eyes, kawaii aesthetic, maximum adorability",
        "maximum": "ultra cute design, huge sparkling eyes, peak adorability, irresistibly cute"
    }
    
    # Color palette options
    color_palettes = {
        "vibrant": "vibrant saturated colors, bright vivid color palette, bold chromatic tones",
        "pastel": "soft pastel colors, gentle muted tones, delicate color harmony",
        "warm": "warm golden colors, cozy amber lighting, rich warm color scheme",
        "cool": "cool blue tones, serene purple hues, calming cool color palette",
        "monochrome": "monochrome grayscale, artistic black and white, tonal variation",
        "natural": "natural earth tones, realistic color palette, organic color scheme"
    }
    
    base_style = art_styles.get(art_style, art_styles["popmart"])
    cuteness = cuteness_levels.get(cuteness_level, cuteness_levels["high"])
    colors = color_palettes.get(color_palette, color_palettes["vibrant"])
    
    return base_style, cuteness, colors

def convert_to_pet_portrait(image: Image.Image, style: str, art_style: str = "popmart", 
                          cuteness_level: str = "high", color_palette: str = "vibrant",
                          custom_prompt: str = None, custom_negative: str = None) -> Image.Image:
    """Convert image to high-quality pet portrait using FLUX.1"""
    
    # Use custom prompt if provided, otherwise generate optimized prompt
    if custom_prompt:
        prompt = custom_prompt
        logger.info(f"Using custom prompt: {prompt[:100]}...")
    else:
        # Get style-specific prompts
        base_style, cuteness, colors = get_art_style_prompts(art_style, cuteness_level, color_palette)
        
        # Analyze the input image for better feature preservation
        image_features = analyze_image_features(image)
        
        # Build optimized prompt for FLUX.1 (which handles longer, more detailed prompts very well)
        if "poodle" in style or "dog" in style:
            animal_type = f"adorable poodle dog with {image_features}"
        elif "cat" in style:
            animal_type = f"beautiful cat with {image_features}"
        else:
            animal_type = f"cute pet with {image_features}"
        
        # Add pose details
        if "sleeping" in style:
            pose_details = "sleeping peacefully in a cozy resting pose"
        elif "sitting" in style:
            pose_details = "sitting elegantly with alert and happy expression"
        else:
            pose_details = "in natural pose, maintaining the same position as the original image"
        
        # FLUX.1 excels with detailed, descriptive prompts
        prompt = f"A stunning portrait of an {animal_type}, {pose_details}, rendered in {base_style}, featuring {cuteness}, with {colors}, masterpiece quality, highly detailed artwork, professional composition, sharp focus, beautiful lighting"
    
    # Use custom negative prompt if provided, otherwise use optimized default
    if custom_negative:
        negative_prompt = custom_negative
        logger.info(f"Using custom negative prompt: {negative_prompt[:100]}...")
    else:
        # FLUX.1 typically works well with minimal negative prompts
        negative_prompt = "blurry, low quality, distorted, deformed, ugly, bad anatomy, extra limbs, missing features"
    
    try:
        logger.info(f"Art Style: {art_style}, Cuteness: {cuteness_level}, Colors: {color_palette}")
        logger.info(f"Using FLUX.1 optimized prompt: {prompt[:150]}...")
        
        # FLUX.1 works best with sizes that are multiples of 32
        processed_img = image.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            img2img_pipeline.vae.to(ai_models.device)
        
        # Generate with FLUX.1 optimized settings
        with torch.no_grad():
            result_image = img2img_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=processed_img,
                strength=0.5,  # FLUX.1 can handle higher strength while preserving identity
                num_inference_steps=20,  # FLUX.1 is efficient and produces good results with fewer steps
                guidance_scale=3.5,  # FLUX.1 works well with lower guidance scales
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Enhanced post-processing for different art styles
        if art_style == "popmart" or art_style == "cartoon":
            # Enhance colors and contrast for cartoon styles
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.2)
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(1.1)
            
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.1)
        elif art_style == "watercolor":
            # Softer enhancement for watercolor
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.05)
        elif art_style == "realistic":
            # Minimal enhancement for realistic style
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.02)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return result_image
        
    except Exception as e:
        logger.error(f"FLUX.1 conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"FLUX.1 conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (FLUX.1) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "flux_1_dev",
        "model": "black-forest-labs/FLUX.1-dev",
        "strength": "0.5 - high quality transformation",
        "available_styles": ["popmart", "watercolor", "oil_painting", "cartoon", "anime", "realistic", "sketch", "digital_art"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "flux_1_dev",
        "model": "black-forest-labs/FLUX.1-dev",
        "approach": "State-of-the-art pet portrait generation with FLUX.1"
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
    """Generate high-quality pet portrait using FLUX.1"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="FLUX.1 models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run FLUX.1 conversion
        loop = asyncio.get_event_loop()
        
        def flux_process():
            return convert_to_pet_portrait(input_image, style, art_style, cuteness_level, color_palette, prompt, negative_prompt)
        
        start_time = time.time()
        result_image = await loop.run_in_executor(executor, flux_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include original for comparison
        orig_buffer = io.BytesIO()
        input_image.resize((1024, 1024), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"FLUX.1 conversion completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "approach": "flux_1_dev",
            "selected_art_style": art_style,
            "cuteness_level": cuteness_level,
            "color_palette": color_palette,
            "model": "black-forest-labs/FLUX.1-dev",
            "strength": 0.5,
            "analysis": f"Generated high-quality {art_style} pet portrait in {generation_time:.1f}s using FLUX.1"
        })
        
    except Exception as e:
        logger.error(f"FLUX.1 generation error: {e}")
        raise HTTPException(status_code=500, detail=f"FLUX.1 generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)