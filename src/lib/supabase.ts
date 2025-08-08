import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database types
export interface UserBones {
  id: string
  user_id: string // Clerk user ID
  bones_count: number
  last_share_reward_date: string | null
  created_at: string
  updated_at: string
}

export interface SharedImage {
  id: string
  user_id: string
  image_url: string
  share_link: string
  view_count: number
  title: string
  description?: string
  style: string
  created_at: string
}