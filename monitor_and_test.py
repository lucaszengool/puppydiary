#!/usr/bin/env python3
"""
Monitor AI backend logs while testing
"""
import requests
import time
import threading
import subprocess

def test_directly_to_ai_backend():
    """Test AI backend directly to see logs"""
    print("\n🤖 Testing AI Backend Directly...")
    print("📋 Watch the AI backend terminal for debug output!")
    
    files = {'image': ('test_pet.jpg', open('/tmp/test_pet.jpg', 'rb'), 'image/jpeg')}
    data = {
        'art_style': 'oil_painting',
        'cuteness_level': 'medium',
        'color_palette': 'warm',
        'prompt': 'adorable pet, classical oil painting style'
    }
    
    print(f"📤 Sending directly to AI backend:")
    print(f"   art_style: {data['art_style']}")
    print(f"   cuteness_level: {data['cuteness_level']}")
    print(f"   color_palette: {data['color_palette']}")
    
    try:
        response = requests.post('http://localhost:8000/generate', 
                               files=files, data=data, timeout=60)
        
        print(f"\n📥 AI Backend Response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Direct AI backend test successful!")
            # Check if response has expected fields
            for key in ['generated_image', 'pose_image', 'generation_time', 'result_analysis']:
                if key in result:
                    if key == 'result_analysis':
                        print(f"📝 {key}: {result[key]}")
                    else:
                        print(f"✅ {key}: Present")
                else:
                    print(f"❌ {key}: Missing")
        else:
            print(f"❌ Error: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print("⏰ AI backend timed out - this is expected for image generation")
    except Exception as e:
        print(f"❌ Direct AI backend test failed: {e}")
    finally:
        files['image'][1].close()

def main():
    print("🔍 AI Backend Debug Monitor")
    print("=" * 40)
    print("👀 Please watch the AI backend terminal window for debug output!")
    print("   Look for logs starting with '🎨 Received generation request:'")
    print()
    
    # Test AI backend directly
    test_directly_to_ai_backend()

if __name__ == "__main__":
    main()