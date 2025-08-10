'use client';

import { useState } from 'react';
import { VSCOProductDisplay } from '@/components/VSCOProductDisplay';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function VSCOTestPage() {
  const [designImageUrl, setDesignImageUrl] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDesignImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setDesignImageUrl('');
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Upload Section */}
      <div style={{ background: 'white', padding: '30px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>
            VSCO风格产品预览系统
          </h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            上传设计图片，查看在不同衣服和相框上的效果
          </p>

          {!designImageUrl ? (
            <div style={{ 
              border: '3px dashed #ddd', 
              borderRadius: '12px', 
              padding: '40px', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} onClick={() => document.getElementById('image-upload')?.click()}>
              <Upload size={48} style={{ color: '#999', marginBottom: '15px' }} />
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                点击上传设计图片
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                支持 JPG, PNG, GIF 格式
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={designImageUrl} 
                alt="上传的设计" 
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '300px', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  marginBottom: '20px'
                }} 
              />
              <br />
              <button 
                onClick={clearImage}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                重新上传
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Display */}
      <VSCOProductDisplay 
        selectedDesignImageUrl={designImageUrl}
      />
    </div>
  );
}