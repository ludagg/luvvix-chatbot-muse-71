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
import NotificationCenter from './NotificationCenter';
import HashtagTrends from './HashtagTrends';
import SearchAdvanced from './SearchAdvanced';

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
    email?: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string;
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

interface Group {
  id: string;
  name: string;
  description: string;
  members_count: number;
  avatar_url?: string;
  is_member: boolean;
}

const MobileCenter = ({ onBack }: MobileCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'groups' | 'notifications' | 'search'>('feed');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);

  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [contentFilter, setContentFilter] = useState<'recent' | 'popular' | 'friends'>('recent');
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [postReactions, setPostReactions] = useState<{[key: string]: {[key: string]: number}}>({});
  const [userReactions, setUserReactions] = useState<{[key: string]: string}>({});

  const reactions = [
    { emoji: '❤️', name: 'love', color: 'text-red-500' },
    { emoji: '👍', name: 'like', color: 'text-blue-500' },
    { emoji: '😂', name: 'laugh', color: 'text-yellow-500' },
    { emoji: '😮', name: 'wow', color: 'text-orange-500' },
    { emoji: '😢', name: 'sad', color: 'text-blue-400' },
    { emoji: '😡', name: 'angry', color: 'text-red-600' }
  ];

  const mockStories = [
    {
      id: '1',
      user: { id: '1', username: 'dev_jane', full_name: 'Jane Developer', avatar_url: '' },
      media_url: '/placeholder.svg',
      media_type: 'image' as const,
      created_at: new Date().toISOString(),
      duration: 5000
    }
  ];

  const mockNotifications = [
    {
      id: '1',
      type: 'like' as const,
      user: { id: '2', username: 'tech_user', full_name: 'Tech User', avatar_url: '' },
      created_at: new Date().toISOString(),
      is_read: false
    }
  ];

  const mockHashtags = [
    { tag: 'ReactJS', posts_count: 15420, trend_direction: 'up' as const, change_percentage: 25 },
    { tag: 'WebDev', posts_count: 8934, trend_direction: 'up' as const, change_percentage: 12 }
  ];

  const mockSuggestedUsers = [
    {
      id: '3',
      username: 'designer_pro',
      full_name: 'Pro Designer',
      avatar_url: '',
      followers_count: 1234,
      is_following: false
    }
  ];

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
    fetchSuggestedUsers();
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('center_posts')
        .select(`
          *,
          user_profiles: user_id (
            id,
            full_name,
            username,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
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
        .from('center_profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Développeurs JavaScript',
          description: 'Communauté de développeurs passionnés',
          members_count: 1247,
          is_member: false
        },
        {
          id: '2',
          name: 'Design UI/UX',
          description: 'Partage et discussions sur le design',
          members_count: 892,
          is_member: true
        },
        {
          id: '3',
          name: 'LuvviX Supporters',
          description: 'Groupe officiel des utilisateurs LuvviX',
          members_count: 3456,
          is_member: false
        }
      ];
      setGroups(mockGroups);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
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

  const createPost = async (content: string, images: File[]) => {
    if (!content.trim() || !user) return;
    setPosting(true);
    try {
      const postData: any = {
        user_id: user.id,
        content: content.trim(),
        media_urls: [],
      };

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

  const handleStoryUpload = async (file: File) => {
    // Story upload logic
    console.log('Uploading story:', file);
    toast({
      title: "Story ajoutée",
      description: "Votre story a été publiée avec succès"
    });
  };

  const handleReaction = async (postId: string, reaction: string) => {
    // Reaction logic
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

  const handleMarkNotificationAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
  };

  const handleMarkAllNotificationsAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const handleHashtagClick = (hashtag: string) => {
    console.log('Clicked hashtag:', hashtag);
  };

  if (showAdvancedSearch) {
    return (
      <SearchAdvanced
        onSearch={handleSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />
    );
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
            { key: 'groups', label: 'Groupes', icon: Users },
            { key: 'notifications', label: 'Notifications', icon: Bell }
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

      {/* Stories Bar améliorée */}
      {activeTab === 'feed' && (
        <div className={`border-b p-3 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
            {/* Ajouter une story */}
            <div className="flex flex-col items-center flex-shrink-0">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleStoryUpload(e.target.files[0])}
                className="hidden"
                id="story-upload"
              />
              <label htmlFor="story-upload" className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
              }`}>
                <Camera className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </label>
              <span className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Votre story</span>
            </div>
            
            {/* Stories existantes */}
            {mockStories.map((story, index) => (
              <div key={story.id} className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => setShowStoryViewer(true)}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5"
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-800' : 'bg-blue-500'
                  }`}>
                    <span className="text-white font-bold text-sm">
                      {story.user.username[0].toUpperCase()}
                    </span>
                  </div>
                </button>
                <span className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {story.user.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'feed' && (
          <div>
            {/* User suggestions */}
            <UserSuggestions
              users={mockSuggestedUsers}
              onFollow={handleFollow}
              onDismiss={handleDismissUser}
            />

            {/* Hashtag trends */}
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
              
              {/* Actions rapides */}
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
                  onClick={() => setShowComposer(true)}
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
                {posts.map((post) => (
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

        {activeTab === 'groups' && (
          <div className="p-4">
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Groupes</h2>
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className={`p-3 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {group.name}
                        </h4>
                        <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {group.description}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {group.members_count} membres
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      group.is_member
                        ? darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}>
                      {group.is_member ? 'Membre' : 'Rejoindre'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter
            notifications={mockNotifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          />
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

      {showStoryViewer && (
        <StoryViewer
          stories={mockStories}
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
