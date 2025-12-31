-- Create a table for site settings
CREATE TABLE IF NOT EXISTS public.ab_site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ab_site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
ON public.ab_site_settings
FOR SELECT
TO public
USING (true);

-- Allow admins to manage settings (using the same logic as other admin tables)
-- Assuming we use service role or admin auth check in API routes
-- But for direct DB access if needed:
CREATE POLICY "Allow service role full access"
ON public.ab_site_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert default social media links as placeholders
INSERT INTO public.ab_site_settings (key, value, description)
VALUES 
('social_twitter', '', 'Twitter/X profile URL'),
('social_linkedin', '', 'LinkedIn profile URL'),
('social_instagram', '', 'Instagram profile URL'),
('social_github', '', 'GitHub profile URL'),
('contact_email', 'hello@asrulbasri.com', 'Primary contact email')
ON CONFLICT (key) DO NOTHING;
