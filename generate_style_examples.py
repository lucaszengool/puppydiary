#!/usr/bin/env python3
"""
Generate example images for all 12 art styles
"""
import os
import requests
import json
import base64
import time
from pathlib import Path
from PIL import Image
from io import BytesIO

# Create styles directory if it doesn't exist
styles_dir = Path("public/styles")
styles_dir.mkdir(parents=True, exist_ok=True)

# Sample pet image URLs from free stock photo sites
pet_images = [
    {
        "name": "golden_retriever",
        "url": "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "realistic"
    },
    {
        "name": "tabby_cat",
        "url": "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "ghibli"
    },
    {
        "name": "white_puppy",
        "url": "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "watercolor"
    },
    {
        "name": "bunny",
        "url": "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "modern"
    },
    {
        "name": "husky",
        "url": "https://images.pexels.com/photos/3726314/pexels-photo-3726314.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "disney"
    },
    {
        "name": "persian_cat",
        "url": "https://images.pexels.com/photos/1317844/pexels-photo-1317844.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "vintage"
    },
    {
        "name": "corgi",
        "url": "https://images.pexels.com/photos/2664417/pexels-photo-2664417.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "popart"
    },
    {
        "name": "siamese_cat",
        "url": "https://images.pexels.com/photos/596590/pexels-photo-596590.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "pencil"
    },
    {
        "name": "french_bulldog",
        "url": "https://images.pexels.com/photos/160846/french-bulldog-summer-smile-joy-160846.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "graffiti"
    },
    {
        "name": "black_cat",
        "url": "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "cyberpunk"
    },
    {
        "name": "poodle",
        "url": "https://images.pexels.com/photos/1458925/pexels-photo-1458925.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "renaissance"
    },
    {
        "name": "orange_cat",
        "url": "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800",
        "style": "mosaic"
    }
]

# Style mapping
style_files = {
    "realistic": "disney-style.png",  # Will be oil painting
    "ghibli": "ghibli-style.png",
    "watercolor": "watercolor-style.png",
    "modern": "modern-style.png",
    "disney": "disney-cartoon.png",
    "vintage": "vintage-style.png",
    "popart": "popart-style.png",
    "pencil": "pencil-style.png",
    "graffiti": "graffiti-style.png",
    "cyberpunk": "cyberpunk-style.png",
    "renaissance": "renaissance-style.png",
    "mosaic": "mosaic-style.png"
}

def download_image(url):
    """Download an image from URL"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return Image.open(BytesIO(response.content))
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def generate_style_example(pet_image_url, style_id):
    """Generate a style example using the AI backend"""
    backend_url = "http://localhost:8083/generate"
    
    try:
        # Download the pet image
        pet_img = download_image(pet_image_url)
        if not pet_img:
            print(f"Failed to download image: {pet_image_url}")
            return None
        
        # Convert to RGB if needed
        if pet_img.mode != 'RGB':
            pet_img = pet_img.convert('RGB')
        
        # Save to bytes
        img_bytes = BytesIO()
        pet_img.save(img_bytes, format='JPEG', quality=95)
        img_bytes.seek(0)
        
        # Prepare the request
        files = {
            'image': ('pet.jpg', img_bytes, 'image/jpeg')
        }
        
        # Map style_id to art_style parameter
        art_style_map = {
            "realistic": "oil_painting",
            "ghibli": "anime",
            "watercolor": "watercolor",
            "modern": "minimalist",
            "disney": "cartoon",
            "vintage": "photography",
            "popart": "pop_art",
            "pencil": "pencil_sketch",
            "graffiti": "graffiti",
            "cyberpunk": "cyberpunk",
            "renaissance": "renaissance",
            "mosaic": "mosaic"
        }
        
        data = {
            'style': 'custom',
            'art_style': art_style_map.get(style_id, "anime"),
            'cuteness_level': 'high',
            'color_palette': 'vibrant'
        }
        
        print(f"🎨 Generating {style_id} style...")
        response = requests.post(backend_url, files=files, data=data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('imageUrl'):
                # Extract base64 image data
                image_data = result['imageUrl']
                if image_data.startswith('data:image'):
                    # Remove data URL prefix
                    base64_data = image_data.split(',')[1]
                    img_data = base64.b64decode(base64_data)
                    
                    # Save the image
                    output_path = styles_dir / style_files[style_id]
                    with open(output_path, 'wb') as f:
                        f.write(img_data)
                    print(f"✅ Saved {style_id} style to {output_path}")
                    return True
        
        print(f"❌ Failed to generate {style_id} style")
        return False
        
    except Exception as e:
        print(f"Error generating {style_id}: {e}")
        return False

def main():
    print("🚀 Starting style example generation...")
    print(f"📁 Output directory: {styles_dir}")
    
    # Check if AI backend is running
    try:
        health = requests.get("http://localhost:8083/health", timeout=5)
        if health.status_code != 200:
            print("⚠️  AI backend not running. Please start it with:")
            print("   python ai-backend/doubao_backend.py")
            return
    except:
        print("⚠️  AI backend not running. Please start it with:")
        print("   python ai-backend/doubao_backend.py")
        return
    
    print("✅ AI backend is running")
    
    # Generate examples for each style
    success_count = 0
    for pet in pet_images:
        if generate_style_example(pet["url"], pet["style"]):
            success_count += 1
            time.sleep(2)  # Rate limiting
    
    print(f"\n📊 Generated {success_count}/{len(pet_images)} style examples")
    
    # Create placeholder images for any missing styles
    print("\n📝 Creating placeholder images for missing styles...")
    for style_id, filename in style_files.items():
        filepath = styles_dir / filename
        if not filepath.exists():
            # Create a placeholder image
            placeholder = Image.new('RGB', (800, 800), color=(240, 240, 240))
            placeholder.save(filepath)
            print(f"📄 Created placeholder for {filename}")

if __name__ == "__main__":
    main()