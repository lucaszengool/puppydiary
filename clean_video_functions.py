#!/usr/bin/env python3
"""
Clean up video-related functions and variables from create page
"""
import re

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Functions to remove completely
functions_to_remove = [
    'handleSingleVideoGeneration',
    'handleGenerateVlog',
    'pollVideoTaskStatus'
]

# Variables/calls to remove or replace
video_patterns = [
    (r'const \[showVideoOption.*?\] = useState\(false\)', ''),
    (r'const \[videoTaskId.*?\] = useState<string \| null>\(null\)', ''),
    (r'const \[videoUrl.*?\] = useState<string \| null>\(null\)', ''),
    (r'const \[videoGenerating.*?\] = useState\(false\)', ''),
    (r'setShowVideoOption\([^)]*\)', '// removed video option'),
    (r'setVideoUrl\([^)]*\)', '// removed video URL'),
    (r'setVideoTaskId\([^)]*\)', '// removed video task ID'),
    (r'setVideoGenerating\([^)]*\)', '// removed video generating'),
    (r'videoGenerating', 'false'),
    (r'Video className="w-4 h-4[^"]*"', 'Sparkles className="w-4 h-4"'),
    (r'<Video[^>]*>', '<Sparkles>'),
    (r'</Video>', '</Sparkles>'),
]

# Apply patterns
for pattern, replacement in video_patterns:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

# Remove entire function definitions
for func_name in functions_to_remove:
    # Pattern to match function from start to its closing brace
    pattern = rf'const {func_name} = async[^{{]*{{[^}}]*?(?:{{[^}}]*?}}[^}}]*?)*}}'
    content = re.sub(pattern, f'// Removed {func_name} function', content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Video functions cleaned up")