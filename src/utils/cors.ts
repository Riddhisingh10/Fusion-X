import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
    ? ['https://connectprep.in']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

/**
 * CORS Middleware wrapper for Next.js Route Handlers.
 * Rejects unauthorized origin headers and applies required headers for secure cross-origin requests.
 */
export function withCors(
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        // Handle preflight OPTIONS requests
        if (request.method === 'OPTIONS') {
            const response = new NextResponse(null, { status: 204 });
            const origin = request.headers.get('origin');
            if (origin && ALLOWED_ORIGINS.includes(origin)) {
                response.headers.set('Access-Control-Allow-Origin', origin);
                response.headers.set('Access-Control-Allow-Credentials', 'true');
                response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-nonce');
            }
            return response;
        }

        const origin = request.headers.get('origin');

        // Enforce Origin checks: reject unauthorized external origins
        if (origin && !ALLOWED_ORIGINS.includes(origin)) {
            return NextResponse.json({ message: 'Forbidden: CORS origin policy violation' }, { status: 403 });
        }

        // Execute the inner handler
        const response = await handler(request, ...args);

        // Append CORS headers for whitelisted origins
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
    };
}
