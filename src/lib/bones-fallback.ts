// Fallback bones system for when Supabase is not available
// This provides basic functionality without database persistence

const fallbackBones = new Map<string, number>()
const fallbackLastReward = new Map<string, string>()

export async function getUserBones(userId: string) {
  return {
    id: `fallback-${userId}`,
    user_id: userId,
    bones_count: fallbackBones.get(userId) ?? 5,
    last_share_reward_date: fallbackLastReward.get(userId) || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function consumeBones(userId: string, amount: number = 1) {
  const currentBones = fallbackBones.get(userId) ?? 5
  
  if (currentBones < amount) {
    return {
      success: false,
      bones: currentBones,
      message: 'Insufficient bones',
      code: 'INSUFFICIENT_BONES'
    }
  }
  
  const newBones = currentBones - amount
  fallbackBones.set(userId, newBones)
  
  return {
    success: true,
    bones: newBones,
    message: 'Bones consumed successfully'
  }
}

export async function awardShareBones(userId: string) {
  // Remove daily limit - allow unlimited sharing rewards
  const currentBones = fallbackBones.get(userId) ?? 5
  const newBones = currentBones + 1
  fallbackBones.set(userId, newBones)
  fallbackLastReward.set(userId, new Date().toISOString())
  
  return {
    success: true,
    message: '分享成功，获得1个骨头！',
    bones: newBones
  }
}

export async function createSharedImage(
  userId: string,
  imageUrl: string,
  title: string,
  style: string,
  description?: string
) {
  const shareId = Math.random().toString(36).substring(2, 15)
  const shareLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${shareId}`
  
  // In fallback mode, we just return a link but don't persist it
  return { shareLink }
}

export async function getSharedImage(shareId: string) {
  // In fallback mode, return null (shared images not available)
  return null
}