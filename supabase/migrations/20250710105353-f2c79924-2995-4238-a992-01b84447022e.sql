-- Vérifier et ajouter seulement les contraintes manquantes

-- 1. Ajouter la clé étrangère entre chat_participants et user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_participants_user_id_fkey'
    ) THEN
        ALTER TABLE public.chat_participants 
        ADD CONSTRAINT chat_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Ajouter la clé étrangère entre chat_messages et user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_sender_id_fkey'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT chat_messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Créer la table message_status si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.message_status (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'sent',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- 4. Activer RLS sur message_status
ALTER TABLE public.message_status ENABLE ROW LEVEL SECURITY;

-- 5. Ajouter les clés étrangères pour message_status si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'message_status_message_id_fkey'
    ) THEN
        ALTER TABLE public.message_status 
        ADD CONSTRAINT message_status_message_id_fkey 
        FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'message_status_user_id_fkey'
    ) THEN
        ALTER TABLE public.message_status 
        ADD CONSTRAINT message_status_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Créer les politiques RLS si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'message_status' AND policyname = 'Users can view message status in their conversations'
    ) THEN
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
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'message_status' AND policyname = 'Users can create message status'
    ) THEN
        CREATE POLICY "Users can create message status" 
        ON public.message_status 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'message_status' AND policyname = 'Users can update message status'
    ) THEN
        CREATE POLICY "Users can update message status" 
        ON public.message_status 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;