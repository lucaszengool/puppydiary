#!/usr/bin/env python3
"""
Test script for the fast enhanced implementation
"""

import requests
import json
import base64
from PIL import Image
import io

def test_fast_api():
    """Test the fast API with your poodle image"""
    
    # API endpoint for fast server
    url = "http://localhost:8003/generate"
    
    # Load your poodle image
    poodle_image_path = "/Users/James/Desktop/WechatIMG100.jpg"
    
    try:
        with open(poodle_image_path, 'rb') as img_file:
            files = {'image': img_file}
            data = {
                'art_style': 'cartoon',
                'strength': '0.6',
                'steps': '20'
            }
            
            print("🐕 Testing Fast Enhanced with your poodle image...")
            print(f"📸 Image: {poodle_image_path}")
            print(f"🎨 Style: {data['art_style']}")
            print(f"💪 Strength: {data['strength']}")
            print(f"⚡ Steps: {data['steps']} (fast)")
            
            response = requests.post(url, files=files, data=data, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Generation successful!")
                print(f"⏱️ Time: {result.get('generationTime', 'N/A')} seconds")
                print(f"🚀 Approach: {result.get('approach', 'N/A')}")
                
                # Save the result
                if 'imageUrl' in result:
                    # Decode base64 image
                    image_data = result['imageUrl'].split(',')[1]
                    img_bytes = base64.b64decode(image_data)
                    
                    # Save result
                    output_path = "/Users/James/Desktop/fast_enhanced_poodle_result.png"
                    with open(output_path, 'wb') as f:
                        f.write(img_bytes)
                    
                    print(f"💾 Result saved to: {output_path}")
                    print("🎉 Fast test completed successfully!")
                    
                    return True
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"📝 Response: {response.text}")
                return False
                
    except FileNotFoundError:
        print(f"❌ Could not find poodle image at: {poodle_image_path}")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the server is running on port 8003")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_multiple_styles():
    """Test multiple art styles quickly"""
    styles = ['cartoon', 'oil_painting', 'watercolor', 'anime', 'popmart']
    
    print("\n🎭 Testing multiple art styles...")
    
    for style in styles:
        print(f"\n🎨 Testing {style} style...")
        
        url = "http://localhost:8003/generate"
        poodle_image_path = "/Users/James/Desktop/WechatIMG100.jpg"
        
        try:
            with open(poodle_image_path, 'rb') as img_file:
                files = {'image': img_file}
                data = {
                    'art_style': style,
                    'strength': '0.6',
                    'steps': '15'  # Even faster for multiple tests
                }
                
                response = requests.post(url, files=files, data=data, timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ {style}: {result.get('generationTime', 'N/A')}s")
                    
                    # Save result
                    if 'imageUrl' in result:
                        image_data = result['imageUrl'].split(',')[1]
                        img_bytes = base64.b64decode(image_data)
                        
                        output_path = f"/Users/James/Desktop/poodle_{style}_result.png"
                        with open(output_path, 'wb') as f:
                            f.write(img_bytes)
                        print(f"💾 Saved: {output_path}")
                else:
                    print(f"❌ {style} failed: {response.status_code}")
                    
        except Exception as e:
            print(f"❌ {style} error: {e}")

def check_fast_api_health():
    """Check if the fast API is running"""
    try:
        response = requests.get("http://localhost:8003/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("🟢 Fast API is healthy!")
            print(f"📱 Device: {health_data.get('device', 'N/A')}")
            print(f"🧠 Models loaded: {health_data.get('models_loaded', 'N/A')}")
            print(f"🔧 Approach: {health_data.get('approach', 'N/A')}")
            print(f"🔢 Version: {health_data.get('version', 'N/A')}")
            return True
        else:
            print(f"🟡 Fast API returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("🔴 Fast API is not running on port 8003")
        return False

if __name__ == "__main__":
    print("⚡ Fast Enhanced Test Script")
    print("=" * 50)
    
    # Check API health first
    if check_fast_api_health():
        print("\n" + "=" * 50)
        
        # Run single test
        success = test_fast_api()
        
        if success:
            # Test multiple styles
            test_multiple_styles()
            print("\n🎊 All fast tests completed!")
        else:
            print("\n😞 Fast test failed.")
    else:
        print("\n🚨 Fast API not running on port 8003")
        print("Make sure you started: PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0 python fast_enhanced.py")