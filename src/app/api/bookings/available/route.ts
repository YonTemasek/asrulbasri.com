import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Get available dates for next 30 days
export async function GET() {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const startDate = today.toISOString().split('T')[0];
        const endDate = thirtyDaysLater.toISOString().split('T')[0];

        // Get booked dates (paid status)
        const { data: bookings, error: bookingsError } = await supabase
            .from('ab_bookings')
            .select('booking_date')
            .gte('booking_date', startDate)
            .lte('booking_date', endDate)
            .in('status', ['paid', 'pending']);

        if (bookingsError) throw bookingsError;

        // Get blocked dates
        const { data: blockedDates, error: blockedError } = await supabase
            .from('ab_blocked_dates')
            .select('blocked_date')
            .gte('blocked_date', startDate)
            .lte('blocked_date', endDate);

        if (blockedError) throw blockedError;

        // Combine unavailable dates
        const bookedDates = bookings?.map(b => b.booking_date) || [];
        const blocked = blockedDates?.map(b => b.blocked_date) || [];
        const unavailableDates = [...new Set([...bookedDates, ...blocked])];

        // Generate available dates
        const availableDates: string[] = [];
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

        while (currentDate <= thirtyDaysLater) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (!unavailableDates.includes(dateStr)) {
                availableDates.push(dateStr);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return NextResponse.json({
            availableDates,
            unavailableDates,
            startDate,
            endDate,
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
