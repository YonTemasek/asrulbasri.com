import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit, STRICT_LIMIT } from '@/lib/rate-limit';

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase not configured');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
    // Rate limit: 5 requests per minute
    const { limited, response } = checkRateLimit(request, STRICT_LIMIT);
    if (limited) return response;

    try {
        const supabase = getSupabaseClient();
        const { email, bookId } = await request.json();

        if (!email || !bookId) {
            return NextResponse.json({ error: 'Email and bookId required' }, { status: 400 });
        }

        // Check if Resend API key is configured
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        // Get book details
        const { data: book, error: bookError } = await supabase
            .from('ab_library_books')
            .select('*')
            .eq('id', bookId)
            .single();

        if (bookError || !book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        // Generate unique token
        const downloadToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        // Store download request
        const { error: insertError } = await supabase
            .from('ab_download_requests')
            .insert({
                email,
                book_id: bookId,
                download_token: downloadToken,
                expires_at: expiresAt.toISOString()
            });

        if (insertError) {
            console.error('Database error:', insertError);
            return NextResponse.json({ error: 'Failed to create download request' }, { status: 500 });
        }

        // Send email via Resend
        const resend = new Resend(resendApiKey);
        const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://asrulbasri.com'}/download/${downloadToken}`;

        await resend.emails.send({
            from: 'SatuLibrary <onboarding@resend.dev>',
            to: email,
            subject: `Your Download: ${book.title}`,
            html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 8px;">📚 Your Ebook is Ready!</h1>
                    <p style="color: #64748b; font-size: 16px; margin-bottom: 24px;">Thank you for downloading from SatuLibrary.</p>
                    
                    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 8px 0;">${book.title}</h2>
                        <p style="color: #64748b; margin: 0;">${book.description || ''}</p>
                    </div>
                    
                    <a href="${downloadUrl}" 
                       style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Download PDF
                    </a>
                    
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">
                        This link expires in 48 hours. If you need a new link, request again from the website.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                    
                    <p style="color: #94a3b8; font-size: 12px;">
                        You're receiving this because you requested a download from asrulbasri.com
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: 'Download link sent to your email' });

    } catch (error) {
        console.error('Error processing download request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
