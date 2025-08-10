'use client';

import { MockupDisplay } from '@/components/MockupDisplay';

export default function MockupTestPage() {
  // 创建一个测试图像
  const testImageDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6b6b'/%3E%3Cstop offset='50%25' style='stop-color:%234ecdc4'/%3E%3Cstop offset='100%25' style='stop-color:%2345b7d1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='512' height='512' fill='url(%23grad)'/%3E%3Ctext x='256' y='200' text-anchor='middle' fill='white' font-size='64' font-weight='bold' font-family='Arial'%3ETEST%3C/text%3E%3Ctext x='256' y='280' text-anchor='middle' fill='white' font-size='64' font-weight='bold' font-family='Arial'%3EMOCKUP%3C/text%3E%3Ctext x='256' y='360' text-anchor='middle' fill='white' font-size='48' font-weight='bold' font-family='Arial'%3EFIXED!%3C/text%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔥 Direct Mockup Test Page
        </h1>
        
        <div className="bg-red-500 text-white p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">⚠️ THIS IS A FORCED TEST</h2>
          <p className="text-lg">
            This page directly renders MockupDisplay with a test image.
            <br />
            You MUST see:
          </p>
          <ul className="list-disc list-inside mt-4 text-lg">
            <li>3 products: T恤 (T-shirt), 马克杯 (Mug), 相框 (Frame)</li>
            <li>Each product with your test image overlaid</li>
            <li>Navigation dots at the bottom</li>
            <li>Click images to cycle through 3 angles</li>
          </ul>
          <p className="mt-4 text-xl font-bold">
            If you don\'t see these, the mockup system is BROKEN!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">MockupDisplay Component Output:</h2>
          
          <MockupDisplay 
            designImageUrl={testImageDataUrl}
            onDownload={(mockupUrl, templateName) => {
              console.log('📥 Download triggered:', templateName);
              console.log('📊 Mockup URL length:', mockupUrl.length);
              const link = document.createElement('a');
              link.href = mockupUrl;
              link.download = `forced-test-${templateName}-${Date.now()}.png`;
              link.click();
            }}
          />
        </div>

        <div className="mt-8 bg-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">📊 Debug Info:</h3>
          <ul className="space-y-2">
            <li>• Open browser console (F12) to see generation logs</li>
            <li>• Check for any errors in red</li>
            <li>• Look for "🎯 Generating mockup for..." messages</li>
            <li>• URL: {typeof window !== \'undefined\' ? window.location.href : \'Loading...\'}</li>
            <li>• Test image loaded: ✅</li>
            <li>• MockupDisplay imported: ✅</li>
          </ul>
        </div>
      </div>
    </div>
  );
}