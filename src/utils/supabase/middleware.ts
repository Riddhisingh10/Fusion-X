import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the user's Supabase Auth session via cookies.
 * This is executed inside Next.js middleware to keep HttpOnly session cookies updated on every page load.
 */
export const updateSession = async (request: NextRequest) => {
    // Initialize standard request forwarding
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update cookies on the incoming request headers so downstream Server Components can read them
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Re-initialize response with updated headers
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    // Set cookies on the outgoing response headers
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // SECURE: Triggers a token refresh if expired, validating it against Supabase Auth servers
    const { data: { user }, error } = await supabase.auth.getUser();

    return { supabase, response, user, error };
};
