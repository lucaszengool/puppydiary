import { NextResponse } from "next/server"

// Access the global artworks array
declare global {
  var artworks: any[] | undefined
}

const artworks = globalThis.artworks ?? []
globalThis.artworks = artworks

export async function POST() {
  try {
    console.log("🧪 Adding test data to artworks array...")
    
    // Add some test artworks
    const testArtworks = [
      {
        id: "test-1",
        userId: "user_test123", 
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwYWNmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvZyAxPC90ZXh0Pjwvc3ZnPg==",
        description: "测试狗狗作品 1",
        createdAt: new Date().toISOString(),
        likes: 5,
        likedBy: []
      },
      {
        id: "test-2", 
        userId: "user_test456",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmNjkwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhdCAyPC90ZXh0Pjwvc3ZnPg==",
        description: "测试猫咪作品 2", 
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        likes: 12,
        likedBy: []
      }
    ]

    // Add to the shared artworks array
    artworks.push(...testArtworks)
    
    console.log("✅ Test data added! Total artworks:", artworks.length)
    return NextResponse.json({ 
      success: true, 
      message: "Test data added",
      count: testArtworks.length,
      total: artworks.length
    })

  } catch (error) {
    console.error("Error adding test data:", error)
    return NextResponse.json({ error: "Failed to add test data" }, { status: 500 })
  }
}