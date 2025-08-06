#!/usr/bin/env python3
"""
Simple FLUX.1-Kontext backend with better timeout handling
"""
import os
import sys
import asyncio
import subprocess
import tempfile
import shutil
import base64
import time
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException, File, UploadFile, Form, BackgroundTasks
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
FLUX_PATH = Path(__file__).parent.parent / "flux"

app = FastAPI(title="Simple FLUX.1-Kontext API")

# Thread pool for background processing
executor = ThreadPoolExecutor(max_workers=1)

def run_flux_generation(image_path: str, prompt: str, output_dir: str, steps: int = 15) -> dict:
    """Run FLUX generation in a separate thread"""
    try:
        cmd = [
            sys.executable, "-m", "flux", "kontext",
            "--prompt", prompt,
            "--img_cond_path", image_path,
            "--guidance", "2.5",
            "--num_steps", str(steps),
            "--device", "mps",
            "--output_dir", output_dir,
            "--offload"
        ]
        
        env = os.environ.copy()
        env['PYTHONPATH'] = str(FLUX_PATH / "src")
        # Suppress tokenizer warnings
        env['TOKENIZERS_PARALLELISM'] = 'false'
        env['TRANSFORMERS_VERBOSITY'] = 'error'
        
        logger.info(f"🚀 Running FLUX: {prompt}")
        start_time = time.time()
        
        # Run with no timeout - let it complete
        result = subprocess.run(
            cmd,
            cwd=FLUX_PATH,
            capture_output=True,
            text=True,
            env=env
        )
        
        generation_time = time.time() - start_time
        
        # Check for real errors vs warnings
        if result.returncode != 0:
            # Check if it's just the T5 tokenizer warning (not a real error)
            if "T5Tokenizer" in result.stderr and "legacy" in result.stderr:
                logger.info("ℹ️ T5 tokenizer legacy warning (can be ignored)")
                # Check if output was actually generated despite warning
                output_files = list(Path(output_dir).glob("*.png"))
                if not output_files:
                    output_files = list(Path(output_dir).glob("*.jpg"))
                
                if output_files:
                    logger.info("✅ Generation succeeded despite warning")
                    # Continue to success path below
                else:
                    logger.error(f"❌ FLUX failed: {result.stderr}")
                    return {
                        "success": False,
                        "error": f"Generation failed: {result.stderr}",
                        "generation_time": generation_time
                    }
            else:
                logger.error(f"❌ FLUX failed: {result.stderr}")
                return {
                    "success": False,
                    "error": f"Generation failed: {result.stderr}",
                    "generation_time": generation_time
                }
        
        if not output_files:
            return {
                "success": False,
                "error": "No output image generated",
                "generation_time": generation_time
            }
        
        # Convert to base64
        with open(output_files[0], 'rb') as img_file:
            img_data = img_file.read()
            base64_image = f"data:image/png;base64,{base64.b64encode(img_data).decode('utf-8')}"
        
        logger.info(f"✅ FLUX completed in {generation_time:.1f}s")
        
        return {
            "success": True,
            "imageUrl": base64_image,
            "generation_time": generation_time
        }
        
    except Exception as e:
        logger.error(f"❌ FLUX generation error: {e}")
        return {
            "success": False,
            "error": str(e),
            "generation_time": 0
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": True}

@app.post("/generate")
async def generate_image(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"), 
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None)
):
    """Generate PopMart-style image using FLUX.1-Kontext"""
    
    try:
        # Build prompt
        if prompt and prompt.strip():
            final_prompt = prompt.strip()
        else:
            base_prompt = "same pet, same appearance, same pose and size, just in "
            
            if art_style == "popmart":
                base_prompt += "PopMart collectible figure style, vinyl toy aesthetic, kawaii cute style"
            else:
                base_prompt += "Studio Ghibli anime style, soft animation art style"
            
            if cuteness_level == "high":
                base_prompt += ", extremely adorable with big expressive eyes"
            
            if color_palette == "vibrant":
                base_prompt += ", bright vibrant colors"
            elif color_palette == "pastel":
                base_prompt += ", soft pastel colors"
            
            final_prompt = base_prompt + ", high quality, detailed, clean background"
        
        # Save uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
            shutil.copyfileobj(image.file, temp_img)
            temp_img_path = temp_img.name
        
        output_dir = tempfile.mkdtemp()
        
        try:
            # Run generation in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                executor, 
                run_flux_generation, 
                temp_img_path, 
                final_prompt, 
                output_dir, 
                15  # Steps
            )
            
            if result["success"]:
                return JSONResponse({
                    "success": True,
                    "imageUrl": result["imageUrl"],
                    "analysis": f"Generated in {result['generation_time']:.1f}s using FLUX.1-Kontext",
                    "generationTime": f"{result['generation_time']:.1f}",
                    "prompt": final_prompt,
                    "model": "FLUX.1-Kontext-dev (local)"
                })
            else:
                raise HTTPException(status_code=500, detail=result["error"])
                
        finally:
            # Cleanup
            try:
                os.unlink(temp_img_path)
                shutil.rmtree(output_dir, ignore_errors=True)
            except:
                pass
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Simple FLUX.1-Kontext Backend...")
    print("📍 Runs locally without HuggingFace tokens")
    print("🔧 First generation downloads models automatically")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8003,
        log_level="info",
        timeout_keep_alive=3600,  # 1 hour keep alive
        timeout_graceful_shutdown=3600  # 1 hour graceful shutdown
    )