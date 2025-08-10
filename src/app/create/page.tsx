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
  ChevronRight,
  Share2,
  Copy,
  Video,
  ShoppingBag
} from "lucide-react"
import BoneIcon from "@/components/BoneIcon"
import Link from "next/link"
import './vsco-style.css'
import { VSCOProductDisplay } from "@/components/VSCOProductDisplay"

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
  const [originalFile, setOriginalFile] = useState<File | null>(null)  // Store original file for reset
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)  // Store original URL
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [, setGeneratedPrompt] = useState<string>("")
  const [savedImages, setSavedImages] = useState<string[]>([])
  // const [editingImageIndex, setEditingImageIndex] = useState<number>(-1) // Track which saved image we're editing
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
  const [showProductPreview, setShowProductPreview] = useState(false)
  
  // Debug images state
  useEffect(() => {
    console.log("🖼️ Image state changed:", {
      generatedImage: generatedImage ? "EXISTS" : "NULL",
      editedImage: editedImage ? "EXISTS" : "NULL",
      showProductPreview
    });
  }, [generatedImage, editedImage, showProductPreview])
  
  
  // Bones system state
  const [userBones, setUserBones] = useState<number>(0)
  const [loadingBones, setLoadingBones] = useState(false)


  // Video-related states (stubs to prevent compilation errors)
  const [showVideoOption, setShowVideoOption] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null)
  const [videoGenerating, setVideoGenerating] = useState(false)

  // 主要艺术风格选项 - 优化后的prompts
  const mainStyleOptions = [
    { 
      id: 'ghibli', 
      icon: Heart, 
      label: '宫崎骏动漫', 
      description: '温暖治愈的手绘风格',
      prompt: 'Studio Ghibli style anime illustration, 宫崎骏风格动漫插画, traditional hand-drawn cel animation, authentic watercolor on textured paper, visible brush texture and paper grain, organic paint bleeding effects, natural color variations, subtle paint layer imperfections, hand-painted cel shading, artist signature brushwork, warm earth tone palette, gentle atmospheric lighting, whimsical handcrafted charm, preserve exact pose and expression, maintain all distinctive features, traditional animation artbook quality, no digital smoothness, authentic studio painting texture'
    },
    { 
      id: 'disney', 
      icon: Sparkles, 
      label: '迪士尼卡通', 
      description: '可爱生动的卡通风格',
      prompt: 'Disney Pixar 3D animation style, 迪士尼风格卡通, high-quality 3D rendering, vibrant saturated colors, smooth clean surfaces, cute anthropomorphic design, large expressive cartoon eyes, exaggerated cute features, professional CGI quality, Pixar-style lighting and shading, preserve original background and environment, maintain exact pose and expression, preserve all distinctive markings and patterns, identical proportions, same eye color, 精美卡通风格, animation masterpiece'
    },
    { 
      id: 'watercolor', 
      icon: Palette, 
      label: '水彩插画', 
      description: '柔美的水彩艺术风格',
      prompt: 'traditional watercolor painting on rough watercolor paper, authentic brush texture with visible bristle marks, natural pigment flow and color bleeding, wet-on-wet watercolor technique, paper fiber texture showing through, organic paint pooling effects, natural brush stroke variations, hand-mixed color gradients, subtle paper warping from water, artist signature loose brushwork, transparent layering effects, natural color separation, preserve exact pose and expression, maintain all distinctive features, museum quality watercolor artwork, no digital perfection, authentic painting imperfections'
    },
    { 
      id: 'vintage', 
      icon: Sun, 
      label: '复古怀旧', 
      description: '温暖的复古摄影风格',
      prompt: 'authentic vintage photograph on aged film stock, natural film grain structure, organic chemical processing variations, authentic darkroom printing texture, silver halide crystal patterns, natural paper aging and yellowing, vintage lens imperfections and vignetting, authentic light leaks and exposure variations, traditional photo paper fiber texture, natural photo mounting corners, slight image warping from age, authentic vintage photo album wear, preserve exact pose and expression, maintain all distinctive features, genuine antique photography quality, no digital filters, authentic chemical photography process'
    },
    { 
      id: 'modern', 
      icon: Wand2, 
      label: '现代简约', 
      description: '简约现代的艺术风格',
      prompt: 'contemporary minimalist painting on primed canvas, authentic acrylic paint texture with subtle brush marks, natural canvas weave texture visible, organic paint application variations, hand-mixed color consistency, authentic artist palette knife texture, natural paint flow patterns, subtle canvas preparation marks, modern gallery-quality paint thickness, authentic studio lighting reflections, preserve exact pose and expression, maintain all distinctive features, museum contemporary art quality, authentic paint material texture, no digital vector smoothness'
    },
    {
      id: 'pencil',
      icon: Camera,
      label: '铅笔素描',
      description: '精细逼真的素描风格',
      prompt: 'traditional graphite pencil drawing on textured drawing paper, authentic pencil grain texture, visible paper tooth showing through, natural hand tremor in lines, organic smudging and blending, fingerprint smears on paper, eraser marks and corrections, varied pencil pressure creating natural line weight, authentic cross-hatching technique, paper creases and slight wrinkles, artist grip marks, natural graphite buildup, preserve exact pose and expression, maintain all distinctive features, sketchbook authenticity with real paper texture, no digital smoothness, traditional draftsmanship'
    },
    {
      id: 'cyberpunk',
      icon: Wand2,
      label: '赛博朋克',
      description: '未来科技霓虹风格',
      prompt: 'cyberpunk street art on weathered concrete wall, authentic spray paint texture with natural drips, stencil edge imperfections, urban wall surface variations, natural paint overspray patterns, authentic graffiti layering, weathered brick and concrete texture, natural paint aging and fading, street artist hand-cut stencil marks, organic spray can pressure variations, authentic urban decay texture, preserve exact pose and expression, maintain all distinctive features, authentic street art quality, no digital glow effects, real spray paint material texture'
    },
    {
      id: 'renaissance',
      icon: Heart,
      label: '文艺复兴',
      description: '古典贵族肖像风格',
      prompt: 'authentic Renaissance oil painting on prepared wood panel, traditional gesso ground texture, authentic sfumato technique with organic color transitions, natural oil paint consistency variations, period-appropriate pigment texture, traditional canvas preparation marks, authentic craquelure aging patterns, natural varnish patina effects, traditional brush hair texture in paint, authentic paint layer transparency, museum-quality oil painting surface, preserve exact pose and expression, maintain all distinctive features, authentic 15th century painting technique, no modern digital effects, traditional master craftsmanship'
    },
    {
      id: 'mosaic',
      icon: Sun,
      label: '马赛克艺术',
      description: '彩色玻璃镶嵌风格',
      prompt: 'traditional Byzantine mosaic made from authentic glass tesserae, natural stone and ceramic tile variations, authentic mortar joint texture with organic irregularities, hand-cut glass pieces with natural edges, traditional grout aging and staining, authentic tile placement imperfections, natural light reflection variations on glass surfaces, organic color variations in handmade tiles, traditional mosaic setting technique, authentic ancient craftsmanship texture, natural wear patterns on tile edges, preserve exact pose and expression, maintain all distinctive features, museum-quality Byzantine mosaic art, no digital geometric precision, authentic handcrafted tile work'
    },
    {
      id: 'monet',
      icon: Palette,
      label: '莫奈印象派',
      description: '莫奈睡莲般的梦幻风格',
      prompt: 'Claude Monet authentic impressionist oil painting, thick impasto brush texture with visible paint ridges, coarse canvas weave showing through, authentic palette knife marks, natural paint texture variations, organic color mixing on canvas, traditional linen canvas preparation, oil paint consistency variations, natural brush hair texture marks, authentic varnish aging effects, museum painting surface irregularities, traditional oil painting cracking, preserve exact pose and expression, maintain all distinctive features, authentic 19th century painting technique, no modern digital effects, traditional artist materials texture'
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

  // Fetch user bones when logged in
  useEffect(() => {
    const fetchUserBones = async () => {
      if (!userId) return
      
      setLoadingBones(true)
      try {
        const response = await fetch('/api/bones')
        if (response.ok) {
          const data = await response.json()
          setUserBones(data.bones || 0)
        } else {
          // If bones API is not available, set to 0
          setUserBones(0)
        }
      } catch (error) {
        console.error('Error fetching bones:', error)
        // If bones system fails, set to 0 but don't break the app
        setUserBones(0)
      } finally {
        setLoadingBones(false)
      }
    }
    
    fetchUserBones()
  }, [userId])

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
    
    // Save original file and URL for reset functionality
    if (!originalFile) {
      setOriginalFile(file)
      const originalUrl = URL.createObjectURL(file)
      setOriginalImageUrl(originalUrl)
      console.log("Original file saved for reset:", file.name)
    }
    
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
      
      console.log("🎨 [STYLE DEBUG] Using style:", {
        styleId: selectedStyle?.id,
        styleLabel: selectedStyle?.label,
        prompt: fullPrompt.substring(0, 100) + '...'
      })
      
      formData.append("prompt", fullPrompt)
      
      // Set style parameters based on selected style
      let artStyle = "anime"
      let colorPalette = "pastel"
      let cutenessLevel = "maximum"
      
      console.log("🔍 [BEFORE SWITCH] selectedStyle:", selectedStyle)
      
      if (selectedStyle) {
        console.log(`🔍 [SWITCH CASE] Processing style ID: "${selectedStyle.id}"`)
        switch(selectedStyle.id) {
          case 'ghibli':
            artStyle = "anime"
            colorPalette = "pastel"
            cutenessLevel = "maximum"
            console.log("✅ [GHIBLI] Applied parameters")
            break
          case 'disney':
            artStyle = "cartoon"
            colorPalette = "vibrant"
            cutenessLevel = "maximum"
            console.log("✅ [DISNEY] Applied parameters")
            break
          case 'watercolor':
            artStyle = "watercolor"
            colorPalette = "soft"
            cutenessLevel = "high"
            console.log("✅ [WATERCOLOR] Applied parameters")
            break
          case 'vintage':
            artStyle = "photography"
            colorPalette = "sepia"
            cutenessLevel = "medium"
            console.log("✅ [VINTAGE] Applied parameters")
            break
          case 'modern':
            artStyle = "minimalist"
            colorPalette = "clean"
            cutenessLevel = "medium"
            console.log("✅ [MODERN] Applied parameters")
            break
          case 'pencil':
            artStyle = "pencil_sketch"
            colorPalette = "monochrome"
            cutenessLevel = "medium"
            console.log("✅ [PENCIL] Applied parameters")
            break
          case 'cyberpunk':
            artStyle = "cyberpunk"
            colorPalette = "neon"
            cutenessLevel = "medium"
            console.log("✅ [CYBERPUNK] Applied parameters")
            break
          case 'renaissance':
            artStyle = "renaissance"
            colorPalette = "warm"
            cutenessLevel = "low"
            console.log("✅ [RENAISSANCE] Applied parameters")
            break
          case 'mosaic':
            artStyle = "mosaic"
            colorPalette = "vibrant"
            cutenessLevel = "medium"
            console.log("✅ [MOSAIC] Applied parameters")
            break
          case 'monet':
            artStyle = "monet_impressionist"
            colorPalette = "pastel"
            cutenessLevel = "low"
            console.log("✅ [MONET] Applied parameters")
            break
          default:
            console.log(`❌ [UNKNOWN STYLE] "${selectedStyle.id}" - using defaults`)
        }
      } else {
        console.log("❌ [NO STYLE] selectedStyle is null/undefined")
      }
      
      formData.append("art_style", artStyle)
      formData.append("cuteness_level", cutenessLevel)
      formData.append("color_palette", colorPalette)
      
      console.log("📤 [SENDING TO API] Final parameters:", {
        art_style: artStyle,
        cuteness_level: cutenessLevel,
        color_palette: colorPalette,
        prompt_length: fullPrompt.length,
        formData_entries: Array.from(formData.entries()).map(([key, value]) => 
          key === 'image' ? [key, 'File object'] : [key, String(value).substring(0, 50)]
        )
      })

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
          description: "继续创作更多精美的宠物艺术作品吧！",
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

  // Poll video task status until completion
  const pollVideoTaskStatus = async (taskId: string) => {
    console.log("🔄 [VLOG DEBUG] Starting to poll task status:", taskId)
    const maxAttempts = 30 // 30 attempts * 2 seconds = 1 minute max
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 [VLOG DEBUG] Polling attempt ${attempts + 1}/${maxAttempts}`)
        
        const response = await fetch(`/api/generate-video?taskId=${taskId}`)
        if (!response.ok) {
          console.error("🚨 [VLOG DEBUG] Task status check failed:", response.status)
          throw new Error(`Task status check failed: ${response.status}`)
        }
        
        const taskResult = await response.json()
        console.log("📊 [VLOG DEBUG] Task status:", taskResult)
        
        if (taskResult.status === 'succeeded' && taskResult.content?.video_url) {
          console.log("🎉 [VLOG DEBUG] Task completed successfully!")
          console.log("🔗 [VLOG DEBUG] Final video URL:", taskResult.content.video_url)
          
          setVideoUrl(taskResult.content.video_url)
          setShowVideoOption(true)
          
          toast({
            title: "Vlog制作完成！",
            description: "您的专属宠物艺术Vlog已准备就绪",
          })
          return
        } else if (taskResult.status === 'failed') {
          console.error("🚨 [VLOG DEBUG] Task failed:", taskResult)
          throw new Error(`Video generation failed: ${taskResult.error || 'Unknown error'}`)
        }
        
        // Still processing, wait and try again
        console.log("⏳ [VLOG DEBUG] Task still processing, waiting...")
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        attempts++
        
      } catch (error) {
        console.error("🚨 [VLOG DEBUG] Polling error:", error)
        throw error
      }
    }
    
    // Timeout
    console.error("⏰ [VLOG DEBUG] Task polling timeout")
    throw new Error("Video generation timeout - please try again")
  }

  // Share with native share API and confirmation for bone reward
  const handleShareWithConfirmation = async (imageUrl: string) => {
    if (!userId) {
      // 直接跳转到登录页面
      window.location.href = '/sign-in'
      return
    }

    try {
      // First create the share link
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          title: `${selectedStyle?.label || '艺术'}风格宠物肖像`,
          style: selectedStyle?.label || '艺术',
          description: `由AI生成的专属宠物艺术肖像 - PETPO宠物肖像定制`
        })
      })

      if (!response.ok) {
        throw new Error('创建分享链接失败')
      }

      const data = await response.json()
      const shareUrl = data.shareLink
      const shareTitle = `${selectedStyle?.label || '艺术'}风格宠物肖像`
      const shareText = `看看我用AI生成的专属宠物艺术肖像！快来PETPO制作你的专属宠物肖像吧！`

      // Try native share first (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          })
          
          // Show confirmation dialog after successful share
          const confirmed = confirm(
            "感谢分享！🎉\n\n" +
            "为了获得骨头奖励，请确认：\n" + 
            "✅ 您是否已成功分享了这个链接？\n\n" +
            "点击\"确定\"领取1个骨头奖励 🦴"
          )
          
          if (confirmed) {
            await awardBonesAfterShare(data.boneReward)
          }
          
        } catch (shareError) {
          console.log('Native share cancelled or failed')
          // Fall back to clipboard copy
          await fallbackShare(shareUrl, data.boneReward)
        }
      } else {
        // Fall back to clipboard copy for desktop
        await fallbackShare(shareUrl, data.boneReward)
      }
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: "分享失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // Fallback share method (copy to clipboard)
  const fallbackShare = async (shareUrl: string, boneReward: any) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
      }
      
      toast({
        title: "链接已复制！📋",
        description: "请粘贴到微信、微博等社交平台分享",
        duration: 5000,
      })
      
      // Show confirmation dialog
      const confirmed = confirm(
        "链接已复制到剪贴板！📋\n\n" +
        "请将链接分享到微信、微博等社交平台\n\n" +
        "分享完成后点击\"确定\"获得1个骨头奖励 🦴"
      )
      
      if (confirmed) {
        await awardBonesAfterShare(boneReward)
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error)
      toast({
        title: "复制失败",
        description: "请手动复制链接进行分享",
        variant: "destructive",
      })
    }
  }

  // Award bones after share confirmation
  const awardBonesAfterShare = async (boneReward: any) => {
    if (boneReward.awarded) {
      setUserBones(boneReward.bones)
      toast({
        title: "获得骨头奖励！🦴",
        description: `感谢分享！获得1个骨头奖励 (总计: ${boneReward.bones}个)`,
      })
    } else {
      toast({
        title: "分享成功！",
        description: boneReward.message || "今日骨头奖励已获取",
      })
    }
  }

  // Simple share for UI buttons (no confirmation needed)
  const handleShareImage = async (imageUrl: string) => {
    await handleShareWithConfirmation(imageUrl)
  }

  // Generate video for single image - show share prompt if no bones
  const handleSingleVideoGeneration = async (imageUrl: string) => {
    if (!userId) {
      // 直接跳转到登录页面
      window.location.href = '/sign-in'
      return
    }

    // If no bones, prompt to share first
    if (userBones < 1) {
      handleShareWithConfirmation(imageUrl)
      return
    }

    try {
      // Consume bones first
      const bonesResponse = await fetch('/api/bones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'consume',
          amount: 1
        })
      })

      if (!bonesResponse.ok) {
        const errorData = await bonesResponse.json()
        if (errorData.code === 'INSUFFICIENT_BONES') {
          toast({
            title: "骨头不足 🦴",
            description: "生成图片需要消耗1个骨头，可通过分享作品获得更多骨头！",
            variant: "destructive",
          })
          return
        }
        throw new Error('骨头消耗失败')
      }

      const bonesData = await bonesResponse.json()
      setUserBones(bonesData.bones) // Update bones count

      // Generate video
      setVideoGenerating(true)
      const videoResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [imageUrl],
          prompt: `${selectedStyle?.label || '艺术'} style pet portrait video with gentle transitions`
        })
      })

      if (!videoResponse.ok) {
        throw new Error('视频生成失败')
      }

      const videoData = await videoResponse.json()
      
      if (videoData.taskId) {
        toast({
          title: "视频生成中...",
          description: "视频正在生成，请稍候片刻 🎬",
        })
        
        // Poll for completion
        await pollVideoTaskStatus(videoData.taskId)
      } else if (videoData.videoUrl) {
        setVideoUrl(videoData.videoUrl)
        setVideoTaskId(videoData.taskId)
        
        toast({
          title: "视频生成完成！",
          description: "您的专属宠物视频已准备就绪 🎥",
        })
      }

    } catch (error) {
      console.error('Single video generation error:', error)
      toast({
        title: "视频生成失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setVideoGenerating(false)
    }
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
      // 直接跳转到登录页面
      window.location.href = '/sign-in'
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
        // Direct video URL (fallback/demo case)
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
      } else if (result.success && result.taskId) {
        // Task-based video generation (polling case)
        console.log("⏳ [VLOG DEBUG] Video generation task started:", result.taskId)
        setVideoTaskId(result.taskId)
        
        toast({
          title: "Vlog制作中...",
          description: "视频正在生成，请稍候片刻",
        })
        
        // Poll for task completion
        await pollVideoTaskStatus(result.taskId)
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
    // If we have an original file, offer to restart with it, otherwise full reset
    if (originalFile && originalImageUrl) {
      console.log("Resetting to original file:", originalFile.name)
      setSelectedFile(originalFile)
      setSelectedImageUrl(originalImageUrl)
      setGeneratedImage(null)
      setCustomPrompt("")
      setGeneratedPrompt("")
      // Keep saved images for continued workflow
      // setSavedImages([])  // Don't reset saved images
      setShowVideoOption(false)
      setVideoTaskId(null)
      setVideoUrl(null)
      setVideoGenerating(false)
      // Keep selected style for convenience
      // setSelectedStyle(null)  // Don't reset style
      setCurrentStep('result')
      // Reset editing states
      resetEditing()
      setEditHistory([])
      setEditedImage(null)
      setCanUndo(false)
      
      // Regenerate with original file
      if (selectedStyle) {
        setIsFirstGeneration(true)
        generatePortrait(originalFile, undefined, false)
      }
    } else {
      // Full reset if no original file
      console.log("Full reset - no original file")
      setSelectedFile(null)
      setSelectedImageUrl(null)
      setOriginalFile(null)
      setOriginalImageUrl(null)
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
  }

  const handlePublishClick = () => {
    console.log("🔥 Publish button clicked!")
    console.log("userId:", userId)
    console.log("generatedImage:", generatedImage ? "exists" : "missing")
    console.log("editedImage:", editedImage ? "exists" : "missing")
    
    if (!userId) {
      console.log("No user, redirecting to login")
      
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
            {userId && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                <BoneIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {loadingBones ? '...' : userBones}
                </span>
              </div>
            )}
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
            <div className="flex items-center space-x-3">
              {userId && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                  <BoneIcon className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    {loadingBones ? '...' : userBones}
                  </span>
                </div>
              )}
              <Link href="/gallery" className="text-sm text-gray-600">
                作品集
              </Link>
            </div>
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

          {/* Mobile Product Preview Modal - Show as overlay on mobile */}
          {(generatedImage || editedImage || selectedImageUrl) && showProductPreview && (
            <div className="md:hidden fixed inset-0 z-[200] bg-white">
              <VSCOProductDisplay 
                selectedDesignImageUrl={editedImage || generatedImage || selectedImageUrl || undefined}
                onBack={() => setShowProductPreview(false)}
              />
            </div>
          )}

          {/* Publish Dialog - removed from here, moved to top level */}

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
      <div className={`hidden md:flex vsco-editor ${savedImages.length > 0 ? 'with-gallery' : ''} ${(generatedImage || editedImage || selectedImageUrl) ? 'with-product-preview' : ''}`}>
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

          {(generatedImage || editedImage || selectedImageUrl) && (
            <div className="vsco-image-container relative">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={editedImage || generatedImage || selectedImageUrl}
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
              
              {/* Action buttons overlay */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <button
                  onClick={() => handleShareImage(editedImage || generatedImage || selectedImageUrl!)}
                  className="flex items-center px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-sm font-medium hover:bg-white transition-colors"
                  title="分享图片获得骨头"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  分享
                </button>
                <button
                  onClick={() => setShowProductPreview(true)}
                  className="flex items-center px-3 py-2 bg-black/90 backdrop-blur-sm text-white rounded-full shadow-lg text-sm font-medium hover:bg-black transition-colors"
                  title="查看产品效果"
                >
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  产品预览
                </button>
                <button
                  onClick={() => handleSingleVideoGeneration(editedImage || generatedImage || selectedImageUrl!)}
                  disabled={videoGenerating}
                  className="flex items-center px-3 py-2 bg-rose/90 backdrop-blur-sm text-white rounded-full shadow-lg text-sm font-medium hover:bg-rose transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={userBones < 1 ? "点击分享获得骨头后生成视频" : "生成视频"}
                >
                  <Video className="w-4 h-4 mr-1" />
                  {videoGenerating ? '生成中...' : (userBones < 1 ? '分享获得' : '视频')}
                  <div className="flex items-center ml-1">
                    <BoneIcon className="w-3 h-3 text-white/80" />
                    <span className="text-xs ml-0.5">1</span>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Desktop Product Preview - Show on right side when image exists */}
        {(generatedImage || editedImage || selectedImageUrl) && (
          <div className="hidden md:block fixed right-0 top-0 bottom-0 w-80 lg:w-96 bg-white border-l border-gray-200 shadow-xl overflow-y-auto z-[50]">
            <div className="h-full pt-16 p-4">
              <VSCOProductDisplay 
                selectedDesignImageUrl={editedImage || generatedImage || selectedImageUrl || undefined}
                isCompactMode={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* VSCO Mobile-Style Layout - Show only on mobile when image is generated */}
      {(generatedImage || editedImage || selectedImageUrl) && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
              {/* Header with bones counter and reset button */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
                {/* Bones counter */}
                {userId && (
                  <div className="flex items-center space-x-1 px-3 py-2 bg-white/70 backdrop-blur-md rounded-full border border-gray-200/50">
                    <BoneIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      {loadingBones ? '...' : userBones}
                    </span>
                  </div>
                )}
                
                {/* Reset button */}
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
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Mobile optimized real-time preview using CSS filters */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={editedImage || generatedImage || selectedImageUrl || ''}
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
                
                  {/* Mobile Action Buttons - Bottom Overlay - Fixed position to always be visible */}
                  <div className="fixed bottom-4 left-4 right-4 flex justify-between z-[70]">
                  <button
                    onClick={() => handleShareImage(editedImage || generatedImage || selectedImageUrl!)}
                    className="flex items-center px-4 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-sm font-medium hover:bg-white transition-colors"
                    title="分享图片获得骨头"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    分享获得骨头
                  </button>
                  <button
                    onClick={() => setShowProductPreview(true)}
                    className="flex items-center px-4 py-3 bg-black/90 backdrop-blur-sm text-white rounded-full shadow-lg text-sm font-medium hover:bg-black transition-colors"
                    title="查看产品效果"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    产品预览
                  </button>
                  <button
                    onClick={() => handleSingleVideoGeneration(editedImage || generatedImage || selectedImageUrl!)}
                    disabled={videoGenerating}
                    className="flex items-center px-4 py-3 bg-rose/90 backdrop-blur-sm text-white rounded-full shadow-lg text-sm font-medium hover:bg-rose transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={userBones < 1 ? "点击分享获得骨头后生成视频" : "生成视频"}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {videoGenerating ? '生成中...' : (userBones < 1 ? '先分享获得骨头' : '生成视频')}
                    <div className="flex items-center ml-2">
                      <BoneIcon className="w-3 h-3 text-white/80" />
                      <span className="text-xs ml-1">1</span>
                    </div>
                  </button>
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
                        <p className="text-sm text-gray-800 font-medium">🎨 作品收藏</p>
                        <p className="text-xs text-gray-600">您的精美作品已保存</p>
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
                  <p className="text-sm text-gray-800 font-medium mb-1">作品收藏</p>
                  <p className="text-xs text-gray-600">您的精美作品已保存</p>
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

        {/* Publish Dialog - Available for both mobile and desktop */}
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

    </div>
  )
}

