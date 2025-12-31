import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client for build time when env vars are not set
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

export const supabase: SupabaseClient = isValidUrl
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => isValidUrl && supabaseAnonKey !== '';

// Database Types
export interface LibraryBook {
    id: number;
    title: string;
    description: string | null;
    price: string;
    download_price: string | null;
    payment_link: string | null;
    category: string | null;
    image_color: string | null;
    text_color: string | null;
    tag: string | null;
    created_at: string;
}

export interface LibraryChapter {
    id: number;
    book_id: number;
    title: string;
    content: string | null;
    sort_order: number;
    created_at: string;
}

export interface LibraryLead {
    id: number;
    email: string;
    source: string | null;
    created_at: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string | null;
    excerpt: string | null;
    content: string | null;
    category: string | null;
    tags: string | null;
    status: string;
    views: number;
    image_url: string | null;
    featured: boolean;
    read_time: string | null;
    author: string | null;
    publish_date: string | null;
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
}

export interface BlogComment {
    id: number;
    post_id: number;
    author_name: string;
    author_email: string | null;
    content: string;
    status: 'pending' | 'approved' | 'spam';
    created_at: string;
}

export interface LegalPage {
    id: number;
    slug: 'privacy' | 'terms';
    title: string;
    content: string;
    updated_at: string;
}

// Booking System Types
export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    price_label: string | null;
    period: string | null;
    duration: string | null;
    features: string[];
    stripe_price_id: string | null;
    icon: string;
    color_theme: string;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    service_id: number | null;
    booking_date: string;
    booking_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    price_paid: number | null;
    status: 'pending' | 'paid' | 'completed' | 'cancelled';
    stripe_session_id: string | null;
    stripe_payment_id: string | null;
    google_meet_link: string | null;
    notes: string | null;
    admin_notes: string | null;
    reminder_24h_sent: boolean;
    reminder_1h_sent: boolean;
    created_at: string;
    // Joined data
    service?: Service;
}

export interface BlockedDate {
    id: number;
    blocked_date: string;
    reason: string | null;
    created_at: string;
}
