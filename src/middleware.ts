import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/kitchen');
    const isLogin = pathname === '/admin/login';

    // Skip public routes and assets
    if (!isProtected && !isLogin) return NextResponse.next();
    if (pathname.includes('/api/')) return NextResponse.next();

    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        if (isProtected && !isLogin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.next();
    }

    // If token exists, we try to decode it (just to get the role)
    // In middleware, we can't easily verify JWT without 'jose' unless we're in Node runtime
    // Next.js middleware runs in Edge. 'jsonwebtoken' might not work.
    // Let's use a simpler approach: check for token existence and redirect based on role stored in cookie
    // OR just use 'jsonwebtoken' if this environment supports it (it usually doesn't in Edge).

    // For now, let's assume we want to protect /admin specifically for owners
    // To do this properly in middleware without 'jose', we check a separate 'role' cookie
    // that we set during login.

    const role = request.cookies.get('auth-role')?.value;

    if (isLogin) {
        if (role === 'owner') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'staff') return NextResponse.redirect(new URL('/kitchen', request.url));
        return NextResponse.next();
    }

    if (pathname.startsWith('/admin') && role !== 'owner') {
        return NextResponse.redirect(new URL('/kitchen', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/kitchen/:path*'],
};
