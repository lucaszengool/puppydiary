#!/bin/bash

echo "🚀 Testing fixed style generation..."
echo "=================================="

# Test realistic (oil painting) style
echo "🎨 Testing realistic (oil painting) style..."
curl -X POST http://localhost:3000/api/generate \
  -F "image=@/tmp/test_pet.jpg" \
  -F "prompt=重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、毛色、标记和任何独特特征都要完全一致，不允许任何改变。 Classical oil painting, 古典写实油画风格, Renaissance-style portraiture, rich oil paint texture, detailed realistic brushwork, dramatic chiaroscuro lighting, deep warm colors, traditional oil painting technique, museum-quality artwork, baroque painting style, detailed realistic rendering, classical composition, preserve original background with oil painting treatment, preserve exact facial features and expression, maintain all unique fur patterns, identical pose and proportions, same eye detail, 古典大师油画风格, masterpiece oil painting" \
  -F "art_style=oil_painting" \
  -F "cuteness_level=medium" \
  -F "color_palette=warm" \
  -F "userId=test_user" \
  --max-time 120 \
  --silent | jq '.petAnalysis, .imageUrl' | head -5

echo ""
echo "✅ Test completed! Check the console output above for results."