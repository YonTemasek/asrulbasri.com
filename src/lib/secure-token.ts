import CryptoJS from 'crypto-js';

// Secret key for HMAC signing (use service role key as base)
const getSecretKey = () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    return key;
};

// Token expires after 30 days
const TOKEN_EXPIRY_DAYS = 30;

interface TokenPayload {
    bookingId: number;
    email: string;
    exp: number; // Expiration timestamp
}

/**
 * Generate a secure token for booking actions (cancel/reschedule)
 * Uses HMAC-SHA256 for signing to prevent tampering
 */
export function generateSecureBookingToken(bookingId: number, email: string): string {
    const payload: TokenPayload = {
        bookingId,
        email,
        exp: Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    };

    const payloadStr = JSON.stringify(payload);
    const payloadB64 = Buffer.from(payloadStr).toString('base64url');

    // Create HMAC signature
    const signature = CryptoJS.HmacSHA256(payloadB64, getSecretKey()).toString(CryptoJS.enc.Base64url);

    // Token format: payload.signature
    return `${payloadB64}.${signature}`;
}

/**
 * Validate and decode a secure booking token
 * Verifies HMAC signature and expiration
 */
export function validateSecureBookingToken(token: string): TokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) {
            console.warn('Invalid token format');
            return null;
        }

        const [payloadB64, providedSignature] = parts;

        // Verify signature
        const expectedSignature = CryptoJS.HmacSHA256(payloadB64, getSecretKey()).toString(CryptoJS.enc.Base64url);

        if (providedSignature !== expectedSignature) {
            console.warn('Token signature mismatch - possible tampering');
            return null;
        }

        // Decode payload
        const payloadStr = Buffer.from(payloadB64, 'base64url').toString();
        const payload: TokenPayload = JSON.parse(payloadStr);

        // Check expiration
        if (Date.now() > payload.exp) {
            console.warn('Token expired');
            return null;
        }

        // Validate payload structure
        if (!payload.bookingId || !payload.email || typeof payload.bookingId !== 'number') {
            console.warn('Invalid token payload structure');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

/**
 * Check if a token is close to expiring (within 7 days)
 */
export function isTokenExpiringSoon(token: string): boolean {
    const payload = validateSecureBookingToken(token);
    if (!payload) return true;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (payload.exp - Date.now()) < sevenDays;
}
