-- Fix RLS Policies for Security
-- This migration tightens security on tables that should be admin-only

-- ============================================
-- 1. ab_admin_users - CRITICAL: Should be fully restricted
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON public.ab_admin_users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ab_admin_users;

-- Create strict admin-only policy
CREATE POLICY "Admin users table is service role only"
ON public.ab_admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. ab_bookings - Should be admin-only via API
-- ============================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public insert" ON public.ab_bookings;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.ab_bookings;

-- Create service role only policy
CREATE POLICY "Bookings are service role only"
ON public.ab_bookings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. ab_download_requests - Should be admin-only
-- ============================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public insert" ON public.ab_download_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.ab_download_requests;

-- Create service role only policy
CREATE POLICY "Download requests are service role only"
ON public.ab_download_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this migration:
-- 1. All three tables should show as "RESTRICTED" in Supabase dashboard
-- 2. Public users cannot directly access these tables
-- 3. Only your API routes (using service_role key) can access them
-- 4. This is the correct security model for your application
