'use client';

import { useState } from 'react';
import { ClothingProductDisplay } from '@/components/ClothingProductDisplay';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function ClothingTestPage() {
  const [designImageUrl, setDesignImageUrl] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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
    setUploadedFile(null);
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="clothing-test-page">
      <div className="container">
        <header className="page-header">
          <h1>服装产品预览系统</h1>
          <p>上传你的设计，选择衣服款式，然后预订你喜欢的产品</p>
        </header>

        {/* Design Upload Section */}
        <section className="upload-section">
          <div className="upload-card">
            <h2>
              <ImageIcon size={20} />
              上传设计图片
            </h2>
            
            {!designImageUrl ? (
              <div className="upload-area">
                <label htmlFor="image-upload" className="upload-label">
                  <Upload size={48} />
                  <span className="upload-text">点击上传图片</span>
                  <span className="upload-hint">支持 JPG, PNG, GIF 格式</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="upload-input"
                />
              </div>
            ) : (
              <div className="uploaded-preview">
                <img src={designImageUrl} alt="上传的设计" className="preview-image" />
                <button onClick={clearImage} className="clear-btn">
                  重新上传
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Product Display Section */}
        <section className="product-section">
          <ClothingProductDisplay 
            selectedDesignImageUrl={designImageUrl}
            frameImage="/相框/相框1.png"
          />
        </section>

        {/* Instructions */}
        <section className="instructions">
          <div className="instructions-card">
            <h3>使用说明</h3>
            <ol>
              <li>上传你的设计图片</li>
              <li>选择衣服类型（卫衣或短袖）</li>
              <li>使用左右箭头浏览不同款式</li>
              <li>点击"立即预订"选择尺码并下单</li>
              <li>根据身高自动推荐合适的尺码</li>
            </ol>
          </div>
        </section>
      </div>

      <style jsx>{`
        .clothing-test-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 10px 0;
        }

        .page-header p {
          font-size: 18px;
          color: #7f8c8d;
          margin: 0;
        }

        .upload-section {
          margin-bottom: 40px;
        }

        .upload-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .upload-card h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 25px 0;
        }

        .upload-area {
          border: 3px dashed #bdc3c7;
          border-radius: 15px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #3498db;
          background: #f8f9fa;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          color: #7f8c8d;
        }

        .upload-input {
          display: none;
        }

        .upload-text {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .upload-hint {
          font-size: 14px;
          color: #95a5a6;
        }

        .uploaded-preview {
          text-align: center;
        }

        .preview-image {
          max-width: 300px;
          max-height: 300px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .clear-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }

        .product-section {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
        }

        .instructions {
          margin-bottom: 40px;
        }

        .instructions-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .instructions-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 20px 0;
        }

        .instructions-card ol {
          font-size: 16px;
          color: #34495e;
          line-height: 1.8;
          padding-left: 20px;
        }

        .instructions-card li {
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 28px;
          }

          .page-header p {
            font-size: 16px;
          }

          .upload-card,
          .product-section,
          .instructions-card {
            padding: 20px;
          }

          .upload-area {
            padding: 30px 20px;
          }

          .preview-image {
            max-width: 250px;
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
}