from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionPipeline, StableDiffusionControlNetPipeline, ControlNetModel
from diffusers import DPMSolverMultistepScheduler
from PIL import Image, ImageEnhance
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
import colorsys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - Low Memory", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
        """Load Stable Diffusion and ControlNet models with memory optimizations"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading models on device: {self.device}")
        
        try:
            # Load base Stable Diffusion model with memory optimizations
            model_id = "runwayml/stable-diffusion-v1-5"
            
            global pipeline, controlnet_pipeline, pose_detector
            
            # Load ControlNet for pose preservation (more memory efficient approach)
            controlnet = ControlNetModel.from_pretrained(
                "lllyasviel/sd-controlnet-openpose",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
            
            controlnet_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
                model_id,
                controlnet=controlnet,
                torch_dtype=torch.float16,
                safety_checker=None,
                requires_safety_checker=False,
                low_cpu_mem_usage=True
            )
            
            # Memory optimizations
            if self.device == "mps":
                # MPS-specific optimizations
                controlnet_pipeline.enable_attention_slicing(1)
                # Keep essential parts on MPS, move VAE to CPU
                controlnet_pipeline.vae.to("cpu")
                controlnet_pipeline.unet.to(self.device)
                controlnet_pipeline.text_encoder.to(self.device)
                controlnet_pipeline.controlnet.to(self.device)
            else:
                controlnet_pipeline = controlnet_pipeline.to(self.device)
                
            # Optimize scheduler
            controlnet_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(controlnet_pipeline.scheduler.config)
            
            if self.device == "cuda":
                controlnet_pipeline.enable_xformers_memory_efficient_attention()
                controlnet_pipeline.enable_model_cpu_offload()
            
            # Load pose detector
            pose_detector = OpenposeDetector.from_pretrained("lllyasviel/Annotators")
            
            self.models_loaded = True
            logger.info("Models loaded successfully with memory optimizations!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load AI models: {str(e)}")

# Initialize models
ai_models = AIModels()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Low Memory Mode)...")
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

def analyze_pet_colors(image: Image.Image) -> str:
    """Analyze the dominant colors in the pet image for better color matching"""
    try:
        # Convert to numpy array and get dominant colors
        img_array = np.array(image.resize((64, 64)))
        pixels = img_array.reshape(-1, 3)
        
        # Get the most common colors (simple approach)
        unique_colors, counts = np.unique(pixels, axis=0, return_counts=True)
        dominant_color = unique_colors[np.argmax(counts)]
        
        # Convert RGB to color description
        r, g, b = dominant_color
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        
        if s < 0.2:  # Low saturation = grayscale
            if v > 0.8:
                return "white"
            elif v < 0.3:
                return "black"
            else:
                return "gray"
        elif h < 0.08 or h > 0.92:  # Red range
            return "reddish brown" if v < 0.7 else "orange"
        elif h < 0.17:  # Orange-yellow
            return "golden" if s > 0.5 else "cream"
        elif h < 0.33:  # Yellow-green
            return "golden" if s > 0.5 else "light brown"
        elif h < 0.67:  # Green-blue
            return "gray" if s < 0.3 else "blue-gray"
        else:  # Blue-purple
            return "dark" if v < 0.5 else "gray"
            
    except Exception as e:
        logger.error(f"Color analysis failed: {e}")
        return "brown"

def generate_popmart_image(prompt: str, input_image: Image.Image, pose_image: Optional[Image.Image] = None) -> Image.Image:
    """Generate PopMart-style image with pose control and enhanced cuteness"""
    
    # Analyze pet colors for better matching
    color_description = analyze_pet_colors(input_image)
    
    # Enhanced PopMart-specific prompt with better cuteness factors
    enhanced_prompt = f"""
    {prompt}, {color_description} fur, PopMart collectible figure style, Labubu style, Molly style,
    extremely cute kawaii chibi, vinyl designer toy, collectible figure,
    oversized round head, tiny body proportions, huge sparkling doe eyes with light reflections,
    rosy pink cheeks, sweet innocent expression, button nose,
    smooth matte vinyl finish, soft pastel colors, dreamy lighting,
    adorable pose, professional toy photography, clean gradient background,
    high quality render, ultra cute aesthetic, heartwarming, loveable,
    designer collectible, premium vinyl toy, 8k resolution
    """
    
    # Comprehensive negative prompt to avoid ugly results
    negative_prompt = """
    realistic, photographic, human, adult content, scary, horror, dark, gory,
    ugly, distorted, deformed, bad anatomy, extra limbs, missing limbs, 
    floating limbs, disconnected limbs, malformed hands, blurry, low quality,
    watermark, signature, text, logo, bad proportions, cloned face,
    disfigured, gross proportions, malformed limbs, missing arms, missing legs,
    extra arms, extra legs, fused fingers, too many fingers, long neck,
    cross-eyed, mutated hands, polar lowres, bad body, bad hands, bad face,
    deformed, blurry, bad anatomy, bad proportions, extra limbs, cloned face,
    skinny, glitchy, double torso, extra arms, extra hands, mangled fingers,
    missing lips, ugly face, distorted face, low resolution, old, mature
    """
    
    try:
        logger.info("Generating enhanced PopMart-style image...")
        
        # Move VAE to device before generation if on MPS
        if ai_models.device == "mps":
            controlnet_pipeline.vae.to(ai_models.device)
        
        # Generate with pose control for better matching
        with torch.no_grad():
            if pose_image is not None:
                image = controlnet_pipeline(
                    prompt=enhanced_prompt,
                    negative_prompt=negative_prompt,
                    image=pose_image,
                    num_inference_steps=20,  # Balanced quality and speed
                    guidance_scale=8.0,  # Higher guidance for better prompt following
                    controlnet_conditioning_scale=0.8,  # Strong pose control
                    width=512,
                    height=512,
                    generator=torch.Generator(device=ai_models.device).manual_seed(42)
                ).images[0]
            else:
                # Fallback without pose control (shouldn't happen)
                image = controlnet_pipeline(
                    prompt=enhanced_prompt,
                    negative_prompt=negative_prompt,
                    num_inference_steps=20,
                    guidance_scale=8.0,
                    width=512,
                    height=512,
                    generator=torch.Generator(device=ai_models.device).manual_seed(42)
                ).images[0]
        
        # Enhance colors and cuteness post-processing
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.2)  # Boost colors slightly
        
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.1)  # Slight contrast boost
        
        # Move VAE back to CPU after generation if on MPS
        if ai_models.device == "mps":
            controlnet_pipeline.vae.to("cpu")
            torch.mps.empty_cache()  # Clear MPS cache
        
        return image
        
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Pepmart AI Backend (Low Memory) is running!", "device": ai_models.device, "models_loaded": ai_models.models_loaded}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "low_memory"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = "sleeping_popmart_poodle"
):
    """Generate PopMart-style pet portrait with memory optimizations"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="AI models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Resize image for processing
        input_image = input_image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Run generation in thread pool
        loop = asyncio.get_event_loop()
        
        def process_image():
            # Detect pose from input image for better matching
            pose_image = detect_pose(input_image)
            
            # Generate based on style with more detailed prompts
            if style == "sleeping_popmart_poodle":
                prompt = "adorable small poodle dog curled up in sleeping position, fluffy curly fur, peaceful dreamy expression, cozy and comfortable"
            elif style == "sitting_popmart_cat":
                prompt = "cute cat sitting upright with perfect posture, fluffy soft fur, alert sweet expression, elegant sitting pose"
            else:
                prompt = "loveable pet in natural pose, soft fluffy fur, sweet gentle expression"
            
            # Generate PopMart-style image with pose matching
            generated_image = generate_popmart_image(prompt, input_image, pose_image)
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
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "poseImage": f"data:image/png;base64,{pose_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "analysis": f"Generated enhanced PopMart-style {style.replace('_', ' ')} in {generation_time:.1f}s with pose matching and color analysis"
        })
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)