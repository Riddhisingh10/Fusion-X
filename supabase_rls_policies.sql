-- ==========================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. HELPER FUNCTION: CHECK IF USER IS ADMIN
-- ==========================================
-- SECURITY DEFINER executes with bypass permissions to safely read the profiles table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND auth.uid() IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. PROFILES TABLE POLICIES
-- ==========================================
-- Select Profile: Users can SELECT their own profile
CREATE POLICY select_own_profile ON profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Update Profile: Users can UPDATE their own profile
CREATE POLICY update_own_profile ON profiles
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND auth.uid() = id)
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Admin Bypass: Admins can view and update any profile
CREATE POLICY admin_select_all_profiles ON profiles
    FOR SELECT
    USING (is_admin());

CREATE POLICY admin_update_all_profiles ON profiles
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==========================================
-- 4. NOTES TABLE POLICIES
-- ==========================================
-- Insert Note: Students can INSERT their own notes
CREATE POLICY insert_own_note ON notes
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Select Note: Students can SELECT notes belonging to their college
CREATE POLICY select_college_notes ON notes
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND college = (SELECT college FROM profiles WHERE id = auth.uid())
    );

-- Delete Note: Only the original author can DELETE their note
CREATE POLICY delete_own_note ON notes
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Admin Bypass: Admins can manage all notes
CREATE POLICY admin_manage_all_notes ON notes
    FOR ALL
    USING (is_admin());

-- ==========================================
-- 5. FEEDBACK TABLE POLICIES
-- ==========================================
-- Insert Feedback: Authenticated users can insert feedback
CREATE POLICY insert_authenticated_feedback ON feedback
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Select Feedback: Only admins can view feedback
CREATE POLICY admin_select_feedback ON feedback
    FOR SELECT
    USING (is_admin());

-- UPDATE & DELETE: Implicitly denied to everyone (including authors) by omitting policies

-- ==========================================
-- 6. STUDY_GROUPS TABLE POLICIES
-- ==========================================
-- Select Groups: Members of the group or the creator can view details
CREATE POLICY select_member_groups ON study_groups
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND (
            creator_id = auth.uid() 
            OR EXISTS (
                SELECT 1 FROM group_members 
                WHERE group_id = id AND user_id = auth.uid()
            )
        )
    );

-- Update/Delete Groups: Only the creator of the group can update/delete it
CREATE POLICY modify_own_group ON study_groups
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND creator_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

CREATE POLICY delete_own_group ON study_groups
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND creator_id = auth.uid());

-- Admin Bypass: Admins can manage all study groups
CREATE POLICY admin_manage_all_groups ON study_groups
    FOR ALL
    USING (is_admin());

-- ==========================================
-- 7. GROUP_MEMBERS TABLE POLICIES
-- ==========================================
-- Select Members: Users can only see memberships of groups they belong to
CREATE POLICY select_visible_members ON group_members
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM group_members AS self
            WHERE self.group_id = group_id AND self.user_id = auth.uid()
        )
    );

-- Join Group: Users can insert their own group membership
CREATE POLICY join_group ON group_members
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Leave Group: Users can remove their own group membership
CREATE POLICY leave_group ON group_members
    FOR DELETE
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admin Bypass: Admins can manage all group memberships
CREATE POLICY admin_manage_all_members ON group_members
    FOR ALL
    USING (is_admin());


-- =========================================================================
-- HOW TO TEST RLS POLICIES USING THE SUPABASE SQL EDITOR
-- =========================================================================
/*
To test policies, mock specific session contexts in the SQL editor:

-- 1. Test as Guest (unauthenticated)
RESET role;
SELECT * FROM profiles; -- Should return 0 rows (denied)

-- 2. Test as Authenticated Student
SET local role authenticated;
SET local request.jwt.claim.sub = '88888888-8888-8888-8888-888888888888'; -- Set target user ID
SELECT * FROM profiles WHERE id = '88888888-8888-8888-8888-888888888888'; -- Should return user details
SELECT * FROM profiles WHERE id = '99999999-9999-9999-9999-999999999999'; -- Should return 0 rows (denied)

-- 3. Test Admin Bypass
SET local role authenticated;
SET local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000000'; -- Set admin user ID
SELECT * FROM profiles; -- Should return all rows
*/
