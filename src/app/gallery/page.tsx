"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Camera, Plus, Grid, User, Heart } from "lucide-react"
import ArtworkModal from "@/components/ArtworkModal"

interface Artwork {
  id: string
  userId: string
  imageUrl: string
  description?: string
  createdAt: string
  likes: number
  likedBy: string[]
}

export default function GalleryPage() {
  const { userId } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      console.log("🔍 Gallery: Fetching artworks...")
      const response = await fetch('/api/publish')
      console.log("📡 Gallery: Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📦 Gallery: Received data:", data)
        console.log("🎨 Gallery: Artworks count:", data.artworks?.length || 0)
        setArtworks(data.artworks || [])
      } else {
        console.error("❌ Gallery: Failed to fetch artworks:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleArtworkClick = (artwork: Artwork) => {
    // Allow everyone to view artwork details without login
    setSelectedArtwork(artwork)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* VSCO Style Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-light tracking-wide text-black">
            PETPO
          </Link>
          <nav className="flex space-x-3 md:space-x-6">
            <Link href="/create" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              创作
            </Link>
            <Link href="/gallery" className="text-sm font-medium text-black border-b-2 border-black">
              作品集
            </Link>
            {userId ? (
              <>
                <Link href="/dashboard" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  我的作品
                </Link>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </>
            ) : (
              <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                登录
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Gallery Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light text-black mb-4 tracking-tight">
            社区作品集
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            探索由我们的用户创作的精美宠物艺术作品
            <span className="block text-sm mt-2 text-gray-500">点击作品查看详情</span>
          </p>
        </div>

        {/* Gallery Grid */}
        {artworks.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-light text-gray-600 mb-2">还没有作品</h3>
            <p className="text-gray-400 mb-6">成为第一个发布作品的用户吧！</p>
            <Link
              href="/create"
              className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors rounded-sm"
            >
              <Plus className="w-4 h-4" />
              <span>开始创作</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                onClick={() => handleArtworkClick(artwork)}
                className="group relative aspect-square overflow-hidden bg-gray-50 rounded-sm cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <img
                  src={artwork.imageUrl}
                  alt="艺术作品"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/90 text-xs">作品</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-white/80 text-xs">
                        <Heart className="w-3 h-3" />
                        <span>{artwork.likes}</span>
                      </div>
                      <span className="text-white/70 text-xs">{formatDate(artwork.createdAt)}</span>
                    </div>
                  </div>
                  {artwork.description && (
                    <p className="text-white/90 text-xs mt-2 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 py-16 border-t border-gray-100">
          <h2 className="text-2xl font-light text-black mb-4">
            创作您自己的宠物艺术作品
          </h2>
          <p className="text-gray-600 mb-8 font-light">
            使用 AI 技术将您的爱宠转换为艺术杰作
          </p>
          <Link
            href="/create"
            className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>开始创作</span>
          </Link>
        </div>
      </main>

      {/* Artwork Detail Modal */}
      <ArtworkModal
        isOpen={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        artwork={selectedArtwork}
      />
    </div>
  )
}