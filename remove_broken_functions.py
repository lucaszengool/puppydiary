#!/usr/bin/env python3
"""
Remove broken video generation functions from create page
"""
import re

# Read the file
with open('src/app/create/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove the broken video functions block
# Look for the start pattern
start_pattern = r'  // Generate video for single image - show share prompt if no bones'
# Look for the end pattern before filterPresets
end_pattern = r'  // Filter presets for mobile interface'

# Find the positions
start_match = re.search(start_pattern, content)
end_match = re.search(end_pattern, content)

if start_match and end_match:
    # Remove everything between these markers
    before = content[:start_match.start()]
    after = content[end_match.start():]
    content = before + "\n  // Video generation functions removed\n\n  " + after[2:]  # Remove the leading spaces from "  // Filter presets..."
    print("✅ Removed broken video functions block")
else:
    print("❌ Could not find the markers to remove functions")

# Write back
with open('src/app/create/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Cleanup completed")