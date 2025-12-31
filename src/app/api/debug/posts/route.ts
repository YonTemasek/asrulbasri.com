import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// Server-side Supabase client with admin access
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        return null;
    }

    return createClient(url, serviceKey);
}

export async function GET() {
    // Only allow in development OR for authenticated admins
    if (process.env.NODE_ENV === 'production') {
        const { authenticated } = await checkAdminAuth();
        if (!authenticated) {
            return unauthorizedResponse();
        }
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' });
    }

    // Get ALL posts regardless of status
    const { data, error } = await supabase
        .from('ab_blog_posts')
        .select('id, title, slug, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    return NextResponse.json({
        count: data?.length || 0,
        posts: data,
        error: error?.message
    });
}
