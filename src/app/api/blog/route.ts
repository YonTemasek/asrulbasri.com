import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side Supabase client with admin access
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, postId, postData } = body;

        const supabase = getSupabaseAdmin();

        if (action === 'publish') {
            let result;
            let slug = postData.slug;

            // Check if slug already exists (for new posts)
            if (!postId && slug) {
                const { data: existing } = await supabase
                    .from('ab_blog_posts')
                    .select('id')
                    .eq('slug', slug)
                    .single();

                if (existing) {
                    // Add timestamp suffix to make unique
                    slug = `${slug}-${Date.now().toString(36)}`;
                    postData.slug = slug;
                }
            }

            if (postId) {
                // Update existing draft to published
                result = await supabase
                    .from('ab_blog_posts')
                    .update(postData)
                    .eq('id', postId)
                    .select()
                    .single();
            } else {
                // Insert new published post
                result = await supabase
                    .from('ab_blog_posts')
                    .insert(postData)
                    .select()
                    .single();
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                return NextResponse.json(
                    { error: result.error.message },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                post: result.data,
                slug: result.data.slug
            });
        }

        if (action === 'save-draft') {
            let result;

            if (postId) {
                result = await supabase
                    .from('ab_blog_posts')
                    .update(postData)
                    .eq('id', postId)
                    .select()
                    .single();
            } else {
                result = await supabase
                    .from('ab_blog_posts')
                    .insert(postData)
                    .select()
                    .single();
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                return NextResponse.json(
                    { error: result.error.message },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                post: result.data,
                id: result.data.id
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
