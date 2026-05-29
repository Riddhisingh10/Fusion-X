import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for UptimeRobot monitoring.
 * Authenticates connectivity to Supabase without requiring user session token.
 */
export async function GET() {
    try {
        const supabase = await createClient();
        
        // Lightweight database ping (limit 1 row from profiles table)
        const { error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (error) {
            console.error("Database health check ping failed:", error.message);
            return NextResponse.json({
                status: 'error',
                db: 'disconnected',
                message: error.message,
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'ok',
            db: 'connected',
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (err: any) {
        console.error("Health check route failed:", err);
        return NextResponse.json({
            status: 'error',
            db: 'error',
            message: err.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
