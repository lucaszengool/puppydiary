from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionXLImg2ImgPipeline, StableDiffusionXLControlNetPipeline, ControlNetModel, DPMSolverMultistepScheduler
from controlnet_aux import CannyDetector
import cv2
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

app = FastAPI(title="Pepmart AI Backend - Enhanced SDXL", version="6.0.0")

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
controlnet_pipeline = None
canny_detector = None
executor = ThreadPoolExecutor(max_workers=1)

class EnhancedSDXLAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load enhanced SDXL + ControlNet pipeline for superior detail preservation"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading Enhanced SDXL + ControlNet models on device: {self.device}")
        
        try:
            global img2img_pipeline, controlnet_pipeline, canny_detector
            
            # Initialize Canny detector for edge preservation
            canny_detector = CannyDetector()
            
            # Load SDXL base model
            model_id = "stabilityai/stable-diffusion-xl-base-1.0"
            
            # Load ControlNet model for structure preservation
            canny_controlnet = ControlNetModel.from_pretrained(
                "diffusers/controlnet-canny-sdxl-1.0",
                torch_dtype=torch.float16,
                use_safetensors=True
            )
            
            # Load SDXL + ControlNet pipeline for detail preservation
            controlnet_pipeline = StableDiffusionXLControlNetPipeline.from_pretrained(
                model_id,
                controlnet=canny_controlnet,
                torch_dtype=torch.float16,
                use_safetensors=True,
                variant="fp16"
            )
            
            # Load SDXL img2img pipeline as fallback
            img2img_pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                use_safetensors=True,
                low_cpu_mem_usage=True
            )
            
            # Use DPM++ scheduler for quality
            controlnet_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                controlnet_pipeline.scheduler.config,
                use_karras_sigmas=True
            )
            img2img_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                img2img_pipeline.scheduler.config,
                use_karras_sigmas=True
            )
            
            # Memory optimizations for SDXL + ControlNet
            if self.device == "mps":
                controlnet_pipeline.enable_attention_slicing(1)
                img2img_pipeline.enable_attention_slicing(1)
                # For MPS, keep components on different devices for memory management
                controlnet_pipeline.vae.to("cpu")
                img2img_pipeline.vae.to("cpu")
                controlnet_pipeline.unet.to(self.device)
                img2img_pipeline.unet.to(self.device)
                controlnet_pipeline.text_encoder.to(self.device)
                controlnet_pipeline.text_encoder_2.to(self.device)
                img2img_pipeline.text_encoder.to(self.device)
                img2img_pipeline.text_encoder_2.to(self.device)
            else:
                controlnet_pipeline = controlnet_pipeline.to(self.device)
                img2img_pipeline = img2img_pipeline.to(self.device)
                
            if self.device == "cuda":
                controlnet_pipeline.enable_xformers_memory_efficient_attention()
                controlnet_pipeline.enable_model_cpu_offload()
                img2img_pipeline.enable_xformers_memory_efficient_attention()
                img2img_pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("Enhanced SDXL + ControlNet models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading Enhanced SDXL models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load Enhanced SDXL models: {str(e)}")

# Initialize models
ai_models = EnhancedSDXLAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Enhanced SDXL Mode)...")
    await ai_models.load_models()

def analyze_image_features(image: Image.Image) -> str:
    """Analyze the image to extract key visual features for better preservation"""
    import numpy as np
    
    # Convert to numpy for analysis
    img_array = np.array(image)
    
    # Simple color analysis
    avg_color = np.mean(img_array, axis=(0, 1))
    
    # Determine dominant colors (can be multiple)
    colors = []
    if avg_color[0] > 150:
        if avg_color[0] > 200:
            colors.append("white")
        elif avg_color[0] > 180:
            colors.append("light brown")
        else:
            colors.append("brown")
    
    if avg_color[1] > avg_color[2] and avg_color[1] > 150:
        colors.append("golden")
    
    if avg_color[2] > 150 and avg_color[2] > avg_color[1]:
        colors.append("gray")
    
    if len(colors) == 0:
        colors.append("dark")
    
    dominant_color = " and ".join(colors[:2]) if len(colors) > 1 else colors[0]
    
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

def get_enhanced_art_style_prompts(art_style: str, cuteness_level: str, color_palette: str) -> tuple[str, str, str]:
    """Generate enhanced style-specific prompts that produce dramatically different results"""
    
    # Dramatically different art style definitions - each should produce visually distinct results
    art_styles = {
        "popmart": "popmart collectible figure, chibi vinyl toy, kawaii blindbox character, rounded cute proportions, glossy toy finish, collectible design",
        "watercolor": "delicate watercolor painting, soft paint bleeding, translucent layers, artistic paper texture, gentle brush strokes, dreamy watercolor effects",
        "oil_painting": "classical oil painting, thick impasto brushwork, renaissance portrait style, rich oil paint texture, museum quality artwork, traditional fine art",
        "cartoon": "vibrant cartoon illustration, disney pixar style, 3D animated character, exaggerated features, bright cartoon colors, playful animation style",
        "anime": "anime manga art style, cel shading, japanese animation, large expressive anime eyes, manga character design, otaku culture aesthetic",
        "realistic": "photorealistic portrait, professional photography, sharp focus, lifelike details, studio lighting, high resolution, natural skin texture",
        "sketch": "detailed pencil sketch, hand-drawn artwork, graphite shading, traditional drawing techniques, artistic linework, sketch paper texture",
        "digital_art": "modern digital artwork, concept art style, digital painting techniques, professional illustration, contemporary art style, digital medium"
    }
    
    # Enhanced cuteness level modifiers that create visible differences
    cuteness_levels = {
        "low": "natural realistic proportions, subtle expression, mature features",
        "medium": "endearing cute features, charming smile, pleasant expression",
        "high": "very cute kawaii style, big round eyes, adorable expression, sweet features",
        "maximum": "ultra kawaii, enormous sparkling eyes, maximum cuteness overload, irresistibly adorable"
    }
    
    # Enhanced color palette options that create dramatic visual differences
    color_palettes = {
        "vibrant": "extremely vibrant rainbow colors, neon bright saturation, electric color scheme, bold chromatic intensity",
        "pastel": "soft pastel pink and blue tones, gentle mint green, lavender purple, dreamy cotton candy colors",
        "warm": "rich golden amber tones, warm orange sunset colors, cozy fireplace lighting, autumn color palette",
        "cool": "deep ocean blue tones, arctic ice colors, cool purple and teal, winter color scheme",
        "monochrome": "elegant black and white, dramatic grayscale contrast, classic monochrome photography style",
        "natural": "earthy brown and green tones, natural wood colors, organic earth palette, realistic natural colors"
    }
    
    base_style = art_styles.get(art_style, art_styles["popmart"])
    cuteness = cuteness_levels.get(cuteness_level, cuteness_levels["high"])
    colors = color_palettes.get(color_palette, color_palettes["vibrant"])
    
    return base_style, cuteness, colors

def convert_to_enhanced_pet_portrait(image: Image.Image, style: str, art_style: str = "popmart", 
                                   cuteness_level: str = "high", color_palette: str = "vibrant",
                                   custom_prompt: str = None, custom_negative: str = None,
                                   use_controlnet: bool = True, controlnet_strength: float = 0.75) -> Image.Image:
    """Convert image to high-quality pet portrait using Enhanced SDXL with dramatically different styles"""
    
    # Use custom prompt if provided, otherwise generate enhanced prompt
    if custom_prompt:
        prompt = custom_prompt
        logger.info(f"Using custom prompt: {prompt[:100]}...")
    else:
        # Get enhanced style-specific prompts
        base_style, cuteness, colors = get_enhanced_art_style_prompts(art_style, cuteness_level, color_palette)
        
        # Analyze the input image for better feature preservation
        image_features = analyze_image_features(image)
        
        # Build enhanced prompt for SDXL with EXACT feature preservation
        if "poodle" in style or "dog" in style:
            animal_type = f"poodle dog with EXACT SAME {image_features}, maintaining all original physical features including exact fur color and texture"
        elif "cat" in style:
            animal_type = f"cat with EXACT SAME {image_features}, maintaining all original physical features including exact fur patterns and colors"
        else:
            animal_type = f"pet with EXACT SAME {image_features}, maintaining all original physical features and appearance"
        
        # Add pose details - preserve original pose
        if "sleeping" in style:
            pose_details = "in exact same sleeping pose as original, peaceful resting position"
        elif "sitting" in style:
            pose_details = "in exact same sitting pose as original, same body position"
        else:
            pose_details = "in EXACT SAME pose and position as original photo, same facial expression"
        
        # Enhanced prompt that preserves features while applying style
        prompt = f"masterpiece portrait of the EXACT SAME {animal_type}, {pose_details}, transformed into {base_style} style while PRESERVING ALL original features colors and markings, {cuteness}, with {colors}, maintaining identical appearance characteristics, same expression same fur pattern same eye color, professional quality {art_style} artwork"
    
    # Use custom negative prompt if provided, otherwise use enhanced default
    if custom_negative:
        negative_prompt = custom_negative
        logger.info(f"Using custom negative prompt: {negative_prompt[:100]}...")
    else:
        # Enhanced negative prompt - avoid changing the pet's features
        negative_prompt = "ugly, bad quality, blurry, distorted, deformed, low resolution, pixelated, artifacts, bad anatomy, missing limbs, extra limbs, duplicate, malformed, scary, dark, human, different animal, different breed, different fur color, different eye color, changed features, wrong pose"
    
    try:
        logger.info(f"ENHANCED GENERATION - Art Style: {art_style}, Cuteness: {cuteness_level}, Colors: {color_palette}")
        logger.info(f"Using enhanced SDXL prompt: {prompt[:150]}...")
        
        # Resize to optimal size for SDXL
        processed_img = image.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Choose pipeline based on detail preservation needs
        if use_controlnet and controlnet_pipeline:
            logger.info(f"Using ControlNet for enhanced detail preservation (strength: {controlnet_strength})")
            
            # Generate Canny edges for structure control
            canny_image = canny_detector(processed_img)
            
            # Move VAE to device for generation
            if ai_models.device == "mps":
                controlnet_pipeline.vae.to(ai_models.device)
            
            # Generate with ControlNet for superior detail preservation
            with torch.no_grad():
                result_image = controlnet_pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    image=canny_image,
                    num_inference_steps=25,
                    guidance_scale=7.5,
                    controlnet_conditioning_scale=max(0.85, controlnet_strength),  # Higher strength for better feature preservation
                    generator=torch.Generator(device=ai_models.device).manual_seed(42)  # Fixed seed for consistency
                ).images[0]
                
            # Move VAE back to CPU
            if ai_models.device == "mps":
                controlnet_pipeline.vae.to("cpu")
        else:
            logger.info("Using standard SDXL img2img pipeline")
            
            # Move VAE to device for generation
            if ai_models.device == "mps":
                img2img_pipeline.vae.to(ai_models.device)
            
            # Generate with Enhanced SDXL optimized settings
            with torch.no_grad():
                result_image = img2img_pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    image=processed_img,
                    strength=0.45,  # Lower strength to preserve more original features
                    num_inference_steps=30,  # More steps for better quality
                    guidance_scale=8.0,  # Higher guidance for stronger style adherence
                    generator=torch.Generator(device=ai_models.device).manual_seed(42)  # Fixed seed for consistency
                ).images[0]
                
            # Move VAE back to CPU
            if ai_models.device == "mps":
                img2img_pipeline.vae.to("cpu")
        
        # Dramatic post-processing based on art style to ensure visible differences
        if art_style == "popmart" or art_style == "cartoon":
            # Dramatic enhancement for toy/cartoon styles
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.5)  # Much more vibrant
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(1.3)  # Higher contrast
            
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.2)  # Sharper for toy effect
            
        elif art_style == "watercolor":
            # Softer, more artistic effect
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(0.9)  # Slightly desaturated
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(0.95)  # Softer contrast
            
        elif art_style == "oil_painting":
            # Rich, dramatic oil painting effect
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.2)
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(1.25)
            
        elif art_style == "realistic":
            # Crisp realistic enhancement
            enhancer = ImageEnhance.Sharpness(result_image)
            result_image = enhancer.enhance(1.1)
            
        elif art_style == "anime":
            # Anime-style enhancement
            enhancer = ImageEnhance.Color(result_image)
            result_image = enhancer.enhance(1.4)  # Very vibrant anime colors
            
            enhancer = ImageEnhance.Contrast(result_image)
            result_image = enhancer.enhance(1.2)
        
        # Memory cleanup
        if ai_models.device == "mps":
            torch.mps.empty_cache()
        elif ai_models.device == "cuda":
            torch.cuda.empty_cache()
        
        return result_image
        
    except Exception as e:
        logger.error(f"Enhanced SDXL conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced SDXL conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Enhanced SDXL) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "enhanced_sdxl",
        "model": "stabilityai/stable-diffusion-xl-base-1.0",
        "strength": "0.6 - dramatic style transformations",
        "features": "Enhanced prompts, random seeds, dramatic style differences",
        "available_styles": ["popmart", "watercolor", "oil_painting", "cartoon", "anime", "realistic", "sketch", "digital_art"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "enhanced_sdxl",
        "model": "stabilityai/stable-diffusion-xl-base-1.0",
        "approach": "Enhanced SDXL with dramatic style transformations and variety"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"),
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None),
    use_controlnet: bool = Form(True),
    controlnet_strength: float = Form(0.75)
):
    """Generate high-quality pet portrait using Enhanced SDXL with dramatic style differences"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="Enhanced SDXL models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run Enhanced SDXL conversion
        loop = asyncio.get_event_loop()
        
        def enhanced_process():
            return convert_to_enhanced_pet_portrait(input_image, style, art_style, cuteness_level, color_palette, prompt, negative_prompt, use_controlnet, controlnet_strength)
        
        start_time = time.time()
        result_image = await loop.run_in_executor(executor, enhanced_process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include original for comparison
        orig_buffer = io.BytesIO()
        input_image.resize((1024, 1024), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"Enhanced SDXL conversion completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "approach": "enhanced_sdxl_controlnet" if use_controlnet else "enhanced_sdxl",
            "selected_art_style": art_style,
            "cuteness_level": cuteness_level,
            "color_palette": color_palette,
            "model": "stabilityai/stable-diffusion-xl-base-1.0",
            "controlnet_used": use_controlnet,
            "controlnet_strength": controlnet_strength if use_controlnet else None,
            "strength": 0.6,
            "seed": "fixed_42",
            "analysis": f"Generated {art_style} pet portrait with {'ControlNet detail preservation' if use_controlnet else 'standard SDXL'} in {generation_time:.1f}s"
        })
        
    except Exception as e:
        logger.error(f"Enhanced SDXL generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced SDXL generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)