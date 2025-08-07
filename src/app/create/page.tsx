"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import ImageEditor, { ImageAdjustments, FilterPreset } from "@/components/ImageEditor"
import PinchZoomImage from "@/components/PinchZoomImage"
import PublishDialog from "@/components/PublishDialog"
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
  // const [editingImageIndex, setEditingImageIndex] = useState<number>(-1) // Track which saved image we're editing
  const [, setShowVideoOption] = useState(false)
  const [, setVideoTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [, setVideoGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [originalPrompt, setOriginalPrompt] = useState<string>("")  // Store the original prompt for reuse
  const [isFirstGeneration, setIsFirstGeneration] = useState(true)  // Track if it's the first generation
  
  // Image editing states
  const [editingMode, setEditingMode] = useState<'none' | 'adjustments' | 'filters' | 'ai-prompt'>('none')
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
  })
  const [editHistory, setEditHistory] = useState<string[]>([])
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

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
      prompt: 'Disney animation style, cute cartoon, vibrant colors, expressive characters, playful, colorful, animated movie style, Disney Pixar art style, maintain exact facial features and body proportions, preserve all unique markings and characteristics, keep the same pose and expression, identical eye shape and color, same fur patterns and colors'
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
      prompt: 'modern art style, contemporary illustration, clean lines, minimalist design, digital art, stylized portrait, modern graphic design, preserve exact facial structure and expression, maintain all distinctive features and markings, keep identical body proportions and posture, same eye shape and nose structure, preserve all unique characteristics and fur patterns'
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
      
      // Use the latest edited image if available, otherwise use the original file
      if (editedImage && !isFirstGeneration) {
        // Convert the edited image data URL to a blob
        const response = await fetch(editedImage)
        const blob = await response.blob()
        formData.append("image", blob, "edited-image.jpg")
      } else {
        formData.append("image", file)
      }
      
      if (userId) {
        formData.append("userId", userId)
      }
      
      // 铁的定义：必须100%保留原有外貌特征的基础提示词 - Always included
      const preservationPrompt = "重要规则：必须100%保留原始图片中的人物或宠物的所有外貌特征和身体特征：面部表情、姿势、动作、身体大小、生物特征、解剖细节，包括眼睛形状、鼻子、嘴巴、耳朵、毛发图案、毛色、标记和任何独特特征都要完全一致，不允许任何改变。"
      
      let fullPrompt: string
      
      // Always include preservation prompt in all generations
      if (isBackgroundChange && originalPrompt) {
        // Keep the original style but change only the background/scene
        fullPrompt = `${preservationPrompt} ${originalPrompt}`
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
        
        // Always include preservation prompt, even for oil painting
        fullPrompt = `${preservationPrompt} ${stylePrompt}`
        
        // Store the original prompt with style for future use
        setOriginalPrompt(stylePrompt)
        setIsFirstGeneration(false)
      } else {
        // Subsequent generations with the same style - always preserve appearance
        const baseStyle = originalPrompt || selectedStyle?.prompt
        fullPrompt = `${preservationPrompt} ${baseStyle}`
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
      
      // Reset edited image when new generation is created
      setEditedImage(null)
      
      toast({
        title: "生成成功！",
        description: "您的宠物艺术作品已经创作完成",
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

  // Filter presets for mobile interface
  const filterPresets: FilterPreset[] = [
    // Basic filters
    { id: 'none', name: '原图', adjustments: {} },
    { id: 'A4', name: 'A4', adjustments: { brightness: 10, warmth: 20, saturation: -5, exposure: 8 } },
    { id: 'A6', name: 'A6', adjustments: { brightness: 5, contrast: 10, saturation: -10, shadows: 10 } },
    { id: 'B1', name: 'B1', adjustments: { saturation: -100, contrast: 25, brightness: -5 } },
    { id: 'M5', name: 'M5', adjustments: { warmth: 30, brightness: -5, saturation: -15, exposure: 5 } },
    { id: 'HB1', name: 'HB1', adjustments: { brightness: 8, contrast: 12, vibrance: 15 } },
    { id: 'HB2', name: 'HB2', adjustments: { warmth: 25, brightness: 5, saturation: 10 } },
    { id: 'F2', name: 'F2', adjustments: { brightness: -8, contrast: 20, saturation: -12 } },
    { id: 'G3', name: 'G3', adjustments: { warmth: -15, brightness: 10, highlights: -15 } },
    { id: 'K1', name: 'K1', adjustments: { brightness: 15, saturation: 20, contrast: -5 } },
    { id: 'K2', name: 'K2', adjustments: { warmth: 35, brightness: 8, saturation: -8 } },
    { id: 'K3', name: 'K3', adjustments: { brightness: -10, contrast: 18, warmth: 10 } },
    { id: 'S1', name: 'S1', adjustments: { saturation: 25, vibrance: 20, brightness: 5 } },
    { id: 'S2', name: 'S2', adjustments: { warmth: -20, brightness: 8, contrast: 12 } },
    { id: 'S3', name: 'S3', adjustments: { brightness: -5, contrast: 15, saturation: -10 } },
    { id: 'T1', name: 'T1', adjustments: { warmth: 15, brightness: 12, highlights: -10 } },
    { id: 'T2', name: 'T2', adjustments: { brightness: -8, contrast: 20, vibrance: 15 } },
    { id: 'C1', name: 'C1', adjustments: { saturation: -30, brightness: 10, contrast: 8 } },
    { id: 'C8', name: 'C8', adjustments: { warmth: 25, brightness: 5, shadows: 15 } },
    { id: 'X1', name: 'X1', adjustments: { brightness: -12, contrast: 25, saturation: -15 } },
    { id: 'vintage', name: '复古', adjustments: { brightness: -10, contrast: 15, saturation: -20, warmth: 25, highlights: -15 } },
    { id: 'film', name: '胶片', adjustments: { warmth: 20, brightness: -5, contrast: 18, saturation: -8 } },
    { id: 'analog', name: '模拟', adjustments: { brightness: 8, warmth: 15, highlights: -12, shadows: 8 } },
    { id: 'cinematic', name: '电影', adjustments: { brightness: -10, contrast: 20, saturation: -12, shadows: -10 } },
    { id: 'portrait', name: '人像', adjustments: { brightness: 5, warmth: 10, highlights: -5 } },
    { id: 'landscape', name: '风景', adjustments: { vibrance: 25, clarity: 15, contrast: 10, saturation: 5 } },
    { id: 'street', name: '街拍', adjustments: { brightness: -5, contrast: 18, clarity: 12, saturation: -8 } },
    { id: 'minimal', name: '极简', adjustments: { brightness: 10, shadows: 20, highlights: -10, saturation: -15 } }
  ]

  const applyPreset = (preset: FilterPreset) => {
    const newAdjustments = { ...imageAdjustments }
    
    // Reset all adjustments first if applying a preset
    Object.keys(newAdjustments).forEach(key => {
      (newAdjustments as any)[key] = 0
    })
    
    // Apply preset adjustments
    Object.entries(preset.adjustments).forEach(([key, value]) => {
      if (value !== undefined) {
        (newAdjustments as any)[key] = value
      }
    })
    
    handleAdjustmentChange(newAdjustments)
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
  }

  const handlePublishClick = () => {
    if (!userId) {
      // Store current URL and redirect to login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      window.location.href = '/sign-in'
    } else {
      setShowPublishDialog(true)
    }
  }

  const handlePublishConfirm = async (description?: string) => {
    const imageToPublish = editedImage || generatedImage
    if (!imageToPublish) return

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageToPublish,
          description: description
        })
      })

      if (response.ok) {
        toast({
          title: "发布成功！",
          description: "您的作品已发布到作品集社区",
        })
      } else {
        throw new Error('发布失败')
      }
    } catch (error) {
      console.error("Publish error:", error)
      toast({
        title: "发布失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
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
                <button
                  onClick={handlePublishClick}
                  className="w-full vsco-btn secondary"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  发布作品
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
              <PinchZoomImage
                src={editedImage || generatedImage}
                alt="生成的艺术作品"
                className="transition-transform duration-300"
              />
            </div>
          )}
        </div>

        {/* VSCO Mobile-Style Layout */}
        {generatedImage && (
          <>
            {/* Mobile VSCO Style Interface */}
            <div className="fixed inset-0 bg-white z-40">
              {/* Header with reset button */}
              <div className="absolute top-0 right-0 z-50 p-4">
                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center border border-gray-200/50 hover:bg-white/80 transition-all shadow-sm"
                >
                  <RotateCcw className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Bottom-left action buttons */}
              <div className="absolute bottom-32 left-0 z-60 p-4 pointer-events-auto">
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      // Save to history and next image functionality
                      const imageToSave = editedImage || generatedImage
                      if (imageToSave && savedImages.length < 3) {
                        const newSavedImages = [...savedImages, imageToSave]
                        setSavedImages(newSavedImages)
                        handleNextImage()
                      }
                    }}
                    className="px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full text-gray-800 text-sm font-medium border border-gray-200/50 hover:bg-white/80 transition-all shadow-sm"
                  >
                    下一张
                  </button>
                  <button 
                    className="px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full text-gray-800 text-sm font-medium border border-gray-200/50 hover:bg-white/80 transition-all shadow-sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.download = `petpo-art-${Date.now()}.png`
                      link.href = editedImage || generatedImage!
                      link.click()
                    }}
                  >
                    保存
                  </button>
                  <button 
                    className="px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full text-gray-800 text-sm font-medium border border-gray-200/50 hover:bg-white/80 transition-all shadow-sm"
                    onClick={handlePublishClick}
                  >
                    发布
                  </button>
                </div>
              </div>

              {/* Image Display Area */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <PinchZoomImage
                    src={editedImage || generatedImage}
                    alt="生成的艺术作品"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Bottom Tools - Only appear when clicked */}
              <div className="absolute bottom-0 left-0 right-0">
                {/* Tool Icons Row */}
                <div className="flex items-center justify-center space-x-8 p-6 bg-gradient-to-t from-gray-100/90 to-transparent">
                  <button
                    onClick={() => setEditingMode(editingMode === 'adjustments' ? 'none' : 'adjustments')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      editingMode === 'adjustments' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 backdrop-blur-sm text-gray-700 border'
                    }`}
                  >
                    <div className="w-6 h-6 rounded border-2 border-current" />
                  </button>
                  
                  <button
                    onClick={() => setEditingMode(editingMode === 'filters' ? 'none' : 'filters')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      editingMode === 'filters' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 backdrop-blur-sm text-gray-700 border'
                    }`}
                  >
                    <Palette className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setEditingMode(editingMode === 'ai-prompt' ? 'none' : 'ai-prompt')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      editingMode === 'ai-prompt' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 backdrop-blur-sm text-gray-700 border'
                    }`}
                  >
                    <Wand2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Tool Panels - Show only when active */}
                {editingMode !== 'none' && (
                  <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 max-h-80 overflow-y-auto">

                    {/* Adjustments Panel */}
                    {editingMode === 'adjustments' && (
                      <div className="p-4 space-y-6">
                        <div className="space-y-4">
                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">曝光</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.exposure}</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={imageAdjustments.exposure}
                              onChange={(e) => {
                                const newAdjustments = { ...imageAdjustments, exposure: parseInt(e.target.value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">高光</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.highlights}</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={imageAdjustments.highlights}
                              onChange={(e) => {
                                const newAdjustments = { ...imageAdjustments, highlights: parseInt(e.target.value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">阴影</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.shadows}</span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={imageAdjustments.shadows}
                              onChange={(e) => {
                                const newAdjustments = { ...imageAdjustments, shadows: parseInt(e.target.value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">对比度</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.contrast}</span>
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
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">饱和度</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.saturation}</span>
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
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm">色温</span>
                              <span className="text-gray-600 text-sm">{imageAdjustments.warmth}</span>
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
                              className="vsco-slider-mobile"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Filters Panel */}
                    {editingMode === 'filters' && (
                      <div className="p-4">
                        <h3 className="text-gray-800 text-center font-medium mb-4">滤镜</h3>
                        
                        <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                          {filterPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => applyPreset(preset)}
                              className="flex-shrink-0 w-16 h-16 bg-gray-100 backdrop-blur-sm rounded text-gray-800 text-xs p-2 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Prompt Panel */}
                    {editingMode === 'ai-prompt' && (
                      <div className="p-4">
                        <h3 className="text-gray-800 text-center font-medium mb-4">AI 提示词</h3>
                        
                        <div className="space-y-4">
                          <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="描述您想要的场景改变..."
                            className="w-full h-24 bg-gray-100 border border-gray-200 rounded p-3 text-gray-800 placeholder-gray-500 text-sm resize-none"
                          />
                          
                          <button
                            onClick={handleCustomPrompt}
                            disabled={isProcessing || !customPrompt.trim()}
                            className="w-full bg-gray-800 text-white py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? '生成中...' : '应用更改'}
                          </button>
                          
                          {/* Scene Options */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {sceneOptions.map((scene) => (
                              <button
                                key={scene.id}
                                onClick={() => {
                                  setCustomPrompt(scene.prompt)
                                }}
                                className="p-3 bg-gray-100 backdrop-blur-sm rounded text-gray-800 text-xs hover:bg-gray-200 transition-colors"
                              >
                                <scene.icon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                <div>{scene.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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

      {/* Publish Dialog */}
      <PublishDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm}
        imageUrl={editedImage || generatedImage || ''}
      />
    </div>
  )
}
