import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
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

    const { slug } = await request.json();

    // Update post status to Published
    const { data, error } = await supabase
        .from('ab_blog_posts')
        .update({
            status: 'Published',
            publish_date: new Date().toISOString()
        })
        .eq('slug', slug)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: `Post "${data.title}" is now Published!`,
        slug: data.slug
    });
}
