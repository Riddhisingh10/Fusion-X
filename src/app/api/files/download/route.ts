import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSecureUser } from '../../../../utils/supabase/server';
import { withCors } from '../../../../utils/cors';

export const dynamic = 'force-dynamic';

export const GET = withCors(async (request: NextRequest) => {
    try {
        // 1. Authenticate user session
        const user = await getSecureUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized: Session required' }, { status: 401 });
        }

        // 2. Parse file path (Format expected: "uploader_user_id/uuid.ext")
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json({ message: 'File path parameter is required' }, { status: 400 });
        }

        const pathParts = filePath.split('/');
        if (pathParts.length < 2) {
            return NextResponse.json({ message: 'Invalid file path structure' }, { status: 400 });
        }
        const fileOwnerId = pathParts[0];

        const supabase = await createClient();

        // 3. Fetch downloader's profile details to check role and college
        const { data: downloaderProfile, error: profileError } = await supabase
            .from('profiles')
            .select('role, college')
            .eq('id', user.id)
            .single();

        if (profileError || !downloaderProfile) {
            return NextResponse.json({ message: 'Access denied: Profile configuration missing' }, { status: 403 });
        }

        // 4. Enforce college boundary matching (unless bypassed by teacher role)
        if (downloaderProfile.role !== 'teacher') {
            const { data: ownerProfile, error: ownerError } = await supabase
                .from('profiles')
                .select('college')
                .eq('id', fileOwnerId)
                .single();

            if (ownerError || !ownerProfile || downloaderProfile.college !== ownerProfile.college) {
                return NextResponse.json({ message: 'Forbidden: Access restricted to college peers' }, { status: 403 });
            }
        }

        // 5. Generate 15-minute signed URL
        const SIGNED_URL_EXPIRY_SECONDS = 15 * 60; // 15 minutes
        const { data, error: signedUrlError } = await supabase.storage
            .from('study-materials')
            .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

        if (signedUrlError || !data) {
            return NextResponse.json({ message: 'Internal error generating signed link' }, { status: 500 });
        }

        return NextResponse.json({
            signedUrl: data.signedUrl
        });

    } catch (error) {
        console.error("Download endpoint error:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});
