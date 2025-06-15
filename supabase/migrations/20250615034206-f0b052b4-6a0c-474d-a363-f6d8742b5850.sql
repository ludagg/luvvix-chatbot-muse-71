
-- Créer une table pour stocker les conversations de l'assistant IA
CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer une table pour stocker les messages de chaque conversation
CREATE TABLE IF NOT EXISTS ai_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE ai_assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les conversations
CREATE POLICY "Users can view their own conversations" 
  ON ai_assistant_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON ai_assistant_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON ai_assistant_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON ai_assistant_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour les messages
CREATE POLICY "Users can view messages from their conversations" 
  ON ai_assistant_messages 
  FOR SELECT 
  USING (
    conversation_id IN (
      SELECT id FROM ai_assistant_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON ai_assistant_messages 
  FOR INSERT 
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_assistant_conversations WHERE user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_assistant_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message_insert
  AFTER INSERT ON ai_assistant_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Index pour améliorer les performances
CREATE INDEX idx_ai_assistant_conversations_user_id ON ai_assistant_conversations(user_id);
CREATE INDEX idx_ai_assistant_conversations_updated_at ON ai_assistant_conversations(updated_at DESC);
CREATE INDEX idx_ai_assistant_messages_conversation_id ON ai_assistant_messages(conversation_id);
CREATE INDEX idx_ai_assistant_messages_created_at ON ai_assistant_messages(created_at);
