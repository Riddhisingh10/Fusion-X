import { createClient } from './client';

/**
 * Enrolls the logged-in user in TOTP Multi-Factor Authentication.
 * Returns the enrollment details including the TOTP secret and SVG QR code to display.
 */
export async function enrollMFA() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Connect & Prep College',
        friendlyName: 'ConnectPrep MFA'
    });

    if (error) throw error;
    return data; // contains factorId, totp: { qr_code, secret, uri }
}

/**
 * Validates the verification code submitted by the user to activate the MFA factor.
 */
export async function verifyMFA(factorId: string, code: string) {
    const supabase = createClient();
    
    // Create verification challenge and check TOTP code correctness in one call
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code
    });

    if (error) throw error;
    return data; // returns access token and session if successful
}

/**
 * Retrieves the current session's Authenticator Assurance Level (AAL).
 * Level can be:
 * - 'aal1': standard login (password/OAuth)
 * - 'aal2': verified second factor (MFA)
 */
export async function getAssuranceLevel() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (error) throw error;
    return {
        currentLevel: data.currentLevel,
        nextLevel: data.nextLevel,
        isMFAActive: data.currentLevel === 'aal2'
    };
}
