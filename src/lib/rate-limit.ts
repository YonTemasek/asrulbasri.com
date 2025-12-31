import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// Note: In production with multiple serverless instances, use Redis or Upstash
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
}

// Default: 10 requests per minute
const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000,
    maxRequests: 10,
};

// Get client identifier from request
function getClientId(request: NextRequest): string {
    // Try to get real IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');

    return cfIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
}

// Clean up old entries periodically
function cleanup(windowMs: number) {
    const now = Date.now();
    rateLimitMap.forEach((value, key) => {
        if (now - value.timestamp > windowMs) {
            rateLimitMap.delete(key);
        }
    });
}

// Check rate limit and return response if exceeded
export function checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig = DEFAULT_CONFIG
): { limited: boolean; response?: NextResponse } {
    const clientId = getClientId(request);
    const key = `${request.nextUrl.pathname}:${clientId}`;
    const now = Date.now();

    // Cleanup old entries every 100 requests
    if (rateLimitMap.size > 100) {
        cleanup(config.windowMs);
    }

    const record = rateLimitMap.get(key);

    if (!record || now - record.timestamp > config.windowMs) {
        // New window
        rateLimitMap.set(key, { count: 1, timestamp: now });
        return { limited: false };
    }

    if (record.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((record.timestamp + config.windowMs - now) / 1000);

        return {
            limited: true,
            response: NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfter),
                        'X-RateLimit-Limit': String(config.maxRequests),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            ),
        };
    }

    // Increment counter
    record.count++;
    rateLimitMap.set(key, record);

    return { limited: false };
}

// Stricter rate limit for sensitive operations
export const STRICT_LIMIT: RateLimitConfig = {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 5,       // 5 requests
};

// Standard rate limit
export const STANDARD_LIMIT: RateLimitConfig = {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 20,      // 20 requests
};

// Loose rate limit for read operations
export const LOOSE_LIMIT: RateLimitConfig = {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 60,      // 60 requests
};
