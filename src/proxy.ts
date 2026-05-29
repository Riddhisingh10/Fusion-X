import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function proxy(request: NextRequest) {
    // 1. Run Supabase session update (refreshes cookie if expired)
    const { response: supabaseResponse, user: supabaseUser } = await updateSession(request);

    // 2. Fallback to check for mock-user cookie to allow demo/testing profiles
    const mockUserCookie = request.cookies.get('mock-user')?.value;
    let mockUser = null;
    if (mockUserCookie) {
        try {
            mockUser = JSON.parse(decodeURIComponent(mockUserCookie));
        } catch (e) {
            // Ignore malformed cookies
        }
    }
    const user = supabaseUser || mockUser;

    // 3. Protect /dashboard/* routes
    const path = request.nextUrl.pathname;
    if (path.startsWith('/dashboard') && !user) {
        const loginUrl = new URL('/login', request.url);
        // Clean redirect to login page
        return NextResponse.redirect(loginUrl);
    }

    // 3. Generate a cryptographic nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // 4. Dynamically read and parse Supabase endpoints from env to configure connect-src and img-src
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : '';

    const cspDirectives = [
        `default-src 'self'`,
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.google.com`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `font-src 'self' data: https://fonts.gstatic.com`,
        `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ''} https://*.googleapis.com https://*.google.com`,
        `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ''} http://localhost:5001 ws://localhost:* wss://localhost:*`,
        `frame-src 'none'`,
        `frame-ancestors 'none'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
    ].join('; ');

    // 5. Construct a final response with CSP and safety headers
    // We clone the request headers to forward the nonce to Server Components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspDirectives);

    const finalResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Copy cookies set by Supabase (e.g. refreshed session tokens)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        finalResponse.cookies.set(cookie.name, cookie.value);
    });

    // Set HTTP security headers
    finalResponse.headers.set('Content-Security-Policy', cspDirectives);
    finalResponse.headers.set('X-Frame-Options', 'DENY');
    finalResponse.headers.set('X-Content-Type-Options', 'nosniff');
    finalResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    finalResponse.headers.set('X-XSS-Protection', '1; mode=block');
    finalResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    return finalResponse;
}

// Apply proxy to all routes except static assets, favicon, and image optimization routes
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
