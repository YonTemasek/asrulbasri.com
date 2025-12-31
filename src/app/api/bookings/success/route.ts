import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Lazy initialization
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    });
};

// GET - Get booking details after successful payment
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Get session from Stripe
        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session.metadata?.booking_id) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Get booking from database
        const { data: booking, error } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(name)
            `)
            .eq('id', parseInt(session.metadata.booking_id))
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({
            booking: {
                service_name: booking.service?.name,
                booking_date: booking.booking_date,
                booking_time: booking.booking_time,
                customer_email: booking.customer_email,
            },
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}
