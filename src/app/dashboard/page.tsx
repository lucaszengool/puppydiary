"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, Plus, Grid, User, Heart, Download, Share2, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserArtwork {
  id: string
  url: string
  title: string
  style: string
  createdAt: string
  published: boolean
  likes: number
}

// Mock user artworks - in real app this would come from database
const mockUserArtworks: UserArtwork[] = [
  {
    id: "1",
    url: "/styles/ghibli-style.png",
    title: "我的宫崎骏风格小狗",
    style: "宫崎骏动漫",
    createdAt: "2024-01-15",
    published: true,
    likes: 45
  },
  {
    id: "2",
    url: "/styles/watercolor-style.png",
    title: "水彩风格猫咪",
    style: "水彩插画",
    createdAt: "2024-01-10",
    published: false,
    likes: 0
  }
]

export default function DashboardPage() {
  const { userId, isSignedIn } = useAuth()
  const { toast } = useToast()
  const [artworks, setArtworks] = useState<UserArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      // In production, fetch user's artworks from API
      setArtworks(mockUserArtworks)
      setLoading(false)
    }
  }, [isSignedIn])

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-light text-black mb-4">需要登录</h2>
          <p className="text-gray-600 mb-8">请登录查看您的创作</p>
          <Link href="/sign-in" className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
            <span>登录</span>
          </Link>
        </div>
      </div>
    )
  }

  const handleTogglePublish = (id: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === id 
        ? { ...artwork, published: !artwork.published }
        : artwork
    ))
    
    const artwork = artworks.find(a => a.id === id)
    toast({
      title: artwork?.published ? "取消发布" : "发布成功",
      description: artwork?.published 
        ? "作品已从公共画廊中移除" 
        : "作品已发布到公共画廊",
    })
  }

  const handleDelete = (id: string) => {
    setArtworks(artworks.filter(artwork => artwork.id !== id))
    toast({
      title: "删除成功",
      description: "作品已删除",
    })
  }

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}-${Date.now()}.png`
    a.click()
  }

  const handleShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "链接已复制",
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-light tracking-wide text-black">
              PETPO
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/create" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                创作
              </Link>
              <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                作品集
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-black border-b-2 border-black">
                我的作品
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-black mb-2 tracking-tight">
              我的作品
            </h1>
            <p className="text-lg text-gray-600 font-light">
              管理您的创作，发布到社区画廊
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>创建新作品</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-sm">
            <div className="flex items-center">
              <Grid className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-light text-black">{artworks.length}</p>
                <p className="text-sm text-gray-600">总作品数</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-sm">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-light text-black">{artworks.filter(a => a.published).length}</p>
                <p className="text-sm text-gray-600">已发布作品</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-sm">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-light text-black">{artworks.reduce((sum, a) => sum + a.likes, 0)}</p>
                <p className="text-sm text-gray-600">获得赞数</p>
              </div>
            </div>
          </div>
        </div>

        {/* Artworks Grid */}
        {artworks.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-light text-black mb-2">还没有作品</h3>
            <p className="text-gray-600 mb-8">创建您的第一个 AI 宠物肖像</p>
            <Link
              href="/create"
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>开始创作</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={artwork.url}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    {artwork.published && (
                      <div className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                        已发布
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-black mb-1">{artwork.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{artwork.style}</span>
                    <span>{new Date(artwork.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  
                  {artwork.published && (
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Heart className="w-3 h-3 mr-1" />
                      <span>{artwork.likes} 赞</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(artwork.url, artwork.title)}
                      className="flex-1 text-xs py-2 px-3 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>下载</span>
                    </button>
                    <button
                      onClick={() => handleShare(artwork.url)}
                      className="flex-1 text-xs py-2 px-3 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>分享</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => handleTogglePublish(artwork.id)}
                      className={`flex-1 text-xs py-2 px-3 transition-colors flex items-center justify-center space-x-1 ${
                        artwork.published
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{artwork.published ? '取消发布' : '发布'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="text-xs py-2 px-3 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}