const fs = require('fs');
const path = require('path');

// Create watercolor-style sample images data for gallery homepage
const watercolorSamples = [
  {
    id: 1,
    title: "温馨小柴犬",
    style: "水彩风格",
    description: "柔美的水彩笔触，温暖的色调",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=512&h=512&fit=crop&crop=center",
    tags: ["柴犬", "水彩", "温馨"]
  },
  {
    id: 2,
    title: "梦幻小猫咪",
    style: "水彩风格",
    description: "梦幻般的水彩效果，清新自然",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=512&h=512&fit=crop&crop=center",
    tags: ["猫咪", "水彩", "梦幻"]
  },
  {
    id: 3,
    title: "可爱金毛",
    style: "水彩风格", 
    description: "金黄色调的水彩艺术",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=512&h=512&fit=crop&crop=center",
    tags: ["金毛", "水彩", "可爱"]
  },
  {
    id: 4,
    title: "优雅波斯猫",
    style: "水彩风格",
    description: "细腻的水彩笔触表现优雅气质",
    imageUrl: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=512&h=512&fit=crop&crop=center", 
    tags: ["波斯猫", "水彩", "优雅"]
  },
  {
    id: 5,
    title: "活泼小狗",
    style: "水彩风格",
    description: "充满活力的水彩表现",
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=512&h=512&fit=crop&crop=center",
    tags: ["小狗", "水彩", "活泼"]
  },
  {
    id: 6,
    title: "安静小猫",
    style: "水彩风格",
    description: "宁静致远的水彩意境",
    imageUrl: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=512&h=512&fit=crop&crop=center",
    tags: ["小猫", "水彩", "安静"]
  }
];

// Create the samples directory if it doesn't exist
const samplesDir = path.join(__dirname, '..', 'public', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Write the samples data
fs.writeFileSync(
  path.join(samplesDir, 'watercolor-samples.json'),
  JSON.stringify(watercolorSamples, null, 2)
);

console.log('✅ Created watercolor samples data for gallery');