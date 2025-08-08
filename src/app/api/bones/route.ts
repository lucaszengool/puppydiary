import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Dynamic import to prevent build-time errors
let getUserBones: any, consumeBones: any, awardShareBones: any

async function loadBonesLib() {
  try {
    const bonesLib = await import('@/lib/bones')
    getUserBones = bonesLib.getUserBones
    consumeBones = bonesLib.consumeBones
    awardShareBones = bonesLib.awardShareBones
    return true
  } catch (error) {
    console.error('Failed to load bones lib:', error)
    return false
  }
}

// GET /api/bones - Get user's bone count
export async function GET() {
  try {
    const loaded = await loadBonesLib()
    if (!loaded) {
      return NextResponse.json({ 
        bones: 0, 
        lastShareReward: null,
        error: 'Bones system not available' 
      }, { status: 503 })
    }

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userBones = await getUserBones(userId)
    
    return NextResponse.json({ 
      bones: userBones?.bones_count || 0,
      lastShareReward: userBones?.last_share_reward_date || null
    })
  } catch (error) {
    console.error('Error fetching bones:', error)
    return NextResponse.json({ 
      bones: 0,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST /api/bones - Consume or award bones
export async function POST(request: NextRequest) {
  try {
    const loaded = await loadBonesLib()
    if (!loaded) {
      return NextResponse.json({ 
        error: 'Bones system not available',
        bones: 0
      }, { status: 503 })
    }

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount = 1 } = await request.json()

    if (action === 'consume') {
      const result = await consumeBones(userId, amount)
      
      if (!result.success) {
        return NextResponse.json({ 
          error: result.message || 'Failed to consume bones',
          code: result.code || 'CONSUME_FAILED',
          bones: result.bones || 0
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true,
        bones: result.bones || 0,
        message: result.message || `Consumed ${amount} bone(s)`
      })
    }

    if (action === 'award_share') {
      const result = await awardShareBones(userId)
      
      if (!result.success) {
        return NextResponse.json({ 
          error: result.message,
          bones: result.bones || 0
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        bones: result.bones || 0,
        message: result.message
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing bones action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}