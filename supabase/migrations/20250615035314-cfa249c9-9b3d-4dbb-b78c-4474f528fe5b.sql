
-- Ajouter la colonne title manquante à la table ai_assistant_conversations
ALTER TABLE ai_assistant_conversations 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Nouvelle conversation';

-- Mettre à jour le trigger pour s'assurer qu'il fonctionne correctement
DROP TRIGGER IF EXISTS update_conversation_on_message_insert ON ai_assistant_messages;

CREATE TRIGGER update_conversation_on_message_insert
  AFTER INSERT ON ai_assistant_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
