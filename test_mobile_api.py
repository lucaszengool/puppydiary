#!/usr/bin/env python3
"""
测试手机端API传输
模拟手机端上传图像并验证返回结果
"""
import requests
import time
import json

def test_mobile_upload():
    """模拟手机端上传图像"""
    
    # 创建测试图像数据（模拟手机拍照）
    test_image = b"fake_image_data_from_mobile"
    
    # 测试不同的艺术风格
    styles = [
        ("oil_painting", "古典油画"),
        ("watercolor", "水彩画"),
        ("anime", "动漫风格")
    ]
    
    for art_style, style_name in styles:
        print(f"\n📱 测试手机端上传 - {style_name} ({art_style})")
        print("=" * 50)
        
        # 构建请求（模拟手机端FormData）
        files = {
            "image": ("photo.jpg", test_image, "image/jpeg")
        }
        
        data = {
            "prompt": f"手机端测试 {style_name} - {int(time.time())}",
            "art_style": art_style,
            "cuteness_level": "high",
            "color_palette": "vibrant",
            "userId": "mobile_user_123"
        }
        
        try:
            # 发送请求到API
            print(f"📤 发送请求到 http://localhost:3000/api/generate")
            print(f"   参数: art_style={art_style}")
            
            response = requests.post(
                "http://localhost:3000/api/generate",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 成功响应!")
                print(f"   - imageUrl: {result.get('imageUrl', '')[:50]}...")
                print(f"   - analysis: {result.get('analysis', 'N/A')}")
                print(f"   - art_style_used: {result.get('art_style_used', 'N/A')}")
                print(f"   - isDemo: {result.get('isDemo', False)}")
                
                # 检查是否返回了正确的风格
                if result.get('art_style_used') == art_style:
                    print(f"   ✅ 风格匹配正确!")
                elif result.get('isDemo'):
                    print(f"   ⚠️  返回了Demo模式（AI后端未连接）")
                else:
                    print(f"   ❌ 风格不匹配: 期望 {art_style}, 实际 {result.get('art_style_used')}")
                    
            else:
                print(f"❌ 请求失败: {response.status_code}")
                print(f"   响应: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print(f"⏰ 请求超时")
        except Exception as e:
            print(f"❌ 错误: {e}")
        
        time.sleep(2)  # 避免过快请求

    print("\n" + "=" * 50)
    print("📱 手机端API测试完成!")
    print("\n提示：")
    print("1. 如果返回Demo模式，检查AI后端是否运行在8000端口")
    print("2. 如果风格不匹配，检查AI后端是否正确处理art_style参数")
    print("3. 查看 /Users/James/Desktop/Pepmart/debug_log.txt 确认请求是否到达AI后端")

if __name__ == "__main__":
    test_mobile_upload()