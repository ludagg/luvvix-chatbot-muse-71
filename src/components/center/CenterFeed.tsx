import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import UserDiscovery from './UserDiscovery';
import ActivityFeed from './ActivityFeed';
import CommunityStats from './CommunityStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Users, Activity, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
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

const CenterFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

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

  useEffect(() => {
    fetchPosts();

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
          media_urls: postData.media_urls || null
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

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
              {/* Post Creator */}
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

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        Aucun post à afficher. Soyez le premier à publier !
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onUpdate={fetchPosts}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
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
