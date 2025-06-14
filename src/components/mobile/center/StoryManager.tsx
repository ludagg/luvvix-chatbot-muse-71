
import React, { useState, useEffect } from 'react';
import { Plus, Camera, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface StoryManagerProps {
  onStoryView: (storyId: string) => void;
}

const StoryManager = ({ onStoryView }: StoryManagerProps) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;

    try {
      // Récupérer toutes les stories actives
      const { data: storiesData, error: storiesError } = await supabase
        .from('center_stories')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // Séparer mes stories des autres
      const myStories = (storiesData || []).filter(story => story.user_id === user.id);
      const otherStories = (storiesData || []).filter(story => story.user_id !== user.id);

      setUserStories(myStories);
      setStories(otherStories);
    } catch (error) {
      console.error('Erreur chargement stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      // Upload du fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('center-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('center-media')
        .getPublicUrl(filePath);

      // Créer la story
      const { error: storyError } = await supabase
        .from('center_stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'image'
        });

      if (storyError) throw storyError;

      toast.success('Story publiée avec succès !');
      fetchStories();
    } catch (error) {
      console.error('Erreur création story:', error);
      toast.error('Erreur lors de la création de la story');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      createStory(file);
    }
  };

  const viewStory = async (storyId: string) => {
    try {
      // Ajouter une vue
      await supabase
        .from('center_story_views')
        .insert({
          story_id: storyId,
          viewer_id: user?.id
        });

      onStoryView(storyId);
    } catch (error) {
      console.error('Erreur vue story:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-4 overflow-x-auto bg-white border-b border-gray-200">
      {/* Ma story / Créer une story */}
      <div className="flex-shrink-0 text-center">
        {userStories.length > 0 ? (
          <button
            onClick={() => viewStory(userStories[0].id)}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                {userStories[0].media_type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <img 
                    src={userStories[0].media_url} 
                    alt="Ma story"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </button>
        ) : (
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          </label>
        )}
        <p className="text-xs mt-1 text-gray-600">
          {userStories.length > 0 ? 'Ma story' : 'Ajouter'}
        </p>
      </div>

      {/* Stories des autres */}
      {stories.map((story) => (
        <div key={story.id} className="flex-shrink-0 text-center">
          <button
            onClick={() => viewStory(story.id)}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                {story.media_type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <Play className="w-6 h-6 text-white" />
                    <img 
                      src={story.media_url} 
                      alt="Story"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  </div>
                ) : (
                  <img 
                    src={story.media_url} 
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </button>
          <p className="text-xs mt-1 text-gray-600 truncate max-w-16">
            {story.user_profiles?.username || 'Utilisateur'}
          </p>
        </div>
      ))}

      {stories.length === 0 && userStories.length === 0 && (
        <div className="flex-1 text-center py-4">
          <p className="text-gray-500 text-sm">Aucune story disponible</p>
        </div>
      )}
    </div>
  );
};

export default StoryManager;
