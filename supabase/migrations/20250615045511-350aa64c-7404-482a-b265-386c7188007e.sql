
-- Ajoute la colonne "connected_at" (horodatage UTC) à la table cloud_connections pour les connexions cloud (Mega et autres)
ALTER TABLE public.cloud_connections
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE DEFAULT now();
