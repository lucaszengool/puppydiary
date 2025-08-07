import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

// In-memory storage for demo (in production, use a database)
let artworks: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl, description } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Create artwork object
    const artwork = {
      id: Date.now().toString(),
      userId,
      imageUrl,
      description: description || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    }

    // Add to storage
    artworks.push(artwork)

    return NextResponse.json({ 
      success: true, 
      artwork 
    })

  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json({ error: "Failed to publish artwork" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return all published artworks, sorted by creation date (newest first)
    const sortedArtworks = artworks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ artworks: sortedArtworks })
  } catch (error) {
    console.error("Get artworks error:", error)
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 })
  }
}