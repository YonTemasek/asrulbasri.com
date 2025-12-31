-- Booking System Database Schema
-- Run this in Supabase SQL Editor

-- =============================================
-- TABLE: ab_services
-- Admin manages services here
-- =============================================
CREATE TABLE IF NOT EXISTS ab_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_label VARCHAR(50),
    period VARCHAR(50),
    duration VARCHAR(100),
    features JSONB DEFAULT '[]',
    stripe_price_id VARCHAR(255),
    icon VARCHAR(50) DEFAULT 'Briefcase',
    color_theme VARCHAR(50) DEFAULT 'emerald',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: ab_bookings
-- Customer bookings
-- =============================================
CREATE TABLE IF NOT EXISTS ab_bookings (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES ab_services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME DEFAULT '10:00:00',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    price_paid DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    stripe_session_id VARCHAR(255),
    stripe_payment_id VARCHAR(255),
    google_meet_link VARCHAR(500),
    notes TEXT,
    admin_notes TEXT,
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_1h_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_date)
);

-- =============================================
-- TABLE: ab_blocked_dates
-- Admin blocks dates
-- =============================================
CREATE TABLE IF NOT EXISTS ab_blocked_dates (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON ab_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON ab_bookings(status);
CREATE INDEX IF NOT EXISTS idx_services_active ON ab_services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order ON ab_services(sort_order);

-- =============================================
-- INSERT DEFAULT SERVICES
-- =============================================
INSERT INTO ab_services (name, description, price, price_label, period, duration, features, icon, color_theme, is_featured, sort_order) VALUES
(
    '1-on-1 Chat',
    'Best for solving a specific problem or getting clarity on your system architecture.',
    450,
    'RM 450',
    '/hour',
    '1 hour',
    '["Personal Call via Google Meet", "Video Recording Provided", "Action Plan PDF"]',
    'MessageSquare',
    'blue',
    false,
    1
),
(
    'Systems Class',
    'Learn how to build your own ''Operator System'' in 4 weeks alongside a cohort.',
    1200,
    'RM 1,200',
    '/pax',
    '4 weeks',
    '["4-Week Live Program", "All Templates Included", "Private Community Group"]',
    'Users',
    'emerald',
    true,
    2
),
(
    'Done For You',
    'I build the systems for you. Best for business owners who want results fast.',
    5000,
    'RM 5,000',
    '/project',
    'Varies',
    '["Full System Setup", "Staff Training included", "3 Months Support"]',
    'Briefcase',
    'purple',
    false,
    3
)
ON CONFLICT DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE ab_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Public can read active services
CREATE POLICY "Public can view active services" ON ab_services
    FOR SELECT USING (is_active = true);

-- Public can read blocked dates (to show unavailable)
CREATE POLICY "Public can view blocked dates" ON ab_blocked_dates
    FOR SELECT USING (true);

-- Public can insert bookings (but not update/delete)
CREATE POLICY "Public can create bookings" ON ab_bookings
    FOR INSERT WITH CHECK (true);

-- Service role can do everything (for admin API)
CREATE POLICY "Service role full access services" ON ab_services
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bookings" ON ab_bookings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access blocked_dates" ON ab_blocked_dates
    FOR ALL USING (auth.role() = 'service_role');
