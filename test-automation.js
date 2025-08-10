const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_URL = 'http://localhost:3000/create';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Create a test dog image
function createTestDogImage() {
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  const testCanvas = createCanvas(512, 512);
  const ctx = testCanvas.getContext('2d');
  
  // Draw a simple dog face with distinct colors
  ctx.fillStyle = '#8B4513'; // Brown
  ctx.beginPath();
  ctx.arc(256, 256, 150, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(200, 220, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(312, 220, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(256, 280, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // Save to file
  const buffer = testCanvas.toBuffer('image/png');
  const testImagePath = path.join(__dirname, 'test-dog.png');
  fs.writeFileSync(testImagePath, buffer);
  return testImagePath;
}

async function runTest() {
  console.log('🚀 Starting automated mockup test...\n');
  
  // Create test image
  console.log('🎨 Creating test dog image...');
  const testImagePath = createTestDogImage();
  console.log(`✅ Test image created at: ${testImagePath}\n`);
  
  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('❌ Browser Error:', text);
    } else if (text.includes('🎯') || text.includes('Generating mockup')) {
      console.log('📊 Browser Log:', text);
    }
  });
  
  try {
    // Navigate to create page
    console.log(`📍 Navigating to ${TEST_URL}...`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '01-initial-page.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot: Initial page\n');
    
    // Upload test image
    console.log('📤 Uploading test dog image...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found!');
    }
    await fileInput.uploadFile(testImagePath);
    await page.waitForTimeout(2000);
    
    // Take screenshot after upload
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '02-after-upload.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot: After upload\n');
    
    // Select a style (click first style option)
    console.log('🎨 Selecting art style...');
    const styleButtons = await page.$$('.style-option, [data-style], button[class*="style"]');
    if (styleButtons.length > 0) {
      await styleButtons[0].click();
      console.log(`✅ Clicked style button (found ${styleButtons.length} style options)`);
    } else {
      console.log('⚠️ No style buttons found, looking for alternative selectors...');
      // Try alternative selectors
      const altButton = await page.$('button:has-text("卡通"), button:has-text("Cartoon")');
      if (altButton) {
        await altButton.click();
        console.log('✅ Clicked alternative style button');
      }
    }
    await page.waitForTimeout(1000);
    
    // Take screenshot after style selection
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '03-after-style-select.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot: After style selection\n');
    
    // Click generate button
    console.log('🎯 Clicking generate button...');
    const generateButton = await page.$('button:has-text("生成"), button:has-text("Generate"), button[class*="generate"]');
    if (!generateButton) {
      throw new Error('Generate button not found!');
    }
    await generateButton.click();
    console.log('✅ Generate button clicked\n');
    
    // Wait for generation (with progress updates)
    console.log('⏳ Waiting for AI image generation...');
    let waitTime = 0;
    const maxWait = 60000; // 60 seconds max
    const checkInterval = 2000; // Check every 2 seconds
    
    while (waitTime < maxWait) {
      await page.waitForTimeout(checkInterval);
      waitTime += checkInterval;
      
      // Check if MockupDisplay appeared
      const mockupDisplay = await page.$('.mockup-display, [class*="mockup"], [class*="product-preview"]');
      if (mockupDisplay) {
        console.log('✅ Mockup display detected!\n');
        break;
      }
      
      // Check for error messages
      const errorElement = await page.$('.error, [class*="error"]');
      if (errorElement) {
        const errorText = await errorElement.evaluate(el => el.textContent);
        console.error(`❌ Error detected: ${errorText}`);
        break;
      }
      
      console.log(`⏳ Still waiting... (${waitTime/1000}s / ${maxWait/1000}s)`);
    }
    
    // Take screenshot after generation
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '04-after-generation.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot: After generation\n');
    
    // Scroll to mockup display area
    console.log('📜 Scrolling to mockup display...');
    await page.evaluate(() => {
      const mockupElement = document.querySelector('.mockup-display, [class*="mockup"], [class*="product-preview"]');
      if (mockupElement) {
        mockupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(2000);
    
    // Take focused screenshot of mockup area
    const mockupElement = await page.$('.mockup-display, [class*="mockup"], [class*="product-preview"]');
    if (mockupElement) {
      const boundingBox = await mockupElement.boundingBox();
      if (boundingBox) {
        await page.screenshot({ 
          path: path.join(SCREENSHOT_DIR, '05-mockup-display-focused.png'),
          clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
          }
        });
        console.log('📸 Screenshot: Mockup display (focused)\n');
      }
    }
    
    // Check for specific product previews
    console.log('🔍 Checking for product previews...');
    const products = ['T恤', '马克杯', '相框', 'T-shirt', 'Mug', 'Frame'];
    for (const product of products) {
      const productElement = await page.$(`text=${product}`);
      if (productElement) {
        console.log(`✅ Found product: ${product}`);
      }
    }
    
    // Try to interact with mockup (click to change angles)
    console.log('\n🔄 Testing angle changes...');
    const mockupImages = await page.$$('.mockup-display img, [class*="mockup"] img');
    if (mockupImages.length > 0) {
      console.log(`Found ${mockupImages.length} mockup images`);
      
      // Click first mockup to change angle
      await mockupImages[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, '06-after-angle-change.png'),
        fullPage: true 
      });
      console.log('📸 Screenshot: After angle change\n');
    }
    
    // Final analysis
    console.log('📊 TEST RESULTS:');
    console.log('================');
    
    // Check what we found
    const finalCheck = await page.evaluate(() => {
      const results = {
        hasMockupDisplay: !!document.querySelector('.mockup-display, [class*="mockup"]'),
        productCount: document.querySelectorAll('[class*="product"]').length,
        imageCount: document.querySelectorAll('.mockup-display img, [class*="mockup"] img').length,
        hasPreOrderButton: !!document.querySelector('button:has-text("预订"), button:has-text("Pre-order")'),
        visibleText: []
      };
      
      // Get visible text content
      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      textElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
          results.visibleText.push(text);
        }
      });
      
      return results;
    });
    
    console.log('✅ Mockup Display Found:', finalCheck.hasMockupDisplay);
    console.log('📦 Product Elements:', finalCheck.productCount);
    console.log('🖼️ Mockup Images:', finalCheck.imageCount);
    console.log('🛒 Pre-order Button:', finalCheck.hasPreOrderButton);
    
    if (finalCheck.visibleText.length > 0) {
      console.log('\n📝 Visible Content Samples:');
      finalCheck.visibleText.slice(0, 10).forEach(text => {
        if (text.includes('恤') || text.includes('杯') || text.includes('框') || 
            text.toLowerCase().includes('shirt') || text.toLowerCase().includes('mug') || 
            text.toLowerCase().includes('frame')) {
          console.log(`  - ${text}`);
        }
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'error-state.png'),
      fullPage: true 
    });
    console.log('📸 Error screenshot saved');
    
    throw error;
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will remain open for manual inspection.');
    console.log('Press Ctrl+C to close and exit.');
    
    // Wait indefinitely (for manual inspection)
    await new Promise(() => {});
    
    // Uncomment below for automated closing:
    // await browser.close();
  }
}

// Run the test
runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});