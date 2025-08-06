"""
Lightweight demo backend for Railway deployment
Returns demo images without actual AI processing
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
import logging
import random
from typing import Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pepmart Demo Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo PopMart style images (base64 encoded)
DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=512&h=512&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=512&h=512&fit=crop",
]

@app.get("/")
async def root():
    return {"message": "Pepmart Demo Backend - Railway Deployment"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": True,
        "provider": "Demo Mode (Railway)"
    }

@app.post("/generate")
async def generate(
    image: UploadFile = File(...),
    style: str = Form("popmart"),
    art_style: str = Form("popmart"),
    cuteness_level: str = Form("high"),
    color_palette: str = Form("vibrant"),
    prompt: Optional[str] = Form(None),
    negative_prompt: Optional[str] = Form(None),
):
    """Generate a demo portrait with basic image processing"""
    
    try:
        # Read and process the uploaded image
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to standard size
        img = img.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Apply simple filters based on art style
        if art_style == "popmart":
            # Enhance colors and contrast for PopMart style
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.5)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.3)
            
        elif art_style == "watercolor":
            # Apply blur for watercolor effect
            img = img.filter(ImageFilter.GaussianBlur(radius=2))
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(0.8)
            
        elif art_style == "sketch":
            # Convert to grayscale for sketch effect
            img = img.convert('L').convert('RGB')
            img = img.filter(ImageFilter.FIND_EDGES)
            
        elif art_style == "cartoon":
            # Enhance colors for cartoon effect
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(2.0)
            img = img.filter(ImageFilter.SMOOTH)
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Return processed image
        return JSONResponse({
            "success": True,
            "imageUrl": f"data:image/jpeg;base64,{img_base64}",
            "analysis": f"Demo {art_style} style portrait generated (Railway deployment)",
            "generationTime": round(random.uniform(2.0, 5.0), 1),
            "demo": True
        })
        
    except Exception as e:
        logger.error(f"Error in demo generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect")
async def detect_pet(image: UploadFile = File(...)):
    """Demo pet detection - always returns positive result"""
    
    return JSONResponse({
        "hasAnimal": True,
        "animalType": "pet",
        "confidence": 0.95,
        "demo": True
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)