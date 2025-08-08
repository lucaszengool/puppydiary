#!/usr/bin/env python3
"""
Fresh test with timestamp to avoid caching
"""
import requests
import time

def test_fresh_request():
    timestamp = int(time.time())
    
    files = {'image': ('test_pet.jpg', open('/tmp/test_pet.jpg', 'rb'), 'image/jpeg')}
    data = {
        'prompt': f'FRESH TEST {timestamp} - Classical oil painting, 古典写实油画风格, Renaissance-style portraiture, rich oil paint texture',
        'art_style': 'oil_painting',
        'cuteness_level': 'medium', 
        'color_palette': 'warm',
        'userId': f'test_user_{timestamp}'
    }
    
    print(f"🧪 Fresh test at {timestamp}")
    print(f"📤 Sending unique prompt: {data['prompt'][:80]}...")
    print(f"📤 Parameters: art_style={data['art_style']}, cuteness_level={data['cuteness_level']}, color_palette={data['color_palette']}")
    
    try:
        response = requests.post('http://localhost:3000/api/generate', 
                               files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            analysis = result.get('petAnalysis', '')
            print(f"✅ Response analysis: {analysis}")
            
            # Check if it's actually using our oil painting style
            if '古典油画' in analysis or 'oil_painting' in analysis:
                print("🎉 SUCCESS: Oil painting style detected!")
            else:
                print(f"❌ FAILED: Still wrong style - got: {analysis}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    finally:
        files['image'][1].close()

if __name__ == "__main__":
    test_fresh_request()