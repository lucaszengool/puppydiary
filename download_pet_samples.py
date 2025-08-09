#!/usr/bin/env python3
"""
Download sample pet images from free stock photo sites as placeholders
"""
import os
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

# Create styles directory if it doesn't exist
styles_dir = Path("public/styles")
styles_dir.mkdir(parents=True, exist_ok=True)

# Sample pet image URLs and their target filenames
pet_samples = [
    {
        "url": "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "disney-style.png",
        "description": "Golden Retriever - Oil Painting Style"
    },
    {
        "url": "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "ghibli-style.png",
        "description": "Tabby Cat - Ghibli Style"
    },
    {
        "url": "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "watercolor-style.png",
        "description": "White Puppy - Watercolor Style"
    },
    {
        "url": "https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "modern-style.png",
        "description": "Bunny - Modern Style"
    },
    {
        "url": "https://images.pexels.com/photos/3726314/pexels-photo-3726314.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "disney-cartoon.png",
        "description": "Husky - Disney Cartoon Style"
    },
    {
        "url": "https://images.pexels.com/photos/1317844/pexels-photo-1317844.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "vintage-style.png",
        "description": "Persian Cat - Vintage Style"
    },
    {
        "url": "https://images.pexels.com/photos/2664417/pexels-photo-2664417.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "popart-style.png",
        "description": "Corgi - Pop Art Style"
    },
    {
        "url": "https://images.pexels.com/photos/596590/pexels-photo-596590.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "pencil-style.png",
        "description": "Siamese Cat - Pencil Sketch Style"
    },
    {
        "url": "https://images.pexels.com/photos/160846/french-bulldog-summer-smile-joy-160846.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "graffiti-style.png",
        "description": "French Bulldog - Graffiti Style"
    },
    {
        "url": "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "cyberpunk-style.png",
        "description": "Black Cat - Cyberpunk Style"
    },
    {
        "url": "https://images.pexels.com/photos/1458925/pexels-photo-1458925.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "renaissance-style.png",
        "description": "Poodle - Renaissance Style"
    },
    {
        "url": "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800",
        "filename": "mosaic-style.png",
        "description": "Orange Cat - Mosaic Style"
    }
]

def download_and_save_image(url, filename, description):
    """Download an image from URL and save it"""
    try:
        print(f"📥 Downloading: {description}")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            # Open the image
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to square (800x800) for consistency
            img = img.resize((800, 800), Image.Resampling.LANCZOS)
            
            # Save as PNG
            output_path = styles_dir / filename
            img.save(output_path, 'PNG', quality=95)
            print(f"✅ Saved: {filename}")
            return True
        else:
            print(f"❌ Failed to download: {description} (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error downloading {description}: {e}")
        return False

def main():
    print("🚀 Downloading sample pet images...")
    print(f"📁 Output directory: {styles_dir}")
    
    success_count = 0
    for pet in pet_samples:
        if download_and_save_image(pet["url"], pet["filename"], pet["description"]):
            success_count += 1
    
    print(f"\n📊 Downloaded {success_count}/{len(pet_samples)} images")
    
    # Create solid color placeholders for any missing images
    colors = {
        "disney-style.png": (255, 218, 185),  # Peach for oil painting
        "ghibli-style.png": (176, 224, 230),  # Powder blue for anime
        "watercolor-style.png": (230, 230, 250),  # Lavender for watercolor
        "modern-style.png": (245, 245, 245),  # Light gray for minimalist
        "disney-cartoon.png": (255, 192, 203),  # Pink for cartoon
        "vintage-style.png": (218, 165, 32),  # Goldenrod for vintage
        "popart-style.png": (255, 20, 147),  # Deep pink for pop art
        "pencil-style.png": (192, 192, 192),  # Silver for pencil
        "graffiti-style.png": (0, 255, 127),  # Spring green for graffiti
        "cyberpunk-style.png": (138, 43, 226),  # Blue violet for cyberpunk
        "renaissance-style.png": (178, 134, 86),  # Brown for renaissance
        "mosaic-style.png": (255, 215, 0)  # Gold for mosaic
    }
    
    print("\n📝 Creating placeholders for any missing images...")
    for filename, color in colors.items():
        filepath = styles_dir / filename
        if not filepath.exists():
            # Create a colored placeholder
            placeholder = Image.new('RGB', (800, 800), color=color)
            placeholder.save(filepath)
            print(f"📄 Created placeholder: {filename}")

if __name__ == "__main__":
    main()