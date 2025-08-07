import { NextResponse } from "next/server"

// Access the global artworks array
declare global {
  var artworks: any[] | undefined
}

const artworks = globalThis.artworks ?? []
globalThis.artworks = artworks

export async function POST() {
  try {
    console.log("🧹 Clearing all artworks...")
    console.log("Before clear - Total artworks:", artworks.length)
    
    // Clear all artworks
    artworks.length = 0
    
    console.log("After clear - Total artworks:", artworks.length)
    console.log("✅ All artworks cleared!")
    
    return NextResponse.json({ 
      success: true, 
      message: "All artworks cleared",
      count: artworks.length
    })

  } catch (error) {
    console.error("Error clearing artworks:", error)
    return NextResponse.json({ error: "Failed to clear artworks" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    artworkCount: artworks.length,
    artworks: artworks.map(a => ({ id: a.id, userId: a.userId }))
  })
}