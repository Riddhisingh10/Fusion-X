-- =========================================================================
-- CONNECT & PREP - REALTIME ATTENDANCE SCHEMA & REPLICATION SETUP
-- =========================================================================

-- 1. Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    date TEXT NOT NULL, -- format DD-MM-YYYY
    day TEXT NOT NULL,
    present INTEGER NOT NULL DEFAULT 1,
    total INTEGER NOT NULL DEFAULT 1,
    doc TEXT,
    doc_status TEXT DEFAULT '',
    sem TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for fast lookups by student and semester
CREATE INDEX IF NOT EXISTS idx_attendance_student_sem 
ON public.attendance (student_id, sem);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 4. Helper Function: Check if the current authenticated user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'teacher'
        AND auth.uid() IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Define Access Control Rules (RLS Policies)
DROP POLICY IF EXISTS select_attendance_student ON public.attendance;
CREATE POLICY select_attendance_student ON public.attendance
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS insert_attendance_teacher ON public.attendance;
CREATE POLICY insert_attendance_teacher ON public.attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_teacher() 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS update_attendance_allowed ON public.attendance;
CREATE POLICY update_attendance_allowed ON public.attendance
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = student_id 
        OR public.is_teacher() 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS delete_attendance_teacher ON public.attendance;
CREATE POLICY delete_attendance_teacher ON public.attendance
    FOR DELETE
    TO authenticated
    USING (
        public.is_teacher() 
        OR public.is_admin()
    );

-- 6. Enable Realtime Replication for the attendance table
-- First, ensure the publication exists, and then add our table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
EXCEPTION
    WHEN duplicate_object THEN
        -- If already added to publication, do nothing
        NULL;
    WHEN OTHERS THEN
        -- Handle general edge cases safely
        NULL;
END $$;
