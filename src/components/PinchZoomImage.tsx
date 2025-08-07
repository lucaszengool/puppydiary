"use client"

import React from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

interface PinchZoomImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

export default function PinchZoomImage({ src, alt, className = '', style }: PinchZoomImageProps) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={4}
      wheel={{
        step: 0.1
      }}
      pinch={{
        step: 5
      }}
      doubleClick={{
        disabled: false,
        mode: "toggle",
        animationTime: 200,
      }}
      panning={{
        disabled: false,
        velocityDisabled: false,
        lockAxisX: false,
        lockAxisY: false,
      }}
      centerOnInit={true}
      limitToBounds={false}
      smooth={true}
      alignmentAnimation={{
        sizeX: 100,
        sizeY: 100,
        velocityAlignmentTime: 200,
      }}
    >
      <TransformComponent
        wrapperClass="zoom-wrapper"
        contentClass="zoom-content"
      >
        <img
          src={src}
          alt={alt}
          className={`vsco-image ${className}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            ...style
          }}
          draggable={false}
        />
      </TransformComponent>
    </TransformWrapper>
  )
}