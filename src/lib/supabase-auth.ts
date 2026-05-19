'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

// Create Supabase client for browser with cookie storage
export function createClient() {
    return createBrowserClient(
        isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
        isValidUrl ? supabaseAnonKey : 'placeholder-key',
        isValidUrl ? undefined : {
            global: {
                fetch: async (url, options) => {
                    return new Response(JSON.stringify([]), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                },
            },
        }
    )
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

// Sign out
export async function signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
}

// Get current session
export async function getSession() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
}
