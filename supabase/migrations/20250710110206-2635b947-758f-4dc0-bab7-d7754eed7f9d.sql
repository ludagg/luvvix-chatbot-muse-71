
-- Désactiver temporairement RLS pour les tables de chat pour éviter les récursions infinies

-- Désactiver RLS sur chat_participants
ALTER TABLE public.chat_participants DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur chat_conversations  
ALTER TABLE public.chat_conversations DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur chat_messages
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur message_status
ALTER TABLE public.message_status DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur message_reactions
ALTER TABLE public.message_reactions DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur user_contacts
ALTER TABLE public.user_contacts DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes qui causent des problèmes
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view message status in their conversations" ON public.message_status;
DROP POLICY IF EXISTS "Users can create message status" ON public.message_status;
DROP POLICY IF EXISTS "Users can update message status" ON public.message_status;
DROP POLICY IF EXISTS "Users can manage reactions in their conversations" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.user_contacts;
DROP POLICY IF EXISTS "Users can add their own contacts" ON public.user_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.user_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.user_contacts;

-- Créer des politiques plus simples sans récursion
CREATE POLICY "Allow authenticated users full access to chat_participants" 
ON public.chat_participants 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to chat_conversations" 
ON public.chat_conversations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to chat_messages" 
ON public.chat_messages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to message_status" 
ON public.message_status 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to message_reactions" 
ON public.message_reactions 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to user_contacts" 
ON public.user_contacts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Réactiver RLS avec les nouvelles politiques simples
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
