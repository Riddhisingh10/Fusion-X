-- =========================================================================
-- CONNECT & PREP - PUSH NOTIFICATIONS DATABASE SCHEMAS & TRIGGERS
-- =========================================================================
-- This script sets up the parent link, notifications table, Row-Level Security,
-- Realtime replication, and triggers to automate attendance/notes alerts.
-- =========================================================================

-- 1. Hardening & Upgrading Profiles Table to support 'parent' role and child link
-- First, drop the old check constraint if it exists to allow parent role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- Add parent-child link column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;


-- 2. Create the Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('attendance', 'notes', 'general')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index user_id and read columns for quick queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications (user_id, read);


-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Define Row Level Security Policies
DROP POLICY IF EXISTS select_own_notifications ON public.notifications;
CREATE POLICY select_own_notifications ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS update_own_notifications ON public.notifications;
CREATE POLICY update_own_notifications ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_own_notifications ON public.notifications;
CREATE POLICY delete_own_notifications ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 5. Enable Realtime Replication for the notifications table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN OTHERS THEN
        NULL;
END $$;


-- 6. Trigger: Automatically Link Parent to Student for Demo Purposes
CREATE OR REPLACE FUNCTION public.auto_link_parent_child()
RETURNS TRIGGER AS $$
DECLARE
    matching_student_id UUID;
BEGIN
    IF NEW.role = 'parent' AND NEW.child_id IS NULL THEN
        -- Find the first student in the same college to link automatically
        SELECT id INTO matching_student_id FROM public.profiles 
        WHERE role = 'student' AND college = NEW.college 
        LIMIT 1;

        IF matching_student_id IS NOT NULL THEN
            NEW.child_id := matching_student_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_link_parent_child ON public.profiles;
CREATE TRIGGER tr_auto_link_parent_child
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_link_parent_child();


-- 7. Trigger: Automatically Notify Parents on Student Attendance Updates
CREATE OR REPLACE FUNCTION public.notify_parent_on_attendance()
RETURNS TRIGGER AS $$
DECLARE
    parent_record RECORD;
BEGIN
    -- Query all parents who are linked to this student
    FOR parent_record IN 
        SELECT id FROM public.profiles 
        WHERE role = 'parent' AND child_id = NEW.student_id
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            parent_record.id,
            'Attendance Notification 📅',
            'Your child was marked ' || (CASE WHEN NEW.present = 1 THEN 'PRESENT' ELSE 'ABSENT' END) || ' in ' || NEW.course || ' for date ' || NEW.date || '.',
            'attendance'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_parent_on_attendance ON public.attendance;
CREATE TRIGGER tr_notify_parent_on_attendance
    AFTER INSERT OR UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_parent_on_attendance();


-- 8. Trigger: Automatically Notify Students in the same college on new Notes Upload
CREATE OR REPLACE FUNCTION public.notify_students_on_notes()
RETURNS TRIGGER AS $$
DECLARE
    student_record RECORD;
    author_college TEXT;
BEGIN
    -- Fetch the college of the author
    SELECT college INTO author_college FROM public.profiles WHERE id = NEW.author_id;

    -- Query all students in the same college (except the author themselves)
    FOR student_record IN 
        SELECT id FROM public.profiles 
        WHERE role = 'student' AND college = author_college AND id != NEW.author_id
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            student_record.id,
            'New Notes Uploaded 📚',
            'A new study resource "' || NEW.title || '" has been uploaded in your subject catalog.',
            'notes'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_students_on_notes ON public.notes;
CREATE TRIGGER tr_notify_students_on_notes
    AFTER INSERT ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_students_on_notes();
