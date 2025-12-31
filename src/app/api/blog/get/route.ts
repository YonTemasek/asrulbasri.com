import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side Supabase client with admin access
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        return null;
    }

    return createClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('ab_blog_posts')
        .select('*')
        .eq('id', parseInt(id))
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ post: data });
}
