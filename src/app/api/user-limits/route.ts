import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"

// Track anonymous user generations using IP address
const anonymousUserGenerations = new Map<string, { count: number, lastReset: number }>()

// Reset counts daily (24 hours)
const RESET_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const MAX_ANONYMOUS_GENERATIONS = 2

function cleanupOldEntries() {
  const now = Date.now()
  for (const [ip, data] of anonymousUserGenerations.entries()) {
    if (now - data.lastReset > RESET_INTERVAL) {
      anonymousUserGenerations.delete(ip)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (userId) {
      // Registered users have no limit (controlled by bones system)
      return NextResponse.json({
        canGenerate: true,
        isRegistered: true,
        generationsUsed: 0,
        maxGenerations: -1 // unlimited for registered users
      })
    }
    
    // Anonymous user - check IP-based limits
    const ip = request.ip || 'unknown'
    cleanupOldEntries()
    
    const userData = anonymousUserGenerations.get(ip) || { count: 0, lastReset: Date.now() }
    const now = Date.now()
    
    // Reset if it's been more than 24 hours
    if (now - userData.lastReset > RESET_INTERVAL) {
      userData.count = 0
      userData.lastReset = now
    }
    
    const canGenerate = userData.count < MAX_ANONYMOUS_GENERATIONS
    
    return NextResponse.json({
      canGenerate,
      isRegistered: false,
      generationsUsed: userData.count,
      maxGenerations: MAX_ANONYMOUS_GENERATIONS
    })
    
  } catch (error) {
    console.error('Error checking user limits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (userId) {
      // Registered users are handled by bones system
      return NextResponse.json({ success: true, isRegistered: true })
    }
    
    // Anonymous user - increment count
    const ip = request.ip || 'unknown'
    cleanupOldEntries()
    
    const userData = anonymousUserGenerations.get(ip) || { count: 0, lastReset: Date.now() }
    const now = Date.now()
    
    // Reset if it's been more than 24 hours
    if (now - userData.lastReset > RESET_INTERVAL) {
      userData.count = 0
      userData.lastReset = now
    }
    
    if (userData.count >= MAX_ANONYMOUS_GENERATIONS) {
      return NextResponse.json({ 
        error: 'Generation limit reached',
        requiresRegistration: true,
        generationsUsed: userData.count,
        maxGenerations: MAX_ANONYMOUS_GENERATIONS
      }, { status: 429 })
    }
    
    // Increment count
    userData.count++
    anonymousUserGenerations.set(ip, userData)
    
    return NextResponse.json({ 
      success: true, 
      isRegistered: false,
      generationsUsed: userData.count,
      maxGenerations: MAX_ANONYMOUS_GENERATIONS
    })
    
  } catch (error) {
    console.error('Error updating user limits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}