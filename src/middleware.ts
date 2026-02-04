
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. JWT validation for scoped routes
    const token = request.cookies.get('auth-token')?.value;
    if (token && pathname.startsWith('/r/')) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const { restaurantSlug: tokenSlug } = payload as { restaurantSlug: string };
            const urlSlug = pathname.split('/')[2];

            // If entering an admin or kitchen route for a specific restaurant
            if (pathname.includes('/admin') || pathname.includes('/kitchen')) {
                // Ensure the token slug matches the URL slug
                if (tokenSlug !== urlSlug) {
                    console.log(`[MIDDLEWARE] Slug Mismatch: URL=${urlSlug}, TOKEN=${tokenSlug}. Redirecting...`);
                    // Redirect to the user's authorized restaurant dashboard
                    return NextResponse.redirect(new URL(`/r/${tokenSlug}/admin`, request.url));
                }
            }
        } catch (e) {
            // Invalid token
            console.error('[MIDDLEWARE] JWT Verification failed:', e);
            // Optionally clear cookie or let the page handle it
        }
    }

    // 2. BeFoodie Home page (platform landing)
    if (pathname === '/') {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/menu/:path*',
        '/admin/:path*',
        '/kitchen/:path*',
    ],
};
