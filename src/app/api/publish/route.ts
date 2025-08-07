import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { UTApi, UTFile } from "uploadthing/server"

// Global storage to persist across hot reloads in development
declare global {
  var artworks: any[] | undefined
}

// In-memory storage for demo (in production, use a database)
const artworks = globalThis.artworks ?? []
globalThis.artworks = artworks

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

    // Upload image to UploadThing if it's base64
    let publicImageUrl = imageUrl
    
    try {
      if (imageUrl.startsWith('data:image/')) {
        console.log("📤 Uploading base64 image to UploadThing...")
        
        // Convert base64 to buffer for upload
        const base64Data = imageUrl.split(',')[1]
        const imageBuffer = Buffer.from(base64Data, 'base64')
        
        // Create a UTFile from buffer
        const fileName = `published-artwork-${userId}-${Date.now()}.jpg`
        const file = new UTFile([imageBuffer], fileName, {
          type: 'image/jpeg'
        })
        
        // Use UTApi for server-side upload
        const utapi = new UTApi()
        const uploadResponse = await utapi.uploadFiles([file])
        
        if (uploadResponse && uploadResponse.length > 0 && uploadResponse[0].data?.url) {
          publicImageUrl = uploadResponse[0].data.url
          console.log('✅ Uploaded to UploadThing:', publicImageUrl)
        } else {
          console.log('⚠️ Upload failed, using base64')
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError)
      console.log("⚠️ Upload failed, using original URL")
    }

    // Create artwork object with public URL
    const artwork = {
      id: Date.now().toString(),
      userId,
      imageUrl: publicImageUrl, // Use the uploaded URL or fallback to original
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

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()
    console.log("🗑️ Delete artwork called by user:", userId)
    
    const { artworkId } = await request.json()
    console.log("🎯 Artwork ID to delete:", artworkId)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find artwork index
    const artworkIndex = artworks.findIndex(artwork => 
      artwork.id === artworkId && artwork.userId === userId
    )

    if (artworkIndex === -1) {
      console.log("❌ Artwork not found or not owned by user")
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    // Remove artwork
    const deletedArtwork = artworks.splice(artworkIndex, 1)[0]
    console.log("✅ Artwork deleted! Remaining artworks:", artworks.length)

    return NextResponse.json({ 
      success: true, 
      deletedArtwork,
      remainingCount: artworks.length 
    })

  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 })
  }
}