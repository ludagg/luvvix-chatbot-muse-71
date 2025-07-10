-- Ajouter les clés étrangères manquantes pour le système de chat

-- 1. Ajouter la clé étrangère entre user_contacts et user_profiles
ALTER TABLE public.user_contacts 
ADD CONSTRAINT user_contacts_contact_user_id_fkey 
FOREIGN KEY (contact_user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 2. Ajouter la clé étrangère entre chat_participants et user_profiles  
ALTER TABLE public.chat_participants 
ADD CONSTRAINT chat_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 3. Ajouter la clé étrangère entre chat_messages et user_profiles
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 4. Créer la table message_status si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.message_status (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'sent',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- 5. Activer RLS sur message_status
ALTER TABLE public.message_status ENABLE ROW LEVEL SECURITY;

-- 6. Ajouter les clés étrangères pour message_status
ALTER TABLE public.message_status 
ADD CONSTRAINT message_status_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;

ALTER TABLE public.message_status 
ADD CONSTRAINT message_status_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 7. Politiques RLS pour message_status
CREATE POLICY "Users can view message status in their conversations" 
ON public.message_status 
FOR SELECT 
USING (message_id IN (
    SELECT chat_messages.id 
    FROM chat_messages 
    WHERE chat_messages.conversation_id IN (
        SELECT chat_participants.conversation_id 
        FROM chat_participants 
        WHERE chat_participants.user_id = auth.uid()
    )
));

CREATE POLICY "Users can create message status" 
ON public.message_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update message status" 
ON public.message_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 8. Trigger pour updated_at sur message_status
CREATE TRIGGER update_message_status_updated_at
    BEFORE UPDATE ON public.message_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_status_message_id ON public.message_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_status_user_id ON public.message_status(user_id);