#!/usr/bin/env python3
"""
Real-time testing script with log monitoring
"""
import requests
import json
import time
import threading
import subprocess
import os

def monitor_next_logs():
    """Monitor Next.js logs"""
    try:
        # Find Next.js process and monitor its output
        cmd = ["tail", "-f", "/dev/null"]  # Placeholder - Next.js doesn't write to a log file by default
        print("📱 [NEXT.JS] Monitoring Next.js process (check terminal where you started npm run dev)")
    except Exception as e:
        print(f"❌ Could not monitor Next.js logs: {e}")

def test_api_with_debug():
    """Test the API with debug output"""
    print("\n🧪 Testing API with debug logging...")
    
    # Test data
    files = {'image': ('test_pet.jpg', open('/tmp/test_pet.jpg', 'rb'), 'image/jpeg')}
    data = {
        'prompt': '重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征 Classical oil painting, 古典写实油画风格, Renaissance-style portraiture, rich oil paint texture, detailed realistic brushwork, dramatic chiaroscuro lighting, deep warm colors, traditional oil painting technique, museum-quality artwork, baroque painting style, detailed realistic rendering, classical composition, preserve original background with oil painting treatment, preserve exact facial features and expression, maintain all unique fur patterns, identical pose and proportions, same eye detail, 古典大师油画风格, masterpiece oil painting',
        'art_style': 'oil_painting',
        'cuteness_level': 'medium', 
        'color_palette': 'warm',
        'userId': 'test_user'
    }
    
    print(f"📤 Sending request with parameters:")
    print(f"   art_style: {data['art_style']}")
    print(f"   cuteness_level: {data['cuteness_level']}")
    print(f"   color_palette: {data['color_palette']}")
    
    try:
        response = requests.post('http://localhost:3000/api/generate', 
                               files=files, data=data, timeout=30)
        
        print(f"\n📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"🖼️ Image URL: {result.get('imageUrl', 'Not found')}")
            print(f"📝 Analysis: {result.get('petAnalysis', 'Not found')}")
            print(f"⏱️ Generation Time: {result.get('generationTime', 'Not found')}s")
            print(f"🔧 Local AI: {result.get('localAI', 'Not found')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out after 30 seconds")
    except Exception as e:
        print(f"❌ Request failed: {e}")
    finally:
        files['image'][1].close()  # Close the file handle

def check_ai_backend():
    """Check if AI backend is responding"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"🤖 AI Backend Health: {response.status_code}")
        if response.status_code == 200:
            health_data = response.json()
            print(f"   Device: {health_data.get('device')}")
            print(f"   Models loaded: {health_data.get('models_loaded')}")
        return True
    except Exception as e:
        print(f"❌ AI Backend not accessible: {e}")
        return False

def main():
    print("🚀 Starting comprehensive debug test...")
    print("=" * 50)
    
    # Check AI backend first
    if not check_ai_backend():
        print("⚠️ AI Backend is not responding. Please check if it's running on port 8000.")
        return
    
    # Test the API
    test_api_with_debug()
    
    print("\n" + "=" * 50)
    print("✅ Debug test completed!")
    print("\n🔍 To see detailed logs:")
    print("1. Check the terminal where you started 'npm run dev' for Next.js API logs")
    print("2. Check the terminal where you started AI backend for processing logs")
    print("3. Open browser console at http://localhost:3000/create for frontend logs")

if __name__ == "__main__":
    main()