
-- Table pour les stories
CREATE TABLE IF NOT EXISTS public.center_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Table pour les vues de stories
CREATE TABLE IF NOT EXISTS public.center_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES center_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, viewer_id)
);

-- Table pour les groupes
CREATE TABLE IF NOT EXISTS public.center_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les membres des groupes
CREATE TABLE IF NOT EXISTS public.center_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES center_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- Table pour les posts dans les groupes
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

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS public.center_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'group_invite', 'group_join', 'story_view', 'mention')),
  entity_type TEXT CHECK (entity_type IN ('post', 'comment', 'story', 'group')),
  entity_id UUID,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les salles de chat (rooms)
CREATE TABLE IF NOT EXISTS public.center_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter une colonne video_url à center_posts si elle n'existe pas
ALTER TABLE public.center_posts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- RLS Policies pour center_stories
ALTER TABLE public.center_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active stories" ON public.center_stories
  FOR SELECT USING (expires_at > CURRENT_TIMESTAMP);

CREATE POLICY "Users can create their own stories" ON public.center_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON public.center_stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.center_stories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies pour center_story_views
ALTER TABLE public.center_story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view story views" ON public.center_story_views
  FOR SELECT USING (true);

CREATE POLICY "Users can add story views" ON public.center_story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- RLS Policies pour center_groups
ALTER TABLE public.center_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public groups" ON public.center_groups
  FOR SELECT USING (NOT is_private OR EXISTS (
    SELECT 1 FROM center_group_members 
    WHERE group_id = center_groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups" ON public.center_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators and admins can update groups" ON public.center_groups
  FOR UPDATE USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM center_group_members 
      WHERE group_id = center_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies pour center_group_members
ALTER TABLE public.center_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members" ON public.center_group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON public.center_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.center_group_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies pour center_notifications
ALTER TABLE public.center_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.center_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.center_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.center_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies pour center_chat_rooms
ALTER TABLE public.center_chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms they participate in" ON public.center_chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM center_chat_participants 
      WHERE room_id = center_chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" ON public.center_chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Triggers pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION update_story_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE center_stories 
  SET views_count = views_count + 1 
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_view_count_trigger
  AFTER INSERT ON center_story_views
  FOR EACH ROW EXECUTE FUNCTION update_story_views_count();

-- Trigger pour mettre à jour le nombre de membres dans les groupes
CREATE OR REPLACE FUNCTION update_group_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE center_groups 
    SET members_count = members_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE center_groups 
    SET members_count = members_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_members_count_trigger
  AFTER INSERT OR DELETE ON center_group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_members_count();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_center_stories_user_id ON center_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_center_stories_expires_at ON center_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_center_notifications_user_id ON center_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_center_notifications_is_read ON center_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_center_group_members_group_id ON center_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_center_group_members_user_id ON center_group_members(user_id);
