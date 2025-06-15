import React, { useState, useEffect } from 'react';
import { Plus, Camera, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoryPreviewModal from './StoryPreviewModal';
import StoryLoader from './StoryLoader';

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    setLoading(true);
    if (!user) {
      console.log('StoryManager: Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    console.log('StoryManager: Début du chargement des stories pour l\'utilisateur:', user.id);

    try {
      // 1. Récupérer les amis de l'utilisateur
      console.log('StoryManager: Récupération des amitiés...');
      const { data: friendships, error: friendError } = await supabase
        .from('center_friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendError) {
        console.error("Erreur chargement des amitiés pour les stories:", friendError);
        // On ne bloque pas, on essaiera au moins de charger les stories de l'utilisateur
      }

      // Extraire les IDs des amis
      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      // Ajouter l'utilisateur actuel
      const allowedUserIds = [...new Set([...friendIds, user.id])];
      console.log('StoryManager: IDs autorisés pour les stories:', allowedUserIds);

      // 2. Récupérer les stories des amis et utilisateur, sans join
      const { data: storiesData, error: storiesError } = await supabase
        .from('center_stories')
        .select('*')
        .in('user_id', allowedUserIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) {
        console.error('Erreur Supabase récupération des stories:', storiesError);
        toast.error(`Impossible de charger les stories: ${storiesError.message || storiesError.details || JSON.stringify(storiesError)}`);
        setLoading(false);
        return;
      }
      if (!storiesData || storiesData.length === 0) {
        setUserStories([]);
        setStories([]);
        setLoading(false);
        return;
      }

      // 3. Récupérer tous les profils nécessaires (batch)
      const uniqueUserIds = [
        ...new Set(storiesData.map((story: any) => story.user_id))
      ];

      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', uniqueUserIds);

      if (profilesError) {
        console.error('Erreur chargement profils user_profiles pour stories:', profilesError);
      }

      // Créer un map rapide des profils
      const profilesMap: { [key: string]: any } = {};
      (profilesData || []).forEach((profile: any) => {
        profilesMap[profile.id] = profile;
      });

      // 4. Associer chaque profil à chaque story
      const storiesWithProfiles = (storiesData || []).map((story: any) => ({
        ...story,
        user_profiles: profilesMap[story.user_id] || undefined
      }));

      // Séparer mes stories des autres
      const myStories = storiesWithProfiles.filter(story => story.user_id === user.id);
      const otherStories = storiesWithProfiles.filter(story => story.user_id !== user.id);

      setUserStories(myStories);
      setStories(otherStories);
    } catch (error: any) {
      console.error('Erreur chargement stories (JS catch):', error);
      toast.error('Erreur inattendue lors du chargement des stories: ' + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File) => {
    if (!user) return;

    setUploading(true);
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
    } finally {
      setUploading(false);
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
    return <StoryLoader text="Chargement des stories..." />;
  }

  const hasNoStories = stories.length === 0 && userStories.length === 0;

  return (
    <>
      {/* Loader pendant upload story */}
      {uploading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <StoryLoader text="Envoi en cours..." />
        </div>
      )}
      <div className="flex items-center space-x-3 p-4 overflow-x-auto bg-white border-b border-gray-200">
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-2">
            Debug: {userStories.length} story(s) utilisateur, {stories.length} story(s) amis
          </div>
        )}

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

        {/* Message personnalisé si aucune story */}
        {hasNoStories && (
          <div className="flex-1 text-center py-4">
            <p className="text-gray-500 text-sm">
              Aucune story disponible. 
              <br />
              {user
                ? "Commencez en publiant la vôtre !"
                : "Connectez-vous pour créer ou voir les stories."}
            </p>
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
