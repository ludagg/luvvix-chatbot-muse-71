
import React, { useState, useEffect } from 'react';
import { Camera, Play, Eye, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    full_name: string;
    avatar_url?: string;
  };
}

interface StoryManagerProps {
  onStoryView?: (storyId: string) => void;
}

const StoryManager = ({ onStoryView }: StoryManagerProps) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('center_stories')
        .select(`
          *,
          user_profiles!inner(username, full_name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Erreur chargement stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadStory = async (file: File, caption?: string) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('center-media')
        .upload(`stories/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('center-media')
        .getPublicUrl(uploadData.path);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      const { error: insertError } = await supabase
        .from('center_stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption || null
        });

      if (insertError) throw insertError;

      toast({
        title: "Story publiée",
        description: "Votre story a été publiée avec succès"
      });

      fetchStories();
    } catch (error) {
      console.error('Erreur upload story:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier la story",
        variant: "destructive"
      });
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Enregistrer la vue
      await supabase
        .from('center_story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id
        });

      onStoryView?.(storyId);
    } catch (error) {
      // Ne pas afficher d'erreur si l'utilisateur a déjà vu la story
      console.log('Vue story déjà enregistrée');
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3">
        <div className="animate-pulse w-14 h-14 bg-gray-200 rounded-full"></div>
        <div className="animate-pulse w-14 h-14 bg-gray-200 rounded-full"></div>
        <div className="animate-pulse w-14 h-14 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-3">
      <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
        {/* Bouton d'ajout de story */}
        <div className="flex flex-col items-center flex-shrink-0">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadStory(file);
            }}
            className="hidden"
            id="story-upload"
          />
          <label htmlFor="story-upload" className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <Camera className="w-6 h-6 text-gray-500" />
          </label>
          <span className="text-xs mt-1 text-gray-600">Votre story</span>
        </div>

        {/* Stories existantes */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center flex-shrink-0">
            <button
              onClick={() => viewStory(story.id)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 relative"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                {story.media_type === 'video' ? (
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <img 
                    src={story.media_url} 
                    alt="Story"
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <Eye className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600">{story.views_count}</span>
              </div>
            </button>
            <span className="text-xs mt-1 text-gray-600 truncate w-16 text-center">
              {story.user_profiles?.username || 'User'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryManager;
