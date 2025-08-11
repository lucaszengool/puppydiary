'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@clerk/nextjs';
import { X, ShoppingBag, User, Mail, Phone, MapPin, Ruler } from 'lucide-react';

// 添加全局样式
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modalScale {
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

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

interface EnhancedPreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ClothingProduct | null;
  designImageUrl?: string;
  frameImage?: string;
}

interface PreOrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  size: 'S' | 'M' | 'L' | 'XL' | '';
  height: string;
}

export function EnhancedPreOrderModal({ isOpen, onClose, product, designImageUrl, frameImage }: EnhancedPreOrderModalProps) {
  const { userId } = useAuth();
  const [form, setForm] = useState<PreOrderForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    size: '',
    height: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !form.size) return;

    setLoading(true);
    try {
      const response = await fetch('/api/enhanced-preorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productType: product.type,
          size: form.size,
          price: product.price,
          designImageUrl,
          frameImage,
          customerInfo: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            height: form.height
          },
          userId: userId || null
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          resetForm();
        }, 3000);
      } else {
        throw new Error('Failed to submit pre-order');
      }
    } catch (error) {
      console.error('Pre-order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      size: '',
      height: ''
    });
  };

  const updateForm = (field: keyof PreOrderForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const recommendSize = (height: number): 'S' | 'M' | 'L' | 'XL' => {
    if (height <= 165) return 'S';
    if (height <= 170) return 'M';
    if (height <= 175) return 'L';
    return 'XL';
  };

  const handleHeightChange = (height: string) => {
    updateForm('height', height);
    const numHeight = parseInt(height);
    if (!isNaN(numHeight)) {
      const recommended = recommendSize(numHeight);
      updateForm('size', recommended);
    }
  };

  if (!isOpen || !product || typeof window === 'undefined') return null;

  if (success) {
    return createPortal(
      <div 
        className="enhanced-modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
      >
        <div 
          className="enhanced-modal enhanced-success-modal"
          style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            animation: 'modalScale 0.3s ease',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="enhanced-success-content">
            <div className="enhanced-success-icon">✓</div>
            <h3 className="enhanced-success-title">预订成功！</h3>
            <p className="enhanced-success-message">
              感谢您预订 {product.name} ({form.size}码)！
              <br />
              我们已收到您的订单信息，确认邮件已发送至您的邮箱。
              <br />
              <br />
              我们会在产品准备就绪后第一时间通知您！
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      className="enhanced-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div 
        className="enhanced-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'modalScale 0.3s ease',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="enhanced-modal-header">
          <h3 className="enhanced-modal-title">
            预订 {product.name}
          </h3>
          <button onClick={onClose} className="enhanced-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="enhanced-modal-content">
          {/* Product Preview */}
          <div className="enhanced-order-preview">
            <div className="enhanced-preview-image">
              <div className="preview-container">
                {frameImage && (
                  <div className="preview-frame">
                    <img src={frameImage} alt="相框" />
                  </div>
                )}
                <div className="preview-clothing">
                  <img src={product.image} alt={product.name} />
                </div>
                {designImageUrl && (
                  <div className="preview-design">
                    <img src={designImageUrl} alt="设计" />
                  </div>
                )}
              </div>
            </div>
            <div className="enhanced-preview-info">
              <span className="enhanced-preview-name">{product.name}</span>
              <span className="enhanced-preview-price">¥{product.price}</span>
              <span className="enhanced-preview-type">{product.type}</span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="size-selection-section">
            <h4 className="section-title">
              <Ruler size={16} />
              尺码选择
            </h4>
            
            {/* Height Input */}
            <div className="height-input-group">
              <label>您的身高 (cm)</label>
              <input
                type="number"
                placeholder="例如: 170"
                value={form.height}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="height-input"
                min="150"
                max="200"
              />
            </div>

            {/* Size Options */}
            <div className="size-options">
              {Object.entries(product.sizes).map(([size, measurements]) => (
                <button
                  key={size}
                  type="button"
                  className={`size-option ${form.size === size ? 'selected' : ''}`}
                  onClick={() => updateForm('size', size as 'S' | 'M' | 'L' | 'XL')}
                >
                  <div className="size-label">{size}</div>
                  <div className="size-measurements">
                    <div>身高: {measurements.height}</div>
                    <div>胸围: {measurements.chest}</div>
                  </div>
                </button>
              ))}
            </div>

            {form.height && form.size && (
              <div className="size-recommendation">
                {parseInt(form.height) >= 160 && parseInt(form.height) <= 180 ? (
                  <span className="recommendation-good">
                    ✓ 根据您的身高，推荐选择 {form.size} 码
                  </span>
                ) : (
                  <span className="recommendation-warning">
                    ⚠️ 请确认尺码是否合适
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pre-order Notice */}
          <div className="enhanced-preorder-notice">
            <ShoppingBag size={16} />
            <span>这是预售商品，我们会在准备就绪后通知您</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="enhanced-order-form">
            <div className="enhanced-form-group">
              <div className="enhanced-input-wrapper">
                <User size={16} className="enhanced-input-icon" />
                <input
                  type="text"
                  placeholder="姓名"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  required
                  className="enhanced-input"
                />
              </div>
            </div>

            <div className="enhanced-form-group">
              <div className="enhanced-input-wrapper">
                <Mail size={16} className="enhanced-input-icon" />
                <input
                  type="email"
                  placeholder="邮箱地址"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  required
                  className="enhanced-input"
                />
              </div>
            </div>

            <div className="enhanced-form-group">
              <div className="enhanced-input-wrapper">
                <Phone size={16} className="enhanced-input-icon" />
                <input
                  type="tel"
                  placeholder="联系电话"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  required
                  className="enhanced-input"
                />
              </div>
            </div>

            <div className="enhanced-form-group">
              <div className="enhanced-input-wrapper">
                <MapPin size={16} className="enhanced-input-icon" />
                <textarea
                  placeholder="收货地址"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  required
                  rows={3}
                  className="enhanced-textarea"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !form.size}
              className="enhanced-submit-btn"
            >
              {loading ? (
                <>
                  <div className="enhanced-spinner" />
                  提交中...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  确认预订 ({form.size || '请选择尺码'})
                </>
              )}
            </button>
          </form>
        </div>

        <style jsx>{`
          .enhanced-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            animation: fadeIn 0.2s ease;
          }

          .enhanced-modal {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: modalScale 0.3s ease;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }

          .enhanced-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 30px;
            border-bottom: 1px solid #f0f0f0;
          }

          .enhanced-modal-title {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            color: #333;
          }

          .enhanced-close-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
          }

          .enhanced-close-btn:hover {
            background: #f5f5f5;
          }

          .enhanced-modal-content {
            padding: 30px;
          }

          .enhanced-order-preview {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 15px;
          }

          .enhanced-preview-image {
            flex: 0 0 120px;
          }

          .preview-container {
            position: relative;
            width: 120px;
            height: 150px;
          }

          .preview-frame {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3;
          }

          .preview-frame img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .preview-clothing {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }

          .preview-clothing img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }

          .preview-design {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            z-index: 2;
          }

          .preview-design img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .enhanced-preview-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
          }

          .enhanced-preview-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }

          .enhanced-preview-price {
            font-size: 22px;
            font-weight: 700;
            color: #000;
          }

          .enhanced-preview-type {
            font-size: 14px;
            color: #666;
            background: #e0e0e0;
            padding: 4px 8px;
            border-radius: 10px;
            align-self: flex-start;
          }

          .size-selection-section {
            margin-bottom: 25px;
            padding: 20px;
            border: 2px solid #f0f0f0;
            border-radius: 15px;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 20px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .height-input-group {
            margin-bottom: 20px;
          }

          .height-input-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #555;
          }

          .height-input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.2s;
          }

          .height-input:focus {
            outline: none;
            border-color: #000;
          }

          .size-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
          }

          .size-option {
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
          }

          .size-option:hover {
            border-color: #999;
          }

          .size-option.selected {
            border-color: #000;
            background: #f5f5f5;
          }

          .size-label {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #333;
          }

          .size-measurements {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }

          .size-recommendation {
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
          }

          .recommendation-good {
            color: #0f5132;
            background: #d1e7dd;
          }

          .recommendation-warning {
            color: #664d03;
            background: #fff3cd;
          }

          .enhanced-preorder-notice {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 10px;
            font-size: 14px;
            color: #2d5a2d;
            margin-bottom: 25px;
          }

          .enhanced-order-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .enhanced-form-group {
            display: flex;
            flex-direction: column;
          }

          .enhanced-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .enhanced-input-icon {
            position: absolute;
            left: 15px;
            color: #999;
            z-index: 1;
          }

          .enhanced-input,
          .enhanced-textarea {
            width: 100%;
            padding: 15px 15px 15px 45px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 16px;
            transition: border-color 0.2s;
            resize: vertical;
            box-sizing: border-box;
          }

          .enhanced-input:focus,
          .enhanced-textarea:focus {
            outline: none;
            border-color: #000;
          }

          .enhanced-submit-btn {
            background: #000;
            color: white;
            border: none;
            padding: 18px 30px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s;
            margin-top: 10px;
          }

          .enhanced-submit-btn:hover:not(:disabled) {
            background: #333;
            transform: translateY(-1px);
          }

          .enhanced-submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
          }

          .enhanced-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .enhanced-success-modal {
            max-width: 400px;
          }

          .enhanced-success-content {
            padding: 40px;
            text-align: center;
          }

          .enhanced-success-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #d1e7dd;
            color: #0f5132;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            margin: 0 auto 20px auto;
          }

          .enhanced-success-title {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin: 0 0 15px 0;
          }

          .enhanced-success-message {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
            margin: 0;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modalScale {
            from { 
              opacity: 0;
              transform: scale(0.9);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (max-width: 600px) {
            .enhanced-order-preview {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }

            .size-options {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
}