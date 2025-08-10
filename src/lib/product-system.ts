export interface ProductSize {
  id: string;
  name: string;
  price: number;
  heightRange: string; // 身高范围
  measurements: {
    chest: string;
    length: string;
    shoulder?: string;
    sleeve?: string;
  };
}

export interface ProductStyle {
  id: string;
  name: string;
  description: string;
  templateImages: string[]; // 多个角度的模板图片
  overlayAreas: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  blendMode: GlobalCompositeOperation;
  opacity: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  styles: ProductStyle[];
  sizes: ProductSize[];
  basePrice: number;
}

// T恤尺码系统 - 根据身高推荐
export const tshirtSizes: ProductSize[] = [
  {
    id: 's',
    name: 'S码',
    price: 39,
    heightRange: '155-165cm',
    measurements: {
      chest: '88-92cm',
      length: '64cm',
      shoulder: '42cm',
      sleeve: '19cm'
    }
  },
  {
    id: 'm',
    name: 'M码', 
    price: 39,
    heightRange: '165-175cm',
    measurements: {
      chest: '96-100cm',
      length: '67cm',
      shoulder: '45cm',
      sleeve: '20cm'
    }
  },
  {
    id: 'l',
    name: 'L码',
    price: 42,
    heightRange: '175-185cm',
    measurements: {
      chest: '104-108cm',
      length: '70cm',
      shoulder: '48cm',
      sleeve: '21cm'
    }
  },
  {
    id: 'xl',
    name: 'XL码',
    price: 45,
    heightRange: '185-195cm',
    measurements: {
      chest: '112-116cm',
      length: '73cm',
      shoulder: '51cm',
      sleeve: '22cm'
    }
  },
  {
    id: 'xxl',
    name: 'XXL码',
    price: 48,
    heightRange: '195cm以上',
    measurements: {
      chest: '120-124cm',
      length: '76cm',
      shoulder: '54cm',
      sleeve: '23cm'
    }
  }
];

// 卫衣尺码系统
export const hoodieSizes: ProductSize[] = [
  {
    id: 's',
    name: 'S码',
    price: 89,
    heightRange: '155-165cm',
    measurements: {
      chest: '100-104cm',
      length: '62cm',
      shoulder: '50cm',
      sleeve: '58cm'
    }
  },
  {
    id: 'm',
    name: 'M码',
    price: 89,
    heightRange: '165-175cm', 
    measurements: {
      chest: '108-112cm',
      length: '65cm',
      shoulder: '53cm',
      sleeve: '60cm'
    }
  },
  {
    id: 'l',
    name: 'L码',
    price: 92,
    heightRange: '175-185cm',
    measurements: {
      chest: '116-120cm',
      length: '68cm',
      shoulder: '56cm',
      sleeve: '62cm'
    }
  },
  {
    id: 'xl',
    name: 'XL码',
    price: 95,
    heightRange: '185-195cm',
    measurements: {
      chest: '124-128cm',
      length: '71cm',
      shoulder: '59cm',
      sleeve: '64cm'
    }
  },
  {
    id: 'xxl',
    name: 'XXL码',
    price: 98,
    heightRange: '195cm以上',
    measurements: {
      chest: '132-136cm',
      length: '74cm',
      shoulder: '62cm',
      sleeve: '66cm'
    }
  }
];

// 相框尺码系统
export const frameSizes: ProductSize[] = [
  {
    id: 'small',
    name: '小尺寸',
    price: 39,
    heightRange: '桌面装饰',
    measurements: {
      chest: '20×25cm',
      length: '适合桌面、书架'
    }
  },
  {
    id: 'medium', 
    name: '中尺寸',
    price: 59,
    heightRange: '房间装饰',
    measurements: {
      chest: '30×40cm',
      length: '适合床头、沙发旁'
    }
  },
  {
    id: 'large',
    name: '大尺寸',
    price: 89,
    heightRange: '墙面主打',
    measurements: {
      chest: '40×60cm',
      length: '适合客厅、卧室主墙'
    }
  },
  {
    id: 'extra-large',
    name: '特大尺寸',
    price: 129,
    heightRange: '展示级别',
    measurements: {
      chest: '60×80cm',
      length: '适合大厅、会议室'
    }
  }
];

// T恤款式
export const tshirtStyles: ProductStyle[] = [
  {
    id: 'basic-white',
    name: '经典白T',
    description: '100%纯棉，舒适透气，经典圆领设计',
    templateImages: [
      '/products/tshirts/white-tshirt-front.jpg',
      '/products/tshirts/white-tshirt-side.jpg', 
      '/products/tshirts/white-tshirt-back.jpg'
    ],
    overlayAreas: [
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 }, // 正面
      { x: 0.35, y: 0.35, width: 0.2, height: 0.25 },  // 侧面
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 }   // 背面
    ],
    blendMode: 'multiply',
    opacity: 0.95
  },
  {
    id: 'basic-black',
    name: '经典黑T',
    description: '100%纯棉，经典黑色，百搭必备款',
    templateImages: [
      '/products/tshirts/black-tshirt-front.jpg',
      '/products/tshirts/black-tshirt-side.jpg',
      '/products/tshirts/black-tshirt-back.jpg'
    ],
    overlayAreas: [
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 },
      { x: 0.35, y: 0.35, width: 0.2, height: 0.25 },
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 }
    ],
    blendMode: 'screen', // 黑T用screen混合
    opacity: 0.85
  },
  {
    id: 'vintage-wash',
    name: '复古洗水T',
    description: '做旧处理，复古质感，街头风格',
    templateImages: [
      '/products/tshirts/vintage-tshirt-front.jpg',
      '/products/tshirts/vintage-tshirt-side.jpg',
      '/products/tshirts/vintage-tshirt-back.jpg'
    ],
    overlayAreas: [
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 },
      { x: 0.35, y: 0.35, width: 0.2, height: 0.25 },
      { x: 0.38, y: 0.35, width: 0.24, height: 0.28 }
    ],
    blendMode: 'multiply',
    opacity: 0.9
  }
];

// 卫衣款式
export const hoodieStyles: ProductStyle[] = [
  {
    id: 'classic-hoodie',
    name: '经典连帽卫衣',
    description: '加绒内里，保暖舒适，经典帽衫设计',
    templateImages: [
      '/products/hoodies/classic-hoodie-front.jpg',
      '/products/hoodies/classic-hoodie-side.jpg',
      '/products/hoodies/classic-hoodie-back.jpg'
    ],
    overlayAreas: [
      { x: 0.35, y: 0.4, width: 0.3, height: 0.25 },
      { x: 0.32, y: 0.4, width: 0.25, height: 0.22 },
      { x: 0.35, y: 0.4, width: 0.3, height: 0.25 }
    ],
    blendMode: 'multiply',
    opacity: 0.9
  },
  {
    id: 'zip-hoodie',
    name: '拉链卫衣',
    description: '开衫设计，方便穿脱，时尚实用',
    templateImages: [
      '/products/hoodies/zip-hoodie-front.jpg',
      '/products/hoodies/zip-hoodie-side.jpg',
      '/products/hoodies/zip-hoodie-back.jpg'
    ],
    overlayAreas: [
      { x: 0.4, y: 0.4, width: 0.2, height: 0.25 }, // 拉链卫衣正面设计区域更小
      { x: 0.32, y: 0.4, width: 0.25, height: 0.22 },
      { x: 0.35, y: 0.4, width: 0.3, height: 0.25 }
    ],
    blendMode: 'multiply',
    opacity: 0.9
  },
  {
    id: 'oversized-hoodie',
    name: '宽松卫衣',
    description: 'oversize版型，街头潮流，舒适随性',
    templateImages: [
      '/products/hoodies/oversized-hoodie-front.jpg',
      '/products/hoodies/oversized-hoodie-side.jpg',
      '/products/hoodies/oversized-hoodie-back.jpg'
    ],
    overlayAreas: [
      { x: 0.33, y: 0.38, width: 0.34, height: 0.28 }, // 宽松版型设计区域更大
      { x: 0.3, y: 0.38, width: 0.28, height: 0.25 },
      { x: 0.33, y: 0.38, width: 0.34, height: 0.28 }
    ],
    blendMode: 'multiply',
    opacity: 0.9
  }
];

// 相框款式
export const frameStyles: ProductStyle[] = [
  {
    id: 'classic-frame',
    name: '经典相框',
    description: '实木边框，玻璃保护，经典装裱效果',
    templateImages: [
      '/products/frames/classic-frame-front.jpg',
      '/products/frames/classic-frame-angle1.jpg',
      '/products/frames/classic-frame-angle2.jpg'
    ],
    overlayAreas: [
      { x: 0.15, y: 0.15, width: 0.7, height: 0.7 },
      { x: 0.16, y: 0.16, width: 0.68, height: 0.68 },
      { x: 0.17, y: 0.17, width: 0.66, height: 0.66 }
    ],
    blendMode: 'source-over',
    opacity: 1
  }
];

// 产品分类
export const productCategories: ProductCategory[] = [
  {
    id: 'tshirts',
    name: 'T恤',
    description: '舒适纯棉，多样设计，日常百搭',
    styles: tshirtStyles,
    sizes: tshirtSizes,
    basePrice: 39
  },
  {
    id: 'hoodies',
    name: '卫衣',
    description: '保暖时尚，街头潮流，四季必备',
    styles: hoodieStyles,
    sizes: hoodieSizes,
    basePrice: 89
  },
  {
    id: 'frames',
    name: '相框',
    description: '精美装裱，艺术展示，家居装饰',
    styles: frameStyles,
    sizes: frameSizes,
    basePrice: 39
  }
];

// 根据身高推荐尺码
export function recommendSizeByHeight(height: number, sizes: ProductSize[]): ProductSize | null {
  for (const size of sizes) {
    const range = size.heightRange.replace(/cm|以上/g, '').split('-');
    if (range.length === 2) {
      const min = parseInt(range[0]);
      const max = parseInt(range[1]);
      if (height >= min && height <= max) {
        return size;
      }
    } else if (range.length === 1) {
      const min = parseInt(range[0]);
      if (height >= min) {
        return size;
      }
    }
  }
  return sizes[1]; // 默认返回M码
}

// Mockup生成器类
export class AdvancedMockupGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateMockup(
    designImageUrl: string, 
    style: ProductStyle, 
    angleIndex: number = 0
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const templateImg = new Image();
      const designImg = new Image();
      
      templateImg.crossOrigin = 'anonymous';
      designImg.crossOrigin = 'anonymous';
      
      let loadedCount = 0;
      const checkLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
          this.compositeImages(templateImg, designImg, style, angleIndex);
          const dataUrl = this.canvas.toDataURL('image/png');
          resolve(dataUrl);
        }
      };

      templateImg.onload = checkLoaded;
      designImg.onload = checkLoaded;

      templateImg.onerror = () => reject(new Error('Failed to load template'));
      designImg.onerror = () => reject(new Error('Failed to load design'));

      templateImg.src = style.templateImages[angleIndex];
      designImg.src = designImageUrl;
    });
  }

  private compositeImages(
    templateImg: HTMLImageElement,
    designImg: HTMLImageElement,
    style: ProductStyle,
    angleIndex: number
  ) {
    this.canvas.width = templateImg.width;
    this.canvas.height = templateImg.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw template background
    this.ctx.drawImage(templateImg, 0, 0);
    
    // Process design image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = designImg.width;
    tempCanvas.height = designImg.height;
    tempCtx.drawImage(designImg, 0, 0);
    
    // Remove background
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 240 || (Math.abs(r-g) < 20 && Math.abs(g-b) < 20 && brightness > 200)) {
        data[i + 3] = 0;
      }
    }
    tempCtx.putImageData(imageData, 0, 0);
    
    // Apply overlay
    const overlayArea = style.overlayAreas[angleIndex];
    const overlayX = overlayArea.x * templateImg.width;
    const overlayY = overlayArea.y * templateImg.height;
    const overlayWidth = overlayArea.width * templateImg.width;
    const overlayHeight = overlayArea.height * templateImg.height;
    
    this.ctx.save();
    this.ctx.globalAlpha = style.opacity;
    this.ctx.globalCompositeOperation = style.blendMode;
    this.ctx.drawImage(tempCanvas, overlayX, overlayY, overlayWidth, overlayHeight);
    this.ctx.restore();
  }
}