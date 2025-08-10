const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directories if they don't exist
const dirs = [
  'public/products/tshirts',
  'public/products/hoodies', 
  'public/products/frames'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to create canvas and save image
function createAndSaveTemplate(width, height, drawFunction, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);
  
  drawFunction(ctx, width, height);
  
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(filename, buffer);
  console.log(`Created: ${filename}`);
}

// T-shirt templates
function drawTshirt(ctx, w, h, color = '#ffffff') {
  // Body
  ctx.fillStyle = color;
  ctx.fillRect(w*0.25, h*0.25, w*0.5, h*0.625);
  
  // Sleeves
  ctx.fillRect(w*0.125, h*0.25, w*0.125, h*0.25);
  ctx.fillRect(w*0.75, h*0.25, w*0.125, h*0.25);
  
  // Neck
  ctx.beginPath();
  ctx.arc(w*0.5, h*0.275, w*0.05, 0, Math.PI);
  ctx.fill();
  
  // Add shading
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(w*0.725, h*0.25, w*0.025, h*0.625);
  ctx.fillRect(w*0.25, h*0.85, w*0.5, h*0.025);
  
  // Design area indicator
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(w*0.375, h*0.35, w*0.25, h*0.25);
}

function drawHoodie(ctx, w, h, color = '#ffffff') {
  // Hoodie body
  ctx.fillStyle = color;
  ctx.fillRect(w*0.225, h*0.3125, w*0.55, h*0.6);
  
  // Hood
  ctx.beginPath();
  ctx.arc(w*0.5, h*0.3125, w*0.15, Math.PI, 0);
  ctx.fill();
  
  // Sleeves
  ctx.fillRect(w*0.1, h*0.3125, w*0.125, h*0.375);
  ctx.fillRect(w*0.775, h*0.3125, w*0.125, h*0.375);
  
  // Pocket
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(w*0.35, h*0.625, w*0.3, h*0.1);
  
  // Add shading
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(w*0.75, h*0.3125, w*0.025, h*0.6);
  ctx.fillRect(w*0.225, h*0.8875, w*0.55, h*0.025);
  
  // Design area
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(w*0.35, h*0.4, w*0.3, h*0.25);
}

function drawFrame(ctx, w, h) {
  // Outer frame - wood texture
  const outerGradient = ctx.createLinearGradient(0, 0, w, 0);
  outerGradient.addColorStop(0, '#8b7355');
  outerGradient.addColorStop(0.5, '#a0845c');
  outerGradient.addColorStop(1, '#8b7355');
  ctx.fillStyle = outerGradient;
  ctx.fillRect(w*0.0625, h*0.0625, w*0.875, h*0.875);
  
  // Inner frame
  const innerGradient = ctx.createLinearGradient(0, 0, w, 0);
  innerGradient.addColorStop(0, '#c9b037');
  innerGradient.addColorStop(0.5, '#f7ef8a');
  innerGradient.addColorStop(1, '#c9b037');
  ctx.fillStyle = innerGradient;
  ctx.fillRect(w*0.1, h*0.1, w*0.8, h*0.8);
  
  // Glass area
  const glassGradient = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w*0.375);
  glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  glassGradient.addColorStop(0.7, 'rgba(240, 248, 255, 0.9)');
  glassGradient.addColorStop(1, 'rgba(230, 240, 250, 0.85)');
  ctx.fillStyle = glassGradient;
  ctx.fillRect(w*0.15, h*0.15, w*0.7, h*0.7);
  
  // Picture area (white background)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w*0.175, h*0.175, w*0.65, h*0.65);
  
  // Glass reflection
  const highlightGradient = ctx.createLinearGradient(w*0.175, h*0.175, w*0.375, h*0.375);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(w*0.175, h*0.175, w*0.2, h*0.2);
}

// Generate T-shirt templates
console.log('Generating T-shirt templates...');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#ffffff'), 'public/products/tshirts/white-tshirt-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#ffffff'), 'public/products/tshirts/white-tshirt-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#ffffff'), 'public/products/tshirts/white-tshirt-back.jpg');

createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#1f2937'), 'public/products/tshirts/black-tshirt-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#1f2937'), 'public/products/tshirts/black-tshirt-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#1f2937'), 'public/products/tshirts/black-tshirt-back.jpg');

createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#f3f4f6'), 'public/products/tshirts/vintage-tshirt-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#f3f4f6'), 'public/products/tshirts/vintage-tshirt-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawTshirt(ctx, w, h, '#f3f4f6'), 'public/products/tshirts/vintage-tshirt-back.jpg');

// Generate Hoodie templates
console.log('Generating Hoodie templates...');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#ffffff'), 'public/products/hoodies/classic-hoodie-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#ffffff'), 'public/products/hoodies/classic-hoodie-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#ffffff'), 'public/products/hoodies/classic-hoodie-back.jpg');

createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#1f2937'), 'public/products/hoodies/zip-hoodie-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#1f2937'), 'public/products/hoodies/zip-hoodie-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#1f2937'), 'public/products/hoodies/zip-hoodie-back.jpg');

createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#4b5563'), 'public/products/hoodies/oversized-hoodie-front.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#4b5563'), 'public/products/hoodies/oversized-hoodie-side.jpg');
createAndSaveTemplate(800, 800, (ctx, w, h) => drawHoodie(ctx, w, h, '#4b5563'), 'public/products/hoodies/oversized-hoodie-back.jpg');

// Generate Frame templates
console.log('Generating Frame templates...');
createAndSaveTemplate(800, 800, drawFrame, 'public/products/frames/classic-frame-front.jpg');
createAndSaveTemplate(800, 800, drawFrame, 'public/products/frames/classic-frame-angle1.jpg');
createAndSaveTemplate(800, 800, drawFrame, 'public/products/frames/classic-frame-angle2.jpg');

console.log('All product templates generated successfully!');