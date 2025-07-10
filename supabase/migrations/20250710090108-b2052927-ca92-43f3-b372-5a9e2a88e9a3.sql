
-- Table pour stocker les contacts des utilisateurs
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT, -- nom personnalisé pour le contact
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  UNIQUE(user_id, contact_user_id)
);

-- Table pour les conversations (privées et groupes)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('private', 'group')),
  name TEXT, -- nom pour les groupes
  description TEXT, -- description pour les groupes
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Table pour les participants des conversations
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Table pour les messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'image', 'video', 'document', 'contact', 'location', 'sticker', 'gif')),
  content TEXT, -- texte du message ou métadonnées JSON
  file_url TEXT, -- URL du fichier pour les médias
  file_name TEXT,
  file_size INTEGER,
  duration INTEGER, -- durée pour les messages vocaux/vidéos
  reply_to UUID REFERENCES chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false
);

-- Table pour le statut des messages (lu, reçu, etc.)
CREATE TABLE IF NOT EXISTS message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Table pour les appels vocaux/vidéos
CREATE TABLE IF NOT EXISTS chat_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  caller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video', 'group_voice', 'group_video')),
  status TEXT DEFAULT 'calling' CHECK (status IN ('calling', 'ongoing', 'ended', 'missed', 'rejected')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER -- durée en secondes
);

-- Table pour les participants d'appel
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES chat_calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'rejected'))
);

-- Table pour les réactions aux messages
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Activer RLS sur toutes les tables
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_contacts
CREATE POLICY "Users can manage their own contacts" ON user_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour chat_conversations
CREATE POLICY "Users can view conversations they participate in" ON chat_conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update group conversations" ON chat_conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id FROM chat_participants 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Politiques RLS pour chat_participants
CREATE POLICY "Users can view participants in their conversations" ON chat_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations" ON chat_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour chat_messages
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Politiques RLS pour message_status
CREATE POLICY "Users can manage message status" ON message_status
  FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour chat_calls
CREATE POLICY "Users can view calls in their conversations" ON chat_calls
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calls" ON chat_calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

-- Politiques RLS pour call_participants
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT USING (
    call_id IN (
      SELECT id FROM chat_calls WHERE conversation_id IN (
        SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
      )
    )
  );

-- Politiques RLS pour message_reactions
CREATE POLICY "Users can manage reactions in their conversations" ON message_reactions
  FOR ALL USING (
    message_id IN (
      SELECT id FROM chat_messages WHERE conversation_id IN (
        SELECT conversation_id FROM chat_participants WHERE user_id = auth.uid()
      )
    )
  );

-- Index pour améliorer les performances
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX idx_chat_participants_conversation_id ON chat_participants(conversation_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX idx_message_status_message_id ON message_status(message_id);
CREATE INDEX idx_message_status_user_id ON message_status(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_timestamp();
