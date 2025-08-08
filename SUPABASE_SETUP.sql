-- Supabase Database Schema for PETPO Bones System
-- Run this SQL in your Supabase SQL Editor

-- 1. Create user_bones table to track user's bone count
CREATE TABLE IF NOT EXISTS public.user_bones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    bones_count INTEGER DEFAULT 0 NOT NULL,
    last_share_reward_date TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT bones_count_non_negative CHECK (bones_count >= 0)
);

-- 2. Create shared_images table to track shared images and links
CREATE TABLE IF NOT EXISTS public.shared_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    image_url TEXT NOT NULL,
    share_link TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    style TEXT NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT view_count_non_negative CHECK (view_count >= 0)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bones_user_id ON public.user_bones(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_images_user_id ON public.shared_images(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_images_share_link ON public.shared_images(share_link);
CREATE INDEX IF NOT EXISTS idx_shared_images_created_at ON public.shared_images(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_bones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_images ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_bones
-- Users can only read their own bones data
CREATE POLICY "Users can view own bones" ON public.user_bones
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own bones data
CREATE POLICY "Users can update own bones" ON public.user_bones
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own bones data
CREATE POLICY "Users can insert own bones" ON public.user_bones
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 6. Create RLS policies for shared_images
-- Users can insert their own shared images
CREATE POLICY "Users can insert own shared images" ON public.shared_images
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can view their own shared images
CREATE POLICY "Users can view own shared images" ON public.shared_images
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Anyone can view shared images (for public sharing)
CREATE POLICY "Anyone can view shared images for public access" ON public.shared_images
    FOR SELECT USING (true);

-- Users can update their own shared images
CREATE POLICY "Users can update own shared images" ON public.shared_images
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers to automatically update updated_at
CREATE TRIGGER update_user_bones_updated_at
    BEFORE UPDATE ON public.user_bones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to safely increment view count (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_view_count(share_link_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.shared_images 
    SET view_count = view_count + 1 
    WHERE share_link = share_link_param
    RETURNING view_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to award bones (with daily limit check)
CREATE OR REPLACE FUNCTION award_share_bones(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
    current_bones INTEGER;
    last_reward DATE;
    today DATE;
    new_bones INTEGER;
BEGIN
    today := CURRENT_DATE;
    
    -- Get current bones and last reward date
    SELECT bones_count, DATE(last_share_reward_date)
    INTO current_bones, last_reward
    FROM public.user_bones 
    WHERE user_id = user_id_param;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.user_bones (user_id, bones_count, last_share_reward_date)
        VALUES (user_id_param, 1, NOW())
        RETURNING bones_count INTO new_bones;
        
        RETURN json_build_object(
            'success', true,
            'bones', new_bones,
            'message', 'Bone reward granted!'
        );
    END IF;
    
    -- Check if already rewarded today
    IF last_reward = today THEN
        RETURN json_build_object(
            'success', false,
            'bones', current_bones,
            'message', 'Already received share reward today'
        );
    END IF;
    
    -- Award bones
    UPDATE public.user_bones 
    SET bones_count = bones_count + 1,
        last_share_reward_date = NOW(),
        updated_at = NOW()
    WHERE user_id = user_id_param
    RETURNING bones_count INTO new_bones;
    
    RETURN json_build_object(
        'success', true,
        'bones', new_bones,
        'message', 'Bone reward granted!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to consume bones safely
CREATE OR REPLACE FUNCTION consume_bones(user_id_param TEXT, amount_param INTEGER DEFAULT 1)
RETURNS JSON AS $$
DECLARE
    current_bones INTEGER;
    new_bones INTEGER;
BEGIN
    -- Get current bones
    SELECT bones_count INTO current_bones
    FROM public.user_bones 
    WHERE user_id = user_id_param;
    
    -- If no record exists, create one with 0 bones
    IF NOT FOUND THEN
        INSERT INTO public.user_bones (user_id, bones_count)
        VALUES (user_id_param, 0);
        current_bones := 0;
    END IF;
    
    -- Check if enough bones
    IF current_bones < amount_param THEN
        RETURN json_build_object(
            'success', false,
            'bones', current_bones,
            'message', 'Insufficient bones',
            'code', 'INSUFFICIENT_BONES'
        );
    END IF;
    
    -- Consume bones
    UPDATE public.user_bones 
    SET bones_count = bones_count - amount_param,
        updated_at = NOW()
    WHERE user_id = user_id_param
    RETURNING bones_count INTO new_bones;
    
    RETURN json_build_object(
        'success', true,
        'bones', new_bones,
        'message', 'Bones consumed successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_bones TO authenticated;
GRANT ALL ON public.shared_images TO authenticated;
GRANT SELECT ON public.shared_images TO anon; -- Allow anonymous users to view shared images
GRANT EXECUTE ON FUNCTION increment_view_count(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION award_share_bones(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_bones(TEXT, INTEGER) TO authenticated;

-- 13. Insert some test data (optional - remove in production)
-- INSERT INTO public.user_bones (user_id, bones_count) 
-- VALUES ('test_user_123', 5);

-- 14. Create view for user bones with additional stats (optional)
CREATE OR REPLACE VIEW user_bones_stats AS
SELECT 
    ub.*,
    COALESCE(si.shared_count, 0) as total_shares,
    COALESCE(si.total_views, 0) as total_views
FROM public.user_bones ub
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as shared_count,
        SUM(view_count) as total_views
    FROM public.shared_images
    GROUP BY user_id
) si ON ub.user_id = si.user_id;

COMMENT ON TABLE public.user_bones IS 'Tracks user bone counts for the PETPO application';
COMMENT ON TABLE public.shared_images IS 'Stores shared image links and tracks views';
COMMENT ON FUNCTION increment_view_count IS 'Safely increments view count for shared images';
COMMENT ON FUNCTION award_share_bones IS 'Awards bones for sharing with daily limit';
COMMENT ON FUNCTION consume_bones IS 'Consumes bones for video generation';