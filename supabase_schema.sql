-- ==================================================
-- NAGARSEVAK CITIZEN APP - COMPLETE DATABASE SCHEMA
-- ==================================================
-- Run this entire script in Supabase SQL Editor
-- Make sure to run it in order!

-- ==================================================
-- 1. CREATE CITIZENS TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  city_id UUID REFERENCES cities(id),
  profile_photo TEXT,
  karma_score INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{9,14}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_citizens_phone ON citizens(phone);
CREATE INDEX IF NOT EXISTS idx_citizens_city ON citizens(city_id);
CREATE INDEX IF NOT EXISTS idx_citizens_active ON citizens(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Citizens can view own profile" ON citizens;
CREATE POLICY "Citizens can view own profile"
  ON citizens FOR SELECT
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Citizens can update own profile" ON citizens;
CREATE POLICY "Citizens can update own profile"
  ON citizens FOR UPDATE
  USING (auth.uid()::text = id::text);

-- ==================================================
-- 2. EXTEND ISSUES TABLE
-- ==================================================

ALTER TABLE issues 
  ADD COLUMN IF NOT EXISTS citizen_id UUID REFERENCES citizens(id),
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS upvotes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified_by_community BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_issues_citizen ON issues(citizen_id);
CREATE INDEX IF NOT EXISTS idx_issues_public ON issues(visibility) WHERE visibility = 'public';

-- RLS Policies
DROP POLICY IF EXISTS "Public issues viewable" ON issues;
CREATE POLICY "Public issues viewable"
  ON issues FOR SELECT
  USING (visibility = 'public' AND is_spam = false);

DROP POLICY IF EXISTS "Citizens can create" ON issues;
CREATE POLICY "Citizens can create"
  ON issues FOR INSERT
  WITH CHECK (auth.uid()::text = citizen_id::text);

-- ==================================================
-- 3. CREATE VOTES TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(issue_id, citizen_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_votes_issue ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_citizen ON votes(citizen_id);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Citizens can vote" ON votes;
CREATE POLICY "Citizens can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid()::text = citizen_id::text);

-- ==================================================
-- 4. CREATE COMMENTS TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL CHECK (LENGTH(TRIM(comment_text)) > 0),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Comments viewable" ON comments;
CREATE POLICY "Comments viewable"
  ON comments FOR SELECT
  USING (is_deleted = false);

DROP POLICY IF EXISTS "Citizens can comment" ON comments;
CREATE POLICY "Citizens can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid()::text = citizen_id::text);

-- ==================================================
-- 5. CREATE OTP TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL CHECK (otp_code ~ '^\d{6}$'),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
  is_used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);

-- ==================================================
-- 6. CREATE HELPER FUNCTIONS
-- ==================================================

-- Function: Generate OTP
CREATE OR REPLACE FUNCTION generate_otp(p_phone TEXT)
RETURNS TABLE(otp_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_otp TEXT;
  v_expires TIMESTAMPTZ;
BEGIN
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires := NOW() + INTERVAL '10 minutes';
  
  INSERT INTO otp_verifications (phone, otp_code, expires_at)
  VALUES (p_phone, v_otp, v_expires);
  
  RETURN QUERY SELECT v_otp, v_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify OTP
CREATE OR REPLACE FUNCTION verify_otp(p_phone TEXT, p_otp TEXT)
RETURNS TABLE(is_valid BOOLEAN, citizen_id UUID) AS $$
DECLARE
  v_citizen_id UUID;
BEGIN
  -- Check OTP
  IF EXISTS (
    SELECT 1 FROM otp_verifications
    WHERE phone = p_phone AND otp_code = p_otp
      AND expires_at > NOW() AND is_used = false
  ) THEN
    -- Mark as used
    UPDATE otp_verifications
    SET is_used = true
    WHERE phone = p_phone AND otp_code = p_otp;
    
    -- Get or create citizen
    INSERT INTO citizens (phone, last_login)
    VALUES (p_phone, NOW())
    ON CONFLICT (phone) DO UPDATE
    SET last_login = NOW()
    RETURNING id INTO v_citizen_id;
    
    RETURN QUERY SELECT true, v_citizen_id;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Upsert Vote
CREATE OR REPLACE FUNCTION upsert_vote(
  p_issue_id UUID,
  p_citizen_id UUID,
  p_vote_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO votes (issue_id, citizen_id, vote_type)
  VALUES (p_issue_id, p_citizen_id, p_vote_type)
  ON CONFLICT (issue_id, citizen_id)
  DO UPDATE SET vote_type = EXCLUDED.vote_type, updated_at = NOW();
  
  -- Update counts
  UPDATE issues SET
    upvotes_count = (SELECT COUNT(*) FROM votes WHERE issue_id = p_issue_id AND vote_type = 'up'),
    downvotes_count = (SELECT COUNT(*) FROM votes WHERE issue_id = p_issue_id AND vote_type = 'down'),
    net_score = (
      SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
      FROM votes WHERE issue_id = p_issue_id
    )
  WHERE id = p_issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- SETUP COMPLETE!
-- ==================================================
-- Next: Configure environment variables and start building

-- ENHANCED CAMERA METADATA UPDATES
ALTER TABLE issues 
  ADD COLUMN IF NOT EXISTS photo_metadata JSONB,
  ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_coordinates POINT; 

CREATE INDEX IF NOT EXISTS idx_issues_location ON issues USING GIST (photo_coordinates);
CREATE INDEX IF NOT EXISTS idx_issues_photo_timestamp ON issues(photo_timestamp);

COMMENT ON COLUMN issues.photo_metadata IS 
  'JSON: { "address": "...", "coordinates": {...}, "altitude": ..., "accuracy": ..., "deviceInfo": {...} }';

INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'issue-photos');

CREATE POLICY "Allow public view" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'issue-photos');

