import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - List all blocked dates
export async function GET() {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const { data, error } = await supabaseAdmin
            .from('ab_blocked_dates')
            .select('*')
            .order('blocked_date', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ blockedDates: data });
    } catch (error) {
        console.error('Error fetching blocked dates:', error);
        return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
    }
}

// POST - Block a date
export async function POST(request: NextRequest) {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('ab_blocked_dates')
            .insert([{
                blocked_date: body.date,
                reason: body.reason || null,
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Date already blocked' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ blockedDate: data });
    } catch (error) {
        console.error('Error blocking date:', error);
        return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
    }
}

// DELETE - Unblock a date
export async function DELETE(request: NextRequest) {
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Date required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('ab_blocked_dates')
            .delete()
            .eq('blocked_date', date);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unblocking date:', error);
        return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
    }
}
