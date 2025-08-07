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
  // Beauty adjustments
  skinSmooth: number
  faceSlim: number
  eyeEnlarge: number
  skinBrighten: number
  teethWhiten: number
  // Body adjustments
  bodySlim: number
  legLengthen: number
  shoulderBroaden: number
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
  {
    id: 'none',
    name: '原图',
    adjustments: {}
  },
  {
    id: 'vintage',
    name: '复古',
    adjustments: {
      brightness: -10,
      contrast: 15,
      saturation: -20,
      warmth: 25,
      highlights: -15
    }
  },
  {
    id: 'warm',
    name: '暖调',
    adjustments: {
      warmth: 30,
      exposure: 10,
      highlights: -10,
      vibrance: 15
    }
  },
  {
    id: 'cool',
    name: '冷调',
    adjustments: {
      warmth: -25,
      highlights: 10,
      shadows: -10,
      vibrance: 10
    }
  },
  {
    id: 'bw',
    name: '黑白',
    adjustments: {
      saturation: -100,
      contrast: 20,
      clarity: 15
    }
  },
  {
    id: 'vibrant',
    name: '鲜艳',
    adjustments: {
      saturation: 30,
      vibrance: 25,
      clarity: 10,
      contrast: 15
    }
  },
  {
    id: 'soft',
    name: '柔和',
    adjustments: {
      highlights: -20,
      shadows: 15,
      clarity: -15,
      brightness: 5
    }
  }
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