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
        return { authenticated: false, user: null };
    }

    // Optional: Check if user email matches admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@asrulbasri.com';
    if (user.email !== adminEmail) {
        return { authenticated: false, user: null };
    }

    return { authenticated: true, user };
}

// Middleware helper for API routes
export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
}
