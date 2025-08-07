"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'

interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
  sharpness: number
  exposure: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  clarity: number
  vibrance: number
}

interface FilterPreset {
  id: string
  name: string
  adjustments: Partial<ImageAdjustments>
}

interface ImageEditorProps {
  originalImage: string
  adjustments: ImageAdjustments
  onAdjustmentChange: (adjustments: ImageAdjustments) => void
  onImageUpdate: (editedImageData: string) => void
}

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
  { id: 'minimal', name: '极简', adjustments: { brightness: 10, shadows: 20, highlights: -10, saturation: -15 } },
  { id: 'warm', name: '暖调', adjustments: { warmth: 30, exposure: 10, highlights: -10, vibrance: 15 } },
  { id: 'cool', name: '冷调', adjustments: { warmth: -25, highlights: 10, shadows: -10, vibrance: 10 } },
  { id: 'bw', name: '黑白', adjustments: { saturation: -100, contrast: 20, clarity: 15 } },
  { id: 'sepia', name: '棕色', adjustments: { saturation: -60, warmth: 40, brightness: 5 } },
  { id: 'vibrant', name: '鲜艳', adjustments: { saturation: 30, vibrance: 25, clarity: 10, contrast: 15 } },
  { id: 'soft', name: '柔和', adjustments: { highlights: -20, shadows: 15, clarity: -15, brightness: 5 } },
  { id: 'dramatic', name: '戏剧', adjustments: { contrast: 30, shadows: -15, highlights: -20, clarity: 20 } },
  { id: 'fade', name: '褥色', adjustments: { shadows: 25, highlights: -15, contrast: -10, brightness: 8 } },
  { id: 'matte', name: '哑光', adjustments: { shadows: 20, highlights: -20, contrast: -15, saturation: -5 } },
  { id: 'bright', name: '明亮', adjustments: { brightness: 20, shadows: 15, highlights: -5, vibrance: 10 } },
  { id: 'moody', name: '情绪', adjustments: { brightness: -15, shadows: -20, highlights: 10, saturation: -10 } },
  { id: 'golden', name: '金色', adjustments: { warmth: 35, brightness: 8, saturation: 15, highlights: -8 } },
  { id: 'urban', name: '城市', adjustments: { contrast: 15, clarity: 18, saturation: -5, brightness: -5 } },
  { id: 'nature', name: '自然', adjustments: { vibrance: 20, saturation: 10, clarity: 12, brightness: 5 } },
  { id: 'sunset', name: '日落', adjustments: { warmth: 40, brightness: 5, highlights: -10, vibrance: 18 } },
  { id: 'sunrise', name: '日出', adjustments: { warmth: 25, brightness: 12, shadows: 10, saturation: 8 } },
  { id: 'blue', name: '蓝调', adjustments: { warmth: -30, saturation: 15, brightness: 5, vibrance: 12 } },
  { id: 'green', name: '绿调', adjustments: { saturation: 20, vibrance: 15, clarity: 10, brightness: 3 } },
  { id: 'pink', name: '粉调', adjustments: { warmth: 20, highlights: 10, saturation: 12, brightness: 8 } },
  { id: 'orange', name: '橙调', adjustments: { warmth: 30, saturation: 18, brightness: 5, vibrance: 15 } }
]

export default function ImageEditor({
  originalImage,
  adjustments,
  onAdjustmentChange,
  onImageUpdate
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const applyFilters = useCallback(async () => {
    if (!canvasRef.current || !originalImage) return

    setIsProcessing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply CSS filters to the canvas context
      const filters = []
      
      // Basic adjustments
      if (adjustments.brightness !== 0) {
        filters.push(`brightness(${100 + adjustments.brightness}%)`)
      }
      if (adjustments.contrast !== 0) {
        filters.push(`contrast(${100 + adjustments.contrast}%)`)
      }
      if (adjustments.saturation !== 0) {
        filters.push(`saturate(${100 + adjustments.saturation}%)`)
      }
      if (adjustments.exposure !== 0) {
        filters.push(`brightness(${100 + adjustments.exposure}%)`)
      }
      if (adjustments.warmth !== 0) {
        if (adjustments.warmth > 0) {
          filters.push(`sepia(${adjustments.warmth}%)`)
        } else {
          filters.push(`hue-rotate(${adjustments.warmth * 2}deg)`)
        }
      }
      if (adjustments.vibrance !== 0) {
        filters.push(`saturate(${100 + adjustments.vibrance}%)`)
      }
      if (adjustments.highlights !== 0) {
        filters.push(`brightness(${100 + adjustments.highlights / 2}%)`)
      }
      if (adjustments.shadows !== 0) {
        filters.push(`contrast(${100 + adjustments.shadows / 2}%)`)
      }
      if (adjustments.clarity !== 0) {
        if (adjustments.clarity > 0) {
          filters.push(`contrast(${100 + adjustments.clarity}%)`)
        } else {
          filters.push(`blur(${Math.abs(adjustments.clarity) / 10}px)`)
        }
      }

      // Apply filters
      ctx.filter = filters.length > 0 ? filters.join(' ') : 'none'
      
      // Draw the image
      ctx.drawImage(img, 0, 0)


      // Get the edited image data
      const editedImageData = canvas.toDataURL('image/jpeg', 0.9)
      onImageUpdate(editedImageData)
      setIsProcessing(false)
    }

    img.src = originalImage
  }, [originalImage, adjustments, onImageUpdate])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const applyPreset = (preset: FilterPreset) => {
    const newAdjustments = { ...adjustments }
    
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
    
    onAdjustmentChange(newAdjustments)
  }

  return (
    <div className="image-editor">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
        className="hidden"
      />
      
      {/* Filter Presets */}
      <div className="filter-presets mb-6">
        <h4 className="text-sm font-medium mb-3 uppercase tracking-wide">预设滤镜</h4>
        <div className="grid grid-cols-3 gap-2">
          {filterPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              disabled={isProcessing}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { ImageAdjustments, FilterPreset }