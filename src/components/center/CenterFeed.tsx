
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import UserDiscovery from './UserDiscovery';
import ActivityFeed from './ActivityFeed';
import CommunityStats from './CommunityStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Activity, BarChart3, UserPlus, Video, Heart, MessageCircle, Share, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

const CenterFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('center_posts')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les posts"
        });
        return;
      }

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  useEffect(() => {
    fetchPosts();
    fetchSuggestedUsers();
    fetchLikedPosts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'center_posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePostCreated = async (postData: any) => {
    try {
      const { error } = await supabase
        .from('center_posts')
        .insert({
          user_id: user?.id,
          content: postData.content,
          media_urls: postData.media_urls || null,
          video_url: postData.video_url || null
        });

      if (error) throw error;

      toast({
        title: "Post publié",
        description: "Votre post a été publié avec succès"
      });

      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier le post"
      });
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

  const toggleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const { data: existingFollow, error: checkError } = await supabase
        .from('center_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingFollow) {
        const { error } = await supabase
          .from('center_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        toast({ title: "Utilisateur non suivi" });
      } else {
        const { error } = await supabase
          .from('center_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        toast({ title: "Utilisateur suivi" });
      }

      fetchSuggestedUsers();
    } catch (error) {
      console.error('Erreur toggle follow:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderEnhancedPost = (post: Post) => (
    <Card key={post.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user_profiles?.avatar_url || ''} />
              <AvatarFallback>
                {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{post.user_profiles?.full_name || 'Utilisateur'}</h4>
              <p className="text-xs text-gray-500">@{post.user_profiles?.username}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {format(new Date(post.created_at), 'dd MMM HH:mm', { locale: fr })}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-900 mb-3">{post.content}</p>
        
        {/* Vidéo si présente */}
        {post.video_url && (
          <div className="mb-3 relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-video flex items-center justify-center">
              <button className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-6 pt-3 border-t">
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center space-x-2 transition-colors ${
              likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes_count}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments_count}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Fil d'actualité
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Users className="h-4 w-4" />
            Découvrir
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activité
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Communauté
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Post Creator amélioré */}
              <PostCreator onPostCreated={handlePostCreated} />

              {/* Refresh Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>

              {/* Posts Feed amélioré */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Aucun post à afficher. Soyez le premier à publier !
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map(renderEnhancedPost)
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Utilisateurs suggérés */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Utilisateurs suggérés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={suggestedUser.avatar_url || ''} />
                          <AvatarFallback>
                            {suggestedUser.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{suggestedUser.full_name}</p>
                          <p className="text-xs text-gray-500">@{suggestedUser.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFollow(suggestedUser.id)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Suivre
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <CommunityStats />
              <ActivityFeed />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discover">
          <UserDiscovery />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed />
        </TabsContent>

        <TabsContent value="stats">
          <CommunityStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CenterFeed;
