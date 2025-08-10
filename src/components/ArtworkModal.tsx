"use client"

import { useState, useEffect } from "react"
import { X, Heart, Calendar, User } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { MockupDisplay } from "@/components/MockupDisplay"

interface Artwork {
  id: string
  userId: string
  imageUrl: string
  description?: string
  createdAt: string
  likes: number
  likedBy: string[]
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  username?: string
  imageUrl?: string
  createdAt?: number
}

interface ArtworkModalProps {
  isOpen: boolean
  onClose: () => void
  artwork: Artwork | null
}

export default function ArtworkModal({ isOpen, onClose, artwork }: ArtworkModalProps) {
  const { userId } = useAuth()
  const [author, setAuthor] = useState<User | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMockups, setShowMockups] = useState(false)

  useEffect(() => {
    if (isOpen && artwork) {
      fetchAuthorInfo()
      checkFavoriteStatus()
    }
  }, [isOpen, artwork])

  const fetchAuthorInfo = async () => {
    if (!artwork) return
    
    try {
      const response = await fetch(`/api/user/${artwork.userId}`)
      if (response.ok) {
        const data = await response.json()
        setAuthor(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch author info:", error)
    }
  }

  const checkFavoriteStatus = async () => {
    if (!userId || !artwork) return

    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.favorites.includes(artwork.id))
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!userId || !artwork) return

    setLoading(true)
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: artwork.id,
          action: isFavorited ? 'remove' : 'add'
        })
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDisplayName = () => {
    if (!author) return '匿名用户'
    if (author.firstName || author.lastName) {
      return `${author.firstName || ''} ${author.lastName || ''}`.trim()
    }
    if (author.username) return author.username
    return '匿名用户'
  }

  if (!isOpen || !artwork) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">作品详情</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Image */}
          <div className="aspect-square bg-gray-100">
            <img
              src={artwork.imageUrl}
              alt="作品"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-4 space-y-4">
            {/* Author & Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {author?.imageUrl && (
                  <img
                    src={author.imageUrl}
                    alt={getDisplayName()}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{getDisplayName()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(artwork.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Favorite Button */}
              {userId && (
                <button
                  onClick={toggleFavorite}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isFavorited
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {isFavorited ? '已收藏' : '收藏'}
                  </span>
                </button>
              )}
            </div>

            {/* Description */}
            {artwork.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">作品描述</h4>
                <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-gray-600">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{artwork.likes || 0} 人喜欢</span>
              </div>
              
              {/* Mockup Toggle Button */}
              <button
                onClick={() => setShowMockups(!showMockups)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                {showMockups ? '隐藏产品预览' : '查看产品预览'}
              </button>
            </div>

            {/* Mockup Display Section */}
            {showMockups && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <MockupDisplay 
                  designImageUrl={artwork.imageUrl}
                  onDownload={(mockupUrl, templateName) => {
                    const link = document.createElement('a');
                    link.href = mockupUrl;
                    link.download = `mockup-${templateName}-${Date.now()}.png`;
                    link.click();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}