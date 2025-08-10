'use client';

import { useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { EnhancedPreOrderModal } from './EnhancedPreOrderModal';

interface ProductItem {
  id: string;
  name: string;
  type: '卫衣' | '短袖' | '相框';
  price?: number;
  image: string;
  sizes?: {
    S: { height: string; chest: string };
    M: { height: string; chest: string };
    L: { height: string; chest: string };
    XL: { height: string; chest: string };
  };
  description?: string;
}

const productItems: ProductItem[] = [
  // 卫衣
  { id: 'hoodie-1', name: '连帽卫衣 - 款式1', type: '卫衣', price: 168, image: '/卫衣/31ec7bd89ff08b6d1d81bba77b44d3d2.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-2', name: '连帽卫衣 - 款式2', type: '卫衣', price: 168, image: '/卫衣/5684ce5c525e6ad1c9af443e2653e8d4.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-3', name: '连帽卫衣 - 款式3', type: '卫衣', price: 168, image: '/卫衣/826c7f376223c11a5d44adb95ceeaf6a.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-4', name: '连帽卫衣 - 款式4', type: '卫衣', price: 168, image: '/卫衣/926e055aa81bcd7681beffbcd82d2dd5.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-5', name: '连帽卫衣 - 款式5', type: '卫衣', price: 168, image: '/卫衣/df18d236e7e8b8b49f63fad744fed181.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  
  // 短袖
  { id: 'tshirt-1', name: '短袖T恤 - 款式1', type: '短袖', price: 88, image: '/短袖/612d2b25d4da872b0eb360603e26383d.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },
  { id: 'tshirt-2', name: '短袖T恤 - 款式2', type: '短袖', price: 88, image: '/短袖/6f6fe23689d18c3582267bd457c390d3.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },
  { id: 'tshirt-3', name: '短袖T恤 - 款式3', type: '短袖', price: 88, image: '/短袖/b81feb9703f09524b4cb09ae9acf8acd.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },

  // 相框
  { id: 'frame-1', name: '经典相框', type: '相框', image: '/相框/相框1.png', description: '精美相框设计' }
];

interface VSCOProductDisplayProps {
  selectedDesignImageUrl?: string;
  onBack?: () => void;
  isCompactMode?: boolean;
}

export function VSCOProductDisplay({ selectedDesignImageUrl, onBack, isCompactMode = false }: VSCOProductDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<'卫衣' | '短袖' | '相框'>('卫衣');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<ProductItem | null>(
    productItems.find(item => item.type === '相框') || null
  );
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentCategoryItems = productItems.filter(item => item.type === selectedCategory);
  const previewItem = currentCategoryItems[previewIndex] || null;

  const handleCategoryChange = (category: '卫衣' | '短袖' | '相框') => {
    setSelectedCategory(category);
    setPreviewIndex(0);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: ProductItem) => {
    if (product.type === '相框') {
      setSelectedFrame(product);
    } else {
      setSelectedProduct(product);
      setShowPreOrderModal(true);
    }
  };

  const handlePreviewNav = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setPreviewIndex(prev => prev === 0 ? currentCategoryItems.length - 1 : prev - 1);
    } else {
      setPreviewIndex(prev => prev === currentCategoryItems.length - 1 ? 0 : prev + 1);
    }
  };

  return (
    <div className="vsco-product-display">
      {onBack && (
        <button onClick={onBack} className="vsco-back-btn">
          <ArrowLeft size={20} />
          返回
        </button>
      )}

      {/* Main Preview Area - VSCO Style */}
      <div className="vsco-main-preview">
        <div className="vsco-preview-container">
          {/* Navigation Arrows */}
          <button 
            className="vsco-nav-arrow vsco-nav-left"
            onClick={() => handlePreviewNav('prev')}
            disabled={currentCategoryItems.length <= 1}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Large Preview */}
          <div className="vsco-preview-image">
            <div className="vsco-image-layers">
              {/* Background (Clothing/Frame) */}
              {previewItem && (
                <div className="vsco-layer vsco-background-layer">
                  <img src={previewItem.image} alt={previewItem.name} />
                </div>
              )}
              
              {/* Frame Overlay (if frame selected and not viewing frames) */}
              {selectedFrame && selectedCategory !== '相框' && (
                <div className="vsco-layer vsco-frame-layer">
                  <img src={selectedFrame.image} alt="相框" />
                </div>
              )}
              
              {/* Design Overlay */}
              {selectedDesignImageUrl && selectedCategory !== '相框' && (
                <div className="vsco-layer vsco-design-layer">
                  <img src={selectedDesignImageUrl} alt="设计" />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            className="vsco-nav-arrow vsco-nav-right"
            onClick={() => handlePreviewNav('next')}
            disabled={currentCategoryItems.length <= 1}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Preview Info */}
        {previewItem && (
          <div className="vsco-preview-info">
            <h3 className="vsco-preview-title">{previewItem.name}</h3>
            {previewItem.price && (
              <div className="vsco-preview-price">¥{previewItem.price}</div>
            )}
            {previewItem.description && (
              <p className="vsco-preview-description">{previewItem.description}</p>
            )}
            
            {previewItem.type !== '相框' && (
              <button 
                className="vsco-order-btn"
                onClick={() => handleProductSelect(previewItem)}
              >
                <ShoppingBag size={16} />
                立即预订
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="vsco-category-tabs">
        <button 
          className={`vsco-tab ${selectedCategory === '卫衣' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('卫衣')}
        >
          卫衣 ({productItems.filter(item => item.type === '卫衣').length})
        </button>
        <button 
          className={`vsco-tab ${selectedCategory === '短袖' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('短袖')}
        >
          短袖 ({productItems.filter(item => item.type === '短袖').length})
        </button>
        <button 
          className={`vsco-tab ${selectedCategory === '相框' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('相框')}
        >
          相框 ({productItems.filter(item => item.type === '相框').length})
        </button>
      </div>

      {/* Product Grid */}
      <div className="vsco-product-grid">
        {currentCategoryItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`vsco-product-card ${
              (item.type === '相框' ? selectedFrame?.id === item.id : false) ? 'selected' : ''
            } ${index === previewIndex ? 'previewing' : ''}`}
            onClick={() => {
              setPreviewIndex(index);
              if (item.type === '相框') {
                setSelectedFrame(item);
              }
            }}
          >
            <div className="vsco-product-image">
              <img src={item.image} alt={item.name} />
              {index === previewIndex && <div className="vsco-preview-indicator" />}
            </div>
            <div className="vsco-product-info">
              <h4 className="vsco-product-name">{item.name}</h4>
              {item.price && (
                <span className="vsco-product-price">¥{item.price}</span>
              )}
            </div>
            {item.type !== '相框' && (
              <button 
                className="vsco-quick-order"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductSelect(item);
                }}
              >
                <ShoppingBag size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced PreOrder Modal */}
      <EnhancedPreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        product={selectedProduct}
        designImageUrl={selectedDesignImageUrl}
        frameImage={selectedFrame?.image}
      />

      <style jsx>{`
        .vsco-product-display {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fafafa;
          min-height: 100vh;
        }

        .vsco-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          margin: 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vsco-back-btn:hover {
          background: #f5f5f5;
          transform: translateY(-1px);
        }

        .vsco-main-preview {
          background: white;
          padding: ${isCompactMode ? '20px 15px' : '40px 20px'};
          border-bottom: 1px solid #e0e0e0;
        }

        .vsco-preview-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${isCompactMode ? '15px' : '30px'};
          margin-bottom: ${isCompactMode ? '20px' : '30px'};
        }

        .vsco-nav-arrow {
          width: 50px;
          height: 50px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
        }

        .vsco-nav-arrow:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .vsco-nav-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .vsco-preview-image {
          width: ${isCompactMode ? '280px' : '500px'};
          height: ${isCompactMode ? '350px' : '600px'};
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          background: #f8f8f8;
        }

        .vsco-image-layers {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vsco-layer {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vsco-background-layer {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .vsco-design-layer {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 250px;
          height: 250px;
          z-index: 2;
          padding: 20px;
        }

        .vsco-frame-layer {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }

        .vsco-background-layer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vsco-design-layer img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .vsco-frame-layer img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vsco-preview-info {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .vsco-preview-title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
        }

        .vsco-preview-price {
          font-size: 28px;
          font-weight: 700;
          color: #000;
          margin-bottom: 12px;
        }

        .vsco-preview-description {
          font-size: 16px;
          color: #666;
          margin: 0 0 25px 0;
          line-height: 1.5;
        }

        .vsco-order-btn {
          background: #000;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .vsco-order-btn:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .vsco-category-tabs {
          display: flex;
          justify-content: center;
          padding: ${isCompactMode ? '15px 10px' : '30px 20px'};
          background: white;
          border-bottom: 1px solid #e0e0e0;
          gap: ${isCompactMode ? '10px' : '20px'};
        }

        .vsco-tab {
          padding: 12px 24px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vsco-tab.active {
          border-color: #000;
          background: #000;
          color: white;
        }

        .vsco-tab:hover:not(.active) {
          border-color: #999;
        }

        .vsco-product-grid {
          padding: ${isCompactMode ? '15px 10px' : '30px 20px'};
          display: grid;
          grid-template-columns: ${isCompactMode ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))'};
          gap: ${isCompactMode ? '10px' : '20px'};
          background: #fafafa;
        }

        .vsco-product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .vsco-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .vsco-product-card.selected {
          border: 2px solid #007AFF;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .vsco-product-card.previewing {
          border: 2px solid #000;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }

        .vsco-product-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .vsco-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .vsco-product-card:hover .vsco-product-image img {
          transform: scale(1.05);
        }

        .vsco-preview-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
          box-shadow: 0 0 0 2px white;
        }

        .vsco-product-info {
          padding: 15px;
        }

        .vsco-product-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0 0 5px 0;
          line-height: 1.3;
        }

        .vsco-product-price {
          font-size: 16px;
          font-weight: 700;
          color: #000;
        }

        .vsco-quick-order {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .vsco-product-card:hover .vsco-quick-order {
          opacity: 1;
        }

        .vsco-quick-order:hover {
          background: #000;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .vsco-preview-image {
            width: 350px;
            height: 420px;
          }

          .vsco-preview-container {
            gap: 15px;
          }

          .vsco-nav-arrow {
            width: 40px;
            height: 40px;
          }

          .vsco-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            padding: 20px 15px;
          }

          .vsco-category-tabs {
            padding: 20px 15px;
            gap: 10px;
          }

          .vsco-tab {
            padding: 10px 18px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .vsco-preview-image {
            width: 300px;
            height: 360px;
          }

          .vsco-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}