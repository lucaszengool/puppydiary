export interface MockupTemplate {
  id: string;
  name: string;
  category: 'apparel' | 'frame' | 'phone' | 'other';
  templateImage: string;
  overlayArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blendMode?: GlobalCompositeOperation;
  opacity?: number;
  transform?: {
    perspective?: number[];
    scale?: number;
    rotation?: number;
    skewX?: number;
    skewY?: number;
  };
}

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  angles: MockupTemplate[];
}

export const mockupTemplates: MockupTemplate[] = [
  // T恤 - 3个角度 (中国人模特)
  {
    id: 'tshirt-front',
    name: 'T恤 · 正面',
    category: 'apparel',
    templateImage: '/mockup-templates/asian-white-shirt.jpg', // 需要替换
    overlayArea: {
      x: 0.38,
      y: 0.35,
      width: 0.24,
      height: 0.28
    },
    blendMode: 'multiply' as GlobalCompositeOperation,
    opacity: 0.95
  },
  {
    id: 'tshirt-side',
    name: 'T恤 · 侧面',
    category: 'apparel',
    templateImage: '/mockup-templates/asian-white-shirt-side.jpg', // 需要替换
    overlayArea: {
      x: 0.35,
      y: 0.35,
      width: 0.2,
      height: 0.25
    },
    blendMode: 'multiply' as GlobalCompositeOperation,
    opacity: 0.9,
    transform: {
      rotation: -15,
      scale: 0.9
    }
  },
  {
    id: 'tshirt-back',
    name: 'T恤 · 背面',
    category: 'apparel',
    templateImage: '/mockup-templates/asian-white-shirt-back.jpg', // 需要替换
    overlayArea: {
      x: 0.38,
      y: 0.35,
      width: 0.24,
      height: 0.28
    },
    blendMode: 'multiply' as GlobalCompositeOperation,
    opacity: 0.95
  },
  
  // 相框 - 3个角度 (使用美丽点点相框)
  {
    id: 'frame-front',
    name: '相框 · 正面',
    category: 'frame',
    templateImage: '/mockup-templates/realistic-glass-frame.jpg',
    overlayArea: {
      x: 0.15,
      y: 0.15,
      width: 0.7,
      height: 0.7
    },
    blendMode: 'source-over' as GlobalCompositeOperation,
    opacity: 1
  },
  {
    id: 'frame-side',
    name: '相框 · 侧面',
    category: 'frame',
    templateImage: '/mockup-templates/realistic-glass-frame.jpg',
    overlayArea: {
      x: 0.16,
      y: 0.16,
      width: 0.68,
      height: 0.68
    },
    blendMode: 'source-over' as GlobalCompositeOperation,
    opacity: 1,
    transform: {
      rotation: -8,
      scale: 0.95
    }
  },
  {
    id: 'frame-angle',
    name: '相框 · 斜角',
    category: 'frame',
    templateImage: '/mockup-templates/realistic-glass-frame.jpg',
    overlayArea: {
      x: 0.17,
      y: 0.17,
      width: 0.66,
      height: 0.66
    },
    blendMode: 'source-over' as GlobalCompositeOperation,
    opacity: 1,
    transform: {
      rotation: 12,
      scale: 0.92
    }
  }
];

export interface ProductSize {
  id: string;
  name: string;
  price: number;
  dimensions?: string;
}

export interface ProductInfoExtended extends ProductInfo {
  sizes?: ProductSize[];
}

export const products: ProductInfoExtended[] = [
  {
    id: 'tshirt',
    name: 'T恤',
    price: 39,
    angles: mockupTemplates.filter(t => t.id.startsWith('tshirt-')),
    sizes: [
      { id: 's', name: 'S码', price: 39, dimensions: '胸围88-92cm' },
      { id: 'm', name: 'M码', price: 39, dimensions: '胸围96-100cm' },
      { id: 'l', name: 'L码', price: 39, dimensions: '胸围104-108cm' },
      { id: 'xl', name: 'XL码', price: 42, dimensions: '胸围112-116cm' },
      { id: 'xxl', name: 'XXL码', price: 45, dimensions: '胸围120-124cm' }
    ]
  },
  {
    id: 'frame',
    name: '相框',
    price: 39,
    angles: mockupTemplates.filter(t => t.id.startsWith('frame-')),
    sizes: [
      { id: 'small', name: '小尺寸', price: 39, dimensions: '20×25cm' },
      { id: 'medium', name: '中尺寸', price: 59, dimensions: '30×40cm' },
      { id: 'large', name: '大尺寸', price: 89, dimensions: '40×60cm' },
      { id: 'extra-large', name: '特大尺寸', price: 129, dimensions: '60×80cm' }
    ]
  }
];

export class MockupGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  private removeBackground(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    // Remove white/light backgrounds
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is close to white/light colors
      const brightness = (r + g + b) / 3;
      const isLight = brightness > 240;
      const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      
      if (isLight || (isGray && brightness > 200)) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    return imageData;
  }

  private trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let top = canvas.height, bottom = 0, left = canvas.width, right = 0;
    
    // Find boundaries of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    
    // Create new trimmed canvas
    const trimmedCanvas = document.createElement('canvas');
    const trimmedCtx = trimmedCanvas.getContext('2d')!;
    const width = right - left + 1;
    const height = bottom - top + 1;
    
    trimmedCanvas.width = width;
    trimmedCanvas.height = height;
    
    trimmedCtx.drawImage(canvas, left, top, width, height, 0, 0, width, height);
    
    return trimmedCanvas;
  }

  async generateMockup(
    designImageUrl: string,
    template: MockupTemplate
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const templateImg = new Image();
      const designImg = new Image();
      
      templateImg.crossOrigin = 'anonymous';
      designImg.crossOrigin = 'anonymous';
      
      // Add cache busting
      const timestamp = Date.now();

      let loadedCount = 0;
      const checkLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
          this.compositeImages(templateImg, designImg, template);
          const dataUrl = this.canvas.toDataURL('image/png');
          resolve(dataUrl + '#' + timestamp); // Add timestamp to prevent caching
        }
      };

      templateImg.onload = checkLoaded;
      designImg.onload = checkLoaded;

      templateImg.onerror = () => reject(new Error('Failed to load template image'));
      designImg.onerror = () => reject(new Error('Failed to load design image'));

      templateImg.src = template.templateImage + '?t=' + timestamp;
      designImg.src = designImageUrl + (designImageUrl.includes('?') ? '&' : '?') + 't=' + timestamp;
    });
  }

  private compositeImages(
    templateImg: HTMLImageElement,
    designImg: HTMLImageElement,
    template: MockupTemplate
  ) {
    
    // Set up main canvas
    this.canvas.width = templateImg.width;
    this.canvas.height = templateImg.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(templateImg, 0, 0);

    // Create temporary canvas for design processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = designImg.width;
    tempCanvas.height = designImg.height;
    
    // Draw design image to temporary canvas
    tempCtx.drawImage(designImg, 0, 0);
    
    // Remove background and get trimmed version
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const cleanImageData = this.removeBackground(imageData);
    tempCtx.putImageData(cleanImageData, 0, 0);
    
    const trimmedCanvas = this.trimCanvas(tempCanvas);

    const overlayX = template.overlayArea.x * templateImg.width;
    const overlayY = template.overlayArea.y * templateImg.height;
    const overlayWidth = template.overlayArea.width * templateImg.width;
    const overlayHeight = template.overlayArea.height * templateImg.height;

    this.ctx.save();

    if (template.opacity !== undefined) {
      this.ctx.globalAlpha = template.opacity;
    }

    if (template.blendMode) {
      this.ctx.globalCompositeOperation = template.blendMode;
    }

    // Special handling for different product types
    if (template.id.startsWith('mug-')) {
      // Use vertical slicing for curved mug effect
      this.applyCurvedOverlay(trimmedCanvas, overlayX, overlayY, overlayWidth, overlayHeight);
    } else if (template.transform) {
      // Apply perspective transform for other products
      const centerX = overlayX + overlayWidth / 2;
      const centerY = overlayY + overlayHeight / 2;
      
      this.ctx.translate(centerX, centerY);
      
      if (template.transform.rotation) {
        this.ctx.rotate(template.transform.rotation * Math.PI / 180);
      }
      
      if (template.transform.scale) {
        this.ctx.scale(template.transform.scale, template.transform.scale);
      }
      
      if (template.transform.skewX || template.transform.skewY) {
        const skewX = template.transform.skewX || 0;
        const skewY = template.transform.skewY || 0;
        this.ctx.transform(1, skewY, skewX, 1, 0, 0);
      }
      
      this.ctx.drawImage(
        trimmedCanvas,
        -overlayWidth / 2,
        -overlayHeight / 2,
        overlayWidth,
        overlayHeight
      );
    } else {
      // Direct overlay for frames and simple products
      this.ctx.drawImage(
        trimmedCanvas,
        overlayX,
        overlayY,
        overlayWidth,
        overlayHeight
      );
    }

    this.ctx.restore();
  }

  // New method for curved surface overlay (mug effect)
  private applyCurvedOverlay(
    sourceCanvas: HTMLCanvasElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const slices = 20; // Number of vertical slices for curve effect
    const sliceWidth = sourceCanvas.width / slices;
    const targetSliceWidth = width / slices;
    
    for (let i = 0; i < slices; i++) {
      const sourceX = i * sliceWidth;
      const targetX = x + (i * targetSliceWidth);
      
      // Create curve effect by varying height
      const curveEffect = Math.sin((i / slices) * Math.PI) * 0.1; // 10% curve variation
      const sliceHeight = height * (1 + curveEffect);
      const sliceY = y + (height - sliceHeight) / 2;
      
      this.ctx.drawImage(
        sourceCanvas,
        sourceX, 0, sliceWidth, sourceCanvas.height,
        targetX, sliceY, targetSliceWidth, sliceHeight
      );
    }
  }

  private applyPerspectiveTransform(
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    perspective: number[]
  ) {
    const segments = 20;
    const segmentWidth = width / segments;
    const segmentHeight = height / segments;

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const sx = (i / segments) * img.width;
        const sy = (j / segments) * img.height;
        const sw = img.width / segments;
        const sh = img.height / segments;

        const dx = x + i * segmentWidth;
        const dy = y + j * segmentHeight;

        this.ctx.drawImage(
          img,
          sx, sy, sw, sh,
          dx, dy, segmentWidth, segmentHeight
        );
      }
    }
  }

  async generateMultipleMockups(
    designImageUrl: string,
    templateIds?: string[]
  ): Promise<{ templateId: string; mockupUrl: string }[]> {
    const templates = templateIds
      ? mockupTemplates.filter(t => templateIds.includes(t.id))
      : mockupTemplates;

    const mockups = await Promise.all(
      templates.map(async (template) => ({
        templateId: template.id,
        mockupUrl: await this.generateMockup(designImageUrl, template)
      }))
    );

    return mockups;
  }
}