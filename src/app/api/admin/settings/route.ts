import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

// GET all settings
export async function GET() {
    try {
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = isValidUrl ? createClient(supabaseUrl, supabaseKey) : createClient('https://placeholder.supabase.co', 'placeholder-key', { global: { fetch: async () => new Response(JSON.stringify([]), { status: 200 }) } });
        const { data: settings, error } = await supabase
            .from('ab_site_settings')
            .select('*')
            .order('key', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ settings });
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST/Update settings
export async function POST(request: Request) {
    try {
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { settings } = await request.json();
        if (!settings || !Array.isArray(settings)) {
            return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
        }

        const supabase = isValidUrl ? createClient(supabaseUrl, supabaseKey) : createClient('https://placeholder.supabase.co', 'placeholder-key', { global: { fetch: async () => new Response(JSON.stringify([]), { status: 200 }) } });

        // Upsert all settings
        const { error } = await supabase
            .from('ab_site_settings')
            .upsert(
                settings.map((s: { key: string; value: string }) => ({
                    key: s.key,
                    value: s.value,
                    updated_at: new Date().toISOString()
                }))
            );

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
