// Fallback bones system for when Supabase is not available
// This provides basic functionality without database persistence

const fallbackBones = new Map<string, number>()
const fallbackLastReward = new Map<string, string>()
const fallbackSharedImages = new Map<string, any>()

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
  const shareLink = `${process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://petpoofficial.org')}/share/${shareId}`
  
  // Store in memory for fallback functionality
  fallbackSharedImages.set(shareId, {
    id: shareId,
    user_id: userId,
    image_url: imageUrl,
    share_link: shareLink,
    title,
    description: description || `由AI生成的专属宠物艺术肖像 - PETPO宠物肖像定制`,
    style,
    view_count: 0,
    created_at: new Date().toISOString()
  })
  
  return { shareLink }
}

export async function getSharedImage(shareId: string) {
  // Get from memory storage
  const sharedImage = fallbackSharedImages.get(shareId)
  if (sharedImage) {
    // Increment view count
    sharedImage.view_count += 1
    fallbackSharedImages.set(shareId, sharedImage)
    return sharedImage
  }
  return null
}