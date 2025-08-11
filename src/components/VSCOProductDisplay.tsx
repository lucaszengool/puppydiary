'use client';

import { useState, useRef } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { EnhancedPreOrderModal } from './EnhancedPreOrderModal';

interface ProductItem {
  id: string;
  name: string;
  type: '卫衣' | '短袖';
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
  { id: 'hoodie-1', name: '连帽卫衣 - 款式1', type: '卫衣', price: 99, image: '/卫衣/31ec7bd89ff08b6d1d81bba77b44d3d2.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-2', name: '连帽卫衣 - 款式2', type: '卫衣', price: 99, image: '/卫衣/5684ce5c525e6ad1c9af443e2653e8d4.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-3', name: '连帽卫衣 - 款式3', type: '卫衣', price: 99, image: '/卫衣/826c7f376223c11a5d44adb95ceeaf6a.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-4', name: '连帽卫衣 - 款式4', type: '卫衣', price: 99, image: '/卫衣/926e055aa81bcd7681beffbcd82d2dd5.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  { id: 'hoodie-5', name: '连帽卫衣 - 款式5', type: '卫衣', price: 99, image: '/卫衣/df18d236e7e8b8b49f63fad744fed181.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '舒适棉质，经典版型' },
  
  // 短袖
  { id: 'tshirt-1', name: '短袖T恤 - 款式1', type: '短袖', price: 49, image: '/短袖/612d2b25d4da872b0eb360603e26383d.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },
  { id: 'tshirt-2', name: '短袖T恤 - 款式2', type: '短袖', price: 49, image: '/短袖/6f6fe23689d18c3582267bd457c390d3.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },
  { id: 'tshirt-3', name: '短袖T恤 - 款式3', type: '短袖', price: 49, image: '/短袖/b81feb9703f09524b4cb09ae9acf8acd.jpg',
    sizes: { S: { height: '160-165cm', chest: '88-92cm' }, M: { height: '165-170cm', chest: '92-96cm' }, L: { height: '170-175cm', chest: '96-100cm' }, XL: { height: '175-180cm', chest: '100-104cm' }},
    description: '纯棉材质，透气舒适' },

];

interface VSCOProductDisplayProps {
  selectedDesignImageUrl?: string;
  onBack?: () => void;
  isCompactMode?: boolean;
}

export function VSCOProductDisplay({ selectedDesignImageUrl, onBack, isCompactMode = false }: VSCOProductDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<'卫衣' | '短袖'>('卫衣');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showFullView, setShowFullView] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentCategoryItems = productItems.filter(item => item.type === selectedCategory);
  const previewItem = currentCategoryItems[previewIndex] || null;

  const handleCategoryChange = (category: '卫衣' | '短袖') => {
    setSelectedCategory(category);
    setPreviewIndex(0);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: ProductItem) => {
    setSelectedProduct(product);
    setShowPreOrderModal(true);
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
          <div 
            ref={previewRef}
            className="vsco-preview-image"
            onMouseMove={(e) => {
              if (!previewRef.current) return;
              const rect = previewRef.current.getBoundingClientRect();
              const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
              const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
              setMagnifierPosition({ x, y });
            }}
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            onDoubleClick={() => setShowFullView(true)}
            style={{ cursor: 'zoom-in' }}
          >
            <div className="vsco-image-layers">
              {/* For clothing items - show clothing with design */}
              {previewItem && (
                <>
                  {/* Background Clothing */}
                  <div className="vsco-layer vsco-background-layer">
                    <img src={previewItem.image} alt={previewItem.name} />
                  </div>
                  
                  {/* Design on Clothing */}
                  {selectedDesignImageUrl && (
                    <div className="vsco-layer vsco-design-on-clothing">
                      <img src={selectedDesignImageUrl} alt="设计" />
                    </div>
                  )}
                </>
              )}
              
              
              {/* Magnifier */}
              {showMagnifier && !isCompactMode && previewItem && (
                <div 
                  className="vsco-magnifier"
                  style={{
                    backgroundImage: `url(${previewItem.image})`,
                    backgroundSize: '500%',
                    backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                    backgroundRepeat: 'no-repeat',
                    left: `${magnifierPosition.x}%`,
                    top: `${magnifierPosition.y}%`,
                    border: '4px solid #fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                  }}
                />
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
            
            <button 
              className="vsco-order-btn"
              onClick={() => handleProductSelect(previewItem)}
            >
              <ShoppingBag size={16} />
              立即预订
            </button>
          </div>
        )}
      </div>

      {/* Full View Modal */}
      {showFullView && (
        <div className="vsco-fullview-modal" onClick={() => setShowFullView(false)}>
          <button className="vsco-fullview-close" onClick={(e) => { e.stopPropagation(); setShowFullView(false); }}>
            <X size={24} />
          </button>
          <div className="vsco-fullview-content">
            {previewItem && (
              <>
                <img src={previewItem.image} alt={previewItem.name} className="vsco-fullview-bg" />
                {selectedDesignImageUrl && (
                  <img src={selectedDesignImageUrl} alt="设计" className="vsco-fullview-design" />
                )}
              </>
            )}
          </div>
        </div>
      )}

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
      </div>

      {/* Product Grid */}
      <div className="vsco-product-grid">
        {currentCategoryItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`vsco-product-card ${index === previewIndex ? 'previewing' : ''}`}
            onClick={() => {
              setPreviewIndex(index);
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
            <button 
              className="vsco-quick-order"
              onClick={(e) => {
                e.stopPropagation();
                handleProductSelect(item);
              }}
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Enhanced PreOrder Modal */}
      <EnhancedPreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        product={selectedProduct as any}
        designImageUrl={selectedDesignImageUrl}
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
          display: flex;
          flex-direction: column;
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
          width: ${isCompactMode ? '320px' : '550px'};
          height: ${isCompactMode ? '400px' : '650px'};
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
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
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

        .vsco-background-layer::after {
          content: '';
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${isCompactMode ? '74px' : '104px'};
          height: ${isCompactMode ? '74px' : '104px'};
          background: 
            radial-gradient(ellipse at center,
              rgba(0, 0, 0, 0.03) 0%,
              rgba(0, 0, 0, 0.01) 60%,
              transparent 100%);
          border-radius: 8px;
          z-index: 1.5;
          pointer-events: none;
        }

        .vsco-design-on-clothing {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${isCompactMode ? '70px' : '100px'};
          height: ${isCompactMode ? '70px' : '100px'};
          z-index: 2;
          filter: 
            drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))
            drop-shadow(0 0 0 rgba(0, 0, 0, 0));
        }

        .vsco-design-on-clothing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at center, 
              rgba(0, 0, 0, 0.02) 0%,
              rgba(0, 0, 0, 0.05) 70%,
              rgba(0, 0, 0, 0.08) 100%);
          border-radius: 6px;
          z-index: -1;
          transform: scale(1.05);
        }

        .vsco-design-on-clothing::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: 
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%,
              rgba(0, 0, 0, 0.05) 100%);
          border-radius: 7px;
          z-index: -1;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .vsco-design-in-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70%;
          height: 70%;
          z-index: 1;
          padding: 10%;
        }

        .vsco-frame-foreground {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .vsco-background-layer img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vsco-design-on-clothing img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .vsco-design-in-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .vsco-frame-foreground img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* New frame container styles */
        .vsco-frame-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vsco-frame-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 0;
        }

        .vsco-frame-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 68%;
          height: 54%;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .vsco-frame-content img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vsco-frame-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .vsco-frame-overlay img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* Magnifier styles */
        .vsco-magnifier {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          background-repeat: no-repeat;
          pointer-events: none;
          z-index: 100;
          transform: translate(-50%, -50%);
          backdrop-filter: blur(0px);
        }

        /* Full view modal styles */
        .vsco-fullview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .vsco-fullview-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1001;
          transition: all 0.2s ease;
        }

        .vsco-fullview-close:hover {
          background: #f0f0f0;
          transform: scale(1.1);
        }

        .vsco-fullview-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vsco-fullview-bg {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
        }

        .vsco-fullview-design {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 240px;
          height: 240px;
          object-fit: contain;
          border-radius: 12px;
          filter: 
            drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))
            drop-shadow(0 0 0 rgba(0, 0, 0, 0));
        }

        .vsco-fullview-design::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at center, 
              rgba(0, 0, 0, 0.02) 0%,
              rgba(0, 0, 0, 0.05) 70%,
              rgba(0, 0, 0, 0.08) 100%);
          border-radius: 12px;
          z-index: -1;
          transform: scale(1.03);
        }

        .vsco-fullview-design::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: 
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%,
              rgba(0, 0, 0, 0.05) 100%);
          border-radius: 14px;
          z-index: -1;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .vsco-fullview-frame {
          position: relative;
          width: 80vw;
          max-width: 800px;
          height: 60vh;
          max-height: 600px;
        }

        .vsco-fullview-frame-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 68%;
          height: 54%;
          object-fit: cover;
          z-index: 1;
        }

        .vsco-fullview-frame-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
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

        /* Portrait mobile screens - Full screen experience */
        @media (max-width: 480px) and (orientation: portrait) {
          .vsco-product-display {
            min-height: 100vh;
            height: 100vh;
            overflow-y: auto;
          }
          
          .vsco-main-preview {
            padding: 10px 15px 20px 15px;
          }
          
          .vsco-preview-image {
            width: 90vw;
            max-width: none;
            height: 45vh;
            min-height: 300px;
          }

          .vsco-design-on-clothing {
            width: 60px;
            height: 60px;
          }

          .vsco-preview-container {
            gap: 10px;
            padding: 0;
            margin-bottom: 15px;
          }
          
          .vsco-category-tabs {
            padding: 15px 10px;
          }

          .vsco-product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 15px 10px;
            padding-bottom: 30px;
          }
          
          .vsco-back-btn {
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            z-index: 1000 !important;
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px);
            padding: 8px 16px !important;
            margin: 0 !important;
            border-radius: 20px !important;
            font-size: 14px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
          }
        }

        /* Landscape mobile and tablets */
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

        /* Additional mobile portrait adjustments */
        @media (max-width: 480px) {
          .vsco-product-display {
            background: #fafafa;
          }
          
          .vsco-preview-image {
            width: 88vw;
            height: 42vh;
            min-height: 280px;
          }

          .vsco-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .vsco-preview-info {
            padding: 0 10px;
          }
          
          .vsco-order-btn {
            padding: 12px 24px;
            font-size: 14px;
          }
          
          /* Fix fullview on mobile */
          .vsco-fullview-modal {
            padding: 10px;
          }
          
          .vsco-fullview-content {
            width: 100%;
            height: 100%;
          }
          
          .vsco-fullview-bg {
            max-width: 95vw;
            max-height: 85vh;
          }
          
          .vsco-fullview-design {
            width: 30vw;
            min-width: 100px;
            max-width: 150px;
            height: 30vw;
            min-height: 100px;
            max-height: 150px;
          }
        }
        
        /* Ensure full viewport coverage on very small screens */
        @media (max-width: 375px) {
          .vsco-preview-image {
            width: 92vw;
            height: 40vh;
            min-height: 260px;
          }
        }
      `}</style>
    </div>
  );
}