-- =========================================================================
-- SUPABASE AUTH & STORAGE HARDENING POLICIES (supabase_auth_hardening.sql)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. OAUTH DOMAIN RESTRICTION TRIGGER
-- -------------------------------------------------------------------------
-- Restricts registration and authentication to @college.edu domains only.
-- Applies to standard emails, OAuth logins (Google, etc.), and magic links.

CREATE OR REPLACE FUNCTION check_oauth_domain()
RETURNS TRIGGER AS $$
DECLARE
    allowed_domain CONSTANT text := 'college.edu';
    user_email text;
BEGIN
    user_email := NEW.email;
    
    -- Reject signups/logins if they do not match the college domain
    IF user_email IS NOT NULL AND NOT (user_email LIKE '%@' || allowed_domain) THEN
        RAISE EXCEPTION 'Access denied. Account email must end with @%.', allowed_domain;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to the auth.users table (executed before insert)
DROP TRIGGER IF EXISTS restrict_domain_trigger ON auth.users;
CREATE TRIGGER restrict_domain_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION check_oauth_domain();


-- -------------------------------------------------------------------------
-- 2. SUPABASE STORAGE RLS POLICIES
-- -------------------------------------------------------------------------

-- 2.1 Public Assets Bucket (Profile Pictures)
-- Bucket config: public read, authenticated insert.

CREATE POLICY "Public read for profile pictures" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'public-assets');

CREATE POLICY "Authenticated upload of profile pictures" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'public-assets' 
        AND auth.uid() IS NOT NULL
    );

-- 2.2 Study Materials Bucket (Private)
-- Folder convention: study-materials/{user_id}/filename.pdf

-- INSERT POLICY: Users can only upload files to their own subfolders
CREATE POLICY "Upload only to user folder" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- SELECT POLICY: Users can download notes if they belong to the same college, 
-- or if they are registered as a 'teacher' in their profile.
CREATE POLICY "Download from same college or teacher bypass" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (
            -- Bypass: Teachers can download all notes
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'teacher'
            )
            OR
            -- Match: Downloader's college must match the college of the file owner (folder name)
            (
                SELECT college FROM profiles WHERE id = auth.uid()
            ) = (
                SELECT college FROM profiles WHERE id = (storage.foldername(name))[1]::uuid
            )
        )
    );

-- DELETE POLICY: Users can only delete their own notes
CREATE POLICY "Delete own study materials" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'study-materials'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
