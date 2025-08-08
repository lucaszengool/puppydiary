import React from 'react'

interface BoneIconProps {
  className?: string
  size?: number
}

export default function BoneIcon({ className = "w-5 h-5", size }: BoneIconProps) {
  const iconSize = size ? { width: size, height: size } : {}
  
  return (
    <svg 
      className={className}
      style={iconSize}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M5 12C5 12 3.5 10.5 3.5 8.5C3.5 6.5 5 5 7 5C8 5 8.5 5.5 9 6.5L15 6.5C15.5 5.5 16 5 17 5C19 5 20.5 6.5 20.5 8.5C20.5 10.5 19 12 19 12C19 12 20.5 13.5 20.5 15.5C20.5 17.5 19 19 17 19C16 19 15.5 18.5 15 17.5L9 17.5C8.5 18.5 8 19 7 19C5 19 3.5 17.5 3.5 15.5C3.5 13.5 5 12 5 12Z" 
        fill="currentColor"
        stroke="currentColor" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}