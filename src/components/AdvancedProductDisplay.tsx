'use client';

import { useState, useEffect } from 'react';
import { 
  productCategories, 
  ProductCategory, 
  ProductStyle, 
  ProductSize,
  AdvancedMockupGenerator,
  recommendSizeByHeight
} from '@/lib/product-system';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Download, 
  Sparkles,
  Package,
  Ruler,
  Heart,
  Star
} from 'lucide-react';

interface ProductDisplayProps {
  designImageUrl: string;
  onDownload?: (mockupUrl: string, productName: string, styleName: string) => void;
  onPreOrder?: (category: ProductCategory, style: ProductStyle, size: ProductSize) => void;
}

interface ProductMockup {
  category: ProductCategory;
  styleIndex: number;
  angleIndex: number;
  mockups: { [styleId: string]: { [angleIndex: number]: string } };
}

export function AdvancedProductDisplay({ 
  designImageUrl, 
  onDownload, 
  onPreOrder 
}: ProductDisplayProps) {
  const [productMockups, setProductMockups] = useState<ProductMockup[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [generator] = useState(() => new AdvancedMockupGenerator());
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    category: ProductCategory;
    style: ProductStyle;
  } | null>(null);

  useEffect(() => {
    generateAllMockups();
  }, [designImageUrl]);

  const generateAllMockups = async () => {
    if (!designImageUrl) return;
    
    setLoading(true);
    try {
      const mockups: ProductMockup[] = [];
      
      for (const category of productCategories) {
        const categoryMockups: ProductMockup = {
          category,
          styleIndex: 0,
          angleIndex: 0,
          mockups: {}
        };
        
        // Generate mockups for each style and angle
        for (let styleIndex = 0; styleIndex < category.styles.length; styleIndex++) {
          const style = category.styles[styleIndex];
          categoryMockups.mockups[style.id] = {};
          
          for (let angleIndex = 0; angleIndex < style.templateImages.length; angleIndex++) {
            try {
              const mockupUrl = await generator.generateMockup(designImageUrl, style, angleIndex);
              categoryMockups.mockups[style.id][angleIndex] = mockupUrl;
            } catch (error) {
              console.error(`Failed to generate mockup for ${style.id} angle ${angleIndex}:`, error);
              // Use placeholder for failed mockups
              categoryMockups.mockups[style.id][angleIndex] = createPlaceholderImage(category.name, style.name);
            }
          }
        }
        
        mockups.push(categoryMockups);
      }
      
      setProductMockups(mockups);
    } catch (error) {
      console.error('Error generating mockups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaceholderImage = (categoryName: string, styleName: string): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 400;
    canvas.height = 400;
    
    // Placeholder background
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);
    
    // Text
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(categoryName, 200, 180);
    ctx.font = '16px Arial';
    ctx.fillText(styleName, 200, 210);
    ctx.fillText('模板加载中...', 200, 240);
    
    return canvas.toDataURL('image/png');
  };

  const changeStyle = (categoryIndex: number, direction: 'prev' | 'next') => {
    setProductMockups(prev => prev.map((mockup, index) => {
      if (index === categoryIndex) {
        const maxStyles = mockup.category.styles.length;
        const newStyleIndex = direction === 'next' 
          ? (mockup.styleIndex + 1) % maxStyles
          : (mockup.styleIndex - 1 + maxStyles) % maxStyles;
        
        return { ...mockup, styleIndex: newStyleIndex };
      }
      return mockup;
    }));
  };

  const changeAngle = (categoryIndex: number) => {
    setProductMockups(prev => prev.map((mockup, index) => {
      if (index === categoryIndex) {
        const currentStyle = mockup.category.styles[mockup.styleIndex];
        const maxAngles = currentStyle.templateImages.length;
        const newAngleIndex = (mockup.angleIndex + 1) % maxAngles;
        
        return { ...mockup, angleIndex: newAngleIndex };
      }
      return mockup;
    }));
  };

  const handlePreOrder = (category: ProductCategory, styleIndex: number) => {
    const style = category.styles[styleIndex];
    setSelectedProduct({ category, style });
    setShowPreOrderModal(true);
  };

  const handleDownload = (categoryIndex: number) => {
    const mockup = productMockups[categoryIndex];
    const currentStyle = mockup.category.styles[mockup.styleIndex];
    const mockupUrl = mockup.mockups[currentStyle.id]?.[mockup.angleIndex];
    
    if (mockupUrl && onDownload) {
      onDownload(mockupUrl, mockup.category.name, currentStyle.name);
    }
  };

  if (loading) {
    return (
      <div className="advanced-product-loading">
        <div className="loading-container">
          <Sparkles className="loading-icon animate-spin" size={48} />
          <h3 className="loading-title">正在为您生成专属预览</h3>
          <p className="loading-subtitle">AI正在处理您的设计，请稍候...</p>
        </div>
      </div>
    );
  }

  if (productMockups.length === 0) return null;

  return (
    <>
      <div className="advanced-product-display">
        {/* Header */}
        <div className="display-header">
          <div className="header-content">
            <Package className="header-icon" />
            <div>
              <h2 className="display-title">产品预览</h2>
              <p className="display-subtitle">选择您喜欢的款式和尺寸</p>
            </div>
          </div>
          
          {/* Category Navigation */}
          <div className="category-nav">
            {productCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setCurrentCategoryIndex(index)}
                className={`category-tab ${index === currentCategoryIndex ? 'active' : ''}`}
              >
                <span className="tab-name">{category.name}</span>
                <span className="tab-price">¥{category.basePrice}起</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Display Grid */}
        <div className="product-grid">
          {productMockups.map((mockup, categoryIndex) => {
            const currentStyle = mockup.category.styles[mockup.styleIndex];
            const mockupUrl = mockup.mockups[currentStyle.id]?.[mockup.angleIndex];
            const isActive = categoryIndex === currentCategoryIndex;
            
            if (!isActive) return null;

            return (
              <div key={mockup.category.id} className="product-card">
                {/* Product Image Section */}
                <div className="product-image-section">
                  <div className="image-container">
                    <img 
                      src={mockupUrl}
                      alt={`${mockup.category.name} - ${currentStyle.name}`}
                      className="product-image"
                      onClick={() => changeAngle(categoryIndex)}
                    />
                    
                    {/* Image Overlays */}
                    <div className="image-overlays">
                      <div className="angle-indicator">
                        角度 {mockup.angleIndex + 1}/{currentStyle.templateImages.length}
                      </div>
                      <div className="click-hint">点击切换角度</div>
                    </div>

                    {/* Style Navigation */}
                    <div className="style-navigation">
                      <button
                        onClick={() => changeStyle(categoryIndex, 'prev')}
                        className="style-nav-btn prev"
                        disabled={mockup.category.styles.length <= 1}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => changeStyle(categoryIndex, 'next')}
                        className="style-nav-btn next"
                        disabled={mockup.category.styles.length <= 1}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Style Indicators */}
                  {mockup.category.styles.length > 1 && (
                    <div className="style-indicators">
                      {mockup.category.styles.map((_, styleIndex) => (
                        <div
                          key={styleIndex}
                          className={`style-indicator ${styleIndex === mockup.styleIndex ? 'active' : ''}`}
                          onClick={() => setProductMockups(prev => prev.map((m, i) => 
                            i === categoryIndex ? { ...m, styleIndex } : m
                          ))}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info Section */}
                <div className="product-info-section">
                  <div className="product-header">
                    <div className="product-title">
                      <h3 className="category-name">{mockup.category.name}</h3>
                      <h4 className="style-name">{currentStyle.name}</h4>
                    </div>
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="star filled" />
                        ))}
                      </div>
                      <span className="rating-text">4.9</span>
                    </div>
                  </div>

                  <p className="style-description">{currentStyle.description}</p>

                  {/* Size Preview */}
                  <div className="size-preview">
                    <div className="size-header">
                      <Ruler size={16} />
                      <span>尺寸选择</span>
                    </div>
                    <div className="size-grid">
                      {mockup.category.sizes.slice(0, 3).map((size) => (
                        <div key={size.id} className="size-preview-item">
                          <span className="size-name">{size.name}</span>
                          <span className="size-height">{size.heightRange}</span>
                          <span className="size-price">¥{size.price}</span>
                        </div>
                      ))}
                      {mockup.category.sizes.length > 3 && (
                        <div className="size-more">+{mockup.category.sizes.length - 3}种</div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="product-features">
                    <div className="feature">
                      <Sparkles size={14} />
                      <span>高清印刷</span>
                    </div>
                    <div className="feature">
                      <Heart size={14} />
                      <span>精选材质</span>
                    </div>
                    <div className="feature">
                      <Package size={14} />
                      <span>快速发货</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => handleDownload(categoryIndex)}
                      className="download-btn"
                    >
                      <Download size={16} />
                      下载预览
                    </button>
                    <button
                      onClick={() => handlePreOrder(mockup.category, mockup.styleIndex)}
                      className="preorder-btn"
                    >
                      <ShoppingBag size={16} />
                      立即预订
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-order Modal */}
      {showPreOrderModal && selectedProduct && (
        <PreOrderModal
          category={selectedProduct.category}
          style={selectedProduct.style}
          onClose={() => setShowPreOrderModal(false)}
          onOrder={onPreOrder}
        />
      )}

      <style jsx>{`
        .advanced-product-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
        }

        .loading-container {
          text-align: center;
        }

        .loading-icon {
          color: #6366f1;
          margin-bottom: 20px;
        }

        .loading-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .loading-subtitle {
          color: #6b7280;
          font-size: 16px;
        }

        .advanced-product-display {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
        }

        .display-header {
          background: white;
          padding: 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .header-icon {
          color: #6366f1;
          font-size: 32px;
        }

        .display-title {
          font-size: 28px;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
        }

        .display-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 16px;
        }

        .category-nav {
          display: flex;
          gap: 12px;
        }

        .category-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 24px;
          background: transparent;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .category-tab.active {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-color: #6366f1;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .category-tab:hover:not(.active) {
          border-color: #6366f1;
          transform: translateY(-1px);
        }

        .tab-name {
          font-weight: 600;
          font-size: 16px;
        }

        .tab-price {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 4px;
        }

        .product-grid {
          padding: 40px;
        }

        .product-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .product-card {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .product-image-section {
          position: relative;
        }

        .image-container {
          position: relative;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .image-container:hover {
          transform: scale(1.02);
        }

        .product-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .image-overlays {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .angle-indicator {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .click-hint {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 15px;
          font-size: 12px;
        }

        .style-navigation {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          pointer-events: none;
        }

        .style-nav-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .style-nav-btn:hover:not(:disabled) {
          background: #6366f1;
          color: white;
          transform: scale(1.1);
        }

        .style-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .style-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .style-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .style-indicator.active {
          background: #6366f1;
          transform: scale(1.3);
        }

        .style-indicator:hover {
          background: #6366f1;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .category-name {
          font-size: 32px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .style-name {
          font-size: 20px;
          font-weight: 600;
          color: #6366f1;
          margin: 0;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #fbbf24;
        }

        .rating-text {
          font-weight: 600;
          color: #1f2937;
        }

        .style-description {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }

        .size-preview {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
        }

        .size-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-weight: 600;
          color: #374151;
        }

        .size-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .size-preview-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: white;
          border-radius: 12px;
          text-align: center;
        }

        .size-name {
          font-weight: 600;
          color: #1f2937;
        }

        .size-height {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0;
        }

        .size-price {
          font-weight: 600;
          color: #dc2626;
          font-size: 14px;
        }

        .size-more {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          border-radius: 12px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .product-features {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
        }

        .download-btn, .preorder-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          flex: 1;
        }

        .download-btn {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          color: #374151;
        }

        .download-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .preorder-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: 2px solid #6366f1;
          color: white;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .preorder-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </>
  );
}

// Pre-order Modal Component
function PreOrderModal({ 
  category, 
  style, 
  onClose, 
  onOrder 
}: {
  category: ProductCategory;
  style: ProductStyle;
  onClose: () => void;
  onOrder?: (category: ProductCategory, style: ProductStyle, size: ProductSize) => void;
}) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(category.sizes[0]);
  const [userHeight, setUserHeight] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<ProductSize | null>(null);

  useEffect(() => {
    if (userHeight) {
      const height = parseInt(userHeight);
      if (height >= 140 && height <= 220) {
        const recommended = recommendSizeByHeight(height, category.sizes);
        setRecommendedSize(recommended);
        if (recommended) {
          setSelectedSize(recommended);
        }
      }
    }
  }, [userHeight, category.sizes]);

  const handleOrder = () => {
    if (onOrder) {
      onOrder(category, style, selectedSize);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">选择尺寸</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="product-summary">
            <h4>{category.name} - {style.name}</h4>
            <p>{style.description}</p>
          </div>

          {/* Height Input */}
          <div className="height-section">
            <label htmlFor="height">您的身高 (cm)</label>
            <input
              id="height"
              type="number"
              value={userHeight}
              onChange={(e) => setUserHeight(e.target.value)}
              placeholder="请输入身高"
              min="140"
              max="220"
            />
            {recommendedSize && (
              <p className="recommendation">
                推荐尺码: <strong>{recommendedSize.name}</strong>
              </p>
            )}
          </div>

          {/* Size Selection */}
          <div className="size-section">
            <h5>选择尺码</h5>
            <div className="size-options">
              {category.sizes.map((size) => (
                <div
                  key={size.id}
                  className={`size-option ${selectedSize.id === size.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  <div className="size-name">{size.name}</div>
                  <div className="size-height">{size.heightRange}</div>
                  <div className="size-measurements">
                    <div>{size.measurements.chest}</div>
                    {size.measurements.length && <div>长度: {size.measurements.length}</div>}
                  </div>
                  <div className="size-price">¥{size.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">取消</button>
          <button onClick={handleOrder} className="order-btn">
            确认预订 - ¥{selectedSize.price}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-body {
          padding: 24px;
        }

        .product-summary {
          margin-bottom: 24px;
        }

        .product-summary h4 {
          font-size: 20px;
          margin: 0 0 8px 0;
        }

        .product-summary p {
          color: #6b7280;
          margin: 0;
        }

        .height-section {
          margin-bottom: 24px;
        }

        .height-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .height-section input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
        }

        .recommendation {
          margin-top: 8px;
          color: #6366f1;
          font-weight: 500;
        }

        .size-section h5 {
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }

        .size-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .size-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .size-option.selected {
          border-color: #6366f1;
          background: #f0f7ff;
        }

        .size-option:hover {
          border-color: #6366f1;
        }

        .size-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .size-height {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .size-measurements {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .size-price {
          font-weight: 600;
          color: #dc2626;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-btn, .order-btn {
          flex: 1;
          padding: 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          color: #374151;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .order-btn {
          background: #6366f1;
          border: 2px solid #6366f1;
          color: white;
        }

        .order-btn:hover {
          background: #5b5ff1;
        }
      `}</style>
    </div>
  );
}