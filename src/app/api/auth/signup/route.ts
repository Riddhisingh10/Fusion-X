import { NextRequest, NextResponse } from 'next/server';
import { validateBody, signupSchema, type SignupInput } from '../../../../utils/validation';
import { createClient } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const POST = withCors(
    validateBody(signupSchema, async (request: NextRequest, body: SignupInput) => {
        const supabase = await createClient();

        // Sign up user in Supabase
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    full_name: body.fullName
                }
            }
        });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        return NextResponse.json({
            message: 'User registered successfully. Check email for confirmation.',
            userId: data.user?.id
        }, { status: 201 });
    })
);
