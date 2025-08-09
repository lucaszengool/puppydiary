#!/usr/bin/env python3
"""
Comprehensive cleanup of ALL video-related code from create page
"""
import re

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove entire functions
function_patterns = [
    # Remove handleGenerateVlog function completely
    r'const handleGenerateVlog = async \(\) => \{[^}]*(?:\{[^}]*\}[^}]*)*\}',
    # Remove handleSingleVideoGeneration function completely  
    r'const handleSingleVideoGeneration = async \([^)]*\) => \{[^}]*(?:\{[^}]*\}[^}]*)*\}',
    # Remove pollVideoTaskStatus function completely
    r'const pollVideoTaskStatus = async \([^)]*\) => \{[^}]*(?:\{[^}]*\}[^}]*)*\}',
]

for pattern in function_patterns:
    content = re.sub(pattern, '// Video function removed', content, flags=re.MULTILINE | re.DOTALL)

# Remove video-related imports and variables
import_patterns = [
    r'Video,\s*',
    r',\s*Video',
    r'import.*Video.*from.*lucide-react.*\n',
]

for pattern in import_patterns:
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Remove all video-related variable references
video_var_patterns = [
    (r'videoGenerating', 'false'),
    (r'setVideoGenerating\([^)]*\)', ''),
    (r'setVideoUrl\([^)]*\)', ''),
    (r'setVideoTaskId\([^)]*\)', ''),
    (r'setShowVideoOption\([^)]*\)', ''),
    (r'handleSingleVideoGeneration', 'handleShareImage'),
    (r'pollVideoTaskStatus\([^)]*\)', ''),
]

for pattern, replacement in video_var_patterns:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Remove video-related UI elements and text
ui_patterns = [
    (r'🎥[^"]*制作视频[^"]*', '💾 保存'),
    (r'🎥[^"]*制作中[^"]*', '保存中...'),
    (r'生成视频[^"]*', '保存图片'),
    (r'制作视频[^"]*', '保存图片'),
    (r'视频[^"]*中[^"]*', '保存中...'),
    (r'Video className="[^"]*"', 'Save className="w-4 h-4"'),
    (r'<Video[^>]*>', '<Save>'),
    (r'</Video>', '</Save>'),
    (r'再保存.*制作视频', '图片已保存'),
    (r'可以制作.*视频.*了', '图片保存成功'),
    (r'视频制作就绪', '准备保存'),
    (r'title="制作视频[^"]*"', 'title="保存图片"'),
]

for pattern, replacement in ui_patterns:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

# Clean up broken syntax and empty lines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
content = re.sub(r'//.*removed[^\n]*\n', '', content)

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Comprehensive video cleanup completed")