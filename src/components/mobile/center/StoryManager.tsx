import React, { useState, useEffect } from 'react';
import { Plus, Camera, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoryPreviewModal from './StoryPreviewModal';

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
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;

    try {
      // Récupérer les amis de l'utilisateur
      const { data: friendships, error: friendError } = await supabase
        .from('center_friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendError) throw friendError;

      // Extraire les IDs des amis
      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      
      // Ajouter l'utilisateur actuel
      const allowedUserIds = [...friendIds, user.id];

      // Récupérer les stories des amis et de l'utilisateur seulement
      const { data: storiesData, error: storiesError } = await supabase
        .from('center_stories')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .in('user_id', allowedUserIds)
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
      setPreviewFile(file);
    }
  };

  const handlePublishStory = async (file: File) => {
    setPreviewFile(null);
    await createStory(file);
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
    <>
      <div className="flex items-center space-x-3 p-4 overflow-x-auto bg-white border-b border-gray-200">
        {/* Mes stories (plusieurs possibles) */}
        {userStories.length > 0 ? (
          userStories.map((story) => (
            <div key={story.id} className="flex-shrink-0 text-center">
              <button
                onClick={() => viewStory(story.id)}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                    {story.media_type === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <img
                        src={story.media_url}
                        alt="Ma story"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </button>
              <p className="text-xs mt-1 text-gray-600 truncate max-w-16">
                {new Date(story.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
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

        {/* Ajouter un bouton en plus pour nouvelle story quand l'utilisateur en a déjà */}
        {userStories.length > 0 && (
          <label className="flex-shrink-0 text-center cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-gray-50">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs mt-1 text-blue-500">Ajouter</p>
          </label>
        )}

        {/* Stories des amis */}
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
            <p className="text-gray-500 text-sm">Aucune story d'amis disponible</p>
          </div>
        )}
      </div>
      {/* Aperçu Modal */}
      {previewFile && (
        <StoryPreviewModal
          file={previewFile}
          onPublish={handlePublishStory}
          onCancel={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

export default StoryManager;
