import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

// In-memory storage for demo (in production, use a database)
let artworks: any[] = []

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Publish API called!")
    const { userId } = auth()
    console.log("User ID:", userId)
    
    if (!userId) {
      console.log("❌ No user ID, returning unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl, description } = await request.json()
    console.log("📸 Image URL length:", imageUrl?.length)
    console.log("📝 Description:", description)

    if (!imageUrl) {
      console.log("❌ No image URL provided")
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
    console.log("✅ Artwork added! Total artworks:", artworks.length)

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
    console.log("🖼️ Gallery API called! Total artworks:", artworks.length)
    // Return all published artworks, sorted by creation date (newest first)
    const sortedArtworks = artworks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    console.log("📋 Returning artworks:", sortedArtworks.map(a => ({ id: a.id, userId: a.userId })))
    return NextResponse.json({ artworks: sortedArtworks })
  } catch (error) {
    console.error("Get artworks error:", error)
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 })
  }
}