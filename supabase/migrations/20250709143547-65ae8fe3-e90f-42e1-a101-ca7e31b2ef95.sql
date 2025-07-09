-- Créer la table pour les notifications quotidiennes d'actualités
CREATE TABLE IF NOT EXISTS public.daily_news_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  headlines JSONB NOT NULL DEFAULT '[]'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  news_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_news_notifications ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own daily news notifications" 
ON public.daily_news_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Index pour optimiser les requêtes
CREATE INDEX idx_daily_news_notifications_user_date ON public.daily_news_notifications(user_id, news_date);
CREATE INDEX idx_daily_news_notifications_sent_at ON public.daily_news_notifications(sent_at);

-- Ajouter une contrainte pour éviter les doublons par jour
ALTER TABLE public.daily_news_notifications 
ADD CONSTRAINT unique_user_news_date UNIQUE(user_id, news_date);