# 🦴 Bones System Setup Guide

## Overview

The PETPO bones system tracks user engagement through:
- **Bones Counter**: Virtual currency displayed in the header 
- **Daily Share Rewards**: Users get 1 bone per day for sharing images
- **Video Generation**: Costs 1 bone per video
- **Share Links**: Generate public links to attract new users

## Database Setup (Required)

### Step 1: Run SQL Schema

1. Go to your Supabase Dashboard: https://eefoxylchsfaoglxwhkm.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `SUPABASE_SETUP.sql`
4. Click **Run** to execute the SQL

This will create:
- `user_bones` table - tracks each user's bone count
- `shared_images` table - tracks shared image links and views
- Database functions for safe bone transactions
- Row Level Security (RLS) policies
- Indexes for performance

### Step 2: Verify Tables Created

In the **Database** tab, you should see:
- ✅ `public.user_bones`
- ✅ `public.shared_images` 

## Environment Variables

Make sure your `.env.local` has:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eefoxylchsfaoglxwhkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7-_j7kGDQtCTP9D-_O98JA_0ekRR0DG
SUPABASE_SERVICE_ROLE_KEY=sb_secret_jJ3Lp_vRRTnqyZipLtrWqQ_aLeSyhcB
```

## Features Implemented

### 🦴 Bones Counter
- Displayed in both desktop and mobile headers
- Shows current bone count for logged-in users
- Updates in real-time after transactions

### 📸 Share Image Buttons  
- Added to every generated image (desktop & mobile)
- Creates shareable public links
- Awards 1 bone per day for sharing
- Copies link to clipboard automatically

### 🎬 Video Generation Buttons
- Individual video generation for each image
- Costs 1 bone per video
- Disabled when insufficient bones
- Shows bone cost in UI

### 🔗 Public Share Pages
- Route: `/share/[shareId]`
- Shows the shared image with view counter
- Attracts visitors to create their own portraits
- Includes call-to-action to main site

## User Flow

### New User (0 bones):
1. ✅ Generate portrait images (free)
2. ✅ Share first image → Gets 1 bone reward
3. ✅ Use bone to generate video
4. ✅ Share more images (max 1 bone/day)

### Existing User:
1. ✅ Bones counter shows current balance
2. ✅ Share images to earn bones (daily limit)
3. ✅ Generate videos using bones
4. ✅ Shared links track views and attract users

## Database Functions

### Safe Bone Operations:
- `consume_bones(user_id, amount)` - Atomic bone consumption
- `award_share_bones(user_id)` - Daily-limited rewards
- `increment_view_count(share_link)` - Race-condition safe

### Security Features:
- Row Level Security (RLS) enabled
- Users can only access their own bone records
- Shared images are publicly viewable
- Service role key for admin operations

## Testing

### Test Bone System:
1. 🔍 Generate an image 
2. 🔍 Check bones counter shows 0
3. 🔍 Click "Share" button
4. 🔍 Should get 1 bone reward (first share of day)
5. 🔍 Click "Video" button 
6. 🔍 Should consume 1 bone and generate video
7. 🔍 Check bones counter shows 0 again

### Test Share Links:
1. 🔍 Copy shared link from clipboard
2. 🔍 Open in incognito/new browser
3. 🔍 Should see public share page
4. 🔍 Click "Create Portrait" button
5. 🔍 Should redirect to main create page

## Production Checklist

- ✅ Supabase tables created
- ✅ Environment variables set
- ✅ RLS policies active
- ✅ Database functions deployed
- ✅ API routes configured
- ✅ UI components integrated
- ✅ Share pages created

## Support

If you encounter issues:
1. Check Supabase Dashboard for table creation
2. Verify environment variables are correct
3. Check browser console for API errors
4. Test with different user accounts

The bones system is now fully integrated with database persistence, real-time updates, and secure transactions! 🎉