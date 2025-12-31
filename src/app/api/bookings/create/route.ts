import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, STRICT_LIMIT } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST - Create pending booking
export async function POST(request: NextRequest) {
    // Rate limit: 5 requests per minute
    const { limited, response } = checkRateLimit(request, STRICT_LIMIT);
    if (limited) return response;

    try {
        const body = await request.json();
        const {
            serviceId,
            bookingDate,
            bookingTime,
            customerName,
            customerEmail,
            customerPhone,
            notes,
        } = body;

        // Validate required fields
        if (!serviceId || !bookingDate || !customerName || !customerEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if date is still available
        const { data: existingBooking } = await supabaseAdmin
            .from('ab_bookings')
            .select('id')
            .eq('booking_date', bookingDate)
            .in('status', ['paid', 'pending'])
            .single();

        if (existingBooking) {
            return NextResponse.json({ error: 'This date is no longer available' }, { status: 400 });
        }

        // Check if date is blocked
        const { data: blockedDate } = await supabaseAdmin
            .from('ab_blocked_dates')
            .select('id')
            .eq('blocked_date', bookingDate)
            .single();

        if (blockedDate) {
            return NextResponse.json({ error: 'This date is blocked' }, { status: 400 });
        }

        // Get service details
        const { data: service, error: serviceError } = await supabaseAdmin
            .from('ab_services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Create pending booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('ab_bookings')
            .insert([{
                service_id: serviceId,
                booking_date: bookingDate,
                booking_time: bookingTime || '10:00:00',
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || null,
                notes: notes || null,
                price_paid: service.price,
                status: 'pending',
            }])
            .select()
            .single();

        if (bookingError) {
            console.error('Error creating booking:', bookingError);
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
