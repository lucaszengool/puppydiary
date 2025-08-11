import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Dynamic import to prevent build-time errors
let createSharedImage: any, awardShareBones: any

async function loadBonesLib() {
  try {
    const bonesLib = await import('@/lib/bones')
    createSharedImage = bonesLib.createSharedImage
    awardShareBones = bonesLib.awardShareBones
    return true
  } catch (error) {
    console.error('Failed to load bones lib:', error)
    return false
  }
}

// POST /api/share - Create a shareable link for an image
export async function POST(request: NextRequest) {
  try {
    const loaded = await loadBonesLib()
    if (!loaded) {
      return NextResponse.json({ 
        error: 'Share system not available'
      }, { status: 503 })
    }

    const { userId } = await auth()
    
    // Allow both logged in and guest users to create share links

    const { imageUrl, title, style, description } = await request.json()

    if (!imageUrl || !title || !style) {
      return NextResponse.json({ 
        error: 'Missing required fields: imageUrl, title, style' 
      }, { status: 400 })
    }

    // Create shared image record (userId can be null for guest users)
    const { shareLink, error } = await createSharedImage(
      userId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
      imageUrl, 
      title, 
      style, 
      description
    )

    if (error || !shareLink) {
      return NextResponse.json({ error: error || 'Failed to create share link' }, { status: 500 })
    }

    // Try to award bones for sharing (only for logged in users)
    let boneResult = { success: false, bones: 0, message: 'Guest user' }
    if (userId) {
      boneResult = await awardShareBones(userId)
    }
    
    return NextResponse.json({
      shareLink,
      boneReward: boneResult.success ? {
        awarded: true,
        bones: boneResult.bones,
        message: boneResult.message
      } : {
        awarded: false,
        bones: boneResult.bones,
        message: boneResult.message
      }
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}