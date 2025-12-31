import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSecureBookingToken } from '@/lib/secure-token';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST - Reschedule a booking
export async function POST(request: NextRequest) {
    try {
        const { token, newDate, newTime } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Invalid reschedule link' }, { status: 400 });
        }

        if (!newDate) {
            return NextResponse.json({ error: 'Please select a new date' }, { status: 400 });
        }

        // Validate token (HMAC-signed with expiration)
        const tokenData = validateSecureBookingToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid or expired reschedule link' }, { status: 400 });
        }

        // Get the booking
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(name)
            `)
            .eq('id', tokenData.bookingId)
            .eq('customer_email', tokenData.email)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status === 'cancelled') {
            return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 });
        }

        // Check if new date is available
        const { data: existingBooking } = await supabaseAdmin
            .from('ab_bookings')
            .select('id')
            .eq('booking_date', newDate)
            .neq('status', 'cancelled')
            .neq('id', booking.id)
            .single();

        if (existingBooking) {
            return NextResponse.json({ error: 'This date is already booked. Please select another date.' }, { status: 400 });
        }

        // Check if date is blocked
        const { data: blockedDate } = await supabaseAdmin
            .from('ab_blocked_dates')
            .select('id')
            .eq('blocked_date', newDate)
            .single();

        if (blockedDate) {
            return NextResponse.json({ error: 'This date is not available. Please select another date.' }, { status: 400 });
        }

        // Update booking with new date
        const originalDate = booking.booking_date;
        const { error: updateError } = await supabaseAdmin
            .from('ab_bookings')
            .update({
                booking_date: newDate,
                booking_time: newTime || booking.booking_time,
                notes: `${booking.notes || ''}\n\n[RESCHEDULED] From ${originalDate} to ${newDate}`.trim(),
            })
            .eq('id', booking.id);

        if (updateError) {
            console.error('Error updating booking:', updateError);
            return NextResponse.json({ error: 'Failed to reschedule booking' }, { status: 500 });
        }

        // TODO: Send reschedule confirmation email

        return NextResponse.json({
            success: true,
            message: 'Booking rescheduled successfully',
            newDate,
        });

    } catch (error) {
        console.error('Reschedule error:', error);
        return NextResponse.json({ error: 'Failed to reschedule booking' }, { status: 500 });
    }
}

// GET - Get booking details and available dates
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
        }

        const tokenData = validateSecureBookingToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
        }

        const { data: booking, error } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                id, customer_name, customer_email, booking_date, booking_time, 
                status, price_paid,
                service:ab_services(name)
            `)
            .eq('id', tokenData.bookingId)
            .eq('customer_email', tokenData.email)
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Get blocked dates for the next 3 months
        const today = new Date();
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        const { data: blockedDates } = await supabaseAdmin
            .from('ab_blocked_dates')
            .select('blocked_date')
            .gte('blocked_date', today.toISOString().split('T')[0])
            .lte('blocked_date', threeMonthsLater.toISOString().split('T')[0]);

        // Get existing bookings
        const { data: existingBookings } = await supabaseAdmin
            .from('ab_bookings')
            .select('booking_date')
            .neq('status', 'cancelled')
            .neq('id', booking.id)
            .gte('booking_date', today.toISOString().split('T')[0])
            .lte('booking_date', threeMonthsLater.toISOString().split('T')[0]);

        const unavailableDates = [
            ...(blockedDates?.map(d => d.blocked_date) || []),
            ...(existingBookings?.map(d => d.booking_date) || []),
        ];

        return NextResponse.json({
            booking,
            unavailableDates,
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}
