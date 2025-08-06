from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionXLImg2ImgPipeline, StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler, DiffusionPipeline, StableDiffusionPipeline
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time
import numpy as np
import cv2
import openai
import os
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - Fast Enhanced", version="6.0.0")

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

# OpenAI client for GPT-4o
openai_client = None

# FLUX.1-Kontext-dev configuration via HF Inference API
HF_TOKEN = None
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-Kontext-dev"

class FastEnhancedAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        self.openai_available = False
        self.hf_available = False
        
    async def load_models(self):
        """Load models and initialize OpenAI client"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading models on device: {self.device}")
        
        # Initialize FLUX.1-Kontext-dev via HF Inference API (works with any PyTorch version)
        try:
            global HF_TOKEN
            HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGING_FACE_TOKEN")
            logger.info(f"HF_TOKEN found: {'Yes' if HF_TOKEN else 'No'}")
            
            if HF_TOKEN:
                # Test HF API access
                headers = {"Authorization": f"Bearer {HF_TOKEN}"}
                test_response = requests.get("https://huggingface.co/api/whoami", headers=headers)
                
                if test_response.status_code == 200:
                    self.hf_available = True
                    logger.info("✅ FLUX.1-Kontext-dev via HF Inference API ready!")
                else:
                    logger.warning(f"⚠️ HF token invalid: {test_response.status_code}")
            else:
                logger.warning("⚠️ HF_TOKEN not found, will use fallback")
        except Exception as e:
            logger.warning(f"⚠️ HF API initialization failed: {e}, using fallback")
        
        # Initialize OpenAI client as secondary option
        try:
            global openai_client
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and not self.hf_available:
                openai_client = openai.OpenAI(api_key=api_key)
                # Test the connection
                response = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: openai_client.models.list()
                )
                self.openai_available = True
                logger.info("✅ OpenAI GPT-4o client initialized successfully!")
            else:
                logger.warning("⚠️ OPENAI_API_KEY not found, will use fallback Ghibli-Diffusion")
        except Exception as e:
            logger.warning(f"⚠️ OpenAI initialization failed: {e}, using fallback")
        
        # Load nitrosocke/Ghibli-Diffusion model as img2img pipeline
        try:
            global img2img_pipeline
            
            # Use the exact Ghibli-Diffusion model but as img2img for input image support
            logger.info("Loading nitrosocke/Ghibli-Diffusion as img2img pipeline...")
            img2img_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                "nitrosocke/Ghibli-Diffusion",
                torch_dtype=torch.float16,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            # Move to device
            img2img_pipeline = img2img_pipeline.to(self.device)
            
            # Use DPM++ scheduler for quality
            img2img_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                img2img_pipeline.scheduler.config,
                use_karras_sigmas=True
            )
            
            # Memory optimizations for Ghibli-Diffusion
            img2img_pipeline.enable_attention_slicing(1)
            
            if self.device == "mps":
                # MPS optimizations
                img2img_pipeline.vae.to("cpu")
                img2img_pipeline.unet.to(self.device)
                img2img_pipeline.text_encoder.to(self.device)
                torch.mps.empty_cache()
            
            logger.info("✅ nitrosocke/Ghibli-Diffusion loaded successfully!")
                
            if self.device == "cuda":
                img2img_pipeline.enable_xformers_memory_efficient_attention()
                img2img_pipeline.enable_model_cpu_offload()
            
            self.models_loaded = True
            logger.info("Fast Enhanced models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading Fast Enhanced models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load Fast Enhanced models: {str(e)}")

# Initialize models
ai_models = FastEnhancedAI()

async def startup():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Fast Enhanced Mode)...")
    await ai_models.load_models()

# Use lifespan instead of deprecated on_event
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await startup()
    yield
    # Shutdown (if needed)
    pass

app = FastAPI(title="Pepmart AI Backend - Fast Enhanced", version="6.0.0", lifespan=lifespan)

# Re-add CORS after FastAPI recreation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_pet_features_fast(image: Image.Image) -> dict:
    """Fast pet feature analysis"""
    img_array = np.array(image)
    
    # Quick color analysis
    avg_color = np.mean(img_array, axis=(0, 1))
    
    # Simple coat color detection
    if avg_color[0] > 140 and avg_color[1] > 110:
        coat_color = "golden brown"
    elif avg_color[0] > 120:
        coat_color = "brown"
    elif avg_color[1] > avg_color[0]:
        coat_color = "golden"
    else:
        coat_color = "cream"
    
    # Quick texture analysis
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    texture_variance = np.var(gray)
    
    if texture_variance > 1000:
        texture = "curly fluffy poodle fur"
    elif texture_variance > 500:
        texture = "fluffy fur"
    else:
        texture = "soft fur"
    
    return {
        "coat_color": coat_color,
        "texture": texture
    }

def get_fast_style_prompts(art_style: str, features: dict) -> tuple[str, str]:
    """Conservative prompts that preserve pet appearance but add Ghibli background"""
    
    # Exact prompts as requested by user
    style_prompts = {
        "cartoon": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "ghibli": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "oil_painting": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "watercolor": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "anime": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "realistic": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background",
        
        "popmart": f"same {features['coat_color']} poodle with {features['texture']}, same look and appearance, same pose and expression, all ghibli style including background"
    }
    
    positive_prompt = style_prompts.get(art_style, style_prompts["cartoon"])
    
    # Very strong negative prompt to preserve original pet appearance
    negative_prompt = "different dog, changed pet, altered animal, different breed, wrong fur color, different pose, changed facial expression, different size, ugly pet, bad anatomy, deformed animal, different fur pattern, wrong texture, human, text, watermark, blurry, low quality"
    
    return positive_prompt, negative_prompt

async def flux_ghibli_transform(image: Image.Image) -> Image.Image:
    """Transform image using FLUX.1-Kontext-dev via HF Inference API"""
    
    if not HF_TOKEN or not ai_models.hf_available:
        raise HTTPException(status_code=503, detail="FLUX API not available")
    
    try:
        # FLUX prompt using exact user specification
        prompt = "same pet, same look and appearance, same pose and expression, all ghibli style including background"
        
        logger.info(f"Running FLUX via HF Inference API with prompt: {prompt}")
        
        # Convert image to base64
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Prepare request for HF Inference API
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        
        # FLUX image-to-image request
        def call_flux_api():
            data = {
                "inputs": prompt,
                "parameters": {
                    "image": img_base64,
                    "guidance_scale": 3.5,
                    "num_inference_steps": 28,
                    "strength": 0.8,
                    "seed": 42
                }
            }
            
            response = requests.post(HF_API_URL, headers=headers, json=data)
            
            if response.status_code == 200:
                # HF returns image bytes directly
                result_image = Image.open(io.BytesIO(response.content))
                return result_image
            else:
                raise Exception(f"HF API Error: {response.status_code} - {response.text}")
        
        # Run in executor to avoid blocking
        result_image = await asyncio.get_event_loop().run_in_executor(
            executor,
            call_flux_api
        )
        
        return result_image
            
    except Exception as e:
        logger.error(f"FLUX transformation failed: {e}")
        raise HTTPException(status_code=500, detail=f"FLUX transformation failed: {str(e)}")

async def gpt4o_ghibli_transform(image: Image.Image) -> Image.Image:
    """Transform image using GPT-4o Vision - the most authentic Ghibli style method"""
    
    if not openai_client or not ai_models.openai_available:
        raise HTTPException(status_code=503, detail="OpenAI GPT-4o not available")
    
    try:
        # Convert image to base64
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # GPT-4o prompt for authentic Ghibli transformation
        prompt = """Turn this image into a Studio Ghibli-style animated portrait. Use the soft color palette, whimsical background, and facial features inspired by Ghibli characters. Style it like a scene from 'My Neighbor Totoro' or 'Spirited Away'. Make it look like authentic Studio Ghibli animation with:

- Soft, hand-painted textures
- Dreamy, magical atmosphere  
- Rich, warm colors
- Gentle lighting
- Miyazaki's distinctive art style
- Keep the same pose and subject but transform the style completely

Create a beautiful Studio Ghibli movie scene."""

        # Call GPT-4o Vision
        response = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{img_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=300
            )
        )
        
        # Check if response contains image URL (GPT-4o can generate images)
        if hasattr(response, 'data') and response.data:
            # Handle image response
            result_image_url = response.data[0].url
            
            # Download the generated image
            import requests
            response = requests.get(result_image_url)
            result_image = Image.open(io.BytesIO(response.content))
            
            return result_image
        else:
            # If no image generated, return original (fallback)
            logger.warning("GPT-4o didn't generate image, using fallback")
            raise Exception("GPT-4o image generation failed")
            
    except Exception as e:
        logger.error(f"GPT-4o transformation failed: {e}")
        raise HTTPException(status_code=500, detail=f"GPT-4o transformation failed: {str(e)}")

def fast_style_transfer(
    image: Image.Image, 
    art_style: str = "cartoon",
    strength: float = 0.45,  # Balanced strength for good Ghibli transformation
    steps: int = 50          # High quality steps for proper transformation
) -> Image.Image:
    """Fast style transfer with optimized settings"""
    
    try:
        # Quick feature analysis
        features = analyze_pet_features_fast(image)
        logger.info(f"Features: {features['coat_color']} {features['texture']}")
        
        # Get optimized prompts
        positive_prompt, negative_prompt = get_fast_style_prompts(art_style, features)
        logger.info(f"Prompt: {positive_prompt[:100]}...")
        
        # Use appropriate resolution for each model
        if ai_models.device == "mps":
            # SD 1.5 native resolution
            processed_image = image.resize((512, 512), Image.Resampling.LANCZOS)
        else:
            # SDXL native resolution
            processed_image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Light sharpening for detail preservation
        processed_image = processed_image.filter(ImageFilter.UnsharpMask(radius=1, percent=105, threshold=1))
        
        # Move components to device temporarily
        if ai_models.device == "mps":
            # Move VAE to device for SD 1.5
            img2img_pipeline.vae.to(ai_models.device)
        
        # Conservative generation with settings optimized for preservation
        with torch.no_grad():
            result = img2img_pipeline(
                prompt=positive_prompt,
                negative_prompt=negative_prompt,
                image=processed_image,
                strength=strength,
                num_inference_steps=steps,
                guidance_scale=7.5,  # Optimal guidance for quality Ghibli transformation
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Quick post-processing
        if art_style in ["cartoon", "popmart", "anime"]:
            enhancer = ImageEnhance.Color(result)
            result = enhancer.enhance(1.3)
            
            enhancer = ImageEnhance.Contrast(result)
            result = enhancer.enhance(1.1)
        
        # Memory cleanup
        if ai_models.device == "mps":
            # Move VAE back to CPU for SD 1.5
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
            import gc
            gc.collect()
        
        return result
        
    except Exception as e:
        logger.error(f"Fast style transfer failed: {e}")
        raise HTTPException(status_code=500, detail=f"Fast style transfer failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Fast Enhanced) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "version": "6.0.0",
        "features": [
            "nitrosocke/Ghibli-Diffusion model",
            "Authentic Studio Ghibli style",
            "ghibli style trigger words",
            "50-step generation for quality",
            "Official Ghibli-Diffusion model"
        ],
        "available_styles": ["cartoon", "ghibli", "oil_painting", "watercolor", "anime", "realistic", "popmart"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "version": "6.0.0",
        "approach": "nitrosocke/Ghibli-Diffusion with ghibli style trigger"
    }

@app.post("/generate")
async def generate_fast_portrait(
    image: UploadFile = File(...),
    art_style: str = Form("cartoon"),
    strength: float = Form(0.45),  # Default to balanced Ghibli transformation
    steps: int = Form(50)          # Default to high quality steps
):
    """Generate fast enhanced pet portrait"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="Fast Enhanced models are still loading. Please wait...")
    
    try:
        # Read image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing: {image.filename}, style: {art_style}")
        
        start_time = time.time()
        
        # Priority 1: Try FLUX.1-Kontext-dev first (user's preferred method)
        if ai_models.hf_available and art_style in ["cartoon", "ghibli"]:
            try:
                logger.info("🎨 Using FLUX.1-Kontext-dev via HF API for exact Ghibli style transformation...")
                result_image = await flux_ghibli_transform(input_image)
                generation_time = time.time() - start_time
                
                logger.info(f"✅ FLUX Ghibli transformation completed in {generation_time:.2f} seconds")
                
                # Convert to base64
                img_buffer = io.BytesIO()
                result_image.save(img_buffer, format='PNG', optimize=True)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                
                # Original
                orig_buffer = io.BytesIO()
                input_image.resize((512, 512), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
                orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
                
                return JSONResponse({
                    "success": True,
                    "imageUrl": f"data:image/png;base64,{img_base64}",
                    "originalImage": f"data:image/png;base64,{orig_base64}",
                    "generationTime": round(generation_time, 2),
                    "art_style": art_style,
                    "method": "flux",
                    "version": "6.0.0",
                    "approach": "flux_kontext_dev",
                    "analysis": f"Exact Ghibli style via FLUX.1-Kontext-dev (HF API) in {generation_time:.1f}s"
                })
                
            except Exception as flux_error:
                logger.warning(f"FLUX failed, falling back to GPT-4o: {flux_error}")
        
        # Priority 2: Try GPT-4o for authentic Ghibli style
        if ai_models.openai_available and art_style in ["cartoon", "ghibli"]:
            try:
                logger.info("🎨 Using GPT-4o for authentic Studio Ghibli transformation...")
                result_image = await gpt4o_ghibli_transform(input_image)
                generation_time = time.time() - start_time
                
                logger.info(f"✅ GPT-4o Ghibli transformation completed in {generation_time:.2f} seconds")
                
                # Convert to base64
                img_buffer = io.BytesIO()
                result_image.save(img_buffer, format='PNG', optimize=True)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                
                # Original
                orig_buffer = io.BytesIO()
                input_image.resize((512, 512), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
                orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
                
                return JSONResponse({
                    "success": True,
                    "imageUrl": f"data:image/png;base64,{img_base64}",
                    "originalImage": f"data:image/png;base64,{orig_base64}",
                    "generationTime": round(generation_time, 2),
                    "art_style": art_style,
                    "method": "gpt4o",
                    "version": "6.0.0",
                    "approach": "authentic_ghibli_gpt4o",
                    "analysis": f"Authentic Studio Ghibli style via GPT-4o in {generation_time:.1f}s"
                })
                
            except Exception as gpt4o_error:
                logger.warning(f"GPT-4o failed, falling back to Ghibli-Diffusion: {gpt4o_error}")
        
        # Priority 3: Fallback to Ghibli-Diffusion
        logger.info("🎨 Using Ghibli-Diffusion fallback...")
        loop = asyncio.get_event_loop()
        
        def process():
            return fast_style_transfer(input_image, art_style, strength, steps)
        
        result_image = await loop.run_in_executor(executor, process)
        generation_time = time.time() - start_time
        
        # Convert to base64
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Original
        orig_buffer = io.BytesIO()
        input_image.resize((512, 512), Image.Resampling.LANCZOS).save(orig_buffer, format='PNG')
        orig_base64 = base64.b64encode(orig_buffer.getvalue()).decode()
        
        logger.info(f"Fast generation completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "originalImage": f"data:image/png;base64,{orig_base64}",
            "generationTime": round(generation_time, 2),
            "art_style": art_style,
            "strength": strength,
            "steps": steps,
            "version": "6.0.0",
            "approach": "fast_enhanced_sd15",
            "analysis": f"Fast {art_style} portrait in {generation_time:.1f}s"
        })
        
    except Exception as e:
        logger.error(f"Fast generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Fast generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)