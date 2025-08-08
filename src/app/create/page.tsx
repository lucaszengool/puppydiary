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
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import './vsco-style.css'

export default function CreatePage() {
  const { userId, isSignedIn, isLoaded } = useAuth()
  
  console.log("[AUTH DEBUG] Auth state:", { userId, isSignedIn, isLoaded })
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
  const [showVideoOption, setShowVideoOption] = useState(false)
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoGenerating, setVideoGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [originalPrompt, setOriginalPrompt] = useState<string>("")  // Store the original prompt for reuse
  const [isFirstGeneration, setIsFirstGeneration] = useState(true)  // Track if it's the first generation
  const [stateRestored, setStateRestored] = useState(false)  // Track if state has been restored from login
  const [isProcessingFile, setIsProcessingFile] = useState(false)  // Prevent multiple file selections
  
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
  const [adjustmentHistory, setAdjustmentHistory] = useState<ImageAdjustments[]>([])
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("")

  // 主要艺术风格选项
  const mainStyleOptions = [
    { 
      id: 'ghibli', 
      icon: Heart, 
      label: '宫崎骏动漫', 
      description: '温暖治愈的手绘风格',
      prompt: 'Studio Ghibli anime style, hand-drawn illustration, warm colors, soft lighting, whimsical and heartwarming, preserve all facial features and body proportions, keep same pose and expression, maintain all unique characteristics'
    },
    { 
      id: 'disney', 
      icon: Sparkles, 
      label: '迪士尼卡通', 
      description: '可爱生动的卡通风格',
      prompt: 'Disney animation style, cartoon illustration, bright colors, cute and charming, maintain facial features and body proportions, preserve unique markings, keep same pose and expression'
    },
    { 
      id: 'realistic', 
      icon: Camera, 
      label: '印象派油画', 
      description: '浪漫印象派绘画风格',
      prompt: 'Impressionist oil painting style, visible brushstrokes, warm colors, soft lighting, artistic painting, preserve facial features and body proportions, maintain unique characteristics, keep same pose and expression'
    },
    { 
      id: 'watercolor', 
      icon: Palette, 
      label: '水彩插画', 
      description: '柔美的水彩艺术风格',
      prompt: 'watercolor illustration, soft watercolor painting, delicate brushstrokes, flowing colors, artistic illustration, gentle and dreamy watercolor art, maintain exact facial features and body proportions, preserve all unique markings and characteristics, keep the same pose and expression, identical eye shape and color, same fur patterns and colors, preserve all distinctive features'
    },
    { 
      id: 'vintage', 
      icon: Sun, 
      label: '复古怀旧', 
      description: '温暖的复古摄影风格',
      prompt: 'vintage style, retro aesthetic, warm sepia tones, nostalgic atmosphere, classic portrait, preserve facial features and body proportions, maintain unique characteristics, keep same pose and expression'
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
    { id: 'sunny', icon: Sun, label: '阳光明媚', prompt: 'just change the background, keep figure the same, bright sunny garden background, golden sunlight streaming through trees, warm yellow and orange lighting, cheerful outdoor setting with flowers and grass, natural sunbeams' },
    { id: 'dreamy', icon: Cloud, label: '梦幻云朵', prompt: 'just change the background, keep figure the same, soft dreamy cloud background, pastel sky with fluffy white clouds, ethereal atmosphere, soft pink and blue gradient sky, floating in heavenly clouds' },
    { id: 'forest', icon: Trees, label: '森林自然', prompt: 'just change the background, keep figure the same, lush forest background, green trees and foliage, natural woodland setting, dappled sunlight through leaves, moss and ferns, peaceful nature scene' },
    { id: 'warm', icon: Heart, label: '温馨家庭', prompt: 'just change the background, keep figure the same, cozy living room background, warm fireplace, comfortable furniture, soft blankets and cushions, homey atmosphere with warm lighting' },
    { id: 'playful', icon: Sparkles, label: '活泼欢乐', prompt: 'just change the background, keep figure the same, colorful playground background, bright toys and balloons, rainbow colors, fun carnival atmosphere, cheerful party decorations' },
    { id: 'artistic', icon: Palette, label: '艺术空间', prompt: 'just change the background, keep figure the same, artist studio background, easels and paintbrushes, colorful paint palette, canvas and art supplies, creative workshop environment' },
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

  // State restoration effect - runs after login
  useEffect(() => {
    if (userId && !stateRestored) {
      const savedState = sessionStorage.getItem('appStateBeforeLogin')
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          
          // Restore all the saved state
          if (state.selectedStyle) setSelectedStyle(state.selectedStyle)
          if (state.generatedImage) setGeneratedImage(state.generatedImage)
          if (state.editedImage) setEditedImage(state.editedImage)
          if (state.savedImages) setSavedImages(state.savedImages)
          if (state.customPrompt) setCustomPrompt(state.customPrompt)
          if (state.originalPrompt) setOriginalPrompt(state.originalPrompt)
          if (state.isFirstGeneration !== undefined) setIsFirstGeneration(state.isFirstGeneration)
          if (state.imageAdjustments) setImageAdjustments(state.imageAdjustments)
          if (state.editingMode) setEditingMode(state.editingMode)
          if (state.currentStep) setCurrentStep(state.currentStep)
          
          // Clean up
          sessionStorage.removeItem('appStateBeforeLogin')
          setStateRestored(true)
          
          toast({
            title: "状态已恢复",
            description: "您的创作进度已恢复",
          })
        } catch (error) {
          console.error('Error restoring state:', error)
          sessionStorage.removeItem('appStateBeforeLogin')
        }
      }
      setStateRestored(true)
    }
  }, [userId, stateRestored]) 

  const handleFileSelect = async (file: File) => {
    console.log("handleFileSelect called with:", file ? file.name : "no file")
    
    // Prevent multiple concurrent file processing
    if (isProcessingFile) {
      console.log("File processing already in progress, ignoring...")
      return
    }
    
    if (!file) {
      toast({
        title: "选择文件失败",
        description: "请重新选择图片",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过 10MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "文件格式不支持",
        description: "请选择 JPG、PNG 或 WebP 格式的图片",
        variant: "destructive",
      })
      return
    }

    if (!selectedStyle) {
      toast({
        title: "请先选择风格",
        description: "请选择艺术风格后上传照片",
        variant: "destructive",
      })
      return
    }

    console.log("File validation passed, creating URL...")
    setIsProcessingFile(true)  // Set processing flag
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setSelectedImageUrl(url)
    setCurrentStep('processing')
    
    toast({
      title: "开始创作",
      description: "AI 正在为您的宠物生成艺术作品...",
    })

    // Automatically start generation
    try {
      await generatePortrait(file, undefined, false)
    } finally {
      setIsProcessingFile(false)  // Clear processing flag
    }
  }

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style)
    setCurrentStep('upload')
  }


  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
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
      
      // Show different messages based on saved images count
      if (savedImages.length === 0) {
        toast({
          title: "🎨 第一张作品生成成功！",
          description: "🎥 提示：收集三张作品后可以制作专属 Vlog 视频哦！",
        })
      } else {
        toast({
          title: "生成成功！",
          description: "您的宠物艺术作品已经创作完成",
        })
      }
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

  const handleNextImage = async () => {
    // Apply final edits and save the result
    let imageToSave = generatedImage
    if (Object.values(imageAdjustments).some(val => val !== 0)) {
      // If there are adjustments, apply them and get the final image
      const finalEditedImage = await applyFinalEdit()
      imageToSave = finalEditedImage || generatedImage
      setEditedImage(imageToSave)
    } else {
      imageToSave = editedImage || generatedImage
    }
    
    if (imageToSave && savedImages.length < 3) {
      const newSavedImages = [...savedImages, imageToSave]
      setSavedImages(newSavedImages)
      
      // If we now have 3 images, show video option
      if (newSavedImages.length >= 3) {
        setShowVideoOption(true)
        toast({
          title: "🎥 可以制作视频啦！",
          description: "您已收集到3张作品，现在可以制作专属Vlog视频了",
        })
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

  const handleGenerateVlog = async () => {
    console.log("🎬 [VLOG DEBUG] Starting vlog generation process...")
    console.log("📊 [VLOG DEBUG] Current state:", {
      savedImagesCount: savedImages.length,
      userId: userId,
      selectedStyle: selectedStyle?.label,
      videoGenerating: videoGenerating
    })
    
    if (savedImages.length < 3) {
      console.warn("⚠️ [VLOG DEBUG] Insufficient images:", savedImages.length)
      toast({
        title: "图片不足",
        description: "需要保存3张图片才能制作Vlog",
        variant: "destructive"
      })
      return
    }

    if (!userId) {
      console.error("🚫 [VLOG DEBUG] No user ID found - user not authenticated")
      toast({
        title: "需要登录",
        description: "请先登录后再制作视频",
        variant: "destructive"
      })
      return
    }

    setVideoGenerating(true)
    
    try {
      console.log("🚀 [VLOG DEBUG] Starting vlog generation with", savedImages.length, "images")
      console.log("📦 [VLOG DEBUG] Request details:", {
        imageCount: savedImages.length,
        style: selectedStyle?.label || '宠物艺术',
        userId: userId,
        firstImageLength: savedImages[0]?.length || 'N/A'
      })
      
      // Call vlog generation API
      const response = await fetch('/api/generate-vlog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: savedImages,
          style: selectedStyle?.label || '宠物艺术',
          transitions: 'smooth',
          music: 'ambient'
        })
      })

      console.log("📝 [VLOG DEBUG] API response status:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("🚫 [VLOG DEBUG] API error response:", errorText)
        throw new Error(`Vlog generation failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ [VLOG DEBUG] API response data:", result)
      
      if (result.success && result.videoUrl) {
        console.log("🎥 [VLOG DEBUG] Video generation successful!")
        console.log("🔗 [VLOG DEBUG] Setting video URL:", result.videoUrl)
        setVideoUrl(result.videoUrl)
        setVideoTaskId(result.taskId)
        setShowVideoOption(true)
        console.log("🎥 [VLOG DEBUG] Video state updated - modal should appear")
        
        toast({
          title: "Vlog制作完成！",
          description: "您的专属宠物艺术Vlog已准备就绪",
        })
      } else {
        console.error("🚫 [VLOG DEBUG] Unexpected response format:", result)
        throw new Error(result.error || 'Unknown error')
      }
      
    } catch (error) {
      console.error('🚨 [VLOG DEBUG] Vlog generation error:', error)
      console.error('🚨 [VLOG DEBUG] Error stack:', (error as Error)?.stack)
      toast({
        title: "Vlog制作失败",
        description: `制作过程中出现错误: ${(error as Error)?.message || '未知错误'}`,
        variant: "destructive"
      })
    } finally {
      console.log("🏁 [VLOG DEBUG] Video generation process completed")
      setVideoGenerating(false)
    }
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
    // Save current state to history before making changes
    if (adjustmentHistory.length === 0 || JSON.stringify(imageAdjustments) !== JSON.stringify(adjustmentHistory[adjustmentHistory.length - 1])) {
      const newHistory = [...adjustmentHistory, imageAdjustments]
      setAdjustmentHistory(newHistory.slice(-10)) // Keep last 10 states
      setCanUndo(true)
    }
    
    // Immediately update adjustments for real-time preview
    setImageAdjustments(newAdjustments)
  }

  const handleUndoAdjustment = () => {
    if (adjustmentHistory.length > 0) {
      const previousState = adjustmentHistory[adjustmentHistory.length - 1]
      setImageAdjustments(previousState)
      setAdjustmentHistory(adjustmentHistory.slice(0, -1))
      setCanUndo(adjustmentHistory.length > 1)
    }
  }

  // Function to apply and save the final edited image using Canvas
  const applyFinalEdit = async () => {
    if (!generatedImage) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise<string>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(generatedImage)

        canvas.width = img.width
        canvas.height = img.height

        // Apply CSS filters to canvas context
        const filters = []
        if (imageAdjustments.brightness !== 0) {
          filters.push(`brightness(${100 + imageAdjustments.brightness}%)`)
        }
        if (imageAdjustments.contrast !== 0) {
          filters.push(`contrast(${100 + imageAdjustments.contrast}%)`)
        }
        if (imageAdjustments.saturation !== 0) {
          filters.push(`saturate(${100 + imageAdjustments.saturation}%)`)
        }
        if (imageAdjustments.warmth > 0) {
          filters.push(`sepia(${imageAdjustments.warmth / 2}%)`)
        }
        if (imageAdjustments.warmth < 0) {
          filters.push(`hue-rotate(${imageAdjustments.warmth}deg)`)
        }
        if (imageAdjustments.exposure !== 0) {
          filters.push(`opacity(${100 + imageAdjustments.exposure / 2}%)`)
        }

        ctx.filter = filters.join(' ')
        ctx.drawImage(img, 0, 0)
        
        const editedDataUrl = canvas.toDataURL('image/png')
        resolve(editedDataUrl)
      }
      img.src = generatedImage
    })
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
    console.log("🔥 Publish button clicked!")
    console.log("userId:", userId)
    console.log("generatedImage:", generatedImage ? "exists" : "missing")
    console.log("editedImage:", editedImage ? "exists" : "missing")
    
    if (!userId) {
      console.log("No user, redirecting to login")
      toast({
        title: "需要登录",
        description: "正在跳转到登录页面",
      })
      
      // Save current application state before login
      const currentState = {
        selectedStyle,
        generatedImage,
        editedImage,
        savedImages,
        customPrompt,
        originalPrompt,
        isFirstGeneration,
        imageAdjustments,
        editingMode,
        currentStep: 'result' // Set to result to show the generated image
      }
      
      sessionStorage.setItem('appStateBeforeLogin', JSON.stringify(currentState))
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search)
      window.location.href = '/sign-in'
      return
    }

    if (!generatedImage && !editedImage) {
      toast({
        title: "没有图片",
        description: "请先生成一张图片",
        variant: "destructive",
      })
      return
    }

    console.log("✅ All checks passed, showing dialog")
    setShowPublishDialog(true)
  }

  const handlePublishConfirm = async (description?: string) => {
    console.log("🚀 Publish confirm called!")
    const imageToPublish = editedImage || generatedImage
    console.log("📸 Image to publish:", imageToPublish ? "exists" : "missing")
    
    if (!imageToPublish) {
      console.log("❌ No image to publish")
      return
    }

    try {
      console.log("📤 Sending publish request...")
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

      console.log("📡 Publish response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Publish successful:", result)
        toast({
          title: "发布成功！",
          description: "您的作品已发布到作品集社区",
        })
      } else {
        const errorData = await response.json()
        console.error("❌ Publish failed:", errorData)
        throw new Error('发布失败')
      }
    } catch (error) {
      console.error("Publish error:", error)
      toast({
        title: "Publish failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="vsco-container">
      {/* Desktop VSCO Style Header */}
      <header className="vsco-header hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-medium text-black tracking-wide">
            PETPO
          </Link>
          <nav className="flex items-center space-x-3 md:space-x-4">
            <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              作品集
            </Link>
            <span className="hidden md:inline text-sm text-gray-500">
              {selectedStyle ? selectedStyle.label : '选择风格'}
            </span>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              重置
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Upload Interface - Show when no image generated */}
      {!generatedImage && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col overflow-y-auto">
          {/* Processing overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 mx-4 max-w-sm w-full text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">生成中</h3>
                <p className="text-gray-600 text-sm">AI 正在为您的宠物创作艺术作品...</p>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h1 className="text-lg font-light">PETPO</h1>
            <Link href="/gallery" className="text-sm text-gray-600">
              作品集
            </Link>
          </div>

          {/* Saved Images Gallery - Desktop only */}
          {savedImages.length > 0 && (
            <div className="vsco-gallery-bottom hidden md:block">
              <div className="vsco-gallery-container">
                <div className="vsco-gallery-header">
                  <h4 className="vsco-gallery-title">已保存作品 ({savedImages.length}/3)</h4>
                  {savedImages.length >= 3 ? (
                    <button
                      onClick={handleGenerateVlog}
                      disabled={videoGenerating}
                      className="vsco-btn primary"
                      style={{ backgroundColor: '#ff6b6b', color: 'white', fontWeight: 'bold' }}
                    >
                      {videoGenerating ? '🎥 制作中...' : '🎥 制作视频 Vlog'}
                    </button>
                  ) : (
                    <div className="text-xs text-gray-500">
                      再保存 {3 - savedImages.length} 张图片即可制作视频
                    </div>
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


          {/* Publish Dialog */}
          {showPublishDialog && (editedImage || generatedImage) && (
            <PublishDialog
              isOpen={showPublishDialog}
              onClose={() => {
                console.log("🔄 Closing publish dialog")
                setShowPublishDialog(false)
              }}
              onConfirm={handlePublishConfirm}
              imageUrl={(editedImage || generatedImage) || ''}
            />
          )}

          {/* Main upload area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-6">
              
              {/* Style selection */}
              {!selectedStyle && (
                <div className="space-y-4">
                  <h2 className="text-center text-xl font-light text-gray-900 mb-8">选择艺术风格</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {mainStyleOptions.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style)
                          setCurrentStep('upload')
                        }}
                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:scale-105 transition-transform"
                      >
                        <img
                          src={`/styles/${style.id === 'realistic' ? 'disney' : style.id}-style.png`}
                          alt={style.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-center">
                            {style.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              {selectedStyle && (
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setSelectedStyle(null)
                      setCurrentStep('style')
                    }}
                    className="flex items-center text-gray-600 text-sm mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    更换风格
                  </button>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-light text-gray-900 mb-2">上传宠物照片</h3>
                    <p className="text-sm text-gray-600">选择了 {selectedStyle.label} 风格</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileSelect(file)
                      }
                    }}
                    className="hidden"
                  />
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">点击上传照片</p>
                    <p className="text-xs text-gray-500 mt-2">支持 JPG, PNG 格式</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
       )}

      {/* Desktop Interface */}
      <div className={`hidden md:flex vsco-editor ${savedImages.length > 0 ? 'with-gallery' : ''}`}>
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
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                style={{ minHeight: '120px', padding: '20px', cursor: 'pointer' }}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium mb-2">点击选择照片</p>
                <p className="text-xs text-gray-500">支持 JPG, PNG, WebP 格式</p>
              </div>
              <button
                onClick={handleCameraClick}
                className="w-full vsco-btn secondary small"
                style={{ minHeight: '44px', padding: '12px', fontSize: '16px' }}
              >
                <Camera className="w-4 h-4 mr-2" />
                拍摄照片
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                multiple={false}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    console.log("File selected:", file.name, file.type, file.size)
                    handleFileSelect(file)
                  }
                  // Clear the input to allow selecting the same file again
                  e.target.value = ''
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                className="hidden"
                multiple={false}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    console.log("Camera file selected:", file.name, file.type, file.size)
                    handleFileSelect(file)
                  }
                  // Clear the input to allow taking another photo
                  e.target.value = ''
                }}
              />
            </div>
          )}


          {/* Desktop Operations Panel */}
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
                  disabled={publishLoading}
                  className="w-full vsco-btn secondary disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {publishLoading ? '准备中...' : '发布作品'}
                </button>
                {savedImages.length < 3 ? (
                  <button onClick={handleNextImage} className="w-full vsco-btn secondary">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    保存并继续 ({savedImages.length + 1}/3)
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleGenerateVlog} 
                      disabled={videoGenerating}
                      className="w-full vsco-btn primary mb-3"
                      style={{ backgroundColor: '#ff6b6b', color: 'white', fontWeight: 'bold' }}
                    >
                      {videoGenerating ? '🎥 制作中...' : '🎥 制作视频 Vlog'}
                    </button>
                    <button onClick={handleReset} className="w-full vsco-btn secondary">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新开始
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Editing Tools */}
              <div className="space-y-6 mt-6">
                {/* Adjustments Section */}
                <div>
                  <h3 className="adjustment-title">调整</h3>
                  <div className="space-y-3">
                    <div className="adjustment-item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">曝光</span>
                        <span className="text-xs text-gray-600">{imageAdjustments.exposure > 0 ? '+' + imageAdjustments.exposure : imageAdjustments.exposure}</span>
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
                        className="vsco-slider w-full"
                      />
                    </div>
                    
                    <div className="adjustment-item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">对比度</span>
                        <span className="text-xs text-gray-600">{imageAdjustments.contrast > 0 ? '+' + imageAdjustments.contrast : imageAdjustments.contrast}</span>
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
                        className="vsco-slider w-full"
                      />
                    </div>
                    
                    <div className="adjustment-item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">饱和度</span>
                        <span className="text-xs text-gray-600">{imageAdjustments.saturation > 0 ? '+' + imageAdjustments.saturation : imageAdjustments.saturation}</span>
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
                        className="vsco-slider w-full"
                      />
                    </div>
                    
                    <div className="adjustment-item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">色溫</span>
                        <span className="text-xs text-gray-600">{imageAdjustments.warmth > 0 ? '+' + imageAdjustments.warmth : imageAdjustments.warmth}</span>
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
                        className="vsco-slider w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Filters Section */}
                <div>
                  <h3 className="adjustment-title">滤镜</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {filterPresets.slice(0, 12).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="bg-gray-100 hover:bg-gray-200 rounded text-xs p-2 transition-colors text-center"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
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
            <div className="vsco-image-container relative">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={editedImage || generatedImage}
                  alt="生成的艺术作品"
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                  style={{
                    filter: `
                      brightness(${100 + imageAdjustments.brightness}%)
                      contrast(${100 + imageAdjustments.contrast}%)
                      saturate(${100 + imageAdjustments.saturation}%)
                      sepia(${imageAdjustments.warmth > 0 ? imageAdjustments.warmth / 2 : 0}%)
                      hue-rotate(${imageAdjustments.warmth < 0 ? imageAdjustments.warmth : 0}deg)
                      opacity(${100 + imageAdjustments.exposure / 2}%)
                    `.replace(/\s+/g, ' ').trim(),
                    transition: 'filter 0.2s ease-out'
                  }}
                />
              </div>
              
              {/* Zoom indicator */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                {savedImages.length + 1}/3
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VSCO Mobile-Style Layout - Show only on mobile when image is generated */}
      {generatedImage && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
              {/* Header with reset button */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center border border-gray-200/50 hover:bg-white/80 transition-all shadow-sm"
                >
                  <RotateCcw className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Main content area - flex to center image with dynamic padding based on editing mode */}
              <div className={`flex-1 flex items-center justify-center px-2 pt-12 transition-all duration-300 ${
                editingMode !== 'none' ? 'pb-80' : 'pb-32'
              }`}>
                <div className="w-full h-full flex items-center justify-center">
                  {/* Mobile optimized real-time preview using CSS filters */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={editedImage || generatedImage}
                      alt="生成的艺术作品"
                      className="max-w-full max-h-full object-contain"
                      style={{
                        filter: `
                          brightness(${100 + imageAdjustments.brightness}%)
                          contrast(${100 + imageAdjustments.contrast}%)
                          saturate(${100 + imageAdjustments.saturation}%)
                          sepia(${imageAdjustments.warmth > 0 ? imageAdjustments.warmth / 2 : 0}%)
                          hue-rotate(${imageAdjustments.warmth < 0 ? imageAdjustments.warmth : 0}deg)
                          opacity(${100 + imageAdjustments.exposure / 2}%)
                        `.replace(/\s+/g, ' ').trim(),
                        transition: 'filter 0.1s ease-out'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Operations Panel - Top Right Floating */}
              <div className="fixed top-16 right-4 z-60 space-y-2">
                <button
                  onClick={handleUndoAdjustment}
                  disabled={!canUndo}
                  className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-gray-200/50 hover:bg-white/90 transition-all shadow-sm disabled:opacity-50"
                  title="撤销上一步调整"
                >
                  <RotateCcw className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    const imageToExport = editedImage || generatedImage
                    a.href = imageToExport!
                    a.download = `petpo-art-${Date.now()}.png`
                    a.click()
                  }}
                  className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-gray-200/50 hover:bg-white/90 transition-all shadow-sm"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handlePublishClick}
                  disabled={publishLoading}
                  className="w-12 h-12 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/90 transition-all shadow-sm disabled:opacity-50"
                >
                  <Heart className="w-5 h-5 text-white" />
                </button>
                {savedImages.length < 3 ? (
                  <button 
                    onClick={handleNextImage} 
                    className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-gray-200/50 hover:bg-white/90 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleGenerateVlog} 
                      disabled={videoGenerating}
                      className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 backdrop-blur-md rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 border-2 border-white/50"
                      title="制作视频 Vlog"
                      style={{
                        boxShadow: videoGenerating ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 4px 15px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <span className="text-white text-xl">
                        {videoGenerating ? '⏳' : '🎥'}
                      </span>
                    </button>
                    <button 
                      onClick={handleReset} 
                      className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-gray-200/50 hover:bg-white/90 transition-all shadow-sm"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Video Generation Notification */}
              {savedImages.length >= 3 && (
                <div className={`fixed left-4 right-4 z-60 transition-all duration-300 ${editingMode !== 'none' ? 'bottom-80' : 'bottom-28'}`}>
                  <div className="bg-white/95 backdrop-blur-md rounded-lg p-3 border border-gray-200/50 shadow-lg mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">🎥 视频制作就绪</p>
                        <p className="text-xs text-gray-600">三张作品已收集完成，点击右上角视频按钮</p>
                      </div>
                      <button
                        onClick={handleGenerateVlog}
                        disabled={videoGenerating}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 text-xs font-medium flex items-center space-x-1"
                      >
                        <span>🎥</span>
                        <span>{videoGenerating ? '制作中' : '制作'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Thumbnail Gallery - Show saved images */}
              {savedImages.length > 0 && (
                <div className={`fixed left-4 right-4 z-60 transition-all duration-300 ${editingMode !== 'none' ? 'bottom-72' : 'bottom-20'}`}>
                  <div className="bg-white/95 backdrop-blur-md rounded-lg p-3 border border-gray-200/50 shadow-lg">
                    <div className="text-center text-xs text-gray-600 mb-2 font-medium">
                      已保存 {savedImages.length}/3
                      {savedImages.length === 1 && (
                        <div className="text-blue-600 font-medium mt-1">
                          📸 再保存两张图片即可制作 Vlog
                        </div>
                      )}
                      {savedImages.length === 2 && (
                        <div className="text-orange-500 font-bold mt-1 animate-pulse">
                          🎥 再保存一张即可制作视频！
                        </div>
                      )}
                      {savedImages.length >= 3 && (
                        <div className="text-green-500 font-bold mt-1">
                          ✅ 可以制作 Vlog 视频了！
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center space-x-2">
                      {savedImages.map((image, index) => (
                        <div 
                          key={index} 
                          className="w-12 h-12 rounded border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-black transition-colors shadow-sm"
                          onClick={() => {
                            // Show preview modal
                            setPreviewImageUrl(image)
                            setShowImagePreview(true)
                          }}
                        >
                          <img
                            src={image}
                            alt={`保存的作品 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {Array.from({ length: 3 - savedImages.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="w-12 h-12 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Tools - Only appear when clicked */}
              <div className="fixed bottom-0 left-0 right-0 z-50">
                {/* Tool Icons Row */}
                <div className="flex items-center justify-center space-x-8 px-4 py-3 bg-white/95 backdrop-blur-md border-t border-gray-200">
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => setEditingMode(editingMode === 'adjustments' ? 'none' : 'adjustments')}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        editingMode === 'adjustments' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded border-2 border-current" />
                    </button>
                    <span className="text-xs text-gray-600">调整</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => setEditingMode(editingMode === 'filters' ? 'none' : 'filters')}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        editingMode === 'filters' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <Palette className="w-6 h-6" />
                    </button>
                    <span className="text-xs text-gray-600">滤镜</span>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => setEditingMode(editingMode === 'ai-prompt' ? 'none' : 'ai-prompt')}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        editingMode === 'ai-prompt' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <Wand2 className="w-6 h-6" />
                    </button>
                    <span className="text-xs text-gray-600">AI</span>
                  </div>
                </div>

                {/* Tool Panels - Show only when active */}
                {editingMode !== 'none' && (
                  <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 max-h-64 overflow-y-auto">

                    {/* Adjustments Panel */}
                    {editingMode === 'adjustments' && (
                      <div className="p-4 space-y-4">
                        <div className="text-center text-sm font-medium text-gray-800 mb-4">调整</div>
                        
                        <div className="space-y-3">
                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">曝光</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.exposure > 0 ? '+' + imageAdjustments.exposure : imageAdjustments.exposure}</span>
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
                              onInput={(e) => {
                                // Real-time preview during drag
                                const newAdjustments = { ...imageAdjustments, exposure: parseInt((e.target as HTMLInputElement).value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">高光</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.highlights > 0 ? '+' + imageAdjustments.highlights : imageAdjustments.highlights}</span>
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
                              onInput={(e) => {
                                const newAdjustments = { ...imageAdjustments, highlights: parseInt((e.target as HTMLInputElement).value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">阴影</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.shadows > 0 ? '+' + imageAdjustments.shadows : imageAdjustments.shadows}</span>
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
                              onInput={(e) => {
                                const newAdjustments = { ...imageAdjustments, shadows: parseInt((e.target as HTMLInputElement).value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">对比度</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.contrast > 0 ? '+' + imageAdjustments.contrast : imageAdjustments.contrast}</span>
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
                              onInput={(e) => {
                                const newAdjustments = { ...imageAdjustments, contrast: parseInt((e.target as HTMLInputElement).value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">饱和度</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.saturation > 0 ? '+' + imageAdjustments.saturation : imageAdjustments.saturation}</span>
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
                              onInput={(e) => {
                                const newAdjustments = { ...imageAdjustments, saturation: parseInt((e.target as HTMLInputElement).value) }
                                handleAdjustmentChange(newAdjustments)
                              }}
                              className="vsco-slider-mobile"
                            />
                          </div>

                          <div className="adjustment-item-mobile">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 text-sm font-medium">色温</span>
                              <span className="text-gray-600 text-sm min-w-[30px] text-right">{imageAdjustments.warmth > 0 ? '+' + imageAdjustments.warmth : imageAdjustments.warmth}</span>
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
                              onInput={(e) => {
                                const newAdjustments = { ...imageAdjustments, warmth: parseInt((e.target as HTMLInputElement).value) }
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
                                onClick={async () => {
                                  // Don't show prompt, directly generate with new scene
                                  if (!selectedFile) return
                                  setCurrentStep('processing')
                                  setEditingMode('none') // Close the panel
                                  await generatePortrait(selectedFile, scene.prompt, true)
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
        )}

        {/* Image Preview Modal */}
        {showImagePreview && previewImageUrl && (
          <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={() => setShowImagePreview(false)}
                className="absolute top-4 right-4 z-[210] w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-xl">×</span>
              </button>
              
              {/* Download button */}
              <button
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = previewImageUrl
                  a.download = `petpo-artwork-${Date.now()}.png`
                  a.click()
                }}
                className="absolute top-4 right-16 z-[210] w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              
              {/* Zoomable image */}
              <PinchZoomImage
                src={previewImageUrl}
                alt="保存的作品预览"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* VSCO-style Video Generation Notification */}
        {savedImages.length >= 3 && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[150] md:top-4 md:left-4 md:transform-none">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-lg px-4 py-3 shadow-sm max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium mb-1">视频制作就绪</p>
                  <p className="text-xs text-gray-600">三张作品已收集完成</p>
                </div>
                <button
                  onClick={handleGenerateVlog}
                  disabled={videoGenerating}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  {videoGenerating ? '制作中...' : '制作'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Video Modal - Optimized for Mobile Portrait */}
        {videoUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center">
            {/* Mobile-first responsive container */}
            <div className="relative w-full h-full md:w-auto md:h-auto md:max-w-4xl md:max-h-[90vh] bg-white md:rounded-lg overflow-hidden flex flex-col">
              
              {/* Header - Fixed at top */}
              <div className="flex items-center justify-between p-4 bg-white border-b md:border-b-0 flex-shrink-0">
                <h3 className="text-lg font-medium text-gray-900">艺术视频</h3>
                <button
                  onClick={() => {
                    console.log("📺 [VLOG DEBUG] Closing video modal")
                    setVideoUrl(null)
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-gray-600 text-xl font-bold">×</span>
                </button>
              </div>
              
              {/* Video container - Flexible height */}
              <div className="flex-1 flex items-center justify-center bg-black p-2 md:p-4">
                <video
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-full object-contain"
                  poster={savedImages[0]}
                  onLoadStart={() => console.log("📺 [VLOG DEBUG] Video loading started")}
                  onError={(e) => console.error("📺 [VLOG DEBUG] Video error:", e)}
                  style={{
                    maxHeight: 'calc(100vh - 160px)', // Account for header and footer
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  您的浏览器不支持视频标签。
                </video>
              </div>
              
              {/* Footer controls - Fixed at bottom */}
              <div className="p-4 bg-white border-t flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <a
                    href={videoUrl}
                    download={`petpo-art-video-${Date.now()}.mp4`}
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                    onClick={() => console.log("📺 [VLOG DEBUG] Download button clicked")}
                  >
                    <Download className="w-4 h-4" />
                    <span>下载视频</span>
                  </a>
                  <button
                    onClick={() => {
                      console.log("📺 [VLOG DEBUG] Share button clicked")
                      if (navigator.share) {
                        navigator.share({
                          title: '我的宠物艺术 Vlog',
                          text: '查看我的宠物艺术作品！',
                          url: window.location.href
                        }).catch(e => console.log('Share failed:', e))
                      } else {
                        // Fallback - copy to clipboard
                        navigator.clipboard?.writeText(window.location.href)
                        alert('链接已复制到剪贴板')
                      }
                    }}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    分享
                  </button>
                </div>
                
                {/* Mobile tip */}
                <p className="text-xs text-gray-500 text-center mt-3 md:hidden">
                  提示：可旋转手机观看更佳效果
                </p>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}

