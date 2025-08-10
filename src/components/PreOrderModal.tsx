'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { X, ShoppingBag, User, Mail, Phone, MapPin } from 'lucide-react';
import { ProductInfo } from '@/lib/mockup-generator';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductInfo | null;
  designImageUrl: string;
}

interface PreOrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function PreOrderModal({ isOpen, onClose, product, designImageUrl }: PreOrderModalProps) {
  const { userId } = useAuth();
  const [form, setForm] = useState<PreOrderForm>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !userId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/preorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          designImageUrl,
          customerInfo: form,
          userId
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
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

  const updateForm = (field: keyof PreOrderForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !product) return null;

  if (success) {
    return (
      <div className="vsco-modal-overlay">
        <div className="vsco-modal vsco-success-modal">
          <div className="vsco-success-content">
            <div className="vsco-success-icon">✓</div>
            <h3 className="vsco-success-title">预订成功！</h3>
            <p className="vsco-success-message">
              感谢您的预订！我们已收到您的订单信息，
              <br />
              确认邮件已发送至您的邮箱。
              <br />
              <br />
              我们会在产品准备就绪后第一时间通知您！
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vsco-modal-overlay" onClick={onClose}>
      <div className="vsco-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vsco-modal-header">
          <h3 className="vsco-modal-title">预订 {product.name}</h3>
          <button onClick={onClose} className="vsco-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="vsco-modal-content">
          {/* Product Preview */}
          <div className="vsco-order-preview">
            <div className="vsco-preview-image">
              <img src={designImageUrl} alt="设计预览" />
            </div>
            <div className="vsco-preview-info">
              <span className="vsco-preview-name">{product.name}</span>
              <span className="vsco-preview-price">¥{product.price}</span>
            </div>
          </div>

          {/* Pre-order Notice */}
          <div className="vsco-preorder-notice">
            <ShoppingBag size={16} />
            <span>这是预售商品，我们会在准备就绪后通知您</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="vsco-order-form">
            <div className="vsco-form-group">
              <div className="vsco-input-wrapper">
                <User size={16} className="vsco-input-icon" />
                <input
                  type="text"
                  placeholder="姓名"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  required
                  className="vsco-input"
                />
              </div>
            </div>

            <div className="vsco-form-group">
              <div className="vsco-input-wrapper">
                <Mail size={16} className="vsco-input-icon" />
                <input
                  type="email"
                  placeholder="邮箱地址"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  required
                  className="vsco-input"
                />
              </div>
            </div>

            <div className="vsco-form-group">
              <div className="vsco-input-wrapper">
                <Phone size={16} className="vsco-input-icon" />
                <input
                  type="tel"
                  placeholder="联系电话"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  required
                  className="vsco-input"
                />
              </div>
            </div>

            <div className="vsco-form-group">
              <div className="vsco-input-wrapper">
                <MapPin size={16} className="vsco-input-icon" />
                <textarea
                  placeholder="收货地址"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  required
                  rows={3}
                  className="vsco-textarea"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="vsco-submit-btn"
            >
              {loading ? (
                <>
                  <div className="vsco-spinner" />
                  提交中...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  确认预订
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}