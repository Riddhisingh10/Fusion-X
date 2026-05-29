import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateBody, feedbackSchema, type FeedbackInput } from '../../../utils/validation';
import { createClient, getSecureUser } from '../../../utils/supabase/server';
import { withCors } from '../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(
    validateBody(feedbackSchema, async (request: NextRequest, body: FeedbackInput) => {
        try {
            // 1. Authenticate user session securely (never trust client claims)
            const user = await getSecureUser();
            if (!user) {
                return NextResponse.json({ message: 'Unauthorized: Session required' }, { status: 401 });
            }

            const supabase = await createClient();

            // 2. Fetch the user's profile to retrieve their college_id
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('college')
                .eq('id', user.id)
                .single();

            if (profileError || !userProfile || !userProfile.college) {
                return NextResponse.json({ message: 'Access denied: Profile college mismatch' }, { status: 403 });
            }

            // 3. Cryptographically generate the rotating daily hash
            const todayDateStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const baseSalt = process.env.DAILY_SALT || 'fallback-secure-salt-key';
            const compositeSalt = `${baseSalt}_${todayDateStr}`;

            const dailyHash = crypto
                .createHmac('sha256', compositeSalt)
                .update(user.id)
                .digest('hex');

            // 4. Rate-limit checks: Count submissions for this hash since midnight UTC
            const startOfToday = new Date();
            startOfToday.setUTCHours(0, 0, 0, 0);

            const { count, error: countError } = await supabase
                .from('anonymous_feedback')
                .select('*', { count: 'exact', head: true })
                .eq('daily_hash', dailyHash)
                .gte('created_at', startOfToday.toISOString());

            if (countError) {
                console.error("Database query failed during rate limiting check:", countError.message);
                return NextResponse.json({ message: 'Failed to verify rate limits' }, { status: 500 });
            }

            if (count && count >= 3) {
                return NextResponse.json({ 
                    message: 'Too many submissions. You can submit up to 3 feedbacks per day anonymously.' 
                }, { status: 429 });
            }

            // 5. Strip all user identity and insert feedback
            // NO user_id, NO IP, NO metadata are persisted in the record
            const { error: insertError } = await supabase
                .from('anonymous_feedback')
                .insert({
                    college_id: userProfile.college,
                    category: body.category,
                    content: body.text, // body.text contains the validated, XSS-sanitized content
                    daily_hash: dailyHash
                });

            if (insertError) {
                console.error("Anonymous feedback insertion failed:", insertError.message);
                return NextResponse.json({ message: 'Failed to record feedback' }, { status: 500 });
            }

            // 6. Return successful response (no user-revealing information is leaked back)
            return NextResponse.json({
                message: 'Feedback submitted anonymously successfully.'
            }, { status: 201 });

        } catch (error) {
            console.error("Feedback route error:", error);
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    })
);
