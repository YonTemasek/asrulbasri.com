import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - List all bookings with service info
export async function GET(request: NextRequest) {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(id, name, price_label, icon, color_theme)
            `)
            .order('booking_date', { ascending: true });

        // Filter by month if provided
        if (month) {
            const startDate = `${month}-01`;
            const endDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
                .toISOString().split('T')[0];
            query = query
                .gte('booking_date', startDate)
                .lte('booking_date', endDate);
        }

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ bookings: data });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
