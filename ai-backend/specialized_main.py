from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from diffusers import StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageDraw, ImageEnhance
import io
import base64
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time
import numpy as np
import cv2
from ultralytics import YOLO
import requests
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - Specialized", version="3.0.0")

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
yolo_model = None
executor = ThreadPoolExecutor(max_workers=1)

class SpecializedAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.models_loaded = False
        
    async def load_models(self):
        """Load specialized models: YOLO for pet detection + Stable Diffusion for cartoon conversion"""
        if self.models_loaded:
            return
            
        logger.info(f"Loading specialized models on device: {self.device}")
        
        try:
            global img2img_pipeline, yolo_model
            
            # Load YOLO for pet detection
            logger.info("Loading YOLOv8 for pet detection...")
            yolo_model = YOLO('yolov8n.pt')  # Nano version for speed
            
            # Load Stable Diffusion for img2img cartoon conversion
            logger.info("Loading Stable Diffusion img2img pipeline...")
            model_id = "runwayml/stable-diffusion-v1-5"
            
            img2img_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                safety_checker=None,
                requires_safety_checker=False,
                low_cpu_mem_usage=True
            )
            
            # Optimize scheduler
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
            logger.info("Specialized models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load specialized models: {str(e)}")

# Initialize models
ai_models = SpecializedAI()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting Pepmart AI Backend (Specialized Mode)...")
    await ai_models.load_models()

def detect_and_crop_pet(image: Image.Image) -> tuple[Image.Image, str, float]:
    """Detect pet in image using YOLO and crop to focus on the pet"""
    try:
        # Convert PIL to numpy for YOLO
        img_array = np.array(image)
        
        # Run YOLO detection
        results = yolo_model(img_array)
        
        # Look for pets (cats=15, dogs=16 in COCO dataset)
        pet_classes = [15, 16]  # cat, dog
        best_detection = None
        best_confidence = 0
        pet_type = "pet"
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    if class_id in pet_classes and confidence > best_confidence:
                        best_detection = box.xyxy[0].cpu().numpy()
                        best_confidence = confidence
                        pet_type = "cat" if class_id == 15 else "dog"
        
        if best_detection is not None:
            # Crop to pet with some padding
            x1, y1, x2, y2 = best_detection.astype(int)
            
            # Add padding
            padding = 20
            height, width = img_array.shape[:2]
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(width, x2 + padding)
            y2 = min(height, y2 + padding)
            
            # Crop the image
            cropped_img = image.crop((x1, y1, x2, y2))
            
            logger.info(f"Detected {pet_type} with confidence {best_confidence:.2f}")
            return cropped_img, pet_type, best_confidence
        else:
            logger.info("No pet detected, using full image")
            return image, "pet", 0.0
            
    except Exception as e:
        logger.error(f"Pet detection failed: {e}")
        return image, "pet", 0.0

def convert_to_cartoon(image: Image.Image, pet_type: str, style: str) -> Image.Image:
    """Convert pet image to cartoon style using img2img"""
    
    # Cartoon style prompts optimized for pets
    style_prompts = {
        "cat": "cute cartoon cat, kawaii anime style, big sparkling eyes, soft fur, adorable expression, PopMart collectible figure style, chibi, vinyl toy aesthetic",
        "dog": "cute cartoon dog, kawaii anime style, big sparkling eyes, fluffy fur, sweet expression, PopMart collectible figure style, chibi, vinyl toy aesthetic",
        "pet": "cute cartoon pet, kawaii anime style, big sparkling eyes, soft fur, adorable expression, PopMart collectible figure style, chibi, vinyl toy aesthetic"
    }
    
    # Style-specific modifiers
    if "sleeping" in style:
        modifier = "sleeping peacefully, eyes closed, cozy pose"
    elif "sitting" in style:
        modifier = "sitting upright, alert pose, looking forward"
    else:
        modifier = "natural pose, happy expression"
    
    prompt = f"{style_prompts.get(pet_type, style_prompts['pet'])}, {modifier}, smooth cartoon shading, vibrant colors, high quality digital art"
    
    negative_prompt = "realistic, photograph, human, ugly, blurry, low quality, distorted, deformed, scary, dark"
    
    try:
        logger.info(f"Converting {pet_type} to cartoon style...")
        
        # Resize for processing
        processed_img = image.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Move VAE to device for generation
        if ai_models.device == "mps":
            img2img_pipeline.vae.to(ai_models.device)
        
        # Generate cartoon version using img2img
        with torch.no_grad():
            cartoon_image = img2img_pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=processed_img,
                strength=0.6,  # Balance between original and new style
                num_inference_steps=15,  # Fast but good quality
                guidance_scale=7.5,
                generator=torch.Generator(device=ai_models.device).manual_seed(42)
            ).images[0]
        
        # Enhance colors for PopMart aesthetic
        enhancer = ImageEnhance.Color(cartoon_image)
        cartoon_image = enhancer.enhance(1.3)
        
        enhancer = ImageEnhance.Contrast(cartoon_image)
        cartoon_image = enhancer.enhance(1.1)
        
        # Move VAE back to CPU
        if ai_models.device == "mps":
            img2img_pipeline.vae.to("cpu")
            torch.mps.empty_cache()
        
        return cartoon_image
        
    except Exception as e:
        logger.error(f"Cartoon conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cartoon conversion failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Specialized Mode) is running!", 
        "device": ai_models.device, 
        "models_loaded": ai_models.models_loaded,
        "mode": "specialized",
        "features": ["YOLOv8 pet detection", "img2img cartoon conversion"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": ai_models.device,
        "models_loaded": ai_models.models_loaded,
        "mode": "specialized",
        "pipeline": "YOLO detection + SD img2img conversion"
    }

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = "sleeping_popmart_poodle"
):
    """Specialized two-stage pet portrait generation: detection + cartoon conversion"""
    
    if not ai_models.models_loaded:
        raise HTTPException(status_code=503, detail="Specialized models are still loading. Please wait...")
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Run specialized pipeline
        loop = asyncio.get_event_loop()
        
        def specialized_process():
            # Stage 1: Detect and crop pet
            cropped_image, pet_type, confidence = detect_and_crop_pet(input_image)
            
            # Stage 2: Convert to cartoon style
            cartoon_image = convert_to_cartoon(cropped_image, pet_type, style)
            
            return cartoon_image, pet_type, confidence, cropped_image
        
        start_time = time.time()
        cartoon_image, pet_type, confidence, cropped_image = await loop.run_in_executor(executor, specialized_process)
        generation_time = time.time() - start_time
        
        # Convert results to base64
        img_buffer = io.BytesIO()
        cartoon_image.save(img_buffer, format='PNG', optimize=True)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Also include cropped image for reference
        crop_buffer = io.BytesIO()
        cropped_image.save(crop_buffer, format='PNG', optimize=True)
        crop_base64 = base64.b64encode(crop_buffer.getvalue()).decode()
        
        logger.info(f"Specialized generation completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/png;base64,{img_base64}",
            "croppedImage": f"data:image/png;base64,{crop_base64}",
            "generationTime": round(generation_time, 2),
            "style": style,
            "petType": pet_type,
            "confidence": round(confidence, 2),
            "analysis": f"Detected {pet_type} (confidence: {confidence:.1f}) and converted to PopMart cartoon style in {generation_time:.1f}s"
        })
        
    except Exception as e:
        logger.error(f"Specialized generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Specialized generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)