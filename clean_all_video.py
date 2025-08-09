#!/usr/bin/env python3
"""
Comprehensive cleanup of all video-related code from create page
"""
import re

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove video-related code blocks and references
video_removals = [
    # Remove the setShowVideoOption call and toast
    (r'      // If we now have 3 images, show video option\s*\n\s*if \(newSavedImages\.length >= 3\) \{\s*\n\s*setShowVideoOption\(true\)\s*\n\s*toast\(\{\s*\n\s*title: "🎥[^"]*",\s*\n\s*description: "[^"]*",\s*\n\s*\}\)\s*\n\s*\}', ''),
    
    # Remove video function calls and references
    (r'setShowVideoOption\([^)]*\)', ''),
    (r'setVideoUrl\([^)]*\)', ''),
    (r'setVideoTaskId\([^)]*\)', ''),
    (r'setVideoGenerating\([^)]*\)', ''),
    (r'setVideoGenerating\(false\)', ''),
    
    # Remove video-related comments and messages
    (r'// Video generation removed[^\n]*', ''),
    (r'🎥[^"]*"[^"]*"', ''),
    (r'"[^"]*视频[^"]*"', ''),
    (r'"[^"]*Video[^"]*"', ''),
    (r'"[^"]*Vlog[^"]*"', ''),
    
    # Remove specific video UI elements
    (r'再保存 \{3 - savedImages\.length\} 张图片即可制作视频', '图片已保存'),
    (r'\{false \? \'🎥 制作中\.\.\.\' : \'🎥 制作视频 Vlog\'\}', '\'💾 保存\''),
    
    # Remove video notification blocks
    (r'/\* Mobile Video Generation Notification \*/[^{]*\{[^}]*\}[^{]*\{[^}]*\}[^{]*\{[^}]*\}[^{]*\}[^{]*\}[^{]*\}', ''),
    (r'/\* VSCO-style Video Generation Notification \*/[^{]*\{[^}]*\}[^{]*\{[^}]*\}[^{]*\}[^{]*\}', ''),
    
    # Remove video button elements
    (r'title="制作视频[^"]*"', 'title="保存图片"'),
    (r'🎥[^}]*制作视频[^}]*', '💾 保存'),
    (r'可以制作 Vlog 视频了！', '图片保存成功！'),
    (r'视频制作就绪', '准备保存下一张'),
    
    # Remove video-related console logs
    (r'console\.log\("[^"]*[Vv]ideo[^"]*"\)', ''),
    (r'console\.log\("🎥[^"]*"\)', ''),
]

# Apply all removals
for pattern, replacement in video_removals:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL | re.IGNORECASE)

# Clean up any remaining video function definitions that might exist
video_functions = [
    'pollVideoTaskStatus',
    'handleSingleVideoGeneration', 
    'handleGenerateVlog'
]

for func_name in video_functions:
    # Remove complete function definitions
    pattern = rf'const {func_name} = async[^{{]*\{{[^}}]*(?:\{{[^}}]*\}}[^}}]*)*\}}'
    content = re.sub(pattern, f'// {func_name} function removed', content, flags=re.MULTILINE | re.DOTALL)

# Clean up empty lines and formatting
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
content = re.sub(r'// removed[^\n]*\n', '', content)

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ All video-related code removed")