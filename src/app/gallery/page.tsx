"use client"

import { useAuth } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Download, Share2, Plus, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Portrait {
  id: string
  generatedImageUrl: string
  createdAt: string
}

export default function GalleryPage() {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [portraits, setPortraits] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      // In production, fetch from API
      // For demo, we'll use a mock data
      setPortraits([])
      setLoading(false)
    }
  }, [userId])
  
  if (!userId) {
    return (
      <div className="min-h-screen cafe-bg">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="ghibli-card">
            <BookOpen className="h-16 w-16 mx-auto text-forest mb-4" />
            <p className="text-forest-dark text-lg">请登录查看您的相册</p>
            <Link href="/sign-in">
              <button className="mt-4 ghibli-button">
                立即登录
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `puppy-diary-${id}.png`
    a.click()
  }

  const handleShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "链接已复制！",
        description: "图片链接已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen cafe-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-dark handwriting mb-4">
            我的狗狗相册
          </h1>
          <p className="text-forest text-lg">
            珍藏每一个美好瞬间，记录狗狗的成长故事
          </p>
        </div>

        {portraits.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="ghibli-card text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full forest-gradient flex items-center justify-center animate-gentle-float">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <p className="text-forest-dark mb-2 text-lg">相册还是空的</p>
              <p className="text-forest mb-6">快去记录第一个美好瞬间吧！</p>
              <Link href="/create">
                <button className="ghibli-button flex items-center space-x-2 mx-auto">
                  <Plus className="h-5 w-5" />
                  <span>创建第一幅作品</span>
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portraits.map((portrait, index) => (
              <div 
                key={portrait.id} 
                className="ghibli-card hover:scale-105 transition-all duration-300 animate-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={portrait.generatedImageUrl}
                    alt="狗狗漫画"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Heart className="h-6 w-6 text-rose fill-rose drop-shadow-md" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-forest">
                    创建于 {new Date(portrait.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(portrait.generatedImageUrl, portrait.id)}
                      className="flex-1 px-3 py-2 rounded-full border-2 border-forest hover:bg-forest-light transition-all flex items-center justify-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">下载</span>
                    </button>
                    <button
                      onClick={() => handleShare(portrait.generatedImageUrl)}
                      className="flex-1 px-3 py-2 rounded-full bg-forest text-white hover:bg-forest-dark transition-all flex items-center justify-center space-x-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">分享</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 添加新作品卡片 */}
            <Link href="/create">
              <div className="ghibli-card hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-dashed border-forest-light">
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-forest-light flex items-center justify-center">
                      <Plus className="h-8 w-8 text-forest" />
                    </div>
                    <p className="text-forest-dark font-medium">添加新作品</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}