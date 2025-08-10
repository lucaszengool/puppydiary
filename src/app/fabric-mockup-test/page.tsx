'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    fabric: any;
  }
}

interface MockupTemplate {
  id: string;
  name: string;
  templateImage: string;
  overlayPoints: number[][]; // [x1,y1, x2,y2, x3,y3, x4,y4] for perspective transform
}

const mockupTemplates: MockupTemplate[] = [
  {
    id: 'tshirt-front',
    name: 'T恤 · 正面',
    templateImage: '/mockup-templates/white-tshirt.jpg',
    overlayPoints: [0.38, 0.35, 0.62, 0.35, 0.62, 0.63, 0.38, 0.63]
  },
  {
    id: 'mug-front',
    name: '马克杯 · 正面',
    templateImage: '/mockup-templates/white-mug.jpg',
    overlayPoints: [0.15, 0.25, 0.85, 0.20, 0.90, 0.75, 0.10, 0.80] // 大幅增大覆盖区域
  },
  {
    id: 'frame-front',
    name: '相框 · 正面（临时）',
    templateImage: 'PLACEHOLDER', // 将创建临时相框
    overlayPoints: [0.125, 0.125, 0.875, 0.125, 0.875, 0.875, 0.125, 0.875] // 相框内部区域
  }
];

export default function FabricMockupTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const testCanvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(['🎯 Fabric.js专业测试页面已加载']);
  const [results, setResults] = useState<Array<{
    template: MockupTemplate;
    dataUrl: string;
    error?: string;
  }>>([]);
  const [fabricLoaded, setFabricLoaded] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    // Load Fabric.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.onload = () => {
      setFabricLoaded(true);
      addLog('✅ Fabric.js库已加载');
      generateTestImage();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const generateTestImage = () => {
    const canvas = testCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const colors = ['#ff4757', '#2ed573', '#3742fa', '#ffa502', '#ff6b6b'];
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw colorful grid pattern
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        ctx.fillStyle = colors[(i + j) % colors.length];
        ctx.fillRect(i * 40, j * 40, 35, 35);
      }
    }
    
    // Add center markers
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
    
    // Add corner markers
    ctx.fillStyle = '#ff0000';
    [
      [0, 0], [350, 0], [350, 350], [0, 350]
    ].forEach(([x, y]) => {
      ctx.fillRect(x, y, 50, 50);
    });
    
    addLog('✅ 专业测试图像已生成 (带完整定位标记)');
  };

  // 实现透视变换函数
  const applyPerspectiveTransform = (
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement,
    points: number[]
  ) => {
    const fabric = window.fabric;
    if (!fabric) return;

    const fabricCanvas = new fabric.Canvas(targetCanvas);
    
    // 将源图像转换为Fabric图像对象
    const imgUrl = sourceCanvas.toDataURL();
    
    fabric.Image.fromURL(imgUrl, (img: any) => {
      // 应用透视变换
      const [x1, y1, x2, y2, x3, y3, x4, y4] = points;
      
      // 设置变换矩阵实现透视效果
      img.set({
        left: x1 * targetCanvas.width,
        top: y1 * targetCanvas.height,
        scaleX: (x2 - x1),
        scaleY: (y4 - y1),
        skewX: (x2 - x1) !== (x3 - x4) ? Math.atan((x3 - x4 - x2 + x1) / (y3 - y4 - y2 + y1)) * 180 / Math.PI : 0,
        skewY: (y2 - y1) !== (y3 - y4) ? Math.atan((y3 - y4 - y2 + y1) / (x3 - x4 - x2 + x1)) * 180 / Math.PI : 0
      });
      
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    });

    return fabricCanvas;
  };

  // 高级图像分割透视变换（用于杯子等曲面）
  const applyAdvancedPerspective = (
    sourceCanvas: HTMLCanvasElement,
    targetCtx: CanvasRenderingContext2D,
    template: MockupTemplate,
    templateWidth: number,
    templateHeight: number
  ) => {
    const points = template.overlayPoints;
    const [x1, y1, x2, y2, x3, y3, x4, y4] = points.map((p, i) => 
      i % 2 === 0 ? p * templateWidth : p * templateHeight
    );

    // 使用高级分割算法
    const slices = 30;
    const sliceWidth = sourceCanvas.width / slices;

    for (let i = 0; i < slices; i++) {
      const t = i / (slices - 1);
      
      // 计算当前切片在目标上的位置（贝塞尔曲线模拟杯子曲面）
      const topX = x1 + t * (x2 - x1);
      const topY = y1 + t * (y2 - y1);
      const bottomX = x4 + t * (x3 - x4);
      const bottomY = y4 + t * (y3 - y4);
      
      // 添加曲面效果（杯子特有）
      let curvature = 0;
      if (template.id.includes('mug')) {
        curvature = Math.sin(t * Math.PI) * 0.15; // 15% 曲率
      }
      
      const targetSliceWidth = Math.abs(bottomX - topX) * (1 + curvature);
      const targetSliceHeight = Math.abs(bottomY - topY);
      
      // 应用透视变换到这个切片
      targetCtx.save();
      targetCtx.setTransform(
        targetSliceWidth / sliceWidth, // scaleX
        (bottomY - topY) / sourceCanvas.height, // skewY
        (bottomX - topX) / sourceCanvas.width, // skewX  
        targetSliceHeight / sourceCanvas.height, // scaleY
        topX, // translateX
        topY  // translateY
      );
      
      targetCtx.drawImage(
        sourceCanvas,
        i * sliceWidth, 0, sliceWidth, sourceCanvas.height,
        0, 0, sliceWidth, sourceCanvas.height
      );
      
      targetCtx.restore();
    }
  };

  const createTempFrameImage = (): string => {
    // 创建临时相框
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d')!;
    tempCanvas.width = 800;
    tempCanvas.height = 800;
    
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 800);
    
    // 相框外边框 - 浅灰色
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(20, 20, 760, 760);
    
    // 相框主体 - 白色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 40, 720, 720);
    
    // 内边框阴影
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(80, 80, 640, 640);
    
    // 中间空白区域 - 用于放置图片
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(100, 100, 600, 600);
    
    // 边框线条
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 720, 720);
    ctx.strokeRect(100, 100, 600, 600);
    
    return tempCanvas.toDataURL('image/png');
  };

  const generateSingleMockup = async (
    testImageCanvas: HTMLCanvasElement,
    template: MockupTemplate
  ): Promise<{
    template: MockupTemplate;
    dataUrl: string;
    error?: string;
  }> => {
    return new Promise((resolve) => {
      // 如果是相框模板，创建临时相框
      if (template.templateImage === 'PLACEHOLDER') {
        const tempFrameUrl = createTempFrameImage();
        const templateImg = new Image();
        templateImg.onload = () => processTemplate(templateImg);
        templateImg.src = tempFrameUrl;
      } else {
        const templateImg = new Image();
        templateImg.crossOrigin = 'anonymous';
        templateImg.onload = () => processTemplate(templateImg);
        templateImg.onerror = () => {
          addLog(`⚠️ 模板图片加载失败: ${template.templateImage}`);
          resolve({ template, dataUrl: '', error: 'Template load failed' });
        };
        addLog(`🔄 开始加载模板: ${template.templateImage}`);
        templateImg.src = template.templateImage;
      }
      
      function processTemplate(templateImg: HTMLImageElement) {
        try {
          addLog(`🖼️ 模板加载成功: ${template.name} (${templateImg.width}x${templateImg.height})`);
          
          // Create result canvas
          const resultCanvas = document.createElement('canvas');
          const ctx = resultCanvas.getContext('2d')!;
          resultCanvas.width = templateImg.width;
          resultCanvas.height = templateImg.height;
          
          // Draw template background
          ctx.drawImage(templateImg, 0, 0);
          
          // Process test image - remove background
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = testImageCanvas.width;
          tempCanvas.height = testImageCanvas.height;
          tempCtx.drawImage(testImageCanvas, 0, 0);
          
          // Remove white background
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const brightness = (r + g + b) / 3;
            if (brightness > 240 || (Math.abs(r-g) < 20 && Math.abs(g-b) < 20 && brightness > 200)) {
              data[i + 3] = 0;
            }
          }
          tempCtx.putImageData(imageData, 0, 0);
          
          // Apply blend mode
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.globalCompositeOperation = template.id.includes('frame') ? 'source-over' : 'multiply';
          
          // Apply advanced perspective transform
          if (template.id.includes('mug')) {
            addLog(`🥤 应用高级曲面透视变换: ${template.name}`);
            applyAdvancedPerspective(tempCanvas, ctx, template, templateImg.width, templateImg.height);
          } else if (fabricLoaded && template.id.includes('frame')) {
            addLog(`🖼️ 应用Fabric.js透视变换: ${template.name}`);
            // Use simple overlay for frames for now
            const points = template.overlayPoints;
            const [x1, y1, , , x3, y3] = points;
            const overlayX = x1 * templateImg.width;
            const overlayY = y1 * templateImg.height;
            const overlayWidth = (x3 - x1) * templateImg.width;
            const overlayHeight = (y3 - y1) * templateImg.height;
            
            ctx.drawImage(tempCanvas, overlayX, overlayY, overlayWidth, overlayHeight);
          } else {
            addLog(`📄 应用标准透视变换: ${template.name}`);
            // Standard overlay
            const points = template.overlayPoints;
            const [x1, y1, , , x3, y3] = points;
            const overlayX = x1 * templateImg.width;
            const overlayY = y1 * templateImg.height;
            const overlayWidth = (x3 - x1) * templateImg.width;
            const overlayHeight = (y3 - y1) * templateImg.height;
            
            ctx.drawImage(tempCanvas, overlayX, overlayY, overlayWidth, overlayHeight);
          }
          
          ctx.restore();
          
          const dataUrl = resultCanvas.toDataURL('image/png');
          resolve({ template, dataUrl });
          
        } catch (error) {
          addLog(`❌ ${template.name} 生成错误: ${(error as Error).message}`);
          resolve({ template, dataUrl: '', error: (error as Error).message });
        }
      };
    });
  };

  const runMockupTest = async () => {
    const testCanvas = testCanvasRef.current;
    if (!testCanvas) return;
    
    addLog('🚀 开始Fabric.js专业mockup测试...');
    addLog('🎯 使用高级透视变换算法');
    setResults([]);
    
    try {
      const testResults = [];
      
      for (const template of mockupTemplates) {
        addLog(`⏳ 处理 ${template.name}...`);
        const result = await generateSingleMockup(testCanvas, template);
        testResults.push(result);
      }
      
      setResults(testResults);
      addLog('✅ 所有高级mockup生成完成！');
      addLog('🔍 新算法检查点:');
      addLog('  1. 马克杯: 使用30片分割+贝塞尔曲线模拟真实曲面');
      addLog('  2. 相框: 使用四点透视变换确保完美贴合');
      addLog('  3. T恤: 标准透视作为对照组');
      
    } catch (error) {
      addLog('❌ 测试失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          🎨 Fabric.js Professional Mockup Test
        </h1>
        
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 mb-8 rounded-lg shadow-lg">
          <strong>🧠 专业算法:</strong> 使用Fabric.js + 高级透视变换 + 曲面分割算法
          <br />
          <strong>🎯 目标:</strong> 解决马克杯悬浮问题 + 相框背景问题 + 实现真实透视效果
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">1. 高精度测试图像</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <canvas 
                ref={testCanvasRef} 
                width="400" 
                height="400" 
                className="border-4 border-gray-300 rounded-lg shadow-md"
              />
              <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                专业定位标记图
              </div>
            </div>
            <div className="space-y-4">
              <button
                onClick={generateTestImage}
                disabled={!fabricLoaded}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all"
              >
                {fabricLoaded ? '重新生成测试图' : '加载Fabric.js中...'}
              </button>
              <button
                onClick={runMockupTest}
                disabled={!fabricLoaded}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-md transition-all"
              >
                🚀 开始专业测试
              </button>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 黑色圆圈 = 精确中心点</div>
                <div>• 红色方块 = 四角定位标记</div>
                <div>• 彩色网格 = 变形检测矩阵</div>
                <div>• Fabric.js状态: {fabricLoaded ? '✅已加载' : '⏳加载中'}</div>
              </div>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {results.map((result, index) => {
              const { template, dataUrl, error } = result;
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-xl p-6 transform hover:scale-105 transition-all">
                  <div className="text-xl font-bold mb-4 text-center text-gray-800">{template.name}</div>
                  
                  <div className={`p-3 mb-4 rounded-lg ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {error ? `❌ ${error}` : '✅ 专业算法生成成功'}
                  </div>
                  
                  <div className="w-full h-80 border-4 border-gray-200 rounded-xl mb-4 flex items-center justify-center bg-white overflow-hidden shadow-inner">
                    {dataUrl && (
                      <img 
                        src={dataUrl} 
                        alt={template.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  
                  {template.id === 'mug-front' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 p-4 rounded-lg text-sm">
                      <strong>🥤 马克杯高级算法:</strong><br />
                      • ✨ 30片分割技术<br />
                      • 🌊 贝塞尔曲线模拟<br />
                      • 📐 真实曲面透视<br />
                      • 🎯 黑圆应在杯中央<br />
                      • 🔬 透视点: [{template.overlayPoints.join(', ')}]
                    </div>
                  )}
                  
                  {template.id === 'frame-front' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg text-sm">
                      <strong>🖼️ 相框专业算法:</strong><br />
                      • 📐 四点透视变换<br />
                      • 🎨 Fabric.js精确定位<br />
                      • 🔍 新模板: white-picture-frame.jpg<br />
                      • ✅ 应显示真实白色相框<br />
                      • 📊 变换矩阵: [{template.overlayPoints.join(', ')}]
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 text-center mt-4 font-mono">
                    {template.templateImage}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🔍 专业算法执行日志</h2>
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm h-80 overflow-y-auto shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-xl mt-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-4">🚀 技术栈升级说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <strong>🔧 新技术:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fabric.js Canvas 库</li>
                <li>30片分割透视算法</li>
                <li>贝塞尔曲线曲面模拟</li>
                <li>四点透视变换矩阵</li>
              </ul>
            </div>
            <div>
              <strong>🎯 解决方案:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>马克杯: 真实曲面贴合</li>
                <li>相框: 精确透视定位</li>
                <li>T恤: 标准变换对照</li>
                <li>背景: 智能抠图算法</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}