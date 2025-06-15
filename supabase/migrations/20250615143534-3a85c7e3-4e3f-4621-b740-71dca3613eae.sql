
-- Table pour suivre les hashtags et leur popularité
CREATE TABLE IF NOT EXISTS public.center_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  posts_count integer NOT NULL DEFAULT 1,
  last_used timestamp with time zone DEFAULT now(),
  UNIQUE(tag)
);

-- Table pour lier hashtags et posts (relation N:N)
CREATE TABLE IF NOT EXISTS public.center_post_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  hashtag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table pour les notifications reçues (type : mention)
CREATE TABLE IF NOT EXISTS public.center_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- e.g. 'mention'
  post_id uuid,
  triggered_by uuid, -- utilisateur à l'origine de la notif
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS : chaque utilisateur ne voit QUE ses notifications
ALTER TABLE public.center_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilisateur: voir ses notifications" 
  ON public.center_notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Utilisateur: ajouter notification" 
  ON public.center_notifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Utilisateur: marquer comme lu" 
  ON public.center_notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Indices pour accélérer les requêtes tendances
CREATE INDEX IF NOT EXISTS idx_center_hashtags_tag ON public.center_hashtags (tag);
CREATE INDEX IF NOT EXISTS idx_post_hashtag_post ON public.center_post_hashtags (post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtag_hashtag ON public.center_post_hashtags (hashtag_id);

