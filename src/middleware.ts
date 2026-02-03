
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Backward compatibility redirects
    if (pathname.startsWith('/menu/')) {
        const tableId = pathname.split('/')[2];
        return NextResponse.redirect(new URL(`/r/demo/menu/${tableId}`, request.url));
    }

    if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/r/demo/admin', request.url));
    }

    if (pathname === '/kitchen') {
        return NextResponse.redirect(new URL('/r/demo/kitchen', request.url));
    }

    // 2. BeFoodie Home page (platform landing)
    if (pathname === '/') {
        // Optionally redirect to a specific demo restaurant or a SaaS landing page
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/menu/:path*',
        '/admin',
        '/kitchen',
    ],
};
