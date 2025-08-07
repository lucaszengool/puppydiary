"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import ImageEditor, { ImageAdjustments } from "@/components/ImageEditor"
import { 
  Camera, 
  Upload, 
  Download, 
  RefreshCw, 
  Heart,
  Sparkles,
  Sun,
  Cloud,
  Trees,
  Palette,
  Wand2,
  RotateCcw,
  ZoomIn,
  User,
  Plus
} from "lucide-react"
import Link from "next/link"
import './vsco-style.css'

export default function CreatePage() {
  const { userId } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [, setCurrentStep] = useState<'style' | 'upload' | 'processing' | 'result' | 'refine'>('style')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [, setGeneratedPrompt] = useState<string>("")
  const [savedImages, setSavedImages] = useState<string[]>([])
  const [,] = useState<number>(-1) // Track which saved image we're editing
  const [, setShowVideoOption] = useState(false)
  const [, setVideoTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [, setVideoGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [originalPrompt, setOriginalPrompt] = useState<string>("")  // Store the original prompt for reuse
  const [isFirstGeneration, setIsFirstGeneration] = useState(true)  // Track if it's the first generation
  
  // Image editing states
  const [editingMode, setEditingMode] = useState<'none' | 'basic' | 'filters' | 'beauty'>('none')
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    sharpness: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    clarity: 0,
    vibrance: 0,
    // Beauty adjustments
    skinSmooth: 0,
    faceSlim: 0,
    eyeEnlarge: 0,
    skinBrighten: 0,
    teethWhiten: 0,
    // Body adjustments
    bodySlim: 0,
    legLengthen: 0,
    shoulderBroaden: 0
  })
  const [editHistory, setEditHistory] = useState<string[]>([])
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

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
      label: '印象派油画', 
      description: '浪漫印象派绘画风格',
      prompt: 'impressionistic oil painting, romantic impressionist style, visible thick brushstrokes, impasto technique, warm golden tones, soft dreamy atmosphere, painterly texture, classical European oil painting, rich color palette, artistic brushwork, romantic lighting, pastoral beauty'
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
    { id: 'sunny', icon: Sun, label: '阳光明媚', prompt: 'bright sunny garden background, golden sunlight streaming through trees, warm yellow and orange lighting, cheerful outdoor setting with flowers and grass, natural sunbeams' },
    { id: 'dreamy', icon: Cloud, label: '梦幻云朵', prompt: 'soft dreamy cloud background, pastel sky with fluffy white clouds, ethereal atmosphere, soft pink and blue gradient sky, floating in heavenly clouds' },
    { id: 'forest', icon: Trees, label: '森林自然', prompt: 'lush forest background, green trees and foliage, natural woodland setting, dappled sunlight through leaves, moss and ferns, peaceful nature scene' },
    { id: 'warm', icon: Heart, label: '温馨家庭', prompt: 'cozy living room background, warm fireplace, comfortable furniture, soft blankets and cushions, homey atmosphere with warm lighting' },
    { id: 'playful', icon: Sparkles, label: '活泼欢乐', prompt: 'colorful playground background, bright toys and balloons, rainbow colors, fun carnival atmosphere, cheerful party decorations' },
    { id: 'artistic', icon: Palette, label: '艺术空间', prompt: 'artist studio background, easels and paintbrushes, colorful paint palette, canvas and art supplies, creative workshop environment' },
  ]



  // Handle pre-selected style from URL parameters
  useEffect(() => {
    const styleParam = searchParams.get('style')
    if (styleParam) {
      const preSelectedStyle = mainStyleOptions.find(style => style.id === styleParam)
      if (preSelectedStyle) {
        setSelectedStyle(preSelectedStyle)
        setCurrentStep('upload')
      }
    }
  }, [searchParams])

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
        
        // For oil painting style, don't use preservation prompt on first generation
        if (selectedStyle?.id === 'realistic') {
          fullPrompt = stylePrompt
        } else {
          fullPrompt = `${preservationPrompt} ${stylePrompt}`
        }
        
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
    // Save the current image (edited version if available, otherwise generated)
    const imageToSave = editedImage || generatedImage
    if (imageToSave && savedImages.length < 3) {
      const newSavedImages = [...savedImages, imageToSave]
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
    setEditedImage(null)
    setCustomPrompt("")
    setCurrentStep('upload')
    // Reset prompt-related state for new image
    setOriginalPrompt("")
    setIsFirstGeneration(true)
    // Reset editing states
    resetEditing()
    setEditHistory([])
    setCanUndo(false)
  }

  const handleCustomPrompt = async () => {
    if (!selectedFile || !customPrompt.trim()) return
    setCurrentStep('processing')
    // Custom prompt is also a background/scene change
    await generatePortrait(selectedFile, customPrompt, true)
  }



  // 图片编辑功能
  const saveToHistory = () => {
    const currentImage = editedImage || generatedImage
    if (currentImage && editHistory.length < 10) {
      setEditHistory([...editHistory, currentImage])
      setCanUndo(true)
    }
  }

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const previousImage = editHistory[editHistory.length - 1]
      setEditedImage(previousImage)
      setEditHistory(editHistory.slice(0, -1))
      setCanUndo(editHistory.length > 1)
    }
  }

  const handleAdjustmentChange = (newAdjustments: ImageAdjustments) => {
    saveToHistory()
    setImageAdjustments(newAdjustments)
  }

  const handleImageUpdate = (editedImageData: string) => {
    setEditedImage(editedImageData)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const resetEditing = () => {
    setImageAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      sharpness: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      clarity: 0,
      vibrance: 0,
      // Beauty adjustments
      skinSmooth: 0,
      faceSlim: 0,
      eyeEnlarge: 0,
      skinBrighten: 0,
      teethWhiten: 0,
      // Body adjustments
      bodySlim: 0,
      legLengthen: 0,
      shoulderBroaden: 0
    })
    setEditedImage(null)
    setEditingMode('none')
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
    // Reset editing states
    resetEditing()
    setEditHistory([])
    setEditedImage(null)
    setCanUndo(false)
    setIsZoomed(false)
  }

  return (
    <div className="vsco-container">
      {/* VSCO Style Header */}
      <header className="vsco-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-lg font-medium text-black tracking-wide">
              PETPO
            </Link>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500">
                {selectedStyle ? selectedStyle.label : '选择风格'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              重置
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className={`vsco-editor ${savedImages.length > 0 ? 'with-gallery' : ''}`}>
        {/* Left Panel - Style Selection & Upload */}
        <div className="vsco-tools">
          {!selectedStyle && (
            <div className="fade-in">
              <h3 className="adjustment-title">选择风格</h3>
              <div className="style-grid">
                {mainStyleOptions.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => handleStyleSelect(style)}
                    className={`style-card ${selectedStyle?.id === style.id ? 'selected' : ''}`}
                  >
                    <img
                      src={`/styles/${style.id === 'realistic' ? 'disney' : style.id}-style.png`}
                      alt={style.label}
                    />
                    <div className="style-label">{style.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedStyle && !selectedFile && (
            <div className="fade-in">
              <h3 className="adjustment-title">上传照片</h3>
              <div
                className="upload-zone"
                onClick={handleUploadClick}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium mb-2">点击上传照片</p>
                <p className="text-xs text-gray-500">支持 JPG, PNG 格式</p>
              </div>
              <button
                onClick={handleCameraClick}
                className="w-full vsco-btn secondary small"
              >
                <Camera className="w-4 h-4 mr-2" />
                拍摄照片
              </button>

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

          {selectedFile && selectedImageUrl && !generatedImage && (
            <div className="fade-in">
              <h3 className="adjustment-title">预览</h3>
              <div className="mb-4">
                <img
                  src={selectedImageUrl}
                  alt="预览"
                  className="w-full aspect-square object-cover rounded-sm"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full vsco-btn"
              >
                {isProcessing ? (
                  <>
                    <div className="vsco-spinner w-4 h-4 mr-2"></div>
                    生成中...
                  </>
                ) : (
                  '开始创作'
                )}
              </button>
            </div>
          )}

          {generatedImage && (
            <div className="fade-in">
              <h3 className="adjustment-title">操作</h3>
              <div className="space-y-3">
                <button
                  onClick={toggleZoom}
                  className="w-full vsco-btn secondary small"
                >
                  <ZoomIn className="w-4 h-4 mr-2" />
                  {isZoomed ? '缩小' : '放大'}
                </button>
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="w-full vsco-btn secondary small disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  撤销
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    // Export the edited version if available, otherwise the original generated image
                    const imageToExport = editedImage || generatedImage
                    a.href = imageToExport
                    a.download = `pet-portrait-${selectedStyle?.id || 'artwork'}-${Date.now()}.png`
                    a.click()
                  }}
                  className="w-full vsco-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </button>
                {savedImages.length < 3 ? (
                  <button onClick={handleNextImage} className="w-full vsco-btn secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    保存并继续
                  </button>
                ) : (
                  <button onClick={handleReset} className="w-full vsco-btn secondary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新开始
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center - Image Display */}
        <div className="vsco-canvas">
          {!selectedStyle && (
            <div className="text-center">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-light text-gray-600 mb-2">选择艺术风格</h3>
              <p className="text-sm text-gray-400">开始您的宠物肖像创作</p>
            </div>
          )}

          {selectedStyle && !selectedFile && (
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-light text-gray-600 mb-2">上传宠物照片</h3>
              <p className="text-sm text-gray-400">将转换为{selectedStyle.label}风格</p>
            </div>
          )}

          {isProcessing && (
            <div className="vsco-loading">
              <div className="text-center">
                <div className="vsco-spinner mb-4"></div>
                <h3 className="text-lg font-light text-gray-600 mb-2">AI 创作中</h3>
                <p className="text-sm text-gray-400">正在生成{selectedStyle?.label}风格作品</p>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className="vsco-image-container">
              <img
                src={editedImage || generatedImage}
                alt="生成的艺术作品"
                className={`vsco-image ${isZoomed ? 'scale-150 cursor-move' : ''} transition-transform duration-300`}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Adjustments */}
        <div className="vsco-adjustments">
          {generatedImage && (
            <div className="fade-in">
              {/* Adjustment Tabs */}
              <div className="adjustment-section">
                <div className="flex space-x-1 mb-6">
                  <button
                    onClick={() => setEditingMode('basic')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                      editingMode === 'basic' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    调整
                  </button>
                  <button
                    onClick={() => setEditingMode('filters')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                      editingMode === 'filters' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    滤镜
                  </button>
                  <button
                    onClick={() => setEditingMode('beauty')}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                      editingMode === 'beauty' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    美颜
                  </button>
                </div>

                {/* Real-time Image Editor */}
                {(editingMode === 'basic' || editingMode === 'filters' || editingMode === 'beauty') && (
                  <>
                    <ImageEditor
                      originalImage={generatedImage}
                      adjustments={imageAdjustments}
                      onAdjustmentChange={handleAdjustmentChange}
                      onImageUpdate={handleImageUpdate}
                    />
                    
                    {editingMode === 'basic' && (
                      <div className="space-y-4 mt-6">
                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>曝光</span>
                            <span className="adjustment-value">{imageAdjustments.brightness}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={imageAdjustments.brightness}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, brightness: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>对比度</span>
                            <span className="adjustment-value">{imageAdjustments.contrast}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={imageAdjustments.contrast}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, contrast: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>饱和度</span>
                            <span className="adjustment-value">{imageAdjustments.saturation}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={imageAdjustments.saturation}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, saturation: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>温度</span>
                            <span className="adjustment-value">{imageAdjustments.warmth}</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={imageAdjustments.warmth}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, warmth: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>
                      </div>
                    )}
                    
                    {editingMode === 'beauty' && (
                      <div className="space-y-4 mt-6">
                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>磨皮</span>
                            <span className="adjustment-value">{imageAdjustments.skinSmooth}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imageAdjustments.skinSmooth}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, skinSmooth: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>瘦脸</span>
                            <span className="adjustment-value">{imageAdjustments.faceSlim}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imageAdjustments.faceSlim}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, faceSlim: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>大眼</span>
                            <span className="adjustment-value">{imageAdjustments.eyeEnlarge}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imageAdjustments.eyeEnlarge}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, eyeEnlarge: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>瘦身</span>
                            <span className="adjustment-value">{imageAdjustments.bodySlim}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imageAdjustments.bodySlim}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, bodySlim: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>

                        <div className="adjustment-item">
                          <div className="adjustment-label">
                            <span>长腿</span>
                            <span className="adjustment-value">{imageAdjustments.legLengthen}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imageAdjustments.legLengthen}
                            onChange={(e) => {
                              const newAdjustments = { ...imageAdjustments, legLengthen: parseInt(e.target.value) }
                              handleAdjustmentChange(newAdjustments)
                            }}
                            className="vsco-slider"
                          />
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={resetEditing}
                      className="w-full vsco-btn secondary small mt-6"
                    >
                      重置所有调整
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Scene adjustments when not editing */}
          {generatedImage && editingMode === 'none' && (
            <div className="adjustment-section fade-in">
              <h3 className="adjustment-title">场景</h3>
              <div className="space-y-3">
                {sceneOptions.slice(0, 4).map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleStyleChange(scene.prompt)}
                    disabled={isProcessing}
                    className="w-full vsco-btn secondary small text-left"
                  >
                    {scene.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="自定义场景..."
                  className="w-full p-3 text-sm border border-gray-200 rounded-sm mb-3 focus:outline-none focus:border-black transition-colors"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleCustomPrompt}
                  disabled={isProcessing || !customPrompt.trim()}
                  className="w-full vsco-btn small disabled:opacity-50"
                >
                  应用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Images Gallery */}
      {savedImages.length > 0 && (
        <div className="vsco-gallery-bottom">
          <div className="vsco-gallery-container">
            <div className="vsco-gallery-header">
              <h4 className="vsco-gallery-title">已保存作品 ({savedImages.length}/3)</h4>
              {savedImages.length >= 3 && (
                <button
                  onClick={() => {
                    // Generate video functionality
                    toast({
                      title: "视频生成",
                      description: "视频生成功能即将推出",
                    })
                  }}
                  className="vsco-btn small"
                >
                  生成视频
                </button>
              )}
            </div>
            <div className="vsco-gallery-grid">
              {savedImages.map((image, index) => (
                <div 
                  key={index} 
                  className="vsco-gallery-item"
                  onClick={() => {
                    // Option to view saved image in modal or download
                    const a = document.createElement('a')
                    a.href = image
                    a.download = `saved-artwork-${index + 1}-${Date.now()}.png`
                    a.click()
                  }}
                  title="点击下载"
                >
                  <img
                    src={image}
                    alt={`保存的作品 ${index + 1}`}
                    className="vsco-gallery-thumbnail"
                  />
                  <div className="vsco-gallery-overlay">
                    <span className="vsco-gallery-number">{index + 1}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: 3 - savedImages.length }).map((_, index) => (
                <div key={`empty-${index}`} className="vsco-gallery-item empty">
                  <div className="vsco-gallery-empty">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">艺术视频</h3>
              <button
                onClick={() => setVideoUrl(null)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>
            <video
              controls
              autoPlay
              className="w-full rounded-sm mb-4"
              poster={savedImages[0]}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="flex justify-center">
              <a
                href={videoUrl}
                download={`pet-art-video-${Date.now()}.mp4`}
                className="vsco-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                下载视频
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}