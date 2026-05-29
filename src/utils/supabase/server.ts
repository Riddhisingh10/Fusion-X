import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkRequiredSecrets } from '../envCheck';

export const createClient = async () => {
    // Assert required secrets are present at runtime
    checkRequiredSecrets();
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // In Next.js App Router, cookie mutations can only be performed in Route Handlers or Server Actions.
                        // We safely ignore this error if middleware handles the session refresh.
                    }
                },
            },
        }
    );
};

/**
 * SECURE PATTERN: Verifies the session by hitting the Supabase Auth server.
 * Never trust getSession() on the server without verifying through getUser().
 */
export const getSecureUser = async () => {
    const supabase = await createClient();
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return null;
        }
        return user;
    } catch {
        return null;
    }
};
