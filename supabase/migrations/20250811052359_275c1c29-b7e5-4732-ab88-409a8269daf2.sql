
-- 1) Fiabiliser Realtime pour UPDATE (livraison, statut, etc.)
ALTER TABLE public.messenger_luvvix_users REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_participants REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_messages REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_calls REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_blocked_users REPLICA IDENTITY FULL;
ALTER TABLE public.messenger_luvvix_shared_files REPLICA IDENTITY FULL;

-- 2) RPC: Créer/obtenir une conversation directe
CREATE OR REPLACE FUNCTION public.messenger_luvvix_get_or_create_direct_conversation(target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_conv_id uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF target_user_id IS NULL OR target_user_id = v_me THEN
    RAISE EXCEPTION 'Invalid target user id';
  END IF;

  -- Existe déjà ?
  SELECT c.id INTO v_conv_id
  FROM messenger_luvvix_conversations c
  JOIN messenger_luvvix_participants p1 ON p1.conversation_id = c.id AND p1.user_id = v_me
  JOIN messenger_luvvix_participants p2 ON p2.conversation_id = c.id AND p2.user_id = target_user_id
  WHERE c.type = 'direct'
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Créer la conversation + participants
  INSERT INTO messenger_luvvix_conversations (type, created_by, settings)
  VALUES ('direct', v_me, '{}'::jsonb)
  RETURNING id INTO v_conv_id;

  INSERT INTO messenger_luvvix_participants (conversation_id, user_id, role)
  VALUES (v_conv_id, v_me, 'member'),
         (v_conv_id, target_user_id, 'member');

  RETURN v_conv_id;
END;
$$;

-- 3) RPC: Envoyer un message avec validations
CREATE OR REPLACE FUNCTION public.messenger_luvvix_send_message(
  p_conversation_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text',
  p_media_url text DEFAULT NULL,
  p_media_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_msg_id uuid;
  v_is_participant boolean;
  v_is_direct boolean;
  v_other_user uuid;
  v_is_blocked boolean;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Vérifier participant
  SELECT EXISTS (
    SELECT 1 FROM messenger_luvvix_participants 
    WHERE conversation_id = p_conversation_id AND user_id = v_me
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RAISE EXCEPTION 'Not a participant of this conversation';
  END IF;

  -- Si conversation directe, vérifier le block dans les deux sens
  SELECT (c.type = 'direct') INTO v_is_direct
  FROM messenger_luvvix_conversations c
  WHERE c.id = p_conversation_id;

  IF v_is_direct THEN
    SELECT user_id INTO v_other_user
    FROM messenger_luvvix_participants
    WHERE conversation_id = p_conversation_id AND user_id <> v_me
    LIMIT 1;

    SELECT EXISTS (
      SELECT 1 FROM messenger_luvvix_blocked_users 
      WHERE (blocker_id = v_me AND blocked_id = v_other_user)
         OR (blocker_id = v_other_user AND blocked_id = v_me)
    ) INTO v_is_blocked;

    IF v_is_blocked THEN
      RAISE EXCEPTION 'User is blocked';
    END IF;
  END IF;

  INSERT INTO messenger_luvvix_messages (
    conversation_id, sender_id, content, message_type, media_url, media_metadata, delivery_status
  ) VALUES (
    p_conversation_id, v_me, p_content, p_message_type, p_media_url, COALESCE(p_media_metadata, '{}'::jsonb), 'sent'
  )
  RETURNING id INTO v_msg_id;

  -- Mettre à jour la conversation
  UPDATE messenger_luvvix_conversations
  SET updated_at = now()
  WHERE id = p_conversation_id;

  RETURN v_msg_id;
END;
$$;
