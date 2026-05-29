import { createBrowserClient } from '@supabase/ssr';

// CRITICAL SECURITY ASSERTION: Stop execution if service_role key leaks to the client bundle
if (typeof window !== 'undefined' && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error(
        "CRITICAL SECURITY CRISIS: The sensitive SUPABASE_SERVICE_ROLE_KEY has leaked to the client browser bundle! " +
        "Ensure it is strictly placed in your server environment and does not carry the NEXT_PUBLIC_ prefix."
    );
}

// Custom cookie-based storage for the browser client to avoid using localStorage
const customSecureStorage = {
    getItem: (key: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
            ?.split('=')[1];
        return value ? decodeURIComponent(value) : null;
    },
    setItem: (key: string, value: string): void => {
        if (typeof document === 'undefined') return;
        const isSecure = window.location.protocol === 'https:';
        // Securely write cookie with SameSite=Lax and optional Secure attribute
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    },
    removeItem: (key: string): void => {
        if (typeof document === 'undefined') return;
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    }
};

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false, // Prevents default auto-saving to localStorage
                storage: customSecureStorage,
                detectSessionInUrl: true
            }
        }
    );
};
