import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, Bell, Image as ImageIcon, MapPin, Users, Video, Feather, TrendingUp, Hash, Home, Mail, Camera, Bookmark, Settings, Moon, Sun, UserPlus } from 'lucide-react';
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
import CommentsModal from './center/CommentsModal';
import FriendshipManager from './center/FriendshipManager';
import MessagingManager from './center/MessagingManager';
import UserProfileModal from './center/UserProfileModal';
import PopularHashtagPosts from './PopularHashtagPosts';
import { extractHashtags, extractMentions } from '@/utils/extractTagsAndMentions';

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
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'groups' | 'notifications' | 'search' | 'messages' | 'friends'>('feed');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Set<string>>(new Set());
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

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

  const [searchModalQuery, setSearchModalQuery] = useState<{show: boolean, initial?: string}>({show: false});

  const handleShowSearch = () => setSearchModalQuery({ show: true });
  const handleCloseSearch = () => setSearchModalQuery({ show: false });

  const handleShowPost = (postId: string) => {
    setSearchModalQuery({ show: false });
    setTimeout(() => {
      setShowCommentsModal(postId);  // Affiche le post sélectionné (peut être amélioré pour ouvrir une vue dédiée post)
    }, 100); // petite latence pour la transition
  };

  const handleShowUserProfile = (userId: string) => {
    setSearchModalQuery({ show: false });
    setTimeout(() => {
      setShowUserProfile(userId);
    }, 100);
  };

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
    fetchSuggestedUsers();
  }, []);

  const fetchPosts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Récupérer les amis de l'utilisateur
      const { data: friendships, error: friendError } = await supabase
        .from('center_friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendError) {
        console.error('Erreur récupération amitiés:', friendError);
        // Continuer sans amis si erreur
      }

      // Extraire les IDs des amis
      const friendIds = (friendships || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      
      // TOUJOURS inclure l'utilisateur actuel pour voir ses propres posts
      const allowedUserIds = [...friendIds, user.id];

      console.log('Allowed user IDs:', allowedUserIds);

      // Récupérer les posts des amis ET de l'utilisateur
      let query = supabase
        .from('center_posts')
        .select('*')
        .in('user_id', allowedUserIds)
        .order('created_at', { ascending: false })
        .limit(20);

      // Si un hashtag est sélectionné, filtrer par hashtag
      if (selectedHashtag) {
        // Récupérer les ids des posts via la table de liaison et ce hashtag (en minuscule)
        const { data: hashtagRow } = await supabase
          .from('center_hashtags')
          .select('id')
          .eq('tag', selectedHashtag.toLowerCase())
          .maybeSingle();
        if (hashtagRow && hashtagRow.id) {
          const { data: mappingRows } = await supabase
            .from('center_post_hashtags')
            .select('post_id')
            .eq('hashtag_id', hashtagRow.id);
          const postIds = mappingRows?.map(row => row.post_id) ?? [];
          if (postIds.length > 0) {
            query = supabase
              .from('center_posts')
              .select('*')
              .in('id', postIds)
              .order('created_at', { ascending: false });
          } else {
            setPosts([]); setLoading(false); return;
          }
        } else {
          setPosts([]); setLoading(false); return;
        }
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;
      console.log('Posts data:', postsData);

      // Récupérer les profils utilisateur avec gestion d'erreur améliorée
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id, full_name, username, avatar_url')
              .eq('id', post.user_id)
              .maybeSingle();

            if (profileError) {
              console.error('Erreur chargement profil pour', post.user_id, ':', profileError);
            }

            // Créer un profil par défaut si aucune donnée ou erreur
            const fallbackProfile = {
              id: post.user_id,
              full_name: userProfile?.full_name || 'Utilisateur',
              username: userProfile?.username || `user_${post.user_id.slice(0, 8)}`,
              avatar_url: userProfile?.avatar_url || ''
            };

            console.log('Profil final pour', post.user_id, ':', fallbackProfile);

            return { ...post, user_profiles: fallbackProfile };
          } catch (error) {
            console.error('Erreur traitement profil:', error);
            // Profil de secours en cas d'erreur
            return { 
              ...post, 
              user_profiles: {
                id: post.user_id,
                full_name: 'Utilisateur',
                username: `user_${post.user_id.slice(0, 8)}`,
                avatar_url: ''
              }
            };
          }
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
    if (!user) return;

    try {
      // Récupérer tous les users sauf soi-même
      const { data: profiles, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);

      if (userError) {
        console.error('Erreur chargement utilisateurs suggérés:', userError);
        return;
      }

      // Vérifier ceux déjà suivis
      const { data: followingData, error: followsErr } = await supabase
        .from('center_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingSet = new Set((followingData ?? []).map(f => f.following_id));

      const transformedUsers: UserProfile[] = (profiles || []).map(profile => ({
        ...profile,
        username: profile.username || `user_${profile.id.slice(0, 8)}`,
        full_name: profile.full_name || 'Utilisateur',
        avatar_url: profile.avatar_url || '',
        followers_count: 0,
        following_count: 0,
        is_following: followingSet.has(profile.id)
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

      // Sauver le post
      const { data: inserted, error } = await supabase
        .from('center_posts')
        .insert(postData)
        .select()
        .maybeSingle();

      if (error || !inserted) throw error || new Error('Insertion post échouée');

      // --- Ajout : hashtags ---
      const hashtags = extractHashtags(content);
      for (const tag of hashtags) {
        // Upsert le hashtag
        const { data: hash, error: hashtagErr } = await supabase
          .from('center_hashtags')
          .upsert([
            { tag, posts_count: 1, last_used: new Date().toISOString() }
          ], { onConflict: 'tag', ignoreDuplicates: false })
          .select()
          .maybeSingle();
        // Incrémente le compteur si déjà existant
        if (!hashtagErr && hash && hash.id) {
          await supabase.rpc('increment_hashtag_count', { tag_val: tag });
          await supabase
            .from('center_post_hashtags')
            .insert({
              post_id: inserted.id,
              hashtag_id: hash.id
            });
        }
      }

      // --- Ajout : notifs de mention ---
      const mentions = extractMentions(content);
      if (mentions.length > 0) {
        const { data: userProfiles } = await supabase
          .from('user_profiles')
          .select('id,username')
          .in('username', mentions.map(x => x.toLowerCase()));

        for (const profile of userProfiles ?? []) {
          await supabase.from('center_notifications').insert({
            user_id: profile.id,
            type: 'mention',
            post_id: inserted.id,
            triggered_by: user.id,
            content: content
          });
        }
      }

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

  const handleFollow = async (userId: string, isCurrentlyFollowing?: boolean) => {
    if (!user) return;
    // Désabonner
    if (isCurrentlyFollowing) {
      const { error } = await supabase
        .from('center_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'arrêter de suivre cet utilisateur",
          variant: "destructive"
        });
        return;
      }

      setSuggestedUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, is_following: false } : u
        )
      );
      toast({
        title: "Abonnement supprimé",
        description: "Vous ne suivez plus cet utilisateur"
      });
    } else {
      // S'abonner
      const { error } = await supabase
        .from('center_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de suivre cet utilisateur",
          variant: "destructive"
        });
        return;
      }

      setSuggestedUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, is_following: true } : u
        )
      );
      toast({
        title: "Utilisateur suivi",
        description: "Vous suivez maintenant cet utilisateur"
      });
    }
  };

  const handleDismissUser = (userId: string) => {
    console.log('Dismissing user suggestion:', userId);
  };

  const handleHashtagClick = (hashtag: string) => {
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
    } else {
      setSelectedHashtag(hashtag);
    }
  };

  const handleUserClick = (userId: string) => {
    console.log('Ouverture du profil utilisateur :', userId);
    setShowUserProfile(userId);
  };

  // Ajout : calculer posts populaires selon le hashtag sélectionné
  const popularHashtagPosts = React.useMemo(() => {
    if (!selectedHashtag) return [];
    // Filtre posts contenant ce hashtag et trie par likes décroissant
    return posts
      .filter((post) => {
        const contentTags = (post.content.match(/#([a-zA-Z0-9_]{1,40})/g) || []).map(tag => tag.substring(1).toLowerCase());
        return contentTags.includes(selectedHashtag.toLowerCase());
      })
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 10); // Top 10
  }, [selectedHashtag, posts]);

  // Show specific views
  if (showAdvancedSearch) {
    return (
      <SearchAdvanced
        onSearch={(query, filters) => console.log('Searching:', query, 'with filters:', filters)}
        onClose={() => setShowAdvancedSearch(false)}
      />
    );
  }

  if (activeTab === 'messages') {
    return <MessagingManager onClose={() => setActiveTab('feed')} />;
  }

  if (activeTab === 'groups') {
    return <GroupManager onBack={() => setActiveTab('feed')} />;
  }

  if (activeTab === 'notifications') {
    return <NotificationManager onClose={() => setActiveTab('feed')} />;
  }

  if (activeTab === 'friends') {
    return <FriendshipManager onClose={() => setActiveTab('feed')} />;
  }

  if (showCommentsModal) {
    return <CommentsModal postId={showCommentsModal} onClose={() => setShowCommentsModal(null)} />;
  }

  if (showUserProfile) {
    return <UserProfileModal userId={showUserProfile} onClose={() => setShowUserProfile(null)} />;
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
              onClick={() => setActiveTab('friends')}
              className={`p-2 hover:bg-gray-100 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-300' : ''}`}
            >
              <UserPlus className="w-5 h-5" />
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

      {/* Stories Bar - only show for friends */}
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
              onDismiss={(userId) => setSuggestedUsers(prev => prev.filter(u => u.id !== userId))}
              onUserClick={handleUserClick}
            />

            <HashtagTrends
              onHashtagClick={handleHashtagClick}
              selectedHashtag={selectedHashtag}
            />
            {selectedHashtag && (
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded mb-2 flex items-center gap-2">
                <Hash /> <span>#</span>
                <span className="font-bold">{selectedHashtag}</span>
                <button
                  onClick={() => setSelectedHashtag(null)}
                  className="ml-2 px-2 py-0.5 bg-blue-200 rounded text-xs text-blue-900 hover:bg-blue-300"
                >Réinitialiser le filtre</button>
              </div>
            )}

            {/* Section posts populaires pour le hashtag sélectionné */}
            {selectedHashtag && (
              <PopularHashtagPosts
                posts={popularHashtagPosts}
                hashtag={selectedHashtag}
                onComment={(postId) => setShowCommentsModal(postId)}
                onLike={toggleLike}
                onShare={sharePost}
                isLiked={postId => likedPosts.has(postId)}
                isSaved={postId => savedPosts.has(postId)}
                onUserClick={handleUserClick}
              />
            )}

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
                  Connectez-vous avec des amis pour voir leurs posts !
                </p>
                <button 
                  onClick={() => setActiveTab('friends')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
                >
                  Trouver des amis
                </button>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <TwitterPost
                    key={post.id}
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    isSaved={savedPosts.has(post.id)}
                    userReaction={userReactions[post.id]}
                    postReactions={postReactions[post.id]}
                    onLike={() => toggleLike(post.id)}
                    onComment={() => setShowCommentsModal(post.id)}
                    onRetweet={() => {}}
                    onShare={() => sharePost(post.id)}
                    onSave={() => {}}
                    onShowReactions={() => setShowReactionPicker(post.id)}
                    onUserClick={() => handleUserClick(post.user_profiles?.id || post.user_id)}
                  />
                ))}
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
                  <button 
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
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
                  </button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      user.is_following
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    onClick={() => handleFollow(user.id, user.is_following)}
                  >
                    {user.is_following ? 'Suivi' : 'Suivre'}
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

      {/* Modale de recherche réelle */}
      {searchModalQuery.show && (
        <SearchAdvanced
          onSearch={() => {}} // La recherche est gérée dans le composant maintenant
          onClose={handleCloseSearch}
          showResultsInModal
          onShowPost={handleShowPost}
          onShowUser={handleShowUserProfile}
        />
      )}

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
