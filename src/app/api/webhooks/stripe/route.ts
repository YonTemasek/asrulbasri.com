import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature') || '';

        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.payment_status === 'paid') {
                    // client_reference_id contains the booking ID from payment link
                    const bookingId = session.client_reference_id;

                    if (bookingId) {
                        // Update booking status to paid
                        const { data: booking, error } = await supabaseAdmin
                            .from('ab_bookings')
                            .update({
                                status: 'paid',
                                stripe_payment_id: session.payment_intent as string,
                            })
                            .eq('id', parseInt(bookingId))
                            .select(`
                                *,
                                service:ab_services(name)
                            `)
                            .single();

                        if (error) {
                            console.error('Error updating booking:', error);
                        } else {
                            console.log(`Booking ${bookingId} marked as paid`);

                            // Generate secure HMAC-signed cancel token for user self-service
                            // Import dynamically to avoid circular dependency
                            const { generateSecureBookingToken } = await import('@/lib/secure-token');
                            const cancelToken = generateSecureBookingToken(booking.id, booking.customer_email);

                            // Send confirmation emails
                            const emailData = {
                                customerName: booking.customer_name,
                                customerEmail: booking.customer_email,
                                serviceName: booking.service?.name || 'Session',
                                bookingDate: booking.booking_date,
                                bookingTime: booking.booking_time,
                                pricePaid: booking.price_paid || 0,
                                notes: booking.notes,
                                cancelToken: cancelToken,
                            };

                            // Send to customer
                            await sendBookingConfirmation(emailData);

                            // Send to admin
                            await sendAdminNotification(emailData);
                        }
                    } else {
                        console.log('No booking ID found in session');
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
