"use client"

import { useState, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { 
  Camera, 
  Upload, 
  Loader2, 
  Download, 
  RefreshCw, 
  Heart,
  Sparkles,
  Sun,
  Cloud,
  Trees,
  Palette,
  Wand2,
  PawPrint,
  Video,
  Play,
  Check
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import './cartoon-styles.css'

export default function CreatePage() {
  const { userId } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState<'style' | 'upload' | 'processing' | 'result' | 'refine'>('style')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")
  const [savedImages, setSavedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1) // Track which saved image we're editing
  const [showVideoOption, setShowVideoOption] = useState(false)
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoGenerating, setVideoGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [originalPrompt, setOriginalPrompt] = useState<string>("")  // Store the original prompt for reuse
  const [isFirstGeneration, setIsFirstGeneration] = useState(true)  // Track if it's the first generation

  // 主要艺术风格选项
  const mainStyleOptions = [
    { 
      id: 'ghibli', 
      icon: Heart, 
      label: '宫崎骏动漫', 
      description: '温暖治愈的手绘风格',
      prompt: 'Ghibli style, hand-drawn illustration, Studio Ghibli anime art style, warm colors, watercolor painting, soft lighting, whimsical, heartwarming, detailed character illustration'
    },
    { 
      id: 'disney', 
      icon: Sparkles, 
      label: '迪士尼卡通', 
      description: '可爱生动的卡通风格',
      prompt: 'Disney animation style, cute cartoon, vibrant colors, expressive characters, playful, colorful, animated movie style, Disney Pixar art style'
    },
    { 
      id: 'realistic', 
      icon: Camera, 
      label: '写实油画', 
      description: '经典油画肖像风格',
      prompt: 'realistic oil painting style, classical portrait, detailed brushwork, rich textures, professional portrait painting, fine art style, museum quality'
    },
    { 
      id: 'watercolor', 
      icon: Palette, 
      label: '水彩插画', 
      description: '柔美的水彩艺术风格',
      prompt: 'watercolor illustration, soft watercolor painting, delicate brushstrokes, flowing colors, artistic illustration, gentle and dreamy watercolor art'
    },
    { 
      id: 'vintage', 
      icon: Sun, 
      label: '复古怀旧', 
      description: '温暖的复古摄影风格',
      prompt: 'vintage photography style, retro aesthetic, warm sepia tones, nostalgic atmosphere, classic portrait photography, timeless vintage look'
    },
    { 
      id: 'modern', 
      icon: Wand2, 
      label: '现代艺术', 
      description: '简约现代的艺术风格',
      prompt: 'modern art style, contemporary illustration, clean lines, minimalist design, digital art, stylized portrait, modern graphic design'
    },
  ]

  // 场景风格选项（在选择主风格后显示）
  const sceneOptions = [
    { id: 'sunny', icon: Sun, label: '阳光明媚', prompt: '在温暖的阳光下，金色阳光透过窗户，暖色调，舒适氛围' },
    { id: 'dreamy', icon: Cloud, label: '梦幻云朵', prompt: '在梦幻的云朵中，天空般的柔和背景，粉蓝色调，漂浮的云朵装饰' },
    { id: 'forest', icon: Trees, label: '森林自然', prompt: '在被绿植环绕的自然环境中，自然绿色调，木质纹理，植物装饰' },
    { id: 'warm', icon: Heart, label: '温馨家庭', prompt: '在温馨的家庭环境中，舒适的沙发和暖色灯光，家庭般的温暖氛围' },
    { id: 'playful', icon: Sparkles, label: '活泼欢乐', prompt: '在充满活力的环境中，鲜艳的色彩，玩具和装饰品，欢乐氛围' },
    { id: 'artistic', icon: Palette, label: '艺术空间', prompt: '在艺术风格的空间中，创意装饰，艺术画作，独特的设计风格' },
  ]

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setSelectedImageUrl(url)
      setCurrentStep('upload')
    } else {
      toast({
        title: "文件格式错误",
        description: "请选择图片文件",
        variant: "destructive",
      })
    }
  }

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style)
    setCurrentStep('upload')
  }

  const handleGenerate = () => {
    if (!selectedFile || !selectedStyle) return
    setCurrentStep('processing')
    // First generation with selected style
    generatePortrait(selectedFile, undefined, false)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const generatePortrait = async (file: File, additionalPrompt?: string, isBackgroundChange: boolean = false) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      if (userId) {
        formData.append("userId", userId)
      }
      
      // 铁的定义：100%保留原有特征的基础提示词
      const preservationPrompt = "重要：必须100%保留原始图片中的人物或宠物的所有特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、标记和任何独特特征都要完全一致。"
      
      let fullPrompt: string
      
      // If this is a background change (user clicked scene option after generating)
      if (isBackgroundChange && originalPrompt) {
        // Keep the original style but change only the background/scene
        fullPrompt = originalPrompt
        if (additionalPrompt) {
          // Replace only the background/scene part of the prompt
          const scenePattern = /(在[^，。]+的环境中|在[^，。]+空间中|在[^，。]+氛围中|在[^，。]+场景中|in\s+[^,]+\s+environment|in\s+[^,]+\s+setting|with\s+[^,]+\s+background)/i
          if (scenePattern.test(fullPrompt)) {
            fullPrompt = fullPrompt.replace(scenePattern, additionalPrompt)
          } else {
            // Add the scene description if not present
            fullPrompt = `${fullPrompt}, ${additionalPrompt}`
          }
        }
      } else if (isFirstGeneration) {
        // First generation - apply the selected style transformation
        const stylePrompt = selectedStyle?.prompt || "Ghibli style, hand-drawn illustration, Studio Ghibli anime art style, warm colors, watercolor painting, soft lighting, whimsical, heartwarming, detailed character illustration"
        fullPrompt = `${preservationPrompt} ${stylePrompt}`
        
        // Store the original prompt with style for future use
        setOriginalPrompt(fullPrompt)
        setIsFirstGeneration(false)
      } else {
        // Subsequent generations with the same style
        fullPrompt = originalPrompt || `${preservationPrompt} ${selectedStyle?.prompt}`
        if (additionalPrompt) {
          fullPrompt = `${fullPrompt}, ${additionalPrompt}`
        }
      }
      
      formData.append("prompt", fullPrompt)
      formData.append("art_style", "anime")
      formData.append("cuteness_level", "maximum")
      formData.append("color_palette", "pastel")

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "生成失败")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setGeneratedPrompt(fullPrompt)
      setCurrentStep('result')
      
      // Don't auto-save if this is a background change - replace current image instead
      // Only save when user explicitly moves to next image
      if (!isBackgroundChange) {
        // This is called after user clicks "下一张"
        // Will be handled in handleNextImage
      }
      
      toast({
        title: "生成成功！",
        description: "您的狗狗漫画已经创作完成",
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
      setCurrentStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStyleChange = async (stylePrompt: string) => {
    if (!selectedFile) return
    setCurrentStep('processing')
    // This is a background change, not a new image
    await generatePortrait(selectedFile, stylePrompt, true)
  }

  const handleNextImage = () => {
    // Save the current generated image before moving to next
    if (generatedImage && savedImages.length < 3) {
      const newSavedImages = [...savedImages, generatedImage]
      setSavedImages(newSavedImages)
      
      // If we now have 3 images, show video option
      if (newSavedImages.length >= 3) {
        setShowVideoOption(true)
      }
    }
    
    // 重置当前图片状态，准备上传下一张
    setSelectedFile(null)
    setSelectedImageUrl(null)
    setGeneratedImage(null)
    setCustomPrompt("")
    setCurrentStep('upload')
    // Reset prompt-related state for new image
    setOriginalPrompt("")
    setIsFirstGeneration(true)
  }

  const handleCustomPrompt = async () => {
    if (!selectedFile || !customPrompt.trim()) return
    setCurrentStep('processing')
    // Custom prompt is also a background/scene change
    await generatePortrait(selectedFile, customPrompt, true)
  }

  // 生成视频
  const generateVideo = async () => {
    if (savedImages.length < 3) {
      toast({
        title: "图片不足",
        description: "需要至少3张图片才能生成视频",
        variant: "destructive",
      })
      return
    }

    setVideoGenerating(true)
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: savedImages,
          prompt: `温馨的宠物日记视频，${selectedStyle?.label || '宫崎骏'}风格动画，保持原始特征，艺术化表现`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('视频生成服务认证失败，请联系技术支持')
        } else if (response.status === 400) {
          throw new Error(errorData.error || errorData.details || '视频生成参数错误')
        }
        throw new Error(errorData.error || errorData.details || '视频生成请求失败')
      }

      const data = await response.json()
      setVideoTaskId(data.taskId)
      
      // 开始轮询视频生成状态
      pollVideoStatus(data.taskId)
      
    } catch (error) {
      console.error('Video generation error:', error)
      toast({
        title: "视频生成暂不可用",
        description: error instanceof Error ? error.message : "请稍后重试或联系技术支持",
        variant: "destructive",
      })
      setVideoGenerating(false)
    }
  }

  // 轮询视频状态
  const pollVideoStatus = async (taskId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/generate-video?taskId=${taskId}`)
        const data = await response.json()
        
        if (data.status === 'succeeded') {
          setVideoUrl(data.output?.[0]?.url || null)
          setVideoGenerating(false)
          toast({
            title: "视频生成成功！",
            description: "您的狗狗vlog已经准备好了",
          })
          return
        } else if (data.status === 'failed') {
          setVideoGenerating(false)
          toast({
            title: "视频生成失败",
            description: data.error || "生成过程中出现错误",
            variant: "destructive",
          })
          return
        }
        
        // 如果还在处理中，3秒后再次检查
        setTimeout(checkStatus, 3000)
      } catch (error) {
        console.error('Status check error:', error)
        setVideoGenerating(false)
      }
    }
    
    checkStatus()
  }

  const handleReset = () => {
    setSelectedFile(null)
    setSelectedImageUrl(null)
    setGeneratedImage(null)
    setCustomPrompt("")
    setGeneratedPrompt("")
    setSavedImages([])
    setShowVideoOption(false)
    setVideoTaskId(null)
    setVideoUrl(null)
    setVideoGenerating(false)
    setSelectedStyle(null)
    setCurrentStep('style')
  }

  return (
    <div className="create-container">
      {/* Floating cartoon elements */}
      <div className="floating-elements">
        <div className="floating-star" style={{top: '20%', left: '10%', animationDelay: '0s'}}></div>
        <div className="floating-star" style={{top: '60%', left: '85%', animationDelay: '1s'}}></div>
        <div className="floating-star" style={{top: '30%', left: '70%', animationDelay: '2s'}}></div>
        <div className="floating-star" style={{top: '80%', left: '15%', animationDelay: '3s'}}></div>
        <div className="floating-star" style={{top: '15%', left: '50%', animationDelay: '0.5s'}}></div>
      </div>
      
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 步骤指示器 */}
        <div className="step-indicator">
          <div className="step">
            <div className={`step-number ${currentStep === 'style' ? 'active' : selectedStyle ? 'completed' : 'inactive'}`}>
              {selectedStyle ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">选择风格</span>
          </div>
          <div className={`step-line ${selectedStyle ? 'completed' : ''}`}></div>
          <div className="step">
            <div className={`step-number ${currentStep === 'upload' ? 'active' : savedImages.length > 0 ? 'completed' : 'inactive'}`}>
              {savedImages.length > 0 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">上传照片</span>
          </div>
          <div className={`step-line ${savedImages.length > 0 ? 'completed' : ''}`}></div>
          <div className="step">
            <div className={`step-number ${currentStep === 'processing' || currentStep === 'result' ? 'active' : savedImages.length > 0 ? 'completed' : 'inactive'}`}>
              {savedImages.length > 0 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">AI创作</span>
          </div>
          <div className={`step-line ${savedImages.length >= 3 ? 'completed' : ''}`}></div>
          <div className="step">
            <div className={`step-number ${savedImages.length >= 3 ? 'completed' : 'inactive'}`}>
              {savedImages.length >= 3 ? <Check className="w-4 h-4" /> : '4'}
            </div>
            <span className="text-sm font-medium">制作视频</span>
          </div>
        </div>

        {/* 保存的图片缩略图 - 始终显示 */}
        {savedImages.length > 0 && (
          <div className="mb-8 fade-in">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-700">
                已保存的作品 ({savedImages.length}/3)
              </h3>
            </div>
            <div className="thumbnail-grid max-w-md mx-auto">
              {[0, 1, 2].map((index) => (
                <div key={index} className={`thumbnail-item ${savedImages[index] ? 'has-image' : 'empty'}`}>
                  {savedImages[index] ? (
                    <Image
                      src={savedImages[index]}
                      alt={`保存的图片 ${index + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PawPrint className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
              ))}
            </div>
            
            {/* 视频生成按钮 */}
            {showVideoOption && (
              <div className="text-center mt-6 fade-in">
                <button
                  onClick={generateVideo}
                  disabled={videoGenerating}
                  className="video-button inline-flex items-center space-x-2 disabled:opacity-50"
                >
                  {videoGenerating ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>生成视频中...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      <span>制作狗狗vlog视频</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 视频播放器 */}
        {videoUrl && (
          <div className="mb-8 fade-in">
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold text-neutral-700 mb-4 text-center">
                🎬 您的狗狗vlog视频
              </h3>
              <video
                controls
                className="w-full max-w-lg mx-auto rounded-xl"
                poster={savedImages[0]}
              >
                <source src={videoUrl} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
              <div className="text-center mt-4">
                <a
                  href={videoUrl}
                  download={`puppy-diary-vlog-${Date.now()}.mp4`}
                  className="premium-button inline-flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下载视频</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 视频编辑器风格布局 */}
        <div className="editor-layout">
          
          {/* 左侧工具面板 */}
          <div className="editor-sidebar-left">
            {/* 风格选择面板 */}
            {currentStep === 'style' && (
              <div className="editor-panel">
                <h3 className="panel-title">选择艺术风格</h3>
                <div className="style-selection-grid">
                  {mainStyleOptions.map((style) => {
                    const Icon = style.icon
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleStyleSelect(style)}
                        className={`style-selection-card ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                      >
                        <Icon className="w-8 h-8 mb-2" />
                        <div className="font-medium text-sm">{style.label}</div>
                        <div className="text-xs text-neutral-500 mt-1">{style.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 素材导入面板 */}
            {currentStep === 'upload' && (
              <div className="editor-panel">
                <h3 className="panel-title">素材导入</h3>
                
                {selectedStyle && (
                  <div className="selected-style-info mb-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm font-medium">已选风格：{selectedStyle.label}</div>
                    <div className="text-xs text-neutral-500">{selectedStyle.description}</div>
                  </div>
                )}
                
                <div className="upload-buttons-grid">
                  <button
                    onClick={handleCameraClick}
                    className="tool-button"
                  >
                    <Camera className="w-6 h-6" />
                    <span>拍照</span>
                  </button>
                  <button
                    onClick={handleUploadClick}
                    className="tool-button"
                  >
                    <Upload className="w-6 h-6" />
                    <span>选择文件</span>
                  </button>
                </div>
                
                {selectedFile && selectedImageUrl && (
                  <div className="mt-4">
                    <div className="preview-thumbnail mb-3">
                      <Image
                        src={selectedImageUrl}
                        alt="预览图片"
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={isProcessing}
                      className="w-full premium-button disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      开始创作
                    </button>
                  </div>
                )}

                {/* 隐藏的文件输入 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
            )}

            {/* 风格调整工具 */}
            {(currentStep === 'result' || currentStep === 'refine') && (
              <div className="editor-panel">
                <h3 className="panel-title">场景调整</h3>
                
                <div className="style-tools">
                  {sceneOptions.map((scene) => {
                    const Icon = scene.icon
                    return (
                      <button
                        key={scene.id}
                        onClick={() => handleStyleChange(scene.prompt)}
                        disabled={isProcessing}
                        className="style-tool-button disabled:opacity-50"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{scene.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4">
                  <label className="text-xs font-medium text-neutral-600 mb-2 block">
                    自定义场景
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="描述您想要的场景..."
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={handleCustomPrompt}
                      disabled={isProcessing || !customPrompt.trim()}
                      className="tool-button-small disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 继续创作按钮 */}
                {savedImages.length < 3 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <button
                      onClick={handleNextImage}
                      className="w-full premium-button-secondary"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      上传下一张图片
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 中央主预览区 */}
          <div className="editor-main-view">
            {/* 风格选择状态 */}
            {currentStep === 'style' && (
              <div className="preview-empty">
                <div className="text-center">
                  <Palette className="w-20 h-20 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-xl font-semibold text-neutral-600 mb-2">选择您喜爱的艺术风格</h3>
                  <p className="text-sm text-neutral-500">每种风格都会保留宠物的原始特征，只改变艺术表现形式</p>
                </div>
              </div>
            )}

            {/* 处理中 */}
            {currentStep === 'processing' && (
              <div className="preview-loading">
                <div className="loading-spinner mb-6"></div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  AI创作中...
                </h3>
                <p className="text-sm text-neutral-500">保留100%原始特征，转换为{selectedStyle?.label || '漫画'}风格</p>
              </div>
            )}

            {/* 生成结果 */}
            {(currentStep === 'result' || currentStep === 'refine') && generatedImage && (
              <div className="preview-content">
                <div className="preview-image-container">
                  <Image
                    src={generatedImage}
                    alt="生成的宠物画作"
                    width={500}
                    height={500}
                    className="preview-image"
                  />
                </div>
                <div className="preview-actions">
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = generatedImage
                      a.download = `pet-portrait-${selectedStyle?.id || 'artwork'}-${Date.now()}.png`
                      a.click()
                    }}
                    className="action-button primary"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出</span>
                  </button>
                  {savedImages.length >= 3 ? (
                    <button
                      onClick={handleReset}
                      className="action-button secondary"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>重新开始</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextImage}
                      className="action-button secondary"
                    >
                      <Camera className="w-4 h-4" />
                      <span>下一张</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 上传状态 */}
            {currentStep === 'upload' && (
              <div className="preview-empty">
                <div className="text-center">
                  <Upload className="w-20 h-20 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-xl font-semibold text-neutral-600 mb-2">上传您宠物的照片</h3>
                  <p className="text-sm text-neutral-500">支持 JPG、PNG 等图片格式，将转换为{selectedStyle?.label || '选定'}风格</p>
                </div>
              </div>
            )}
          </div>

          {/* 右侧属性面板 */}
          <div className="editor-sidebar-right">
            {(currentStep === 'result' || currentStep === 'refine') && (
              <div className="editor-panel">
                <h3 className="panel-title">图像属性</h3>
                <div className="property-list">
                  <div className="property-item">
                    <span className="property-label">尺寸</span>
                    <span className="property-value">512×512</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">风格</span>
                    <span className="property-value">宫崎骏漫画</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">特征保留</span>
                    <span className="property-value">100%</span>
                  </div>
                </div>
              </div>
            )}

            {!userId && (currentStep === 'result' || currentStep === 'refine') && (
              <div className="editor-panel">
                <h3 className="panel-title">账户升级</h3>
                <div className="upgrade-content">
                  <p className="text-xs text-neutral-600 mb-3">
                    登录后可保存所有作品到云端相册
                  </p>
                  <div className="space-y-2">
                    <Link href="/sign-up" className="block">
                      <button className="w-full tool-button text-xs">
                        免费注册
                      </button>
                    </Link>
                    <Link href="/sign-in" className="block">
                      <button className="w-full tool-button-outline text-xs">
                        登录
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部时间轴（缩略图区域） */}
        <div className="editor-timeline">
          <div className="timeline-header">
            <h4 className="text-sm font-semibold text-neutral-700">项目素材</h4>
            <div className="timeline-controls">
              <span className="text-xs text-neutral-500">{savedImages.length}/3 已生成</span>
              {showVideoOption && (
                <button
                  onClick={generateVideo}
                  disabled={videoGenerating}
                  className="timeline-video-button disabled:opacity-50"
                >
                  {videoGenerating ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>制作中</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>制作Vlog</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className="timeline-track">
            {[0, 1, 2].map((index) => (
              <div key={index} className={`timeline-item ${savedImages[index] ? 'has-content' : 'empty'}`}>
                {savedImages[index] ? (
                  <div className="timeline-thumbnail">
                    <Image
                      src={savedImages[index]}
                      alt={`Frame ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                    <div className="timeline-index">{index + 1}</div>
                  </div>
                ) : (
                  <div className="timeline-placeholder">
                    <PawPrint className="w-6 h-6 text-neutral-400" />
                    <span className="timeline-index">{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}