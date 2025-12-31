'use client'

import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client for browser with cookie storage
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
