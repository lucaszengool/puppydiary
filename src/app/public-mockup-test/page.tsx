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
    overlayArea: { x: 0.35, y: 0.45, width: 0.30, height: 0.25 },
    blendMode: 'multiply',
    opacity: 0.90
  },
  {
    id: 'frame-front',
    name: '相框 · 正面',
    templateImage: '/mockup-templates/white-picture-frame.jpg',
    overlayArea: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    blendMode: 'source-over',
    opacity: 1
  }
];

export default function PublicMockupTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(['🎯 PUBLIC测试页面已加载 - 无需登录']);
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
    
    // Draw colorful pattern - make it more distinctive for mug testing
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        ctx.fillStyle = colors[(i + j) % colors.length];
        ctx.fillRect(i * 40, j * 40, 35, 35);
      }
    }
    
    // Add center markers for positioning test
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CENTER', 200, 180);
    ctx.fillText('TEST', 200, 220);
    
    // Add distinctive center circle
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(200, 200, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Add corner markers to test positioning
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 50, 50); // Top-left
    ctx.fillRect(350, 0, 50, 50); // Top-right
    ctx.fillRect(0, 350, 50, 50); // Bottom-left
    ctx.fillRect(350, 350, 50, 50); // Bottom-right
    
    addLog('✅ 增强测试图像已生成 (带定位标记)');
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
          addLog(`🖼️ 模板加载成功: ${template.name} (${templateImg.width}x${templateImg.height})`);
          
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
          
          addLog(`📐 ${template.name} 覆盖区域: (${Math.round(overlayX)}, ${Math.round(overlayY)}) ${Math.round(overlayWidth)}x${Math.round(overlayHeight)}`);
          
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
            addLog(`🥤 使用曲面算法处理马克杯: ${template.name}`);
            applyCurvedOverlay(tempCanvas, ctx, overlayX, overlayY, overlayWidth, overlayHeight);
          } else {
            addLog(`📄 直接覆盖处理: ${template.name}`);
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
              overlayHeight: Math.round(overlayHeight),
              templateWidth: templateImg.width,
              templateHeight: templateImg.height
            } 
          });
          
        } catch (error) {
          addLog(`❌ ${template.name} 生成错误: ${(error as Error).message}`);
          resolve({ template, dataUrl: '', error: (error as Error).message });
        }
      };
      
      templateImg.onerror = () => {
        addLog(`⚠️ 模板图片加载失败: ${template.templateImage}`);
        
        // Create placeholder showing the error
        const placeholderCanvas = document.createElement('canvas');
        const ctx = placeholderCanvas.getContext('2d')!;
        placeholderCanvas.width = 400;
        placeholderCanvas.height = 400;
        
        ctx.fillStyle = '#ffebee';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#c62828';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❌ 模板加载失败', 200, 180);
        ctx.fillText(template.name, 200, 210);
        ctx.font = '12px Arial';
        ctx.fillText(template.templateImage, 200, 240);
        
        const dataUrl = placeholderCanvas.toDataURL('image/png');
        resolve({ template, dataUrl, error: 'Template load failed' });
      };
      
      addLog(`🔄 开始加载模板: ${template.templateImage}`);
      templateImg.src = template.templateImage;
    });
  };

  const runMockupTest = async () => {
    const testCanvas = canvasRef.current;
    if (!testCanvas) return;
    
    addLog('🚀 开始全面mockup测试...');
    addLog('🎯 将测试马克杯居中问题和相框背景问题');
    setResults([]);
    
    try {
      const testResults = [];
      
      // Test each template sequentially to better track progress
      for (const template of mockupTemplates) {
        addLog(`⏳ 处理 ${template.name}...`);
        const result = await generateSingleMockup(testCanvas, template);
        testResults.push(result);
      }
      
      setResults(testResults);
      addLog('✅ 所有mockup生成完成！');
      addLog('🔍 检查点:');
      addLog('  1. 马克杯: 彩色图案应该在杯子表面，不能飘在外面');
      addLog('  2. 相框: 应该显示白色相框背景，不是其他物体');
      addLog('  3. T恤: 作为对照组，应该正常显示');
      
    } catch (error) {
      addLog('❌ 测试失败: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    generateTestImage();
    addLog('📝 页面已就绪 - 点击"开始测试"按钮验证mockup效果');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔥 PUBLIC Mockup System Test (无需登录)
        </h1>
        
        <div className="bg-red-100 border border-red-400 p-4 mb-8 rounded-lg">
          <strong>🚨 测试目标:</strong> 发现并修复马克杯图片位置错误、相框背景错误问题
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">1. 测试图像 (带定位标记)</h2>
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
                重新生成测试图
              </button>
              <button
                onClick={runMockupTest}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                🚀 开始测试
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            • 黑色圆圈 = 图像中心点<br />
            • 红色方块 = 图像四角标记<br />
            • 彩色方格 = 用于检测变形和位置
          </div>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {results.map((result, index) => {
              const { template, dataUrl, error, dimensions } = result;
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-xl font-bold mb-4 text-center">{template.name}</div>
                  
                  <div className={`p-2 mb-4 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {error ? `❌ ${error}` : '✅ 生成成功'}
                  </div>
                  
                  <div className="w-full h-80 border-2 border-gray-300 rounded-lg mb-4 flex items-center justify-center bg-white overflow-hidden">
                    {dataUrl && (
                      <img 
                        src={dataUrl} 
                        alt={template.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  
                  {dimensions && (
                    <div className="bg-blue-50 p-3 rounded text-sm mb-3">
                      <strong>技术参数:</strong><br />
                      • 模板尺寸: {dimensions.templateWidth}×{dimensions.templateHeight}<br />
                      • 覆盖位置: ({dimensions.overlayX}, {dimensions.overlayY})<br />
                      • 覆盖尺寸: {dimensions.overlayWidth}×{dimensions.overlayHeight}<br />
                      • 覆盖比例: {template.overlayArea.width}×{template.overlayArea.height}
                    </div>
                  )}
                  
                  {template.id === 'mug-front' && (
                    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm">
                      <strong>🥤 马克杯检查要点:</strong><br />
                      • ❓ 黑色圆圈是否在杯子中央？<br />
                      • ❓ 彩色图案是否贴合杯面？<br />
                      • ❓ 图案有没有飘在杯子外面？<br />
                      • ❓ 曲面效果是否自然？
                    </div>
                  )}
                  
                  {template.id === 'frame-front' && (
                    <div className="bg-purple-50 border border-purple-300 p-3 rounded text-sm">
                      <strong>🖼️ 相框检查要点:</strong><br />
                      • ❓ 背景是白色相框吗？<br />
                      • ❓ 还是显示了其他物体？<br />
                      • ❓ 图案是否填充整个框内区域？<br />
                      • ❓ 边缘处理是否正确？
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 text-center mt-4">
                    {template.templateImage}<br />
                    {template.blendMode} · α={template.opacity}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🔍 实时测试日志</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-bold mb-3">📋 问题诊断指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>马克杯问题症状:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>图案飘在杯子外面</li>
                <li>位置偏移严重</li>
                <li>图案变形不自然</li>
                <li>没有贴合杯面</li>
              </ul>
            </div>
            <div>
              <strong>相框问题症状:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>显示背包而不是相框</li>
                <li>显示灯具而不是相框</li>
                <li>背景颜色不对</li>
                <li>模板图片错误</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}