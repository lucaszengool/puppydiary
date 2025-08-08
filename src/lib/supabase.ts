import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eefoxylchsfaoglxwhkm.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7-_j7kGDQtCTP9D-_O98JA_0ekRR0DG'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_jJ3Lp_vRRTnqyZipLtrWqQ_aLeSyhcB'

// Validate required environment variables and create clients
let supabase: any = null
let supabaseAdmin: any = null

try {
  if (supabaseUrl && supabaseKey && supabaseServiceKey) {
    // Client for browser usage
    supabase = createClient(supabaseUrl, supabaseKey)
    
    // Admin client for server-side operations  
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('✅ Supabase initialized successfully')
  } else {
    console.warn('⚠️ Supabase not configured - bones system will be disabled')
  }
} catch (error) {
  console.warn('⚠️ Supabase initialization failed - bones system will be disabled:', error)
}

export { supabase, supabaseAdmin }

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