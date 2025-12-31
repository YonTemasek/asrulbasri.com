-- Enable RLS and Fix Security Policies
-- This migration enables Row Level Security and applies proper policies

-- ============================================
-- 1. ab_admin_users - ENABLE RLS + Restrict
-- ============================================

-- Enable RLS
ALTER TABLE public.ab_admin_users ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ab_admin_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.ab_admin_users';
    END LOOP;
END $$;

-- Create strict admin-only policy
CREATE POLICY "Admin users table is service role only"
ON public.ab_admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. ab_bookings - ENABLE RLS + Restrict
-- ============================================

-- Enable RLS
ALTER TABLE public.ab_bookings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ab_bookings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.ab_bookings';
    END LOOP;
END $$;

-- Create service role only policy
CREATE POLICY "Bookings are service role only"
ON public.ab_bookings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. ab_download_requests - ENABLE RLS + Restrict
-- ============================================

-- Enable RLS
ALTER TABLE public.ab_download_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ab_download_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.ab_download_requests';
    END LOOP;
END $$;

-- Create service role only policy
CREATE POLICY "Download requests are service role only"
ON public.ab_download_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
