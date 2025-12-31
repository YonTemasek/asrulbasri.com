import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set');
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asrulbasri@gmail.com';
// Use Resend's test domain if FROM_EMAIL not set (requires domain verification for custom domains)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Asrul Basri <onboarding@resend.dev>';

interface BookingEmailData {
    customerName: string;
    customerEmail: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    pricePaid: number;
    googleMeetLink?: string;
    notes?: string;
    cancelToken?: string;
}

// Format date nicely
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Format time nicely
function formatTime(timeStr: string) {
    return timeStr?.slice(0, 5) || '10:00';
}

// ============================================
// BOOKING CONFIRMATION (to Customer)
// ============================================
export async function sendBookingConfirmation(data: BookingEmailData) {
    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.customerEmail,
            subject: `Booking Confirmed: ${data.serviceName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Asrul Basri</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Your Session is Confirmed</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #10b981; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 24px;">✓</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 24px; line-height: 1.6;">
                                Hi <strong>${data.customerName}</strong>,
                            </p>
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">
                                Thank you for booking a session with me. I'm excited to connect with you and help you achieve your goals.
                            </p>
                            
                            <!-- Booking Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Service</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">📅 Date</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatDate(data.bookingDate)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">🕐 Time</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatTime(data.bookingTime)} (Malaysia Time)</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">💰 Amount Paid</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <span style="color: #10b981; font-size: 18px; font-weight: 700;">RM ${data.pricePaid.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- What's Next -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="background: #0f172a; border-radius: 12px; padding: 20px 24px;">
                                        <h4 style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 8px;">📬 What happens next?</h4>
                                        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">
                                            You'll receive a Google Meet link via email before our session. I'll also send you reminders 24 hours and 1 hour before we meet.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Signature -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td>
                                        <p style="color: #64748b; font-size: 16px; margin: 0 0 16px; line-height: 1.6;">
                                            Looking forward to speaking with you!
                                        </p>
                                        <p style="color: #0f172a; font-size: 16px; margin: 0;">
                                            <strong>Asrul Basri</strong><br>
                                            <span style="color: #64748b; font-size: 14px;">System Builder & Consultant</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                                            Questions? Reply to this email or reach out at
                                        </p>
                                        <a href="mailto:hello@asrulbasri.com" style="color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none;">hello@asrulbasri.com</a>
                                    </td>
                                </tr>
                                ${data.cancelToken ? `
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                                            Need to change your plans?
                                            <a href="https://asrulbasri.com/booking/reschedule/${data.cancelToken}" style="color: #3b82f6; text-decoration: none;">Reschedule</a>
                                            or
                                            <a href="https://asrulbasri.com/booking/cancel/${data.cancelToken}" style="color: #ef4444; text-decoration: none;">Cancel</a>
                                        </p>
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <a href="https://asrulbasri.com" style="color: #64748b; font-size: 12px; text-decoration: none;">asrulbasri.com</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`Confirmation email sent to ${data.customerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error };
    }
}

// ============================================
// NEW BOOKING ALERT (to Admin)
// ============================================
export async function sendAdminNotification(data: BookingEmailData) {
    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `New Booking: ${data.customerName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">New Booking Alert</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${data.customerName}</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #3b82f6; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 24px; color: white;">+</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Customer Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Name</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.customerName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">Email</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <a href="mailto:${data.customerEmail}" style="color: #3b82f6; font-size: 14px; font-weight: 600; text-decoration: none;">${data.customerEmail}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Booking Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Service</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Date</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatDate(data.bookingDate)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Time</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatTime(data.bookingTime)} (Malaysia Time)</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">Amount</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <span style="color: #10b981; font-size: 18px; font-weight: 700;">RM ${data.pricePaid.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            ${data.notes ? `
                            <!-- Customer Notes -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px 24px;">
                                        <h4 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Customer Notes</h4>
                                        <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.6;">${data.notes}</p>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://asrulbasri.com/dashboard/bookings" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            View Booking
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                                            This is an automated notification from your booking system.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`Admin notification sent`);
        return { success: true };
    } catch (error) {
        console.error('Error sending admin notification:', error);
        return { success: false, error };
    }
}

// ============================================
// 24 HOUR REMINDER
// ============================================
export async function sendReminder24h(data: BookingEmailData) {
    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.customerEmail,
            subject: `Reminder: Your session is tomorrow`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Asrul Basri</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">See You Tomorrow</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #3b82f6; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 20px; color: white;">24h</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 24px; line-height: 1.6;">
                                Hi <strong>${data.customerName}</strong>,
                            </p>
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">
                                Just a friendly reminder that our session is <strong>tomorrow</strong>. I'm looking forward to connecting with you!
                            </p>
                            
                            <!-- Session Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Service</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Date</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatDate(data.bookingDate)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">Time</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatTime(data.bookingTime)} (Malaysia Time)</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            ${data.googleMeetLink ? `
                            <!-- Join Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="${data.googleMeetLink}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Join Google Meet
                                        </a>
                                        <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0;">
                                            ${data.googleMeetLink}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            ` : `
                            <!-- Meet Link Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="background: #0f172a; border-radius: 12px; padding: 20px 24px;">
                                        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">
                                            The Google Meet link will be sent to you before the session.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            `}
                            
                            <!-- Signature -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td>
                                        <p style="color: #64748b; font-size: 16px; margin: 0 0 16px; line-height: 1.6;">
                                            See you soon!
                                        </p>
                                        <p style="color: #0f172a; font-size: 16px; margin: 0;">
                                            <strong>Asrul Basri</strong><br>
                                            <span style="color: #64748b; font-size: 14px;">System Builder & Consultant</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                                            Questions? Reply to this email or reach out at
                                        </p>
                                        <a href="mailto:hello@asrulbasri.com" style="color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none;">hello@asrulbasri.com</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`24h reminder sent to ${data.customerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending 24h reminder:', error);
        return { success: false, error };
    }
}

// ============================================
// 1 HOUR REMINDER
// ============================================
export async function sendReminder1h(data: BookingEmailData) {
    if (!data.googleMeetLink) {
        console.log('Skipping 1h reminder - no meet link set');
        return { success: false, error: 'No meet link' };
    }

    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.customerEmail,
            subject: `Your session starts in 1 hour`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Asrul Basri</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Starting in 1 Hour</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #f59e0b; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 20px; color: white;">1h</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 24px; line-height: 1.6;">
                                Hi <strong>${data.customerName}</strong>,
                            </p>
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">
                                Your session starts in <strong>1 hour</strong>. Here's your meeting link:
                            </p>
                            
                            <!-- Join Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${data.googleMeetLink}" style="display: inline-block; background: #10b981; color: white; padding: 20px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 18px;">
                                            Join Google Meet
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Meeting Link -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
                                        <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Meeting Link</p>
                                        <a href="${data.googleMeetLink}" style="color: #3b82f6; font-size: 14px; font-weight: 500; text-decoration: none; word-break: break-all;">${data.googleMeetLink}</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Signature -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td>
                                        <p style="color: #64748b; font-size: 16px; margin: 0 0 16px; line-height: 1.6;">
                                            See you soon!
                                        </p>
                                        <p style="color: #0f172a; font-size: 16px; margin: 0;">
                                            <strong>Asrul Basri</strong><br>
                                            <span style="color: #64748b; font-size: 14px;">System Builder & Consultant</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                                            Questions? Reply to this email or reach out at
                                        </p>
                                        <a href="mailto:hello@asrulbasri.com" style="color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none;">hello@asrulbasri.com</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`1h reminder sent to ${data.customerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending 1h reminder:', error);
        return { success: false, error };
    }
}

// ============================================
// CANCELLATION EMAIL DATA INTERFACE  
// ============================================
interface CancellationEmailData {
    customerName: string;
    customerEmail: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    pricePaid: number;
    cancellationReason: string;
    refunded: boolean;
}

// ============================================
// CANCELLATION CONFIRMATION (to Customer)
// ============================================
export async function sendCancellationConfirmation(data: CancellationEmailData) {
    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.customerEmail,
            subject: `Booking Cancelled: ${data.serviceName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Asrul Basri</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Booking Cancelled</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #ef4444; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 24px; color: white;">✕</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 24px; line-height: 1.6;">
                                Hi <strong>${data.customerName}</strong>,
                            </p>
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 32px; line-height: 1.6;">
                                Your booking has been cancelled as requested. ${data.refunded ? 'A full refund has been processed and should appear in your account within 5-10 business days.' : ''}
                            </p>
                            
                            <!-- Cancelled Session Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; border: 1px solid #fecaca;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Cancelled Session</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                                    <span style="color: #7f1d1d; font-size: 14px;">Service</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #fecaca; text-align: right;">
                                                    <span style="color: #7f1d1d; font-size: 14px; font-weight: 600;">${data.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                                    <span style="color: #7f1d1d; font-size: 14px;">Date</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #fecaca; text-align: right;">
                                                    <span style="color: #7f1d1d; font-size: 14px; font-weight: 600;">${formatDate(data.bookingDate)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #7f1d1d; font-size: 14px;">Refund</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <span style="color: #7f1d1d; font-size: 14px; font-weight: 600;">${data.refunded ? `RM ${data.pricePaid.toLocaleString()}` : 'N/A'}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Book Again CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                                            Would you like to book another session?
                                        </p>
                                        <a href="https://asrulbasri.com/work-with-me" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Book Again
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Signature -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td>
                                        <p style="color: #0f172a; font-size: 16px; margin: 0;">
                                            <strong>Asrul Basri</strong><br>
                                            <span style="color: #64748b; font-size: 14px;">System Builder & Consultant</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                                            Questions? Reply to this email or reach out at
                                        </p>
                                        <a href="mailto:hello@asrulbasri.com" style="color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none;">hello@asrulbasri.com</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`Cancellation confirmation sent to ${data.customerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending cancellation confirmation:', error);
        return { success: false, error };
    }
}

// ============================================
// CANCELLATION ALERT (to Admin)
// ============================================
export async function sendCancellationAlert(data: CancellationEmailData) {
    try {
        const resend = getResend();
        if (!resend) return { success: false, error: 'Email not configured' };
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `Booking Cancelled: ${data.customerName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 40px 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #fecaca; margin: 0 0 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Cancellation Alert</h2>
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${data.customerName}</h1>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background: #ef4444; width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                                            <span style="font-size: 24px; color: white;">✕</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Reason Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <h4 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Cancellation Reason</h4>
                                        <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.6;">${data.cancellationReason}</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Booking Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">Cancelled Booking</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Customer</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.customerName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Email</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <a href="mailto:${data.customerEmail}" style="color: #3b82f6; font-size: 14px; font-weight: 600; text-decoration: none;">${data.customerEmail}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Service</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${data.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                    <span style="color: #64748b; font-size: 14px;">Date</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                                    <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatDate(data.bookingDate)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="color: #64748b; font-size: 14px;">Refund</span>
                                                </td>
                                                <td style="padding: 12px 0; text-align: right;">
                                                    <span style="color: ${data.refunded ? '#ef4444' : '#64748b'}; font-size: 14px; font-weight: 600;">${data.refunded ? `RM ${data.pricePaid.toLocaleString()} refunded` : 'No refund'}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- View Dashboard -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="https://asrulbasri.com/dashboard/bookings" style="display: inline-block; background: #64748b; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            View Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                                            This is an automated notification from your booking system.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        console.log(`Cancellation alert sent to admin`);
        return { success: true };
    } catch (error) {
        console.error('Error sending cancellation alert:', error);
        return { success: false, error };
    }
}
