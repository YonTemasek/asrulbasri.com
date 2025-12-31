import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendCancellationConfirmation, sendCancellationAlert } from '@/lib/email';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

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

// GET - Get single booking
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(id, name, price_label, icon, color_theme)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ booking: data });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}

// PATCH - Update booking (add meet link, admin notes, status)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { id } = await params;
        const body = await request.json();

        // Only allow updating specific fields
        const allowedFields = ['google_meet_link', 'admin_notes', 'status', 'booking_time'];
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const { data, error } = await supabaseAdmin
            .from('ab_bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ booking: data });
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

// DELETE - Cancel booking with refund
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { authenticated } = await checkAdminAuth();
    if (!authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { id } = await params;

        // Get reason from request body
        let reason = 'Cancelled by admin';
        try {
            const body = await request.json();
            if (body.reason) reason = body.reason;
        } catch {
            // No body, use default reason
        }

        // First get the booking to check for payment info
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(name)
            `)
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
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
                    console.log(`Admin refund processed for booking ${booking.id}`);
                } catch (refundError) {
                    console.error('Refund error:', refundError);
                    return NextResponse.json({
                        error: 'Failed to process refund. Please handle manually.'
                    }, { status: 500 });
                }
            }
        }

        // Update booking status and add cancellation note
        const { error: updateError } = await supabaseAdmin
            .from('ab_bookings')
            .update({
                status: 'cancelled',
                admin_notes: `[CANCELLED BY ADMIN] ${reason}\n\n${booking.admin_notes || ''}`.trim(),
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Send cancellation emails
        const emailData = {
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            serviceName: booking.service?.name || 'Session',
            bookingDate: booking.booking_date,
            bookingTime: booking.booking_time,
            pricePaid: booking.price_paid || 0,
            cancellationReason: `[Admin] ${reason}`,
            refunded: refundSuccessful,
        };

        // Send to customer
        await sendCancellationConfirmation(emailData);

        // Send to admin (for record)
        await sendCancellationAlert(emailData);

        return NextResponse.json({
            success: true,
            refunded: refundSuccessful,
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }
}
