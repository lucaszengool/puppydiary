import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Configure API route for long-running operations
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { images, style, transitions, music } = await request.json()
    
    console.log("🎬 Vlog generation request:", {
      imageCount: images?.length,
      style,
      transitions,
      music
    })

    if (!images || images.length < 3) {
      return NextResponse.json({ 
        error: "At least 3 images are required for vlog generation" 
      }, { status: 400 })
    }

    // For now, return a demo response with a sample video
    // In production, this would call a video generation service
    console.log("🎭 Creating vlog with transitions and music...")
    
    // Simulate video generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Return demo video URL (you would replace this with actual video generation)
    const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    
    const taskId = `vlog-${userId}-${Date.now()}`
    
    return NextResponse.json({
      success: true,
      videoUrl: demoVideoUrl,
      taskId,
      message: "Vlog generated successfully!",
      metadata: {
        style,
        transitions,
        music,
        imageCount: images.length,
        duration: "30s"
      }
    })

  } catch (error) {
    console.error("Vlog generation error:", error)
    return NextResponse.json({ 
      error: "Failed to generate vlog" 
    }, { status: 500 })
  }
}