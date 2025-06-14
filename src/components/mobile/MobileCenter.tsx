import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Heart, MessageCircle, Share, Bell, Image as ImageIcon, MapPin, Users, Video, Feather, TrendingUp, Hash, Home, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TwitterPost from './TwitterPost';
import TwitterComposer from './TwitterComposer';

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
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'groups' | 'notifications'>('feed');
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
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
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

  const [stories, setStories] = useState<{ 
    id: string, 
    user: UserProfile, 
    media_url: string, 
    created_at: string 
  }[]>([]);
  const [myStoryUpload, setMyStoryUpload] = useState<File | null>(null);
  const [uploadingStory, setUploadingStory] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header Mobile optimisé */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LuvviX</h1>
              <p className="text-xs text-gray-500">Center</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filtres de contenu */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'feed'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fil
            {activeTab === 'feed' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'explore'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Explorer
            {activeTab === 'explore' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'groups'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Groupes
            {activeTab === 'groups' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'notifications'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Notifications
            {activeTab === 'notifications' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Stories Bar améliorée */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
          {/* Ajouter une story */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-xs mt-1 text-gray-600">Story</span>
          </div>
          
          {/* Story existante */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5">
              <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-600">dev_jane</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'feed' && (
          <div>
            {/* Zone de composition rapide */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => setShowComposer(true)}
                className="flex items-center space-x-3 w-full p-3 bg-gray-50 rounded-full text-left"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-500 flex-1">Quoi de neuf ?</span>
              </button>
              
              {/* Actions rapides */}
              <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100">
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
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun post à afficher</h3>
                <p className="text-gray-500 mb-4 text-sm">Soyez le premier à publier !</p>
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
                    onShowReactions={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Explorer</h2>
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{user.full_name}</h4>
                      <p className="text-xs text-gray-500">@{user.username}</p>
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
            <h2 className="text-lg font-bold mb-4">Groupes</h2>
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{group.name}</h4>
                        <p className="text-xs text-gray-600 mb-1">{group.description}</p>
                        <p className="text-xs text-gray-500">{group.members_count} membres</p>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      group.is_member
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          <div className="p-4">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Notifications</h3>
              <p className="text-gray-500 text-sm">Aucune notification pour le moment</p>
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

      {/* Composer Modal */}
      {showComposer && (
        <TwitterComposer
          onClose={() => setShowComposer(false)}
          onPost={createPost}
          isSubmitting={posting}
        />
      )}
    </div>
  );
};

export default MobileCenter;
