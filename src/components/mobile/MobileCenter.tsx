import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, Bell, Image as ImageIcon, MapPin, Users, Video, Feather, TrendingUp, Hash, Home, Mail, Camera, Bookmark, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TwitterPost from './TwitterPost';
import TwitterComposer from './TwitterComposer';
import StoryViewer from './StoryViewer';
import ReactionPicker from './ReactionPicker';
import UserSuggestions from './UserSuggestions';
import HashtagTrends from './HashtagTrends';
import SearchAdvanced from './SearchAdvanced';
import MobileCenterMessaging from './MobileCenterMessaging';
import VideoUploader from './VideoUploader';
import StoryManager from './center/StoryManager';
import NotificationManager from './center/NotificationManager';
import GroupManager from './center/GroupManager';

interface MobileCenterProps {
  onBack: () => void;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

const MobileCenter = ({ onBack }: MobileCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'groups' | 'notifications' | 'search' | 'messages'>('feed');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [postReactions, setPostReactions] = useState<{[key: string]: {[key: string]: number}}>({});
  const [userReactions, setUserReactions] = useState<{[key: string]: string}>({});

  const mockHashtags = [
    { tag: 'ReactJS', posts_count: 15420, trend_direction: 'up' as const, change_percentage: 25 },
    { tag: 'WebDev', posts_count: 8934, trend_direction: 'up' as const, change_percentage: 12 }
  ];

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
    fetchSuggestedUsers();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const { data: postsData, error: postsError } = await supabase
        .from('center_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      console.log('Posts data:', postsData);

      // Fetch user profiles separately for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          console.log('Fetching profile for user_id:', post.user_id);
          
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', post.user_id)
            .single();

          console.log('Profile data for', post.user_id, ':', userProfile);
          console.log('Profile error:', profileError);

          if (profileError) {
            console.error('Erreur chargement profil:', profileError);
            // Return post with fallback user data
            const fallbackProfile = {
              id: post.user_id,
              full_name: 'Utilisateur Inconnu',
              username: `user_${post.user_id.slice(0, 8)}`,
              avatar_url: ''
            };
            console.log('Using fallback profile:', fallbackProfile);
            return {
              ...post,
              user_profiles: fallbackProfile
            };
          }

          const finalProfile = {
            id: userProfile.id,
            full_name: userProfile.full_name || 'Utilisateur Sans Nom',
            username: userProfile.username || `user_${userProfile.id.slice(0, 8)}`,
            avatar_url: userProfile.avatar_url || ''
          };
          console.log('Final profile:', finalProfile);

          return {
            ...post,
            user_profiles: finalProfile
          };
        })
      );

      console.log('Posts with profiles:', postsWithProfiles);
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      
      // Transform data to match UserProfile interface
      const transformedUsers: UserProfile[] = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || `user_${profile.id.slice(0, 8)}`,
        full_name: profile.full_name || 'Utilisateur',
        avatar_url: profile.avatar_url || '',
        followers_count: 0,
        following_count: 0,
        is_following: false
      }));
      
      setSuggestedUsers(transformedUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('center_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedPosts(new Set(data?.map(like => like.post_id) || []));
    } catch (error) {
      console.error('Erreur chargement likes:', error);
    }
  };

  const createPost = async (content: string, images: File[], video?: File) => {
    if (!content.trim() || !user) return;
    setPosting(true);
    try {
      const postData: any = {
        user_id: user.id,
        content: content.trim(),
        media_urls: [],
      };

      // Upload images
      if (images.length > 0) {
        const uploadResults = await Promise.all(images.map(async (img, index) => {
          const { data, error } = await supabase.storage
            .from('center-media')
            .upload(`posts/${user.id}_${Date.now()}_${index}_${img.name}`, img, { upsert: true });
          if (error) throw error;
          return supabase.storage.from('center-media').getPublicUrl(data.path).data.publicUrl;
        }));
        postData.media_urls = uploadResults;
      }

      // Upload video
      if (video) {
        const { data, error } = await supabase.storage
          .from('center-media')
          .upload(`videos/${user.id}_${Date.now()}_${video.name}`, video, { upsert: true });
        if (error) throw error;
        postData.video_url = supabase.storage.from('center-media').getPublicUrl(data.path).data.publicUrl;
      }

      const { error } = await supabase
        .from('center_posts')
        .insert(postData);

      if (error) throw error;

      fetchPosts();
      toast({
        title: "Post publié",
        description: "Votre post a été publié avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const isLiked = likedPosts.has(postId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('center_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('center_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        setLikedPosts(prev => new Set([...prev, postId]));
      }

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Erreur toggle like:', error);
    }
  };

  const sharePost = async (postId: string) => {
    const fakeUrl = `${window.location.origin}/center/post/${postId}`;
    try {
      await navigator.clipboard.writeText(fakeUrl);
      toast({
        title: "Lien copié",
        description: "Le lien du post a été copié dans le presse-papier !",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = (file: File) => {
    setShowComposer(true);
    setShowVideoUploader(false);
    // Pass video to composer
  };

  const handleReaction = async (postId: string, reaction: string) => {
    console.log('Adding reaction:', reaction, 'to post:', postId);
    setShowReactionPicker(null);
  };

  const handleSearch = (query: string, filters: any) => {
    console.log('Searching:', query, 'with filters:', filters);
    setShowAdvancedSearch(false);
  };

  const handleFollow = (userId: string) => {
    console.log('Following user:', userId);
  };

  const handleDismissUser = (userId: string) => {
    console.log('Dismissing user suggestion:', userId);
  };

  const handleHashtagClick = (hashtag: string) => {
    console.log('Clicked hashtag:', hashtag);
  };

  // Show specific views
  if (showAdvancedSearch) {
    return (
      <SearchAdvanced
        onSearch={handleSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />
    );
  }

  if (activeTab === 'messages') {
    return <MobileCenterMessaging onBack={() => setActiveTab('feed')} />;
  }

  if (activeTab === 'groups') {
    return <GroupManager onBack={() => setActiveTab('feed')} />;
  }

  if (activeTab === 'notifications') {
    return <NotificationManager onClose={() => setActiveTab('feed')} />;
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header Mobile optimisé */}
      <div className={`sticky top-0 border-b z-40 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className={`p-2 hover:bg-gray-100 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-300' : ''}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>LuvviX</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Center</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowAdvancedSearch(true)}
              className={`p-2 hover:bg-gray-100 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-300' : ''}`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`p-2 hover:bg-gray-100 rounded-full relative ${darkMode ? 'hover:bg-gray-800 text-gray-300' : ''}`}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 hover:bg-gray-100 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-300' : ''}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className={`flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {[
            { key: 'feed', label: 'Fil', icon: Home },
            { key: 'explore', label: 'Explorer', icon: TrendingUp },
            { key: 'messages', label: 'Messages', icon: Mail },
            { key: 'groups', label: 'Groupes', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative flex flex-col items-center space-y-1 ${
                activeTab === key
                  ? darkMode ? 'text-blue-400' : 'text-blue-600'
                  : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
              {activeTab === key && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-600'
                }`}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Bar */}
      {activeTab === 'feed' && (
        <StoryManager onStoryView={(storyId) => console.log('Viewed story:', storyId)} />
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'feed' && (
          <div>
            <UserSuggestions
              users={suggestedUsers}
              onFollow={handleFollow}
              onDismiss={handleDismissUser}
            />

            <HashtagTrends
              hashtags={mockHashtags}
              onHashtagClick={handleHashtagClick}
            />

            {/* Zone de composition rapide */}
            <div className={`p-4 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => setShowComposer(true)}
                className={`flex items-center space-x-3 w-full p-3 rounded-full text-left ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className={`flex-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Quoi de neuf ?
                </span>
              </button>
              
              <div className={`flex items-center justify-around mt-3 pt-3 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <button
                  onClick={() => setShowComposer(true)}
                  className="flex items-center space-x-2 text-green-500 hover:bg-green-50 px-3 py-2 rounded-full transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  onClick={() => setShowVideoUploader(true)}
                  className="flex items-center space-x-2 text-blue-500 hover:bg-blue-50 px-3 py-2 rounded-full transition-colors"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm font-medium">Vidéo</span>
                </button>
                <button
                  onClick={() => setShowComposer(true)}
                  className="flex items-center space-x-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">Position</span>
                </button>
                <button
                  onClick={() => setShowComposer(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
                >
                  Publier
                </button>
              </div>
            </div>

            {/* Feed des posts */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <Users className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Aucun post à afficher
                </h3>
                <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Soyez le premier à publier !
                </p>
                <button 
                  onClick={() => setShowComposer(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
                >
                  Créer un post
                </button>
              </div>
            ) : (
              <div>
                {posts.map((post) => {
                  console.log('Rendering post:', post.id, 'with user:', post.user_profiles);
                  return (
                    <TwitterPost
                      key={post.id}
                      post={post}
                      isLiked={likedPosts.has(post.id)}
                      isSaved={savedPosts.has(post.id)}
                      userReaction={userReactions[post.id]}
                      postReactions={postReactions[post.id]}
                      onLike={() => toggleLike(post.id)}
                      onComment={() => {}}
                      onRetweet={() => {}}
                      onShare={() => sharePost(post.id)}
                      onSave={() => {}}
                      onShowReactions={() => setShowReactionPicker(post.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-4">
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Explorer</h2>
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.full_name}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                    Suivre
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant pour composer */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50"
      >
        <Feather className="w-6 h-6" />
      </button>

      {/* Modals */}
      {showComposer && (
        <TwitterComposer
          onClose={() => setShowComposer(false)}
          onPost={createPost}
          isSubmitting={posting}
        />
      )}

      {showVideoUploader && (
        <VideoUploader
          onVideoSelect={handleVideoUpload}
          onClose={() => setShowVideoUploader(false)}
        />
      )}

      {showStoryViewer && (
        <StoryViewer
          stories={[]}
          initialIndex={0}
          onClose={() => setShowStoryViewer(false)}
        />
      )}

      {showReactionPicker && (
        <ReactionPicker
          onReact={(reaction) => handleReaction(showReactionPicker, reaction)}
          onClose={() => setShowReactionPicker(null)}
          position={{ x: 200, y: 400 }}
        />
      )}
    </div>
  );
};

export default MobileCenter;
