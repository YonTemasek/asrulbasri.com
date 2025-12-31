import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendReminder24h, sendReminder1h } from '@/lib/email';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// This cron runs every hour
// Vercel Cron: 0 * * * * (at minute 0 of every hour)
export async function GET() {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const results = {
            reminder24h: { sent: 0, errors: 0 },
            reminder1h: { sent: 0, errors: 0 },
        };

        // ============================================
        // 24 HOUR REMINDERS
        // Send for bookings that are tomorrow
        // ============================================
        const { data: bookings24h, error: error24h } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(name)
            `)
            .eq('booking_date', tomorrowStr)
            .eq('status', 'paid')
            .eq('reminder_24h_sent', false);

        if (error24h) {
            console.error('Error fetching 24h bookings:', error24h);
        } else if (bookings24h && bookings24h.length > 0) {
            for (const booking of bookings24h) {
                const result = await sendReminder24h({
                    customerName: booking.customer_name,
                    customerEmail: booking.customer_email,
                    serviceName: booking.service?.name || 'Session',
                    bookingDate: booking.booking_date,
                    bookingTime: booking.booking_time,
                    pricePaid: booking.price_paid || 0,
                    googleMeetLink: booking.google_meet_link,
                });

                if (result.success) {
                    // Mark as sent
                    await supabaseAdmin
                        .from('ab_bookings')
                        .update({ reminder_24h_sent: true })
                        .eq('id', booking.id);
                    results.reminder24h.sent++;
                } else {
                    results.reminder24h.errors++;
                }
            }
        }

        // ============================================
        // 1 HOUR REMINDERS
        // Send for bookings today that start in ~1 hour
        // ============================================
        const { data: bookingsToday, error: errorToday } = await supabaseAdmin
            .from('ab_bookings')
            .select(`
                *,
                service:ab_services(name)
            `)
            .eq('booking_date', today)
            .eq('status', 'paid')
            .eq('reminder_1h_sent', false)
            .not('google_meet_link', 'is', null);

        if (errorToday) {
            console.error('Error fetching today bookings:', errorToday);
        } else if (bookingsToday && bookingsToday.length > 0) {
            const currentHour = now.getHours();

            for (const booking of bookingsToday) {
                // Parse booking time (format: HH:MM:SS)
                const bookingHour = parseInt(booking.booking_time?.split(':')[0] || '10');

                // Send reminder if booking is in approximately 1 hour
                // (current hour + 1 = booking hour)
                if (currentHour + 1 === bookingHour) {
                    const result = await sendReminder1h({
                        customerName: booking.customer_name,
                        customerEmail: booking.customer_email,
                        serviceName: booking.service?.name || 'Session',
                        bookingDate: booking.booking_date,
                        bookingTime: booking.booking_time,
                        pricePaid: booking.price_paid || 0,
                        googleMeetLink: booking.google_meet_link,
                    });

                    if (result.success) {
                        // Mark as sent
                        await supabaseAdmin
                            .from('ab_bookings')
                            .update({ reminder_1h_sent: true })
                            .eq('id', booking.id);
                        results.reminder1h.sent++;
                    } else {
                        results.reminder1h.errors++;
                    }
                }
            }
        }

        console.log('Reminder cron completed:', results);

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            results,
        });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
    }
}
