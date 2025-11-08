-- Create Messages Table for In-App Chat with E2E Encryption Support
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id TEXT NOT NULL, -- Format: "user1_id_user2_id" or "user1_id_user2_id_helpRequestId"
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  -- Encrypted message content (encrypted on client-side before sending)
  encrypted_content TEXT NOT NULL,
  -- Encryption metadata (nonce, algorithm, etc.)
  encryption_metadata JSONB,
  -- Message status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create Conversations Table (for easier querying)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, -- Same format as conversation_id in messages
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_preview TEXT, -- Non-encrypted preview (first 50 chars, sanitized)
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT conversations_user_order CHECK (user1_id < user2_id)
);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'abusive_language',
    'inappropriate_behavior',
    'fraud',
    'spam',
    'harassment',
    'fake_profile',
    'other'
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- URLs to screenshots or evidence
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT reports_different_users CHECK (reporter_id != reported_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_help_request_id ON messages(help_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_help_request_id ON conversations(help_request_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Messages Policies
-- Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can only send messages as themselves
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages (for status updates)
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Conversations Policies
-- Users can only see conversations they're part of
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create conversations they're part of
CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update conversations they're part of
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Reports Policies
-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only admins can update reports
CREATE POLICY "Only admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_conversation_id TEXT;
BEGIN
  v_user1_id := LEAST(NEW.sender_id, NEW.recipient_id);
  v_user2_id := GREATEST(NEW.sender_id, NEW.recipient_id);
  v_conversation_id := NEW.conversation_id;
  
  INSERT INTO conversations (id, user1_id, user2_id, help_request_id, last_message_at, last_message_preview)
  VALUES (
    v_conversation_id,
    v_user1_id,
    v_user2_id,
    NEW.help_request_id,
    NEW.created_at,
    LEFT(REPLACE(REPLACE(NEW.encrypted_content, '<', ''), '>', ''), 50)
  )
  ON CONFLICT (id)
  DO UPDATE SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(REPLACE(REPLACE(NEW.encrypted_content, '<', ''), '>', ''), 50),
    updated_at = NOW();
  
  -- Update unread count
  IF NEW.recipient_id = v_user1_id THEN
    UPDATE conversations
    SET user1_unread_count = user1_unread_count + 1
    WHERE id = v_conversation_id;
  ELSE
    UPDATE conversations
    SET user2_unread_count = user2_unread_count + 1
    WHERE id = v_conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id TEXT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET status = 'read', read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND recipient_id = p_user_id
    AND status != 'read';
    
  -- Reset unread count
  UPDATE conversations
  SET 
    user1_unread_count = CASE WHEN user1_id = p_user_id THEN 0 ELSE user1_unread_count END,
    user2_unread_count = CASE WHEN user2_id = p_user_id THEN 0 ELSE user2_unread_count END
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON reports TO authenticated;

COMMENT ON TABLE messages IS 'End-to-end encrypted messages between users';
COMMENT ON TABLE conversations IS 'Conversation metadata for easier querying';
COMMENT ON TABLE reports IS 'User reports for abusive behavior, fraud, etc.';

