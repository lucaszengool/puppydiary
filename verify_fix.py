#!/usr/bin/env python3
"""
Verify that different art styles are working correctly
"""
import requests
import json

def test_art_style(style, style_name):
    print(f"\n🎨 Testing {style_name} style...")
    
    response = requests.post(
        "http://localhost:3000/api/generate",
        data={
            "prompt": f"Test {style_name} style",
            "art_style": style,
            "cuteness_level": "medium",
            "color_palette": "warm",
            "userId": "test123"
        },
        files={"image": ("test.jpg", b"fake_image_data", "image/jpeg")},
        timeout=60
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success! Response analysis: {result.get('analysis', 'N/A')}")
        if 'art_style_used' in result:
            print(f"   Art style used: {result['art_style_used']}")
    else:
        print(f"❌ Failed with status {response.status_code}")

# Test different styles
styles = [
    ("oil_painting", "Oil Painting"),
    ("watercolor", "Watercolor"),
    ("anime", "Anime/Manga")
]

print("🔍 Verifying art style fix...")
for style, name in styles:
    try:
        test_art_style(style, name)
    except Exception as e:
        print(f"❌ Error testing {name}: {e}")

print("\n✅ Verification complete!")