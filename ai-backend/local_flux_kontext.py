#!/usr/bin/env python3
"""
Local FLUX.1-Kontext implementation without HuggingFace token dependency
"""
import os
import sys
from pathlib import Path
import tempfile
import shutil

# Add the FLUX path to sys.path
FLUX_PATH = Path(__file__).parent.parent / "flux"
sys.path.insert(0, str(FLUX_PATH / "src"))

try:
    import torch
    import numpy as np
    import base64
    from PIL import Image
    from fastapi import FastAPI, HTTPException, File, UploadFile, Form
    from fastapi.responses import JSONResponse, StreamingResponse
    import uvicorn
    import logging
except ImportError as e:
    print(f"Missing dependencies: {e}")
    print("Please ensure PyTorch and other dependencies are installed")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Local FLUX.1-Kontext API")

# Global model cache
MODEL_CACHE = {}

def load_models_locally():
    """Initialize FLUX setup - models loaded on first generation"""
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    logger.info(f"FLUX will use device: {device}")
    
    try:
        # Store device info - models will be loaded by CLI on first use
        MODEL_CACHE.update({
            'device': device,
            'initialized': True
        })
        
        logger.info("✅ FLUX.1-Kontext setup ready!")
        return True
            
    except Exception as e:
        logger.error(f"❌ Failed to initialize FLUX: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("Starting Local FLUX.1-Kontext Backend...")
    success = load_models_locally()
    if not success:
        logger.error("Failed to load models. Some features may not work.")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": bool(MODEL_CACHE)}

@app.post("/test-generate")
async def test_generate():
    """Test generation with default image"""
    try:
        # Use the default cup image from FLUX examples
        cup_path = FLUX_PATH / "assets" / "cup.png"
        if not cup_path.exists():
            raise HTTPException(status_code=404, detail="Test image not found")
        
        # Test with a simple prompt
        test_prompt = "same pet, same pose, just in cute cartoon style"
        
        import subprocess
        output_dir = tempfile.mkdtemp()
        
        cmd = [
            sys.executable, "-m", "flux", "kontext",
            "--prompt", test_prompt,
            "--img_cond_path", str(cup_path),
            "--guidance", "2.5",
            "--num_steps", "10",  # Very fast test
            "--device", MODEL_CACHE.get('device', 'cpu'),
            "--output_dir", output_dir,
            "--offload"
        ]
        
        env = os.environ.copy()
        env['PYTHONPATH'] = str(FLUX_PATH / "src")
        
        logger.info(f"Testing FLUX with command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd, 
            cwd=FLUX_PATH,
            capture_output=True,
            text=True,
            env=env,
            timeout=300  # 5 minute timeout for test
        )
        
        return {
            "test": "completed",
            "return_code": result.returncode,
            "stdout": result.stdout[-500:],  # Last 500 chars
            "stderr": result.stderr[-500:] if result.stderr else None
        }
        
    except Exception as e:
        logger.error(f"Test generation failed: {e}")
        return {"test": "failed", "error": str(e)}

@app.post("/generate")
async def generate_image(
    image: UploadFile = File(...),
    style: str = Form("sleeping_popmart_poodle"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"), 
    color_palette: str = Form("vibrant"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None),
    guidance: float = Form(2.5),
    num_steps: int = Form(20),  # Reduced steps for faster generation
    seed: int = Form(None)
):
    """Generate PopMart-style image using FLUX.1-Kontext"""
    
    if not MODEL_CACHE:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    import time
    start_time = time.time()
    
    try:
        # Build FLUX.1-Kontext specific prompt - keep same pet, same pose, change style only
        base_prompt = "same pet, same appearance, same pose and size, just in "
        
        # Add style-specific elements
        if art_style == "popmart":
            base_prompt += "PopMart collectible figure style, vinyl toy aesthetic, kawaii cute style"
        else:
            base_prompt += "Studio Ghibli anime style, soft animation art style"
        
        # Add detail modifiers
        if cuteness_level == "high":
            base_prompt += ", extremely adorable with big expressive eyes"
        elif cuteness_level == "medium":
            base_prompt += ", cute and friendly appearance"
        
        if color_palette == "vibrant":
            base_prompt += ", bright vibrant colors"
        elif color_palette == "pastel":
            base_prompt += ", soft pastel colors"
        elif color_palette == "monochrome":
            base_prompt += ", monochrome with subtle color accents"
        
        base_prompt += ", high quality, detailed, clean background"
        
        # Use custom prompt if provided, otherwise use generated one
        final_prompt = prompt.strip() if prompt and prompt.strip() else base_prompt
        
        logger.info(f"Generated prompt: {final_prompt}")
        
        # Save uploaded image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
            shutil.copyfileobj(image.file, temp_img)
            temp_img_path = temp_img.name
        
        # Create output directory
        output_dir = tempfile.mkdtemp()
        
        try:
            # Use the FLUX CLI directly with our local setup
            import subprocess
            
            cmd = [
                sys.executable, "-m", "flux", "kontext",
                "--prompt", final_prompt,
                "--img_cond_path", temp_img_path,
                "--guidance", str(guidance),
                "--num_steps", str(num_steps),
                "--device", MODEL_CACHE.get('device', 'cpu'),
                "--output_dir", output_dir,
                "--offload"  # Use offloading for memory efficiency
            ]
            
            if seed is not None:
                cmd.extend(["--seed", str(seed)])
            
            # Change to FLUX directory and run
            env = os.environ.copy()
            env['PYTHONPATH'] = str(FLUX_PATH / "src")
            
            logger.info(f"Running FLUX command: {' '.join(cmd)}")
            logger.info(f"Starting generation - this may take 2-5 minutes...")
            
            result = subprocess.run(
                cmd, 
                cwd=FLUX_PATH,
                capture_output=True,
                text=True,
                env=env,
                timeout=600  # 10 minute timeout for subprocess
            )
            
            logger.info(f"FLUX subprocess completed with return code: {result.returncode}")
            if result.stdout:
                logger.info(f"FLUX stdout: {result.stdout}")
            if result.stderr:
                logger.info(f"FLUX stderr: {result.stderr}")
            
            if result.returncode != 0:
                logger.error(f"FLUX command failed: {result.stderr}")
                raise HTTPException(status_code=500, detail=f"Generation failed: {result.stderr}")
            
            # Find generated image
            output_files = list(Path(output_dir).glob("*.png"))
            if not output_files:
                output_files = list(Path(output_dir).glob("*.jpg"))
            
            if not output_files:
                raise HTTPException(status_code=500, detail="No output image generated")
            
            # Convert to base64 data URL for frontend compatibility
            generated_image_path = output_files[0]
            with open(generated_image_path, 'rb') as img_file:
                img_data = img_file.read()
                base64_image = f"data:image/png;base64,{base64.b64encode(img_data).decode('utf-8')}"
            
            generation_time = time.time() - start_time
            
            # Clean up output directory
            shutil.rmtree(output_dir)
            
            return JSONResponse({
                "success": True,
                "imageUrl": base64_image,
                "analysis": f"PopMart-style figure generated using FLUX.1-Kontext with {art_style} aesthetic, {cuteness_level} cuteness level",
                "generationTime": f"{generation_time:.1f}",
                "prompt": final_prompt,
                "model": "FLUX.1-Kontext-dev (local)"
            })
            
        finally:
            # Cleanup temporary input image
            os.unlink(temp_img_path)
            
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Local FLUX.1-Kontext Backend...")
    print("📍 This runs completely locally without needing HuggingFace tokens")
    print("🔧 Models will be downloaded on first run and cached locally")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8003,  # Same port as your existing backend
        log_level="info"
    )