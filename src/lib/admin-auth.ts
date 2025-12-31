import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Check if user is authenticated admin
export async function checkAdminAuth() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // Not needed for read-only
                },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.log('[Auth] No user found:', error?.message);
        return { authenticated: false, user: null };
    }

    // Optional: Check if user email matches admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'asrulbasri@gmail.com';
    const userEmail = user.email?.toLowerCase();
    const expectedEmail = adminEmail.toLowerCase();

    console.log('[Auth] User email:', userEmail);
    console.log('[Auth] Expected email:', expectedEmail);

    if (userEmail !== expectedEmail) {
        console.log('[Auth] Email mismatch - access denied');
        return { authenticated: false, user: null };
    }

    console.log('[Auth] Authentication successful');
    return { authenticated: true, user };
}

// Middleware helper for API routes
export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
}
