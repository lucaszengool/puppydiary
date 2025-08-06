"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Webcam from "react-webcam"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  className?: string
}

export function ImageUpload({ onImageSelect, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [webcamRef, setWebcamRef] = useState<Webcam | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log("onDrop called:", { acceptedFiles, rejectedFiles })
    
    if (rejectedFiles.length > 0) {
      console.error("Rejected files:", rejectedFiles)
      alert("File rejected. Please make sure it's an image under 10MB.")
      return
    }
    
    const file = acceptedFiles[0]
    if (file) {
      console.log("Processing file:", file.name, file.size, file.type)
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("FileReader completed")
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    } else {
      console.warn("No file in acceptedFiles")
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const capturePhoto = useCallback(() => {
    if (webcamRef) {
      const imageSrc = webcamRef.getScreenshot()
      if (imageSrc) {
        setPreview(imageSrc)
        setShowWebcam(false)
        
        // Convert base64 to File
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" })
            onImageSelect(file)
          })
      }
    }
  }, [webcamRef, onImageSelect])

  const resetImage = () => {
    setPreview(null)
    setShowWebcam(false)
  }

  if (preview) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden popmart-shadow", className)}>
        <Image
          src={preview}
          alt="Pet preview"
          width={400}
          height={400}
          className="w-full h-auto object-cover"
        />
        <Button
          onClick={resetImage}
          size="icon"
          variant="destructive"
          className="absolute top-4 right-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (showWebcam) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative rounded-2xl overflow-hidden popmart-shadow">
          <Webcam
            ref={(ref) => setWebcamRef(ref)}
            screenshotFormat="image/jpeg"
            className="w-full h-auto"
            videoConstraints={{
              width: 720,
              height: 720,
              facingMode: "user"
            }}
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={capturePhoto} variant="popmart" className="flex-1">
            Capture Photo
          </Button>
          <Button onClick={() => setShowWebcam(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "image-upload-area rounded-2xl p-8 text-center cursor-pointer transition-all",
          "hover:border-popmart-pink/50 hover:bg-gradient-to-br hover:from-popmart-pink/20 hover:via-popmart-blue/20 hover:to-popmart-yellow/20",
          isDragActive && "border-popmart-pink bg-popmart-pink/10"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-popmart-pink" />
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? "Drop your pet photo here!" : "Drag & drop your pet photo"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          or click to select from your device
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Supports JPEG, PNG, WebP (max 10MB)
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gradient-to-br from-popmart-pink/10 via-popmart-blue/10 to-popmart-yellow/10 px-2 text-gray-500">
            Or
          </span>
        </div>
      </div>

      <Button
        onClick={() => setShowWebcam(true)}
        variant="outline"
        className="w-full"
      >
        <Camera className="h-4 w-4 mr-2" />
        Use Camera
      </Button>
    </div>
  )
}