import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const { data, error } = await supabaseAdmin
                .from('ab_legal_pages')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ page: data });
        }

        // Get all legal pages
        const { data, error } = await supabaseAdmin
            .from('ab_legal_pages')
            .select('*')
            .order('slug');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ pages: data });
    } catch (error) {
        console.error('Legal pages API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, title, content } = body;

        // Upsert - update if exists, insert if not
        const { data, error } = await supabaseAdmin
            .from('ab_legal_pages')
            .upsert(
                {
                    slug,
                    title,
                    content,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();

        if (error) {
            console.error('Error saving legal page:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, page: data });
    } catch (error) {
        console.error('Legal pages API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
