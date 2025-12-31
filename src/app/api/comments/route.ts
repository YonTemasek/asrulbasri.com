import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, STRICT_LIMIT, STANDARD_LIMIT } from '@/lib/rate-limit';

// Admin client for bypassing RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    // Rate limit: 20 requests per minute
    const { limited, response } = checkRateLimit(request, STANDARD_LIMIT);
    if (limited) return response;

    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        const status = searchParams.get('status') || 'approved';
        const all = searchParams.get('all') === 'true';

        let query = supabaseAdmin
            .from('ab_blog_comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (postId) {
            query = query.eq('post_id', postId);
        }

        if (!all) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching comments:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ comments: data });
    } catch (error) {
        console.error('Comments API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Rate limit: 5 requests per minute for creating comments
    const { limited, response } = checkRateLimit(request, STRICT_LIMIT);
    if (limited) return response;

    try {
        const body = await request.json();
        const { action, postId, authorName, authorEmail, content, commentId, status } = body;

        if (action === 'create') {
            // Create new comment (pending by default)
            const { data, error } = await supabaseAdmin
                .from('ab_blog_comments')
                .insert({
                    post_id: postId,
                    author_name: authorName,
                    author_email: authorEmail,
                    content: content,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating comment:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, comment: data });
        }

        if (action === 'approve' || action === 'spam' || action === 'delete') {
            if (action === 'delete') {
                const { error } = await supabaseAdmin
                    .from('ab_blog_comments')
                    .delete()
                    .eq('id', commentId);

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }
            } else {
                const { error } = await supabaseAdmin
                    .from('ab_blog_comments')
                    .update({ status: action === 'approve' ? 'approved' : 'spam' })
                    .eq('id', commentId);

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Comments API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
