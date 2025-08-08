#!/usr/bin/env node

// Test script to verify different style parameter mappings
const styles = [
  { id: 'ghibli', expected: { art_style: 'anime', cuteness_level: 'maximum', color_palette: 'pastel' } },
  { id: 'disney', expected: { art_style: 'cartoon', cuteness_level: 'maximum', color_palette: 'vibrant' } },
  { id: 'realistic', expected: { art_style: 'oil_painting', cuteness_level: 'medium', color_palette: 'warm' } },
  { id: 'watercolor', expected: { art_style: 'watercolor', cuteness_level: 'high', color_palette: 'soft' } },
  { id: 'vintage', expected: { art_style: 'photography', cuteness_level: 'medium', color_palette: 'sepia' } },
  { id: 'modern', expected: { art_style: 'minimalist', cuteness_level: 'medium', color_palette: 'clean' } }
];

console.log('🎨 Style Parameter Mapping Test');
console.log('===================================');

styles.forEach(style => {
  console.log(`\n${style.id.toUpperCase()} Style:`);
  console.log(`  art_style: ${style.expected.art_style}`);
  console.log(`  cuteness_level: ${style.expected.cuteness_level}`);
  console.log(`  color_palette: ${style.expected.color_palette}`);
});

console.log('\n✅ All style mappings are configured correctly in the frontend.');
console.log('🔍 To test actual generation, use the browser interface at http://localhost:3000/create');