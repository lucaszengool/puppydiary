#!/usr/bin/env node

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/generate';

// Test data matching frontend logic
const styles = [
  {
    id: 'realistic',
    label: '古典油画',
    prompt: '重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、毛色、标记和任何独特特征都要完全一致，不允许任何改变。 Classical oil painting, 古典写实油画风格, Renaissance-style portraiture, rich oil paint texture, detailed realistic brushwork, dramatic chiaroscuro lighting, deep warm colors, traditional oil painting technique, museum-quality artwork, baroque painting style, detailed realistic rendering, classical composition, preserve original background with oil painting treatment, preserve exact facial features and expression, maintain all unique fur patterns, identical pose and proportions, same eye detail, 古典大师油画风格, masterpiece oil painting',
    art_style: 'oil_painting',
    cuteness_level: 'medium',
    color_palette: 'warm'
  },
  {
    id: 'disney',
    label: '迪士尼卡通',
    prompt: '重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、毛色、标记和任何独特特征都要完全一致，不允许任何改变。 Disney Pixar 3D animation style, 迪士尼风格卡通, high-quality 3D rendering, vibrant saturated colors, smooth clean surfaces, cute anthropomorphic design, large expressive cartoon eyes, exaggerated cute features, professional CGI quality, Pixar-style lighting and shading, preserve original background and environment, maintain exact pose and expression, preserve all distinctive markings and patterns, identical proportions, same eye color, 精美卡通风格, animation masterpiece',
    art_style: 'cartoon',
    cuteness_level: 'maximum',
    color_palette: 'vibrant'
  },
  {
    id: 'vintage',
    label: '复古怀旧',
    prompt: '重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、毛色、标记和任何独特特征都要完全一致，不允许任何改变。 vintage portrait photography, 复古摄影风格, retro 1950s aesthetic, warm sepia and amber tones, soft film grain texture, classic portrait lighting, nostalgic warm filter, aged photograph look, golden hour lighting, vintage color grading, old-fashioned charm, preserve original background with vintage treatment, maintain exact pose and facial expression, preserve all distinctive features and markings, identical proportions, same eye detail, 复古摄影大师风格, timeless portrait quality',
    art_style: 'photography',
    cuteness_level: 'medium',
    color_palette: 'sepia'
  }
];

async function testStyle(style) {
  try {
    console.log(`\n🎨 Testing ${style.label} (${style.id})...`);
    console.log(`Expected parameters: art_style=${style.art_style}, cuteness_level=${style.cuteness_level}, color_palette=${style.color_palette}`);
    
    const form = new FormData();
    form.append('image', fs.createReadStream('/tmp/test_pet.jpg'));
    form.append('prompt', style.prompt);
    form.append('art_style', style.art_style);
    form.append('cuteness_level', style.cuteness_level);
    form.append('color_palette', style.color_palette);
    form.append('userId', 'test_user');

    const response = await fetch(API_URL, {
      method: 'POST',
      body: form,
      timeout: 60000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`✅ SUCCESS: ${style.label}`);
    console.log(`📸 Image URL: ${result.imageUrl}`);
    console.log(`📝 Analysis: ${result.petAnalysis}`);
    console.log(`⏱️ Generation Time: ${result.generationTime}s`);
    
    return {
      style: style.label,
      success: true,
      imageUrl: result.imageUrl,
      analysis: result.petAnalysis
    };

  } catch (error) {
    console.log(`❌ FAILED: ${style.label}`);
    console.log(`Error: ${error.message}`);
    
    return {
      style: style.label,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting automated style generation tests...');
  console.log('============================================');
  
  const results = [];
  
  for (const style of styles) {
    const result = await testStyle(style);
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.style}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.success) {
      console.log(`   Image: ${result.imageUrl}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 Success Rate: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
}

// Run tests
runTests().catch(console.error);