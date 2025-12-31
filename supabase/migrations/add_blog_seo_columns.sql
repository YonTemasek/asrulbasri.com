-- Add new columns to ab_blog_posts table for enhanced blog functionality
-- Run this in Supabase SQL Editor

ALTER TABLE ab_blog_posts 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Asrul Basri',
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON ab_blog_posts(slug);

-- Create index on status and publish_date for listing published posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON ab_blog_posts(status, publish_date DESC);
