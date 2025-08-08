import type { UserBones } from './supabase'

let supabaseAdmin: any = null
let supabaseAvailable = false

// Try to initialize Supabase, fall back to in-memory storage if it fails
async function initSupabase() {
  try {
    const supabaseLib = await import('./supabase')
    supabaseAdmin = supabaseLib.supabaseAdmin
    supabaseAvailable = true
    return true
  } catch (error) {
    console.warn('Supabase not available, using fallback:', error)
    supabaseAvailable = false
    return false
  }
}

// Get user's bone count
export async function getUserBones(userId: string): Promise<UserBones | null> {
  const initialized = await initSupabase()
  
  if (!initialized || !supabaseAvailable) {
    // Use fallback system
    const fallback = await import('./bones-fallback')
    return await fallback.getUserBones(userId)
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('user_bones')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user bones:', error)
      return null
    }

    // If no record exists, create one
    if (!data) {
      return await createUserBonesRecord(userId)
    }

    return data
  } catch (error) {
    console.error('Error in getUserBones:', error)
    // Fall back to in-memory system
    const fallback = await import('./bones-fallback')
    return await fallback.getUserBones(userId)
  }
}

// Create initial bones record for new user
async function createUserBonesRecord(userId: string): Promise<UserBones | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_bones')
      .insert({
        user_id: userId,
        bones_count: 0,
        last_share_reward_date: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user bones record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createUserBonesRecord:', error)
    return null
  }
}

// Consume bones for video generation using database function
export async function consumeBones(userId: string, amount: number = 1): Promise<{ success: boolean, bones?: number, message?: string, code?: string }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('consume_bones', {
      user_id_param: userId,
      amount_param: amount
    })

    if (error) {
      console.error('Error consuming bones:', error)
      return { success: false, message: 'Database error' }
    }

    return data
  } catch (error) {
    console.error('Error in consumeBones:', error)
    return { success: false, message: 'Error processing request' }
  }
}

// Award bones for sharing (max once per day) using database function
export async function awardShareBones(userId: string): Promise<{ success: boolean, message: string, bones?: number }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('award_share_bones', {
      user_id_param: userId
    })

    if (error) {
      console.error('Error awarding share bones:', error)
      return { success: false, message: 'Database error' }
    }

    return data
  } catch (error) {
    console.error('Error in awardShareBones:', error)
    return { success: false, message: 'Error processing reward' }
  }
}

// Create shared image record
export async function createSharedImage(
  userId: string, 
  imageUrl: string, 
  title: string, 
  style: string, 
  description?: string
): Promise<{ shareLink: string | null, error?: string }> {
  try {
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const shareLink = `${process.env.NEXTAUTH_URL || 'https://petpoofficial.org'}/share/${shareId}`

    const { data, error } = await supabaseAdmin
      .from('shared_images')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        share_link: shareLink,
        title,
        description,
        style,
        view_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shared image:', error)
      return { shareLink: null, error: 'Failed to create share link' }
    }

    return { shareLink }
  } catch (error) {
    console.error('Error in createSharedImage:', error)
    return { shareLink: null, error: 'Error creating share link' }
  }
}

// Get shared image by share ID
export async function getSharedImage(shareId: string) {
  try {
    const shareLink = `${process.env.NEXTAUTH_URL || 'https://petpoofficial.org'}/share/${shareId}`
    
    const { data, error } = await supabaseAdmin
      .from('shared_images')
      .select('*')
      .eq('share_link', shareLink)
      .single()

    if (error) {
      console.error('Error fetching shared image:', error)
      return null
    }

    // Increment view count
    await supabaseAdmin
      .from('shared_images')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id)

    return { ...data, view_count: data.view_count + 1 }
  } catch (error) {
    console.error('Error in getSharedImage:', error)
    return null
  }
}