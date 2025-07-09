-- Activer les extensions nécessaires pour les cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer le cron job pour envoyer les notifications d'actualités quotidiennes
-- Tous les jours à 8h00 (heure du serveur)
SELECT cron.schedule(
  'daily-news-notifications',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://ad47350f-59af-461e-b682-1f7fd95503bc.supabase.co/functions/v1/send-daily-news-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);