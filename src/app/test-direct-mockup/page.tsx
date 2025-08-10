'use client';

import { useEffect, useRef, useState } from 'react';

interface MockupTemplate {
  id: string;
  name: string;
  templateImage: string;
  overlayArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blendMode: GlobalCompositeOperation;
  opacity: number;
}

const mockupTemplates: MockupTemplate[] = [
  {
    id: 'tshirt-front',
    name: 'T恤 · 正面',
    templateImage: '/mockup-templates/white-tshirt.jpg',
    overlayArea: { x: 0.38, y: 0.35, width: 0.24, height: 0.28 },
    blendMode: 'multiply',
    opacity: 0.95
  },
  {
    id: 'mug-front',
    name: '马克杯 · 正面',
    templateImage: '/mockup-templates/white-mug.jpg',
    overlayArea: { x: 0.28, y: 0.32, width: 0.44, height: 0.36 },
    blendMode: 'multiply',
    opacity: 0.90
  },
  {
    id: 'frame-front',
    name: '相框 · 正面',
    templateImage: '/mockup-templates/white-frame-bg.jpg',
    overlayArea: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
    blendMode: 'source-over',
    opacity: 1
  }
];

export default function TestDirectMockupPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(['🎯 测试页面已加载']);
  const [results, setResults] = useState<Array<{
    template: MockupTemplate;
    dataUrl: string;
    error?: string;
    dimensions?: any;
  }>>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const generateTestImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const colors = ['#ff4757', '#2ed573', '#3742fa', '#ffa502', '#ff6b6b'];
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw colorful pattern
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        ctx.fillStyle = colors[(i + j) % colors.length];
        ctx.fillRect(i * 40, j * 40, 35, 35);
      }
    }
    
    // Add center text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEST', 200, 180);
    ctx.fillText('DOG', 200, 220);
    
    // Add a distinctive shape in center
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(200, 250, 30, 0, Math.PI * 2);
    ctx.fill();
    
    addLog('✅ 测试图像已生成');
  };

  const removeBackground = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      const isLight = brightness > 240;
      const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      
      if (isLight || (isGray && brightness > 200)) {
        data[i + 3] = 0;
      }
    }
    
    return imageData;
  };

  const applyCurvedOverlay = (
    sourceCanvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const slices = 20;
    const sliceWidth = sourceCanvas.width / slices;
    const targetSliceWidth = width / slices;
    
    for (let i = 0; i < slices; i++) {
      const sourceX = i * sliceWidth;
      const targetX = x + (i * targetSliceWidth);
      
      const curveEffect = Math.sin((i / slices) * Math.PI) * 0.1;
      const sliceHeight = height * (1 + curveEffect);
      const sliceY = y + (height - sliceHeight) / 2;
      
      ctx.drawImage(
        sourceCanvas,
        sourceX, 0, sliceWidth, sourceCanvas.height,
        targetX, sliceY, targetSliceWidth, sliceHeight
      );
    }
  };

  const generateSingleMockup = async (
    testImageCanvas: HTMLCanvasElement,
    template: MockupTemplate
  ): Promise<{
    template: MockupTemplate;
    dataUrl: string;
    error?: string;
    dimensions?: any;
  }> => {
    return new Promise((resolve) => {
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      
      templateImg.onload = () => {
        try {
          // Create result canvas
          const resultCanvas = document.createElement('canvas');
          const ctx = resultCanvas.getContext('2d')!;
          resultCanvas.width = templateImg.width;
          resultCanvas.height = templateImg.height;
          
          // Draw template background
          ctx.drawImage(templateImg, 0, 0);
          
          // Process test image
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = testImageCanvas.width;
          tempCanvas.height = testImageCanvas.height;
          tempCtx.drawImage(testImageCanvas, 0, 0);
          
          // Remove background
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const cleanImageData = removeBackground(imageData);
          tempCtx.putImageData(cleanImageData, 0, 0);
          
          // Calculate overlay position
          const overlayX = template.overlayArea.x * templateImg.width;
          const overlayY = template.overlayArea.y * templateImg.height;
          const overlayWidth = template.overlayArea.width * templateImg.width;
          const overlayHeight = template.overlayArea.height * templateImg.height;
          
          // Apply blend mode and opacity
          ctx.save();
          if (template.opacity !== undefined) {
            ctx.globalAlpha = template.opacity;
          }
          if (template.blendMode) {
            ctx.globalCompositeOperation = template.blendMode;
          }
          
          // Apply overlay
          if (template.id.startsWith('mug-')) {
            addLog(`🔧 使用曲面算法处理马克杯: ${template.name}`);
            applyCurvedOverlay(tempCanvas, ctx, overlayX, overlayY, overlayWidth, overlayHeight);
          } else {
            addLog(`📐 直接覆盖处理: ${template.name}`);
            ctx.drawImage(tempCanvas, overlayX, overlayY, overlayWidth, overlayHeight);
          }
          
          ctx.restore();
          
          const dataUrl = resultCanvas.toDataURL('image/png');
          resolve({ 
            template, 
            dataUrl, 
            dimensions: { 
              overlayX: Math.round(overlayX), 
              overlayY: Math.round(overlayY), 
              overlayWidth: Math.round(overlayWidth), 
              overlayHeight: Math.round(overlayHeight) 
            } 
          });
          
        } catch (error) {
          resolve({ template, dataUrl: '', error: (error as Error).message });
        }
      };
      
      templateImg.onerror = () => {
        addLog(`⚠️ 模板图片加载失败: ${template.templateImage}`);
        
        // Create placeholder
        const placeholderCanvas = document.createElement('canvas');
        const ctx = placeholderCanvas.getContext('2d')!;
        placeholderCanvas.width = 400;
        placeholderCanvas.height = 400;
        
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('模板加载失败', 200, 180);
        ctx.fillText(template.name, 200, 220);
        
        const dataUrl = placeholderCanvas.toDataURL('image/png');
        resolve({ template, dataUrl, error: 'Template load failed' });
      };
      
      templateImg.src = template.templateImage;
    });
  };

  const runMockupTest = async () => {
    const testCanvas = canvasRef.current;
    if (!testCanvas) return;
    
    addLog('🚀 开始mockup测试...');
    setResults([]);
    
    try {
      const testResults = await Promise.all(
        mockupTemplates.map(template => generateSingleMockup(testCanvas, template))
      );
      
      setResults(testResults);
      addLog('✅ 所有mockup生成完成！');
      addLog('🔍 请检查马克杯图片是否在杯子中央');
      addLog('🔍 请检查相框是否显示白色框架背景');
      
    } catch (error) {
      addLog('❌ 测试失败: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    generateTestImage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔥 Direct Mockup System Test
        </h1>
        
        <div className="bg-blue-100 border border-blue-400 p-4 mb-8 rounded-lg">
          <strong>测试目标:</strong> 验证马克杯图片居中、相框背景正确
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">1. 测试图像</h2>
          <div className="flex items-center gap-4">
            <canvas 
              ref={canvasRef} 
              width="400" 
              height="400" 
              className="border-2 border-gray-300 rounded-lg"
            />
            <div>
              <button
                onClick={generateTestImage}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
              >
                生成新测试图
              </button>
              <button
                onClick={runMockupTest}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                开始测试
              </button>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {results.map((result, index) => {
              const { template, dataUrl, error, dimensions } = result;
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-xl font-bold mb-4 text-center">{template.name}</div>
                  
                  <div className={`p-2 mb-4 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {error ? `❌ ${error}` : '✅ 生成成功'}
                  </div>
                  
                  <div className="w-full h-80 border-2 border-gray-300 rounded-lg mb-4 flex items-center justify-center bg-white">
                    {dataUrl && (
                      <img 
                        src={dataUrl} 
                        alt={template.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  
                  {template.id === 'mug-front' && dimensions && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong>马克杯分析:</strong><br />
                      • 覆盖区域: x={dimensions.overlayX}, y={dimensions.overlayY}<br />
                      • 尺寸: {dimensions.overlayWidth} × {dimensions.overlayHeight}<br />
                      • 是否使用曲面算法: ✅<br />
                      • 图片应该在杯子中央，不能飘在外面
                    </div>
                  )}
                  
                  {template.id === 'frame-front' && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong>相框分析:</strong><br />
                      • 覆盖区域: 几乎全覆盖 (5% margin)<br />
                      • 背景应该是白色相框，不是其他物体<br />
                      • 如果显示错误物体，说明模板图片错误
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 text-center mt-4">
                    模板: {template.templateImage}<br />
                    混合模式: {template.blendMode}<br />
                    透明度: {template.opacity}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">测试日志</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}