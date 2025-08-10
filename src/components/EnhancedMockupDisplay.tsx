'use client';

import { useState, useEffect, useRef } from 'react';
import { MockupGenerator, products, ProductInfoExtended, ProductSize } from '@/lib/mockup-generator';
import { Download, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Package } from 'lucide-react';
import { PreOrderModal } from './PreOrderModal';

interface MockupDisplayProps {
  designImageUrl: string;
  onDownload?: (mockupUrl: string, templateName: string) => void;
}

interface ProductMockup {
  product: ProductInfoExtended;
  mockups: { templateId: string; mockupUrl: string }[];
  currentAngle: number;
  selectedSize?: ProductSize;
}

export function EnhancedMockupDisplay({ designImageUrl, onDownload }: MockupDisplayProps) {
  const [productMockups, setProductMockups] = useState<ProductMockup[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfoExtended | null>(null);
  const [generator] = useState(() => new MockupGenerator());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateAllMockups();
  }, [designImageUrl]);

  const generateAllMockups = async () => {
    if (!designImageUrl) return;
    
    setLoading(true);
    try {
      const productMockups: ProductMockup[] = [];
      
      for (const product of products) {
        const mockups = await Promise.all(
          product.angles.map(async (template) => ({
            templateId: template.id,
            mockupUrl: await generator.generateMockup(designImageUrl, template)
          }))
        );
        
        productMockups.push({
          product,
          mockups,
          currentAngle: 0,
          selectedSize: product.sizes?.[0] // 默认选择第一个尺寸
        });
      }
      
      setProductMockups(productMockups);
    } catch (error) {
      console.error('Error generating mockups:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedSize = (productIndex: number, size: ProductSize) => {
    setProductMockups(prev => prev.map((pm, i) => 
      i === productIndex ? { ...pm, selectedSize: size } : pm
    ));
  };

  const scrollToProduct = (index: number) => {
    setCurrentProductIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = index * container.clientWidth;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const nextAngle = (productIndex: number) => {
    setProductMockups(prev => prev.map((pm, i) => 
      i === productIndex 
        ? { ...pm, currentAngle: (pm.currentAngle + 1) % pm.mockups.length }
        : pm
    ));
  };

  const handlePreOrder = (productMockup: ProductMockup) => {
    setSelectedProduct(productMockup.product);
    setShowPreOrder(true);
  };

  const handleDownload = (mockupUrl: string, templateName: string) => {
    if (onDownload) {
      onDownload(mockupUrl, templateName);
    } else {
      const link = document.createElement('a');
      link.href = mockupUrl;
      link.download = `mockup-${templateName}-${Date.now()}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="enhanced-mockup-container">
        <div className="enhanced-loading">
          <div className="loading-spinner">
            <Sparkles className="animate-spin" size={40} />
          </div>
          <p className="loading-text">正在生成您的专属预览...</p>
        </div>
      </div>
    );
  }

  if (productMockups.length === 0) return null;

  return (
    <>
      <div className="enhanced-mockup-container">
        {/* Header */}
        <div className="mockup-header">
          <h3 className="mockup-title">
            <Package className="title-icon" />
            产品预览
          </h3>
          <div className="product-tabs">
            {productMockups.map((pm, index) => (
              <button
                key={pm.product.id}
                onClick={() => scrollToProduct(index)}
                className={`product-tab ${index === currentProductIndex ? 'active' : ''}`}
              >
                {pm.product.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Display */}
        <div 
          ref={scrollContainerRef}
          className="mockup-scroll-container"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const containerWidth = e.currentTarget.clientWidth;
            const newIndex = Math.round(scrollLeft / containerWidth);
            if (newIndex !== currentProductIndex) {
              setCurrentProductIndex(newIndex);
            }
          }}
        >
          {productMockups.map((productMockup, productIndex) => {
            const currentMockup = productMockup.mockups[productMockup.currentAngle];
            const currentTemplate = productMockup.product.angles[productMockup.currentAngle];
            const selectedSize = productMockup.selectedSize;

            return (
              <div key={productMockup.product.id} className="mockup-slide">
                <div className="mockup-content">
                  {/* Product Image */}
                  <div className="mockup-image-container">
                    <div 
                      className="mockup-image"
                      onClick={() => nextAngle(productIndex)}
                    >
                      <img 
                        src={currentMockup?.mockupUrl}
                        alt={currentTemplate?.name}
                        className="product-image"
                      />
                      <div className="angle-indicator">
                        {currentTemplate?.name}
                      </div>
                      <div className="click-hint">点击切换视角</div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <div className="product-header">
                      <h4 className="product-name">{productMockup.product.name}</h4>
                      <div className="product-price">
                        ¥{selectedSize?.price || productMockup.product.price}
                      </div>
                    </div>

                    {/* Size Selection */}
                    {productMockup.product.sizes && (
                      <div className="size-selection">
                        <label className="size-label">尺寸选择</label>
                        <div className="size-options">
                          {productMockup.product.sizes.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => updateSelectedSize(productIndex, size)}
                              className={`size-option ${selectedSize?.id === size.id ? 'selected' : ''}`}
                            >
                              <span className="size-name">{size.name}</span>
                              <span className="size-price">¥{size.price}</span>
                              {size.dimensions && (
                                <span className="size-dimensions">{size.dimensions}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button
                        onClick={() => handleDownload(currentMockup?.mockupUrl, currentTemplate?.name)}
                        className="download-btn"
                      >
                        <Download size={16} />
                        下载预览
                      </button>
                      <button
                        onClick={() => handlePreOrder(productMockup)}
                        className="preorder-btn"
                      >
                        <ShoppingBag size={16} />
                        立即预订
                      </button>
                    </div>

                    {/* Product Features */}
                    <div className="product-features">
                      <div className="feature">
                        <Sparkles size={14} />
                        <span>高清印刷</span>
                      </div>
                      <div className="feature">
                        <Package size={14} />
                        <span>精美包装</span>
                      </div>
                      <div className="feature">
                        <span>🚚</span>
                        <span>7天发货</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {productMockups.length > 1 && (
          <>
            <button
              onClick={() => scrollToProduct((currentProductIndex - 1 + productMockups.length) % productMockups.length)}
              className="nav-arrow nav-left"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scrollToProduct((currentProductIndex + 1) % productMockups.length)}
              className="nav-arrow nav-right"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Product Indicators */}
        <div className="product-indicators">
          {productMockups.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToProduct(index)}
              className={`indicator ${index === currentProductIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <PreOrderModal 
        isOpen={showPreOrder}
        onClose={() => setShowPreOrder(false)}
        product={selectedProduct}
        mockupUrl={selectedProduct ? productMockups.find(pm => pm.product.id === selectedProduct.id)?.mockups[0]?.mockupUrl : undefined}
      />

      <style jsx>{`
        .enhanced-mockup-container {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .enhanced-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 20px;
        }

        .loading-spinner {
          color: #6366f1;
        }

        .loading-text {
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }

        .mockup-header {
          padding: 30px 30px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }

        .mockup-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .title-icon {
          color: #6366f1;
        }

        .product-tabs {
          display: flex;
          gap: 8px;
        }

        .product-tab {
          padding: 10px 20px;
          background: transparent;
          border: 2px solid #e5e7eb;
          border-radius: 25px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .product-tab.active {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }

        .product-tab:hover:not(.active) {
          border-color: #6366f1;
          color: #6366f1;
        }

        .mockup-scroll-container {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }

        .mockup-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .mockup-slide {
          flex: 0 0 100%;
          scroll-snap-align: start;
          padding: 30px;
        }

        .mockup-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .mockup-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .mockup-image-container {
          position: relative;
        }

        .mockup-image {
          position: relative;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .mockup-image:hover {
          transform: scale(1.02);
        }

        .product-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .angle-indicator {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .click-hint {
          position: absolute;
          bottom: 15px;
          right: 15px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          padding: 6px 10px;
          border-radius: 15px;
          font-size: 11px;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-name {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .product-price {
          font-size: 24px;
          font-weight: 700;
          color: #dc2626;
        }

        .size-selection {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .size-label {
          font-weight: 600;
          color: #374151;
          font-size: 16px;
        }

        .size-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .size-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
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
          color: #1f2937;
        }

        .size-price {
          font-size: 14px;
          color: #dc2626;
          font-weight: 500;
        }

        .size-dimensions {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .download-btn, .preorder-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          flex: 1;
          justify-content: center;
        }

        .download-btn {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          color: #374151;
        }

        .download-btn:hover {
          background: #e5e7eb;
        }

        .preorder-btn {
          background: #6366f1;
          border: 2px solid #6366f1;
          color: white;
        }

        .preorder-btn:hover {
          background: #5b5ff1;
        }

        .product-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          z-index: 10;
        }

        .nav-arrow:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-50%) scale(1.1);
        }

        .nav-left {
          left: 20px;
        }

        .nav-right {
          right: 20px;
        }

        .product-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 20px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #6366f1;
          transform: scale(1.2);
        }
      `}</style>
    </>
  );
}