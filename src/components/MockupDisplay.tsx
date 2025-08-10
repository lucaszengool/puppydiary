'use client';

import { useState, useEffect, useRef } from 'react';
import { MockupGenerator, products, ProductInfoExtended, ProductSize } from '@/lib/mockup-generator';
import { Download, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
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

export function MockupDisplay({ designImageUrl, onDownload }: MockupDisplayProps) {
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
          currentAngle: 0
        });
      }
      
      setProductMockups(productMockups);
    } catch (error) {
      console.error('Error generating mockups:', error);
    } finally {
      setLoading(false);
    }
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

  const scrollToProduct = (index: number) => {
    setCurrentProductIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = index * container.clientWidth;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const nextProduct = () => {
    const nextIndex = (currentProductIndex + 1) % productMockups.length;
    scrollToProduct(nextIndex);
  };

  const prevProduct = () => {
    const prevIndex = (currentProductIndex - 1 + productMockups.length) % productMockups.length;
    scrollToProduct(prevIndex);
  };

  const nextAngle = (productIndex: number) => {
    setProductMockups(prev => prev.map((pm, i) => 
      i === productIndex 
        ? { ...pm, currentAngle: (pm.currentAngle + 1) % pm.mockups.length }
        : pm
    ));
  };

  const handlePreOrder = (product: ProductInfo) => {
    setSelectedProduct(product);
    setShowPreOrder(true);
  };

  if (loading) {
    return (
      <div className="vsco-mockup-container">
        <div className="vsco-mockup-loading">
          <div className="vsco-loading-dot"></div>
          <div className="vsco-loading-dot"></div>
          <div className="vsco-loading-dot"></div>
        </div>
      </div>
    );
  }

  if (productMockups.length === 0) return null;

  return (
    <>
      <div className="vsco-mockup-container">
        {/* Main Display */}
        <div 
          ref={scrollContainerRef}
          className="vsco-mockup-scroll"
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

            return (
              <div key={productMockup.product.id} className="vsco-mockup-slide">
                <div 
                  className="vsco-mockup-image"
                  onClick={() => nextAngle(productIndex)}
                >
                  <img
                    src={currentMockup.mockupUrl}
                    alt={currentTemplate.name}
                    className="vsco-mockup-img"
                  />
                  
                  {/* Angle indicator */}
                  <div className="vsco-angle-indicator">
                    {productMockup.mockups.map((_, angleIndex) => (
                      <div
                        key={angleIndex}
                        className={`vsco-angle-dot ${angleIndex === productMockup.currentAngle ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="vsco-product-info">
                  <div className="vsco-product-header">
                    <span className="vsco-product-name">{productMockup.product.name}</span>
                    <span className="vsco-product-price">¥{productMockup.product.price}</span>
                  </div>
                  
                  <div className="vsco-product-actions">
                    <button
                      onClick={() => handleDownload(currentMockup.mockupUrl, currentTemplate.name)}
                      className="vsco-action-btn"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handlePreOrder(productMockup.product)}
                      className="vsco-preorder-btn"
                    >
                      <ShoppingBag size={16} />
                      预订
                    </button>
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
              onClick={prevProduct}
              className="vsco-nav-btn vsco-nav-prev"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextProduct}
              className="vsco-nav-btn vsco-nav-next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Product Dots Indicator */}
        {productMockups.length > 1 && (
          <div className="vsco-mockup-dots">
            {productMockups.map((pm, index) => (
              <button
                key={pm.product.id}
                onClick={() => scrollToProduct(index)}
                className={`vsco-dot ${index === currentProductIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pre-order Modal */}
      <PreOrderModal 
        isOpen={showPreOrder}
        onClose={() => setShowPreOrder(false)}
        product={selectedProduct}
        designImageUrl={designImageUrl}
      />
    </>
  );
}