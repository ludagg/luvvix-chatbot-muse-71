
-- Créer les tables manquantes pour center_group_posts
CREATE TABLE IF NOT EXISTS public.center_group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS pour center_group_posts
ALTER TABLE public.center_group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group posts if member" ON public.center_group_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM center_group_members 
      WHERE group_id = center_group_posts.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts in groups they belong to" ON public.center_group_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM center_group_members 
      WHERE group_id = center_group_posts.group_id AND user_id = auth.uid()
    )
  );

-- Créer le bucket de stockage si inexistant
INSERT INTO storage.buckets (id, name, public) 
VALUES ('center-media', 'center-media', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour center-media
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'center-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public media access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'center-media');

CREATE POLICY "Users can delete own media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'center-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Assurer que user_profiles existe pour les jointures
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS pour user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_center_group_posts_group_id ON center_group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_center_group_posts_user_id ON center_group_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
