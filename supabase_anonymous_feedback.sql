-- =========================================================================
-- CRYPTOGRAPHICALLY DECOUPLED ANONYMOUS FEEDBACK SCHEMA
-- =========================================================================

-- 1. Create the anonymous feedback table
CREATE TABLE IF NOT EXISTS anonymous_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    daily_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index the daily_hash and created_at columns for quick rate-limit checking
CREATE INDEX IF NOT EXISTS idx_feedback_daily_hash_date 
ON anonymous_feedback (daily_hash, created_at);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE anonymous_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Define Access Control Policies
-- Rule A: Authenticated students can INSERT feedback, but cannot select or view submissions back
CREATE POLICY insert_anonymous_feedback ON anonymous_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Rule B: Only administrators can view (SELECT) anonymous feedback submissions
CREATE POLICY select_admin_feedback ON anonymous_feedback
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Rule C: UPDATE and DELETE operations are fully blocked by omitting policies for them
