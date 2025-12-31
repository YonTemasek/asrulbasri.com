-- Fix ab_services RLS - Allow admin dashboard access
-- The dashboard needs to be able to update services

-- Drop existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ab_services') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.ab_services';
    END LOOP;
END $$;

-- Allow public to READ services (for the services page)
CREATE POLICY "Allow public read access to services"
ON public.ab_services
FOR SELECT
TO public
USING (true);

-- Allow service role to do everything (for API routes and dashboard)
CREATE POLICY "Allow service role full access to services"
ON public.ab_services
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
