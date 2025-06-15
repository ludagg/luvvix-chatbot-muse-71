import React, { useState, useEffect } from 'react';
import { Plus, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoryPreviewModal from './StoryPreviewModal';
import StoryLoader from './StoryLoader';
import StoryViewer from '../StoryViewer';

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

interface UserStoriesGroup {
  user_id: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  stories: Story[];
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
  const [storyGroups, setStoryGroups] = useState<UserStoriesGroup[]>([]);
  const [myStoryGroup, setMyStoryGroup] = useState<UserStoriesGroup | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState<Story[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      // Récupérer les amis
      const { data: friendships } = await supabase
        .from('center_friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      const allowedUserIds = [...new Set([...friendIds, user.id])];

      // Récupérer les stories récentes
      const { data: storiesData, error: storiesError } = await supabase
        .from('center_stories')
        .select('*')
        .in('user_id', allowedUserIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) {
        toast.error(`Impossible de charger les stories: ${storiesError.message}`);
        setLoading(false);
        return;
      }
      if (!storiesData || storiesData.length === 0) {
        setUserStories([]);
        setStories([]);
        setStoryGroups([]);
        setMyStoryGroup(null);
        setLoading(false);
        return;
      }

      // Récupérer tous les profils nécessaires
      const uniqueUserIds = [
        ...new Set(storiesData.map((story: any) => story.user_id))
      ];
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', uniqueUserIds);

      const profilesMap: { [key: string]: any } = {};
      (profilesData || []).forEach((profile: any) => {
        profilesMap[profile.id] = profile;
      });

      // Grouper stories par user_id (du plus récent au plus ancien)
      const userStoriesMap: { [userId: string]: Story[] } = {};
      (storiesData || []).forEach((story: Story) => {
        if (!userStoriesMap[story.user_id]) userStoriesMap[story.user_id] = [];
        userStoriesMap[story.user_id].push({
          ...story,
          user_profiles: profilesMap[story.user_id] || undefined
        });
      });

      // Séparer "moi" et "autres"
      const myStoriesArr = userStoriesMap[user.id] || [];
      const myStoryGrp: UserStoriesGroup | null = myStoriesArr.length > 0 ? {
        user_id: user.id,
        user_profiles: profilesMap[user.id] || undefined,
        stories: myStoriesArr,
      } : null;

      // Autres users
      const otherGroups: UserStoriesGroup[] = Object.entries(userStoriesMap)
        .filter(([uid]) => uid !== user.id)
        .map(([uid, stories]) => ({
          user_id: uid,
          user_profiles: profilesMap[uid] || undefined,
          stories
        }));

      setUserStories(myStoriesArr);
      setStories(storiesData);
      setMyStoryGroup(myStoryGrp);
      setStoryGroups(otherGroups);
    } catch (error: any) {
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

  // Fonction qui ouvre le StoryViewer pour UN user (moi ou autre)
  const handleOpenStoryViewer = (stories: Story[], initialIndex: number = 0) => {
    setViewerStories(stories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    setViewerIndex(initialIndex);
    setViewerOpen(true);
    if (stories[initialIndex]?.id) onStoryView(stories[initialIndex].id);
  };

  const hasNoStories = storyGroups.length === 0 && (!myStoryGroup || !myStoryGroup.stories.length);

  if (loading) {
    return <StoryLoader text="Chargement des stories..." />;
  }

  return (
    <>
      {uploading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <StoryLoader text="Envoi en cours..." />
        </div>
      )}
      <div className="flex items-center space-x-3 p-4 overflow-x-auto bg-white border-b border-gray-200">
        {/* Profil - mes stories GROUPÉES */}
        {myStoryGroup && myStoryGroup.stories.length > 0 ? (
          <div className="flex-shrink-0 text-center">
            <button
              onClick={() => handleOpenStoryViewer(myStoryGroup.stories, 0)}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                  {myStoryGroup.stories[0].media_type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <img
                      src={myStoryGroup.stories[0].media_url}
                      alt="Ma story"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </button>
            <p className="text-xs mt-1 text-gray-600 truncate max-w-16">
              {new Date(myStoryGroup.stories[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
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

        {/* Ajouter un bouton nouvelle story si déjà existante */}
        {myStoryGroup && myStoryGroup.stories.length > 0 && (
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

        {/* Stories des amis GROUPÉES */}
        {storyGroups.map((group) => (
          <div key={group.user_id} className="flex-shrink-0 text-center">
            <button
              onClick={() => handleOpenStoryViewer(group.stories, 0)}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full border-2 border-gray-300 p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                  {group.stories[0].media_type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                      <Play className="w-6 h-6 text-white" />
                      <img
                        src={group.stories[0].media_url}
                        alt="Story"
                        className="w-full h-full object-cover absolute inset-0 opacity-40"
                      />
                    </div>
                  ) : (
                    <img
                      src={group.stories[0].media_url}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </button>
            <p className="text-xs mt-1 text-gray-600 truncate max-w-16">
              {group.user_profiles?.username || 'Utilisateur'}
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
      {/* Modal d'aperçu */}
      {previewFile && (
        <StoryPreviewModal
          file={previewFile}
          onPublish={handlePublishStory}
          onCancel={() => setPreviewFile(null)}
        />
      )}
      {/* Story viewer modal */}
      {viewerOpen && viewerStories.length > 0 && (
        <StoryViewer
          stories={viewerStories.map(story => ({
            id: story.id,
            user: {
              id: story.user_id,
              username: story.user_profiles?.username || '',
              avatar_url: story.user_profiles?.avatar_url || '',
              full_name: story.user_profiles?.full_name || ''
            },
            media_url: story.media_url,
            media_type: story.media_type,
            created_at: story.created_at,
            duration: 5000 // 5s par défaut, option à améliorer
          }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoryManager;
