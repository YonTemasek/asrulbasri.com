import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation, sendAdminNotification, sendReminder24h, sendReminder1h } from '@/lib/email';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// Test endpoint to verify email sending
// ONLY accessible by authenticated admins in production
export async function POST(request: NextRequest) {
    // Only allow in development OR for authenticated admins
    if (process.env.NODE_ENV === 'production') {
        const { authenticated } = await checkAdminAuth();
        if (!authenticated) {
            return unauthorizedResponse();
        }
    }

    try {
        const body = await request.json();
        const testEmail = body.email || 'asrulbasri@gmail.com';
        const emailType = body.type || 'booking';

        const testData = {
            customerName: 'Test User',
            customerEmail: testEmail,
            serviceName: '1-on-1 Chat',
            bookingDate: '2026-01-20',
            bookingTime: '10:00',
            pricePaid: 450,
            notes: 'This is a test booking',
            googleMeetLink: 'https://meet.google.com/abc-defg-hij',
        };

        const results: Record<string, boolean> = {};

        if (emailType === 'all' || emailType === 'booking') {
            const customerResult = await sendBookingConfirmation(testData);
            results.customerConfirmation = customerResult.success || false;

            const adminResult = await sendAdminNotification(testData);
            results.adminNotification = adminResult.success || false;
        }

        if (emailType === 'all' || emailType === 'reminder24h') {
            const reminder24hResult = await sendReminder24h(testData);
            results.reminder24h = reminder24hResult.success || false;
        }

        if (emailType === 'all' || emailType === 'reminder1h') {
            const reminder1hResult = await sendReminder1h(testData);
            results.reminder1h = reminder1hResult.success || false;
        }

        return NextResponse.json({
            success: true,
            message: 'Test emails sent!',
            sentTo: testEmail,
            results,
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send test email'
        }, { status: 500 });
    }
}

// GET endpoint for easy browser testing - also requires auth in production
export async function GET(request: NextRequest) {
    // Only allow in development OR for authenticated admins
    if (process.env.NODE_ENV === 'production') {
        const { authenticated } = await checkAdminAuth();
        if (!authenticated) {
            return unauthorizedResponse();
        }
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || 'asrulbasri@gmail.com';
    const type = searchParams.get('type') || 'all';

    // Reuse POST logic
    const mockRequest = {
        json: async () => ({ email, type }),
    } as NextRequest;

    return POST(mockRequest);
}
