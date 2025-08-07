import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

// In-memory storage for demo (in production, use a database)
let favorites: { userId: string; artworkId: string }[] = []

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { artworkId, action } = await request.json()

    if (!artworkId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === 'add') {
      // Add to favorites if not already added
      const existing = favorites.find(f => f.userId === userId && f.artworkId === artworkId)
      if (!existing) {
        favorites.push({ userId, artworkId })
      }
    } else if (action === 'remove') {
      // Remove from favorites
      favorites = favorites.filter(f => !(f.userId === userId && f.artworkId === artworkId))
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Favorites error:", error)
    return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's favorites
    const userFavorites = favorites
      .filter(f => f.userId === userId)
      .map(f => f.artworkId)

    return NextResponse.json({ favorites: userFavorites })

  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json({ error: "Failed to get favorites" }, { status: 500 })
  }
}