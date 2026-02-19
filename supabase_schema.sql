-- ============================================================
-- NAGARSEVAK - COMPLETE DATABASE SETUP
-- Run this in: Supabase Dashboard → SQL Editor
-- This is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ============================================================
-- 1. CITIZENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.citizens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT,
  email         TEXT,
  role          TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'worker', 'admin')),
  profile_photo TEXT,
  karma_score   INTEGER DEFAULT 0,
  is_verified   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  is_banned     BOOLEAN DEFAULT false,
  ban_reason    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_citizens_phone ON citizens(phone);

ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Citizens can view own profile"   ON citizens;
DROP POLICY IF EXISTS "Citizens can update own profile" ON citizens;
DROP POLICY IF EXISTS "Allow citizen creation"          ON citizens;

CREATE POLICY "Allow citizen creation"        ON citizens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Citizens can view own profile" ON citizens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Citizens can update own profile" ON citizens FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 2. OTP CODES TABLE (used by login flow)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id  UUID REFERENCES citizens(id) ON DELETE CASCADE NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_used     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_citizen ON otp_codes(citizen_id);

-- ============================================================
-- 3. ISSUES TABLE (central data store for all panels)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.issues (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Citizen info
  citizen_id               UUID REFERENCES citizens(id),
  citizen_name             TEXT,
  citizen_phone            TEXT,

  -- Issue details
  issue_type               TEXT NOT NULL,
  description              TEXT,
  status                   TEXT DEFAULT 'new'    CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority                 TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ai_priority_score        INTEGER DEFAULT 50,

  -- Location
  location_address         TEXT,
  latitude                 DOUBLE PRECISION,
  longitude                DOUBLE PRECISION,
  location_verified        BOOLEAN DEFAULT false,

  -- Photo
  photo_url                TEXT,
  photo_timestamp          TIMESTAMPTZ,
  photo_metadata           JSONB,

  -- Community
  visibility               TEXT DEFAULT 'public',
  upvotes_count            INTEGER DEFAULT 0,
  downvotes_count          INTEGER DEFAULT 0,
  net_score                INTEGER DEFAULT 0,
  comments_count           INTEGER DEFAULT 0,
  is_spam                  BOOLEAN DEFAULT false,

  -- Worker assignment (for Worker Panel)
  assigned_worker_id       UUID REFERENCES citizens(id),
  assigned_at              TIMESTAMPTZ,
  resolved_at              TIMESTAMPTZ,
  resolution_notes         TEXT,

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_citizen  ON issues(citizen_id);
CREATE INDEX IF NOT EXISTS idx_issues_status   ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_type     ON issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_issues_created  ON issues(created_at DESC);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Citizens can create"        ON issues;
DROP POLICY IF EXISTS "Public issues viewable"     ON issues;
DROP POLICY IF EXISTS "Admin can view all issues"  ON issues;
DROP POLICY IF EXISTS "Anyone can submit issues"   ON issues;
DROP POLICY IF EXISTS "Anyone can view public issues" ON issues;
DROP POLICY IF EXISTS "Anyone can update issues"   ON issues;

-- New open policies (custom OTP auth = anon role)
CREATE POLICY "Anyone can submit issues"      ON issues FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view all issues"    ON issues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update issues"      ON issues FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 4. STORAGE BUCKET FOR PHOTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated uploads"        ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to issue-photos"  ON storage.objects;
DROP POLICY IF EXISTS "Allow anon photo uploads"           ON storage.objects;
DROP POLICY IF EXISTS "Allow public view"                  ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo view"            ON storage.objects;

CREATE POLICY "Allow anon photo uploads"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'issue-photos');

CREATE POLICY "Allow public photo view"
  ON storage.objects FOR SELECT
  TO anon, authenticated, public
  USING (bucket_id = 'issue-photos');

-- ============================================================
-- 5. OTP FUNCTIONS (login flow)
-- ============================================================
DROP FUNCTION IF EXISTS public.generate_otp(text);
CREATE OR REPLACE FUNCTION public.generate_otp(p_phone TEXT)
RETURNS TABLE (res_otp_code TEXT, res_expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMPTZ;
  v_citizen_id UUID;
BEGIN
  -- Get or create citizen
  SELECT id INTO v_citizen_id FROM public.citizens WHERE phone = p_phone;
  IF v_citizen_id IS NULL THEN
    INSERT INTO public.citizens (phone, name, role)
    VALUES (p_phone, 'New Citizen', 'citizen')
    RETURNING id INTO v_citizen_id;
  END IF;

  -- Generate 6-digit OTP
  v_otp := floor(random() * 900000 + 100000)::text;
  v_expires_at := now() + interval '5 minutes';

  -- Invalidate old OTPs
  UPDATE public.otp_codes SET is_used = true
  WHERE citizen_id = v_citizen_id AND is_used = false;

  -- Insert new OTP
  INSERT INTO public.otp_codes (citizen_id, code, expires_at)
  VALUES (v_citizen_id, v_otp, v_expires_at);

  RETURN QUERY SELECT v_otp, v_expires_at;
END;
$$;

DROP FUNCTION IF EXISTS public.verify_otp(text, text);
CREATE OR REPLACE FUNCTION public.verify_otp(p_phone TEXT, p_otp TEXT)
RETURNS TABLE (res_is_valid BOOLEAN, res_citizen_id UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_citizen_id UUID;
  v_record_id  UUID;
BEGIN
  SELECT id INTO v_citizen_id FROM public.citizens WHERE phone = p_phone;
  IF v_citizen_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid;
    RETURN;
  END IF;

  SELECT id INTO v_record_id
  FROM public.otp_codes
  WHERE citizen_id = v_citizen_id
    AND code = p_otp
    AND is_used = false
    AND expires_at > now()
  ORDER BY created_at DESC LIMIT 1;

  IF v_record_id IS NOT NULL THEN
    UPDATE public.otp_codes SET is_used = true WHERE id = v_record_id;
    UPDATE public.citizens SET last_login = now() WHERE id = v_citizen_id;
    RETURN QUERY SELECT true, v_citizen_id;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid;
  END IF;
END;
$$;

-- ============================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ALL DONE!
-- ✅ Citizens can now submit reports  
-- ✅ Admin panel can query the issues table
-- ✅ Worker panel can query & update issues
-- ============================================================
