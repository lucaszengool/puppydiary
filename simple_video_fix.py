#!/usr/bin/env python3
"""
Simple video cleanup - just replace problematic references
"""

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple replacements to fix the errors
replacements = [
    ('setShowVideoOption(true)', ''),
    ('setShowVideoOption(false)', ''),
    ('setVideoUrl(result.videoUrl)', ''),
    ('setVideoUrl(taskResult.content.video_url)', ''),
    ('setVideoUrl(videoData.videoUrl)', ''),
    ('setVideoUrl(null)', ''),
    ('setVideoTaskId(result.taskId)', ''),
    ('setVideoTaskId(videoData.taskId)', ''),
    ('setVideoTaskId(null)', ''),
    ('setVideoGenerating(true)', ''),
    ('setVideoGenerating(false)', ''),
    ('videoGenerating', 'false'),
    ('Video className="w-4 h-4 mr-1" />', 'Download className="w-4 h-4 mr-1" />'),
    ('Video className="w-4 h-4 mr-2" />', 'Download className="w-4 h-4 mr-2" />'),
    ('handleSingleVideoGeneration', 'handleShareImage'),
    ('handleGenerateVlog', 'handleNextImage'),
]

# Apply replacements
for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Simple video cleanup completed")