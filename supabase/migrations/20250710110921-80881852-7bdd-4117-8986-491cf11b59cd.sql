
-- Supprimer les tables existantes s'il y a des problèmes
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.user_contacts CASCADE;
DROP TABLE IF EXISTS public.message_status CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;

-- Créer la table des conversations
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'group')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des participants
CREATE TABLE public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Créer la table des messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des contacts
CREATE TABLE public.user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_user_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simples pour les conversations
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

CREATE POLICY "Users can add participants" ON public.chat_participants
FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.chat_conversations 
    WHERE created_by = auth.uid()
  )
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

-- Créer des index pour les performances
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_conversation_id ON public.chat_participants(conversation_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sent_at ON public.chat_messages(sent_at);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
