#!/bin/bash

echo "🤖 Testing AI Backend Directly"
echo "=============================="

echo "Testing oil_painting style..."
curl -X POST http://localhost:8000/generate \
  -F "image=@/tmp/test_pet.jpg" \
  -F "art_style=oil_painting" \
  -F "cuteness_level=medium" \
  -F "color_palette=warm" \
  -F "prompt=adorable pet, classical oil painting style" \
  --max-time 60 | jq -r '.result_analysis // "No analysis field"' | head -3

echo ""
echo "Check AI backend logs for debug output!"