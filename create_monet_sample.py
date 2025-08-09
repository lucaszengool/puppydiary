#!/usr/bin/env python3
"""
Create a sample image for Monet style
"""
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

# Create styles directory if it doesn't exist
styles_dir = Path("public/styles")
styles_dir.mkdir(parents=True, exist_ok=True)

def download_and_save_monet_sample():
    """Download a sample pet image for Monet style"""
    url = "https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?auto=compress&cs=tinysrgb&w=800"
    filename = "monet-style.png"
    
    try:
        print(f"📥 Downloading Monet sample image...")
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
            print(f"❌ Failed to download (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error downloading: {e}")
        return False

def create_placeholder():
    """Create a placeholder if download fails"""
    filename = "monet-style.png"
    filepath = styles_dir / filename
    
    if not filepath.exists():
        # Create a placeholder with impressionist colors (soft blue/green)
        placeholder = Image.new('RGB', (800, 800), color=(176, 196, 222))  # Light steel blue
        placeholder.save(filepath)
        print(f"📄 Created placeholder: {filename}")

if __name__ == "__main__":
    print("🚀 Creating Monet style sample image...")
    
    if not download_and_save_monet_sample():
        create_placeholder()
    
    print("✅ Monet style sample ready!")