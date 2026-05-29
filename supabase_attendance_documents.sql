-- =========================================================================
-- SUPABASE ATTENDANCE DOCUMENTS BUCKET AND POLICIES
-- =========================================================================

-- 1. Create the 'attendance-documents' storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attendance-documents', 'attendance-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS storage policies for 'attendance-documents' bucket

-- Allow users to upload (insert) files to their own subfolder
DROP POLICY IF EXISTS "Upload own attendance document" ON storage.objects;
CREATE POLICY "Upload own attendance document" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'attendance-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to download (select) their own files, or teachers/admins to download any file
DROP POLICY IF EXISTS "Select own attendance document or teacher bypass" ON storage.objects;
CREATE POLICY "Select own attendance document or teacher bypass" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'attendance-documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
            )
        )
    );

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Delete own attendance document" ON storage.objects;
CREATE POLICY "Delete own attendance document" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'attendance-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 3. Update public.attendance table policies to allow students to INSERT their own records 
-- (necessary when uploading excuse documents for mock dates that don't exist in Supabase yet)
DROP POLICY IF EXISTS insert_attendance_student ON public.attendance;
CREATE POLICY insert_attendance_student ON public.attendance
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = auth.uid()
    );
