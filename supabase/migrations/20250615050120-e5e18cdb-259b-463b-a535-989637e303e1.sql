
-- Supprime la contrainte existante si elle existe
ALTER TABLE public.cloud_connections 
  DROP CONSTRAINT IF EXISTS cloud_connections_provider_check;

-- Ajoute une nouvelle contrainte CHECK autorisant "dropbox", "google_drive" et "mega" comme provider
ALTER TABLE public.cloud_connections
  ADD CONSTRAINT cloud_connections_provider_check
  CHECK (provider IN ('dropbox', 'google_drive', 'mega'));
