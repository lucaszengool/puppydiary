#!/usr/bin/env python3
"""
Create a simplified create page with video generation removed
"""

# This will be a Python script to help clean up the page
# Let me read the current file and create a cleaned version

print("Creating simplified create page...")

import re

# Read current file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove video-related imports
content = re.sub(r'\s*Video,', '', content)

# Remove video-related state variables
video_states = [
    r'\s*const \[showVideoOption, setShowVideoOption\] = useState\(false\)',
    r'\s*const \[videoTaskId, setVideoTaskId\] = useState<string \| null>\(null\)',
    r'\s*const \[videoUrl, setVideoUrl\] = useState<string \| null>\(null\)',
    r'\s*const \[videoGenerating, setVideoGenerating\] = useState\(false\)'
]

for pattern in video_states:
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Remove video-related functions (this is more complex, will do manually)
# For now, just remove obvious video references that cause compilation errors

# Remove lines with video-related variables that cause errors
video_error_patterns = [
    r'.*setShowVideoOption\(.*\).*\n',
    r'.*setVideoUrl\(.*\).*\n', 
    r'.*setVideoTaskId\(.*\).*\n',
    r'.*setVideoGenerating\(.*\).*\n',
    r'.*videoGenerating.*\n',
    r'.*videoUrl.*&&.*\n',
    r'.*Video className.*\n'
]

for pattern in video_error_patterns:
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

print("Video-related code patterns removed")
print("Manual cleanup still needed for complex video functions")