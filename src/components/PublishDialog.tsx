"use client"

import { useState } from "react"
import { X, Globe, Heart, Users } from "lucide-react"

interface PublishDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (description?: string) => void
  imageUrl: string
}

export default function PublishDialog({ isOpen, onClose, onConfirm, imageUrl }: PublishDialogProps) {
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handlePublish = () => {
    onConfirm(description.trim() || undefined)
    onClose()
    setDescription("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">发布到作品集</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="作品预览"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-blue-700">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">公开发布</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Users className="w-4 h-4" />
              <span className="text-xs">所有人都可以在作品集社区中看到这个作品</span>
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品描述 <span className="text-gray-400">(可选)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="分享您的创作灵感或故事..."
              className="w-full h-20 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/200
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handlePublish}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Heart className="w-4 h-4" />
            <span>发布作品</span>
          </button>
        </div>
      </div>
    </div>
  )
}