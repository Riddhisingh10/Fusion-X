const REQUIRED_SECRETS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
    'DAILY_SALT'
];

/**
 * Validates that all critical infrastructure secrets are present.
 * Throws a detailed error at startup or runtime if any key is missing.
 */
export function checkRequiredSecrets() {
    const missing = REQUIRED_SECRETS.filter(secret => !process.env[secret]);
    if (missing.length > 0) {
        throw new Error(
            `[CRITICAL BOOTSTRAP FAILURE] Missing environment secrets: ${missing.join(', ')}. ` +
            `Please configure these keys in Vercel settings or your local decrypted .env file immediately.`
        );
    }
}
