'use client';

import { useState } from 'react';
import { MockupDisplay } from '@/components/MockupDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Upload, RefreshCw, ImagePlus } from 'lucide-react';

export default function TestMockupPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');

  const sampleDesigns = [
    {
      name: 'Pepmart卡通人物',
      url: '/api/placeholder/400/400?text=Pepmart+Character&bg=ff69b4'
    },
    {
      name: '抽象艺术',
      url: '/api/placeholder/400/400?text=Abstract+Art&bg=4169e1'
    },
    {
      name: '可爱猫咪',
      url: '/api/placeholder/400/400?text=Cute+Cat&bg=ffa500'
    },
    {
      name: '品牌Logo',
      url: '/api/placeholder/400/400?text=Brand+Logo&bg=32cd32'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (customUrl) {
      setImageUrl(customUrl);
    }
  };

  const handleSampleSelect = (url: string) => {
    setImageUrl(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">产品效果图生成器</h1>
          <p className="text-gray-600">上传您的设计，查看在不同产品上的效果</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">上传设计图</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">从本地上传</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-6 w-6 mr-2 text-gray-400" />
                    <span className="text-gray-600">选择图片文件</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">或输入图片URL</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                  <Button onClick={handleUrlSubmit} size="sm">
                    加载
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">示例设计</label>
                <div className="grid grid-cols-2 gap-2">
                  {sampleDesigns.map((design) => (
                    <button
                      key={design.name}
                      onClick={() => handleSampleSelect(design.url)}
                      className="p-2 text-sm border rounded hover:bg-gray-50 transition-colors"
                    >
                      {design.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">当前设计</h2>
            {imageUrl ? (
              <div className="space-y-4">
                <div className="aspect-square max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Current design"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageUrl('');
                      setCustomUrl('');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    清除
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImagePlus className="h-12 w-12 mb-2" />
                <p>请先上传或选择一个设计</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="bg-yellow-100 border border-yellow-400 p-4 mb-6 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">🔧 FORCED MOCKUP DISPLAY - TESTING FIXES</h3>
            <p className="text-yellow-700 text-sm">
              This MockupDisplay is FORCED to show with a test image to verify all mockup fixes.
              If you don't see T-shirt, Mug, and Frame previews below, the mockup system is broken.
            </p>
          </div>
          <MockupDisplay 
            designImageUrl={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ff6b6b'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='white' font-size='36' font-family='Arial'%3ETEST%3C/text%3E%3Ctext x='200' y='230' text-anchor='middle' fill='white' font-size='36' font-family='Arial'%3EMOCKUP%3C/text%3E%3Ctext x='200' y='280' text-anchor='middle' fill='white' font-size='36' font-family='Arial'%3EFIXED!%3C/text%3E%3C/svg%3E"}
            onDownload={(mockupUrl, templateName) => {
              console.log('🎯 Download triggered for:', templateName);
              const link = document.createElement('a');
              link.href = mockupUrl;
              link.download = `test-mockup-${templateName}-${Date.now()}.png`;
              link.click();
            }}
          />
        </Card>
      </div>
    </div>
  );
}