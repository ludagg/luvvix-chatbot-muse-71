
-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.user_contacts CASCADE;

-- Table des conversations (métadonnées uniquement)
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_name TEXT, -- Nom chiffré de la conversation
  conversation_type TEXT NOT NULL DEFAULT 'private' CHECK (conversation_type IN ('private', 'group')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants
CREATE TABLE public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_public_key TEXT NOT NULL, -- Clé publique du participant pour cette conversation
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Table des messages (tout est chiffré)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL, -- Contenu chiffré
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
  encrypted_metadata TEXT, -- Métadonnées chiffrées (nom de fichier, etc.)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des contacts
CREATE TABLE public.user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_contact_name TEXT, -- Nom de contact chiffré
  encrypted_public_key TEXT NOT NULL, -- Clé publique du contact
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_user_id)
);

-- Table pour les clés publiques des utilisateurs
CREATE TABLE public.user_public_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_public_keys ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les conversations
CREATE POLICY "Users can view their conversations" ON public.chat_conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON public.chat_conversations
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Politiques RLS pour les participants
CREATE POLICY "Users can view participants in their conversations" ON public.chat_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to their conversations" ON public.chat_participants
FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.chat_conversations 
    WHERE created_by = auth.uid()
  ) OR user_id = auth.uid()
);

-- Politiques RLS pour les messages
CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

-- Politiques RLS pour les contacts
CREATE POLICY "Users can view their contacts" ON public.user_contacts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add contacts" ON public.user_contacts
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their contacts" ON public.user_contacts
FOR DELETE USING (user_id = auth.uid());

-- Politiques RLS pour les clés publiques
CREATE POLICY "Users can view all public keys" ON public.user_public_keys
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own public key" ON public.user_public_keys
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Créer des index pour les performances
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_conversation_id ON public.chat_participants(conversation_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sent_at ON public.chat_messages(sent_at);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX idx_user_public_keys_user_id ON public.user_public_keys(user_id);

-- Activer le temps réel pour toutes les tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_contacts;
