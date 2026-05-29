-- =========================================================================
-- SECURE REALTIME GROUP CHAT SCHEMAS & TRIGGERS (supabase_realtime_chat.sql)
-- =========================================================================

-- 1. Create the messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL, -- references study_groups.id
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast retrieval of group chats ordered by date
CREATE INDEX IF NOT EXISTS idx_messages_group_date 
ON messages (group_id, created_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Define Access Control Rules
-- Rule A (Select): Students can only read messages in groups they belong to
CREATE POLICY select_group_messages ON messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = messages.group_id 
            AND user_id = auth.uid()
        )
    );

-- Rule B (Insert): Students can only send messages if they are active group members
CREATE POLICY insert_group_messages ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = messages.group_id 
            AND user_id = auth.uid()
        )
    );

-- Rule C (Update/Delete): Explicitly blocked (denied by omitting policy declarations)


-- 4. FLOOD PREVENTION: Rate limit trigger (Max 1 message per 2 seconds per user)
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM messages
        WHERE sender_id = NEW.sender_id
        AND created_at >= now() - INTERVAL '2 seconds'
    ) THEN
        RAISE EXCEPTION 'Rate limit exceeded: Please wait 2 seconds before sending another message.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_message_rate_limit ON messages;
CREATE TRIGGER trigger_message_rate_limit
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION check_message_rate_limit();


-- 5. CONTENT SANITIZATION: HTML Tag Stripping and character limit trigger
CREATE OR REPLACE FUNCTION sanitize_message_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Strip HTML tags using regular expression replacement
    NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    -- Hard limit text content to 1000 characters
    NEW.content := substring(NEW.content from 1 for 1000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sanitize_message ON messages;
CREATE TRIGGER trigger_sanitize_message
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION sanitize_message_content();
