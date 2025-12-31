// Middleware - just pass through, client-side auth handles protection
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*'
}
