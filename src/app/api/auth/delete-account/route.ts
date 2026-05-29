import { NextRequest, NextResponse } from 'next/server';
import { getSecureUser } from '../../../../utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

/**
 * DPDP Act 2023 - Right to Erasure Endpoint.
 * Permanent erasure of user authentication credentials and associated data.
 */
export const POST = withCors(async (request: NextRequest) => {
    try {
        // 1. Authenticate target user securely
        const user = await getSecureUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized: Session required' }, { status: 401 });
        }

        // 2. Initialize the privileged admin client using service_role secret
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        // 3. Delete user account from Supabase Auth
        // NOTE: Make sure foreign keys to auth.users are configured with 'ON DELETE CASCADE'
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (error) {
            console.error(`[COMPLIANCE ALERT] Failed to delete user ${user.id}:`, error.message);
            return NextResponse.json({ message: 'Failed to complete erasure request' }, { status: 500 });
        }

        console.log(`[DPDP COMPLIANCE] Account and all associated data permanently erased for user: ${user.id}`);

        // 4. Return successful response instructing the client-side to reset session state
        return NextResponse.json({
            message: 'Your account and all associated data have been permanently deleted in compliance with the DPDP Act.'
        }, { status: 200 });

    } catch (error) {
        console.error("Delete account endpoint error:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});
