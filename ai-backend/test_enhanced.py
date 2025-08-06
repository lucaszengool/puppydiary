#!/usr/bin/env python3
"""
Test script for the enhanced SDXL + ControlNet implementation
"""

import requests
import json
import base64
from PIL import Image
import io

def test_enhanced_api():
    """Test the enhanced API with your poodle image"""
    
    # API endpoint
    url = "http://localhost:8000/generate"
    
    # Load your poodle image
    poodle_image_path = "/Users/James/Desktop/WechatIMG100.jpg"
    
    try:
        with open(poodle_image_path, 'rb') as img_file:
            files = {'image': img_file}
            data = {
                'art_style': 'cartoon',
                'use_controlnet': 'true',
                'controlnet_strength': '0.8',
                'cuteness_level': 'high',
                'color_palette': 'vibrant'
            }
            
            print("🐕 Testing enhanced SDXL + ControlNet with your poodle image...")
            print(f"📸 Image: {poodle_image_path}")
            print(f"🎨 Style: {data['art_style']}")
            print(f"🔧 ControlNet: {data['use_controlnet']} (strength: {data['controlnet_strength']})")
            
            response = requests.post(url, files=files, data=data, timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Generation successful!")
                print(f"⏱️ Time: {result.get('generationTime', 'N/A')} seconds")
                print(f"🚀 Approach: {result.get('approach', 'N/A')}")
                print(f"🔧 ControlNet used: {result.get('controlnet_used', 'N/A')}")
                
                # Save the result
                if 'imageUrl' in result:
                    # Decode base64 image
                    image_data = result['imageUrl'].split(',')[1]
                    img_bytes = base64.b64decode(image_data)
                    
                    # Save result
                    output_path = "/Users/James/Desktop/enhanced_poodle_result.png"
                    with open(output_path, 'wb') as f:
                        f.write(img_bytes)
                    
                    print(f"💾 Result saved to: {output_path}")
                    print("🎉 Test completed successfully!")
                    
                    return True
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"📝 Response: {response.text}")
                return False
                
    except FileNotFoundError:
        print(f"❌ Could not find poodle image at: {poodle_image_path}")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def check_api_health():
    """Check if the API is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("🟢 API is healthy!")
            print(f"📱 Device: {health_data.get('device', 'N/A')}")
            print(f"🧠 Models loaded: {health_data.get('models_loaded', 'N/A')}")
            print(f"🔧 Approach: {health_data.get('approach', 'N/A')}")
            return True
        else:
            print(f"🟡 API returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("🔴 API is not running. Please start the server first.")
        return False

if __name__ == "__main__":
    print("🧪 Enhanced SDXL + ControlNet Test Script")
    print("=" * 50)
    
    # Check API health first
    if check_api_health():
        print("\n" + "=" * 50)
        # Run the test
        success = test_enhanced_api()
        
        if success:
            print("\n🎊 All tests passed! Your enhanced implementation is working!")
        else:
            print("\n😞 Test failed. Check the logs above for details.")
    else:
        print("\n🚨 Please start the enhanced server first:")
        print("cd /Users/James/Desktop/Pepmart/ai-backend")
        print("PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0 python enhanced_main.py")