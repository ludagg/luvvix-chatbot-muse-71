
-- Ajouter les nouvelles colonnes à la table user_profiles pour les informations sociales
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Créer une table pour gérer les connexions aux services cloud
CREATE TABLE IF NOT EXISTS cloud_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'dropbox', 'google_drive', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  account_info JSONB, -- stocke email, nom, etc. du compte connecté
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, provider)
);

-- Activer RLS sur la table cloud_connections
ALTER TABLE cloud_connections ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres connexions
CREATE POLICY "Users can view their own cloud connections" 
ON cloud_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cloud connections" 
ON cloud_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cloud connections" 
ON cloud_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cloud connections" 
ON cloud_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Mettre à jour la fonction handle_new_user pour inclure les nouvelles données
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Générer un username unique basé sur l'email ou les métadonnées
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  -- Nettoyer le username (supprimer les espaces et caractères spéciaux)
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Si le username est vide ou NULL, utiliser un UUID tronqué
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user_' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  
  final_username := base_username;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    final_username := base_username || '_' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Insérer dans user_profiles avec toutes les données
  INSERT INTO public.user_profiles (
    id, 
    full_name, 
    username,
    bio,
    age,
    gender,
    country,
    avatar_url
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    final_username,
    COALESCE(new.raw_user_meta_data->>'bio', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'age' ~ '^[0-9]+$' 
      THEN (new.raw_user_meta_data->>'age')::INTEGER 
      ELSE NULL 
    END,
    COALESCE(new.raw_user_meta_data->>'gender', ''),
    COALESCE(new.raw_user_meta_data->>'country', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Insérer dans user_preferences avec les données supplémentaires
  INSERT INTO public.user_preferences (
    id, 
    user_id,
    theme,
    notifications_enabled,
    preferred_languages
  )
  VALUES (
    gen_random_uuid(),
    new.id,
    'light',
    true,
    ARRAY['fr']
  ) ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer le profil Center avec toutes les nouvelles données
  INSERT INTO public.center_profiles (
    id,
    username,
    full_name,
    bio,
    avatar_url,
    preferences
  )
  VALUES (
    new.id,
    final_username,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'bio', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    jsonb_build_object(
      'country', COALESCE(new.raw_user_meta_data->>'country', ''),
      'gender', COALESCE(new.raw_user_meta_data->>'gender', ''),
      'age', COALESCE(new.raw_user_meta_data->>'age', ''),
      'phone_number', COALESCE(new.raw_user_meta_data->>'phone_number', '')
    )
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;
