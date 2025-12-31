import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - List active services (public)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('ab_services')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ services: data });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}
