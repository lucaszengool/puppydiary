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
  PawPrint
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CreatePage() {
  const { userId } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result' | 'refine'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")

  // 预设的风格选项
  const styleOptions = [
    { id: 'sunny', icon: Sun, label: '阳光明媚', prompt: '在阳光明媚的草地上，温暖的色调' },
    { id: 'dreamy', icon: Cloud, label: '梦幻云朵', prompt: '在梦幻的云朵之间，柔和的粉色调' },
    { id: 'forest', icon: Trees, label: '森林冒险', prompt: '在神秘的森林中冒险，绿色自然色调' },
    { id: 'warm', icon: Heart, label: '温馨时光', prompt: '温馨的家庭氛围，暖色调' },
    { id: 'playful', icon: Sparkles, label: '活泼欢乐', prompt: '活泼欢乐的氛围，鲜艳的色彩' },
    { id: 'artistic', icon: Palette, label: '艺术风格', prompt: '艺术绘画风格，油画质感' },
  ]

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setSelectedImageUrl(url)
      setCurrentStep('processing')
      generatePortrait(file)
    } else {
      toast({
        title: "文件格式错误",
        description: "请选择图片文件",
        variant: "destructive",
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const generatePortrait = async (file: File, additionalPrompt?: string) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      if (userId) {
        formData.append("userId", userId)
      }
      
      // 基础的宫崎骏风格提示词
      const basePrompt = "Ghibli style, hand-drawn illustration, cute dog character, warm colors, watercolor painting, soft lighting, whimsical, heartwarming"
      const fullPrompt = additionalPrompt ? `${basePrompt}, ${additionalPrompt}` : basePrompt
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
    await generatePortrait(selectedFile, stylePrompt)
  }

  const handleCustomPrompt = async () => {
    if (!selectedFile || !customPrompt.trim()) return
    setCurrentStep('processing')
    await generatePortrait(selectedFile, customPrompt)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setSelectedImageUrl(null)
    setGeneratedImage(null)
    setCustomPrompt("")
    setGeneratedPrompt("")
    setCurrentStep('upload')
  }

  return (
    <div className="min-h-screen watercolor-bg">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 步骤指示器 */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-forest-dark' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-forest text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="hidden sm:inline">上传照片</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'processing' || currentStep === 'result' || currentStep === 'refine' ? 'text-forest-dark' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'processing' || currentStep === 'result' || currentStep === 'refine' ? 'bg-forest text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="hidden sm:inline">生成漫画</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'refine' ? 'text-forest-dark' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'refine' ? 'bg-forest text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="hidden sm:inline">微调风格</span>
            </div>
          </div>
        </div>

        {/* 上传界面 */}
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-forest-dark handwriting mb-4">
                记录狗狗的美好瞬间
              </h1>
              <p className="text-lg text-forest">选择一张您最爱的狗狗照片，让AI为它创作独特的漫画形象</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 拍照按钮 */}
              <button
                onClick={handleCameraClick}
                className="ghibli-card hover:scale-105 transition-transform duration-300 cursor-pointer group"
              >
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="w-20 h-20 rounded-full forest-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest-dark handwriting">拍照记录</h3>
                  <p className="text-sm text-forest">使用相机拍摄新照片</p>
                </div>
              </button>

              {/* 上传按钮 */}
              <button
                onClick={handleUploadClick}
                className="ghibli-card hover:scale-105 transition-transform duration-300 cursor-pointer group"
              >
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="w-20 h-20 rounded-full forest-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-forest-dark handwriting">上传照片</h3>
                  <p className="text-sm text-forest">从相册选择照片</p>
                </div>
              </button>
            </div>

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

            {/* 提示信息 */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 text-forest">
                <PawPrint className="h-5 w-5" />
                <span className="text-sm">支持 JPG、PNG 等常见图片格式</span>
                <PawPrint className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* 处理中界面 */}
        {currentStep === 'processing' && (
          <div className="max-w-4xl mx-auto">
            <div className="ghibli-card">
              <div className="text-center py-16">
                <Loader2 className="h-16 w-16 mx-auto text-forest animate-spin mb-6" />
                <h2 className="text-2xl font-semibold text-forest-dark handwriting mb-2">
                  正在创作您的漫画...
                </h2>
                <p className="text-forest">AI正在将您的狗狗照片转化为温暖的手绘作品</p>
                <p className="text-sm text-forest/70 mt-2">这可能需要20-30秒</p>
              </div>
            </div>
          </div>
        )}

        {/* 结果展示界面 */}
        {(currentStep === 'result' || currentStep === 'refine') && generatedImage && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 左侧 - 生成的图片 */}
              <div className="ghibli-card">
                <h3 className="text-xl font-semibold text-forest-dark handwriting mb-4">
                  您的狗狗漫画
                </h3>
                <div className="aspect-square bg-cream rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={generatedImage}
                    alt="生成的狗狗漫画"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = generatedImage
                      a.download = `puppy-diary-${Date.now()}.png`
                      a.click()
                    }}
                    className="flex-1 ghibli-button flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>保存图片</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 rounded-full border-2 border-forest bg-white hover:bg-forest-light transition-all flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>重新开始</span>
                  </button>
                </div>
                
                {!userId && (
                  <div className="mt-4 p-4 bg-sand/50 rounded-xl border-2 border-rose">
                    <p className="text-sm text-forest-dark mb-2">
                      喜欢这幅作品吗？登录后可以保存到您的相册！
                    </p>
                    <div className="flex gap-2">
                      <Link href="/sign-up" className="flex-1">
                        <button className="w-full px-3 py-1.5 bg-forest text-white rounded-full text-sm hover:bg-forest-dark transition">
                          免费注册
                        </button>
                      </Link>
                      <Link href="/sign-in" className="flex-1">
                        <button className="w-full px-3 py-1.5 border-2 border-forest rounded-full text-sm hover:bg-forest-light transition">
                          登录
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧 - 微调选项 */}
              <div className="ghibli-card">
                <h3 className="text-xl font-semibold text-forest-dark handwriting mb-4">
                  微调风格
                </h3>
                
                {/* 预设风格选项 */}
                <div className="mb-6">
                  <p className="text-sm text-forest mb-3">选择不同的风格效果：</p>
                  <div className="grid grid-cols-2 gap-3">
                    {styleOptions.map((style) => {
                      const Icon = style.icon
                      return (
                        <button
                          key={style.id}
                          onClick={() => {
                            setCurrentStep('refine')
                            handleStyleChange(style.prompt)
                          }}
                          disabled={isProcessing}
                          className="p-3 rounded-xl border-2 border-forest-light hover:border-forest hover:bg-forest-light/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-forest group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-forest-dark font-medium">{style.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 自定义提示词 */}
                <div className="border-t-2 border-forest-light pt-6">
                  <p className="text-sm text-forest mb-3">或输入您想要的风格描述：</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="例如：在花园里玩耍，春天的氛围..."
                      className="flex-1 px-4 py-2 border-2 border-forest-light rounded-full focus:border-forest focus:outline-none"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={() => {
                        setCurrentStep('refine')
                        handleCustomPrompt()
                      }}
                      disabled={isProcessing || !customPrompt.trim()}
                      className="px-6 py-2 bg-forest text-white rounded-full hover:bg-forest-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>生成</span>
                    </button>
                  </div>
                </div>

                {/* 当前使用的提示词 */}
                {generatedPrompt && (
                  <div className="mt-6 p-4 bg-sky-light/30 rounded-xl border-2 border-sky">
                    <p className="text-xs text-sky-deep font-medium mb-1">当前风格描述：</p>
                    <p className="text-xs text-forest-dark">{generatedPrompt}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-forest">
                每次微调都会基于原始照片重新生成，尝试不同风格找到您最喜欢的效果！
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}