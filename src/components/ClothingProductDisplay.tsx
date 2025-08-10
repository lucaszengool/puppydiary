'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { EnhancedPreOrderModal } from './EnhancedPreOrderModal';

interface ClothingProduct {
  id: string;
  name: string;
  type: '卫衣' | '短袖';
  price: number;
  image: string;
  sizes: {
    S: { height: string; chest: string };
    M: { height: string; chest: string };
    L: { height: string; chest: string };
    XL: { height: string; chest: string };
  };
  description: string;
}

const clothingProducts: ClothingProduct[] = [
  // 卫衣产品
  {
    id: 'hoodie-1',
    name: '经典连帽卫衣 - 款式1',
    type: '卫衣',
    price: 168,
    image: '/卫衣/31ec7bd89ff08b6d1d81bba77b44d3d2.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '舒适棉质，经典版型，适合休闲穿着'
  },
  {
    id: 'hoodie-2',
    name: '经典连帽卫衣 - 款式2',
    type: '卫衣',
    price: 168,
    image: '/卫衣/5684ce5c525e6ad1c9af443e2653e8d4.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '舒适棉质，经典版型，适合休闲穿着'
  },
  {
    id: 'hoodie-3',
    name: '经典连帽卫衣 - 款式3',
    type: '卫衣',
    price: 168,
    image: '/卫衣/826c7f376223c11a5d44adb95ceeaf6a.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '舒适棉质，经典版型，适合休闲穿着'
  },
  {
    id: 'hoodie-4',
    name: '经典连帽卫衣 - 款式4',
    type: '卫衣',
    price: 168,
    image: '/卫衣/926e055aa81bcd7681beffbcd82d2dd5.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '舒适棉质，经典版型，适合休闲穿着'
  },
  {
    id: 'hoodie-5',
    name: '经典连帽卫衣 - 款式5',
    type: '卫衣',
    price: 168,
    image: '/卫衣/df18d236e7e8b8b49f63fad744fed181.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '舒适棉质，经典版型，适合休闲穿着'
  },
  // 短袖产品
  {
    id: 'tshirt-1',
    name: '经典短袖T恤 - 款式1',
    type: '短袖',
    price: 88,
    image: '/短袖/612d2b25d4da872b0eb360603e26383d.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '纯棉材质，透气舒适，经典圆领设计'
  },
  {
    id: 'tshirt-2',
    name: '经典短袖T恤 - 款式2',
    type: '短袖',
    price: 88,
    image: '/短袖/6f6fe23689d18c3582267bd457c390d3.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '纯棉材质，透气舒适，经典圆领设计'
  },
  {
    id: 'tshirt-3',
    name: '经典短袖T恤 - 款式3',
    type: '短袖',
    price: 88,
    image: '/短袖/b81feb9703f09524b4cb09ae9acf8acd.jpg',
    sizes: {
      S: { height: '160-165cm', chest: '88-92cm' },
      M: { height: '165-170cm', chest: '92-96cm' },
      L: { height: '170-175cm', chest: '96-100cm' },
      XL: { height: '175-180cm', chest: '100-104cm' }
    },
    description: '纯棉材质，透气舒适，经典圆领设计'
  }
];

interface ClothingProductDisplayProps {
  selectedDesignImageUrl?: string;
  frameImage?: string;
}

export function ClothingProductDisplay({ selectedDesignImageUrl, frameImage = '/相框/相框1.png' }: ClothingProductDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<'卫衣' | '短袖'>('卫衣');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ClothingProduct | null>(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const currentProducts = clothingProducts.filter(product => product.type === selectedCategory);
  const currentProduct = currentProducts[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? currentProducts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === currentProducts.length - 1 ? 0 : prev + 1));
  };

  const handleCategoryChange = (category: '卫衣' | '短袖') => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  const handlePreOrder = (product: ClothingProduct) => {
    setSelectedProduct(product);
    setShowPreOrderModal(true);
  };

  return (
    <div className="clothing-product-display">
      {/* Category Selector */}
      <div className="category-selector">
        <button 
          className={`category-btn ${selectedCategory === '卫衣' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('卫衣')}
        >
          卫衣
        </button>
        <button 
          className={`category-btn ${selectedCategory === '短袖' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('短袖')}
        >
          短袖
        </button>
      </div>

      {/* Product Preview */}
      <div className="product-preview-container">
        <div className="product-navigation">
          <button 
            onClick={handlePrevious}
            className="nav-btn nav-prev"
            disabled={currentProducts.length <= 1}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="product-preview">
            {/* Frame */}
            <div className="frame-container">
              <img src={frameImage} alt="相框" className="frame-image" />
            </div>

            {/* Clothing Background */}
            <div className="clothing-background">
              <img src={currentProduct.image} alt={currentProduct.name} className="clothing-image" />
            </div>

            {/* User Design Overlay */}
            {selectedDesignImageUrl && (
              <div className="design-overlay">
                <img src={selectedDesignImageUrl} alt="设计" className="design-image" />
              </div>
            )}
          </div>

          <button 
            onClick={handleNext}
            className="nav-btn nav-next"
            disabled={currentProducts.length <= 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{currentProduct.name}</h3>
          <p className="product-description">{currentProduct.description}</p>
          <div className="product-price">¥{currentProduct.price}</div>
          
          <button 
            className="preorder-btn"
            onClick={() => handlePreOrder(currentProduct)}
          >
            <ShoppingBag size={16} />
            立即预订
          </button>
        </div>

        {/* Style Indicators */}
        {currentProducts.length > 1 && (
          <div className="style-indicators">
            {currentProducts.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced PreOrder Modal */}
      <EnhancedPreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        product={selectedProduct}
        designImageUrl={selectedDesignImageUrl}
        frameImage={frameImage}
      />

      <style jsx>{`
        .clothing-product-display {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .category-selector {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .category-btn {
          padding: 12px 24px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn.active {
          border-color: #000;
          background: #000;
          color: white;
        }

        .category-btn:hover:not(.active) {
          border-color: #999;
        }

        .product-preview-container {
          text-align: center;
        }

        .product-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .nav-btn {
          width: 50px;
          height: 50px;
          border: 2px solid #e0e0e0;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn:hover:not(:disabled) {
          border-color: #000;
          background: #f5f5f5;
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .product-preview {
          position: relative;
          width: 400px;
          height: 500px;
          margin: 0 auto;
        }

        .frame-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }

        .frame-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .clothing-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .clothing-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .design-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .design-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .product-info {
          margin-top: 30px;
        }

        .product-name {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 10px 0;
          color: #333;
        }

        .product-description {
          font-size: 16px;
          color: #666;
          margin: 0 0 15px 0;
        }

        .product-price {
          font-size: 28px;
          font-weight: 700;
          color: #000;
          margin: 15px 0 25px 0;
        }

        .preorder-btn {
          background: #000;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .preorder-btn:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .style-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #000;
        }

        .indicator:hover:not(.active) {
          background: #999;
        }

        @media (max-width: 600px) {
          .product-preview {
            width: 300px;
            height: 375px;
          }

          .design-overlay {
            width: 150px;
            height: 150px;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}