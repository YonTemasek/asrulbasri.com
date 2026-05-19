import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

// Check if user is authenticated admin
export async function checkAdminAuth() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
        isValidUrl ? supabaseAnonKey : 'placeholder-key',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // Not needed for read-only
                },
            },
            ...(isValidUrl ? {} : {
                global: {
                    fetch: async (url, options) => {
                        return new Response(JSON.stringify([]), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    },
                }
            }),
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
