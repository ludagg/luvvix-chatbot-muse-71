
-- Enable the required extensions if they aren't already
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to set up newsletter cron jobs
CREATE OR REPLACE FUNCTION public.setup_newsletter_cron()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  supabase_anon_key text;
  result json;
BEGIN
  -- Get the Supabase URL and anon key from environment variables
  SELECT current_setting('app.settings.supabase_url') INTO supabase_url;
  SELECT current_setting('app.settings.supabase_anon_key') INTO supabase_anon_key;

  -- Remove existing cron jobs if they exist to avoid duplicates
  PERFORM cron.unschedule('hourly-newsletter');
  PERFORM cron.unschedule('daily-newsletter');
  PERFORM cron.unschedule('weekly-newsletter');

  -- Schedule hourly newsletter to run at the beginning of each hour
  PERFORM cron.schedule(
    'hourly-newsletter',
    '0 * * * *',
    $$
    SELECT
      net.http_get(
        url:='https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/send-newsletter?frequency=realtime',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI"}'::jsonb
      ) as request_id;
    $$
  );

  -- Schedule daily newsletter to run at 8:00 AM every day
  PERFORM cron.schedule(
    'daily-newsletter',
    '0 8 * * *',
    $$
    SELECT
      net.http_get(
        url:='https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/send-newsletter?frequency=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI"}'::jsonb
      ) as request_id;
    $$
  );

  -- Schedule weekly newsletter to run at 9:00 AM every Monday
  PERFORM cron.schedule(
    'weekly-newsletter',
    '0 9 * * 1',
    $$
    SELECT
      net.http_get(
        url:='https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/send-newsletter?frequency=weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI"}'::jsonb
      ) as request_id;
    $$
  );

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Newsletter cron jobs configured successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Update the configuration to store the Supabase URL and anon key
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://qlhovvqcwjdbirmekdoy.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI';
