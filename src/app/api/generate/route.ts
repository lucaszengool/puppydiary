import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import sharp from "sharp"
import { portraitStorage } from "@/lib/storage"
import { rateLimiter } from "@/lib/rate-limit"
import { localAnimalDetection } from "@/lib/animal-detection"

// Configure API route for long-running operations
export const runtime = 'nodejs'
export const maxDuration = 900 // 15 minutes

// Local AI Backend Configuration
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8003"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Check if local AI backend is available
    console.log(`🔍 Checking AI backend at: ${AI_BACKEND_URL}/health`)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const healthCheck = await fetch(`${AI_BACKEND_URL}/health`, { 
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log(`📊 Health check response: ${healthCheck.status} ${healthCheck.statusText}`)
      
      if (!healthCheck.ok) {
        throw new Error(`AI backend not healthy: ${healthCheck.status}`)
      }
      
      const healthData = await healthCheck.json()
      console.log("✅ Local AI backend is ready:", healthData)
    } catch (healthError) {
      console.log("⚠️ Local AI backend not available, using demo mode")
      console.log("❌ Health check error:", healthError instanceof Error ? healthError.message : String(healthError))
      
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return NextResponse.json({
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&crop=center",
        petAnalysis: "DEMO MODE - Local AI backend not running. Start the Python backend with 'python ai-backend/main.py' for real PopMart figure generation!",
        portraitId: null,
        saved: false,
        demo: true,
        error: "AI backend offline"
      })
    }

    const { userId } = auth()
    
    // Use userId for rate limiting if available, otherwise use IP address
    const rateLimitKey = userId || request.ip || 'anonymous'
    
    // Rate limiting
    const rateLimit = rateLimiter.check(rateLimitKey)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const customPrompt = formData.get("prompt") as string | null
    const customNegativePrompt = formData.get("negative_prompt") as string | null
    const artStyle = formData.get("art_style") as string || "popmart"
    const cutenessLevel = formData.get("cuteness_level") as string || "high"
    const colorPalette = formData.get("color_palette") as string || "vibrant"
    
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Processing image:", image.name, image.size, image.type)

    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload JPEG, PNG, or WebP images." 
      }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log("Image buffer size:", buffer.length)
    
    // Resize and optimize image for API
    const optimizedBuffer = await sharp(buffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer()
    
    console.log("Optimized buffer size:", optimizedBuffer.length)
    
    const base64Image = optimizedBuffer.toString("base64")

    // Quick local pet detection (free and fast)
    let petAnalysis = "pet detected - ready for PopMart generation"

    try {
      console.log("🔍 Quick pet detection with local models...")
      const detection = await localAnimalDetection.detectAnimalsInImage(optimizedBuffer)
      
      if (detection.hasAnimal && detection.confidence > 0.5) {
        petAnalysis = `${detection.animalType} detected - generating PopMart figure`
        console.log("✅ Local pet detection result:", petAnalysis)
      } else {
        petAnalysis = "pet assumed present - proceeding with generation"
      }
    } catch (localError) {
      console.log("⚠️ Local detection failed, proceeding anyway:", localError instanceof Error ? localError.message : String(localError))
      petAnalysis = "pet assumed present - proceeding with generation"
    }

    console.log("🎨 Starting PopMart figure generation with local AI...")

    try {
      // Create FormData for local AI backend
      const aiFormData = new FormData()
      const imageBlob = new Blob([new Uint8Array(optimizedBuffer)], { type: 'image/jpeg' })
      aiFormData.append('image', imageBlob, 'pet.jpg')
      aiFormData.append('style', 'sleeping_popmart_poodle')
      
      // Add style parameters
      aiFormData.append('art_style', artStyle)
      aiFormData.append('cuteness_level', cutenessLevel)
      aiFormData.append('color_palette', colorPalette)
      
      // Add custom prompts if provided
      if (customPrompt && customPrompt.trim()) {
        aiFormData.append('prompt', customPrompt.trim())
      }
      if (customNegativePrompt && customNegativePrompt.trim()) {
        aiFormData.append('negative_prompt', customNegativePrompt.trim())
      }

      // Call local AI backend with extended timeout for FLUX
      console.log("🚀 Starting FLUX generation request...")
      
      const aiResponse = await fetch(`${AI_BACKEND_URL}/generate`, {
        method: 'POST',
        body: aiFormData,
        // Remove timeout entirely - let the backend handle it
        signal: undefined
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.text()
        throw new Error(`AI Backend Error: ${aiResponse.status} - ${errorData}`)
      }

      const aiResult = await aiResponse.json()
      
      if (!aiResult.success || !aiResult.imageUrl) {
        throw new Error("AI backend did not return a valid image")
      }

      console.log(`✅ Local AI generation successful in ${aiResult.generationTime}s`)
      
      // Save to storage only if user is signed in
      let portraitId = null
      if (userId) {
        const portrait = portraitStorage.addPortrait({
          userId,
          originalImageUrl: `data:image/jpeg;base64,${base64Image}`,
          generatedImageUrl: aiResult.imageUrl,
          petAnalysis: aiResult.analysis,
        })
        portraitId = portrait.id
      }

      // Upload generated image to Uploadthing for public URL
      let publicImageUrl = aiResult.imageUrl
      try {
        if (aiResult.imageUrl.startsWith('data:image/')) {
          // Convert base64 to blob and upload
          const base64Data = aiResult.imageUrl.split(',')[1]
          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          // Create a form for upload
          const uploadFormData = new FormData()
          const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
          uploadFormData.append('files', blob, `generated-${Date.now()}.jpg`)
          
          // Upload to Uploadthing
          const uploadResponse = await fetch('/api/uploadthing', {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            if (uploadResult?.[0]?.url) {
              publicImageUrl = uploadResult[0].url
              console.log('✅ Uploaded to cloud storage:', publicImageUrl)
            }
          }
        }
      } catch (uploadError) {
        console.log('⚠️ Cloud upload failed, using base64:', uploadError)
      }

      return NextResponse.json({
        imageUrl: publicImageUrl,
        petAnalysis: aiResult.analysis,
        portraitId,
        saved: !!userId,
        generationTime: aiResult.generationTime,
        localAI: true,
        cloudUrl: publicImageUrl !== aiResult.imageUrl
      })
      
    } catch (aiError) {
      console.error("🚨 Local AI generation failed:", aiError)
      
      // Fallback to demo mode
      console.log("Falling back to demo mode due to local AI issues")
      return NextResponse.json({
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&crop=center",
        petAnalysis: `LOCAL AI ISSUE - ${petAnalysis}. The local AI backend encountered an error: ${aiError instanceof Error ? aiError.message : String(aiError)}. Please check that the Python backend is running properly.`,
        portraitId: null,
        saved: false,
        demo: true,
        error: `Local AI backend error: ${aiError instanceof Error ? aiError.message : String(aiError)}`
      })
    }

  } catch (error) {
    console.error("Generation error:", error)
    
    // Handle specific error types
    if (error instanceof Error) {
      // OpenAI API errors
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "AI service is busy. Please try again in a few moments." },
          { status: 503 }
        )
      }
      
      if (error.message.includes("content policy")) {
        return NextResponse.json(
          { error: "The image content violates our content policy." },
          { status: 400 }
        )
      }

      // Image processing errors
      if (error.message.includes("unsupported image format")) {
        return NextResponse.json(
          { error: "Unsupported image format. Please use JPEG, PNG, or WebP." },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to generate portrait. Please try again." },
      { status: 500 }
    )
  }
}