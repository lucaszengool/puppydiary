from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import base64
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart AI Backend - Simple Version", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Pepmart AI Backend (Simple) is running!", 
        "status": "ready",
        "version": "simple-demo"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "simple-demo",
        "ai_ready": True,
        "message": "Simple backend ready for demonstration"
    }

def create_demo_popmart_image() -> str:
    """Create a simple demo PopMart-style image"""
    # Create a simple colored square as demo
    demo_image = Image.new('RGB', (512, 512), color=(255, 192, 203))  # Pink background
    
    # Convert to base64
    img_buffer = io.BytesIO()
    demo_image.save(img_buffer, format='PNG')
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

@app.post("/generate")
async def generate_pet_portrait(
    image: UploadFile = File(...),
    style: str = "sleeping_popmart_poodle"
):
    """Generate PopMart-style pet portrait - Simple Demo Version"""
    
    try:
        # Read uploaded image
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        logger.info(f"Processing image: {image.filename}, size: {input_image.size}")
        
        # Simulate AI processing time
        start_time = time.time()
        await asyncio.sleep(2)  # Simulate 2 second processing
        generation_time = time.time() - start_time
        
        # Generate demo image
        demo_image_url = create_demo_popmart_image()
        
        logger.info(f"Demo generation completed in {generation_time:.2f} seconds")
        
        return JSONResponse({
            "success": True,
            "imageUrl": demo_image_url,
            "poseImage": demo_image_url,  # Same as main image for demo
            "generationTime": round(generation_time, 2),
            "style": style,
            "analysis": f"DEMO MODE: Generated PopMart-style {style.replace('_', ' ')} in {generation_time:.1f}s using simple backend. Install full AI models for real generation with Stable Diffusion!"
        })
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

# Import asyncio at the top level
import asyncio

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Pepmart Simple AI Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)