
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserBadgeComponent from '@/components/ui/user-badge';
import { useBadges } from '@/hooks/use-badges';
import { 
  Heart, MessageCircle, Share, MoreHorizontal, Plus, Search, 
  Users, Video, Camera, Mic, Phone, Bell, Settings,
  Bookmark, TrendingUp, Globe, Lock, Image, Smile,
  Send, Eye, Play, Pause, VolumeX, Volume2
} from 'lucide-react';
import StoryManager from './center/StoryManager';
import MessagingManager from './center/MessagingManager';
import FriendshipManager from './center/FriendshipManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  media_urls?: string[];
  video_url?: string;
  is_liked?: boolean;
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

const MobileCenter = () => {
  const { user, profile } = useAuth();
  const { getTopBadges } = useBadges();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'following'>('feed');
  const [showMessaging, setShowMessaging] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const userBadges = getTopBadges(2);

  useEffect(() => {
    if (user) {
      loadPosts();
      loadStories();
    }
  }, [user, activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('center_posts')
        .select(`
          *,
          user_profiles!inner(username, full_name, avatar_url),
          center_likes!left(id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeTab === 'following') {
        // Récupérer les posts des amis uniquement
        const { data: friendships } = await supabase
          .from('center_friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${user?.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted');

        const friendIds = (friendships || []).map(f => 
          f.requester_id === user?.id ? f.addressee_id : f.requester_id
        );

        if (friendIds.length > 0) {
          query = query.in('user_id', friendIds);
        } else {
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      const { data: postsData, error } = await query;

      if (error) throw error;

      const formattedPosts: Post[] = (postsData || []).map(post => ({
        id: post.id,
        user: {
          id: post.user_id,
          username: post.user_profiles?.username || 'utilisateur',
          full_name: post.user_profiles?.full_name || 'Utilisateur',
          avatar_url: post.user_profiles?.avatar_url
        },
        content: post.content,
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        media_urls: post.media_urls,
        video_url: post.video_url,
        is_liked: post.center_likes && post.center_likes.length > 0
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const { data: storiesData, error } = await supabase
        .from('center_stories')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStories(storiesData || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && selectedMedia.length === 0) return;
    if (!user) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('center_posts')
        .insert({
          user_id: user.id,
          content: newPost.trim() || '',
          media_urls: selectedMedia.length > 0 ? ['placeholder'] : null
        });

      if (error) throw error;

      setNewPost('');
      setSelectedMedia([]);
      loadPosts();
      
      toast({
        title: "Succès",
        description: "Post publié avec succès !",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('center_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('center_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Mettre à jour l'état local
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                is_liked: !p.is_liked,
                likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleStoryView = (storyId: string) => {
    // Marquer la story comme vue
    if (user) {
      supabase
        .from('center_story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id
        })
        .then(() => {
          // Optionnel: rafraîchir les stories
        });
    }
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedMedia(prev => [...prev, ...files].slice(0, 4)); // Max 4 médias
  };

  const PostCard = ({ post }: { post: Post }) => (
    <div className="bg-white border-b border-gray-100 p-4">
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user.avatar_url} alt={post.user.full_name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {post.user.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{post.user.full_name}</h3>
              {post.user.id === user?.id && userBadges.slice(0, 1).map(badge => (
                <UserBadgeComponent key={badge.id} badge={badge} size="sm" />
              ))}
            </div>
            <button className="p-1">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-2">@{post.user.username} • {new Date(post.created_at).toLocaleDateString()}</p>
          
          {post.content && <p className="text-gray-900 mb-3">{post.content}</p>}
          
          {/* Médias */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <div className="bg-gray-100 aspect-video flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          )}

          {post.video_url && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <div className="bg-black aspect-video flex items-center justify-center relative">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-gray-500">
            <button 
              onClick={() => handleLikePost(post.id)}
              className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
                post.is_liked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>

            <button className="flex items-center space-x-2 hover:text-purple-500 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showMessaging) {
    return <MessagingManager onClose={() => setShowMessaging(false)} />;
  }

  if (showFriends) {
    return <FriendshipManager onClose={() => setShowFriends(false)} />;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">LuvviX Center</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFriends(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowMessaging(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stories */}
      <StoryManager onStoryView={handleStoryView} />

      {/* Tabs de navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {(['feed', 'discover', 'following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {tab === 'feed' && 'Accueil'}
              {tab === 'discover' && 'Découvrir'}
              {tab === 'following' && 'Abonnements'}
            </button>
          ))}
        </div>
      </div>

      {/* Créateur de post */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.user_metadata?.avatar_url || profile?.avatar_url} alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {(user?.user_metadata?.full_name || profile?.full_name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Que voulez-vous partager ?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            
            {selectedMedia.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMedia.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                    <button
                      onClick={() => setSelectedMedia(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                  <Camera className="w-5 h-5 text-gray-500 hover:text-blue-500" />
                </label>
                <button className="hover:text-blue-500">
                  <Video className="w-5 h-5 text-gray-500" />
                </button>
                <button className="hover:text-blue-500">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && selectedMedia.length === 0) || isPosting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {activeTab === 'following' ? 'Aucun post d\'amis' : 'Aucun post disponible'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'following' 
                ? 'Ajoutez des amis pour voir leurs publications !' 
                : 'Soyez le premier à partager quelque chose !'}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default MobileCenter;
