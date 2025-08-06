// In production, this would be replaced with a proper database
// For demo purposes, we'll use in-memory storage

interface Portrait {
  id: string
  userId: string
  originalImageUrl: string
  generatedImageUrl: string
  petAnalysis: string
  createdAt: Date
}

class PortraitStorage {
  private portraits: Map<string, Portrait[]> = new Map()

  addPortrait(portrait: Omit<Portrait, "id" | "createdAt">) {
    const id = Math.random().toString(36).substring(7)
    const newPortrait: Portrait = {
      ...portrait,
      id,
      createdAt: new Date(),
    }

    const userPortraits = this.portraits.get(portrait.userId) || []
    userPortraits.push(newPortrait)
    this.portraits.set(portrait.userId, userPortraits)

    return newPortrait
  }

  getUserPortraits(userId: string): Portrait[] {
    return this.portraits.get(userId) || []
  }

  getPortrait(userId: string, portraitId: string): Portrait | null {
    const userPortraits = this.portraits.get(userId) || []
    return userPortraits.find(p => p.id === portraitId) || null
  }

  deletePortrait(userId: string, portraitId: string): boolean {
    const userPortraits = this.portraits.get(userId) || []
    const filtered = userPortraits.filter(p => p.id !== portraitId)
    
    if (filtered.length < userPortraits.length) {
      this.portraits.set(userId, filtered)
      return true
    }
    return false
  }
}

// Export singleton instance
export const portraitStorage = new PortraitStorage()