import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendCancellationConfirmation, sendCancellationAlert } from '@/lib/email';
import { validateSecureBookingToken } from '@/lib/secure-token';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    });
};

// POST - Cancel a booking
export async function POST(request: NextRequest) {
    try {
        const { token, reason } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Invalid cancellation link' }, { status: 400 });
        }

        if (!reason || reason.trim().length < 3) {
            return NextResponse.json({ error: 'Please provide a reason for cancellation' }, { status: 400 });
        }

        // Validate token (HMAC-signed with expiration)
        const tokenData = validateSecureBookingToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid or expired cancellation link' }, { status: 400 });
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
            return NextResponse.json({ error: 'This booking has already been cancelled' }, { status: 400 });
        }

        // Process Stripe refund if payment was made
        let refundSuccessful = false;
        if (booking.stripe_payment_id) {
            const stripe = getStripe();
            if (stripe) {
                try {
                    await stripe.refunds.create({
                        payment_intent: booking.stripe_payment_id,
                    });
                    refundSuccessful = true;
                    console.log(`Refund processed for booking ${booking.id}`);
                } catch (refundError) {
                    console.error('Refund error:', refundError);
                    return NextResponse.json({
                        error: 'Failed to process refund. Please contact support.'
                    }, { status: 500 });
                }
            }
        }

        // Update booking status
        const { error: updateError } = await supabaseAdmin
            .from('ab_bookings')
            .update({
                status: 'cancelled',
                notes: `[CANCELLED BY USER] ${reason}\n\nOriginal notes: ${booking.notes || 'None'}`,
            })
            .eq('id', booking.id);

        if (updateError) {
            console.error('Error updating booking:', updateError);
            return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
        }

        // Send cancellation emails
        const emailData = {
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            serviceName: booking.service?.name || 'Session',
            bookingDate: booking.booking_date,
            bookingTime: booking.booking_time,
            pricePaid: booking.price_paid || 0,
            cancellationReason: reason,
            refunded: refundSuccessful,
        };

        // Send to customer
        await sendCancellationConfirmation(emailData);

        // Send to admin
        await sendCancellationAlert(emailData);

        return NextResponse.json({
            success: true,
            message: refundSuccessful
                ? 'Booking cancelled and refund processed successfully'
                : 'Booking cancelled successfully',
            refunded: refundSuccessful,
        });

    } catch (error) {
        console.error('Cancellation error:', error);
        return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }
}

// GET - Get booking details for cancellation page
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

        return NextResponse.json({ booking });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}
