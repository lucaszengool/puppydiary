#!/usr/bin/env python3
"""
Add empty stubs for video-related functions to prevent compilation errors
"""

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position to insert video stubs (after userBones state)
insert_point = content.find('  // 主要艺术风格选项')

if insert_point == -1:
    print("❌ Could not find insertion point")
    exit(1)

# Video stubs to add
video_stubs = '''
  // Video-related states (stubs to prevent compilation errors)
  const [showVideoOption, setShowVideoOption] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null)
  const [videoGenerating, setVideoGenerating] = useState(false)

'''

# Insert the stubs
content = content[:insert_point] + video_stubs + content[insert_point:]

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Video stubs added")