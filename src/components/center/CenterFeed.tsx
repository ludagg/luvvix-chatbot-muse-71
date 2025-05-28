
import React, { useState, useEffect } from 'react';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user_profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

const CenterFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('center_posts')
        .select(`
          *,
          user_profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les posts"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (postData: any) => {
    try {
      const { data, error } = await supabase
        .from('center_posts')
        .insert([{
          user_id: user?.id,
          content: postData.content,
          media_url: postData.media_url,
          media_type: postData.media_type
        }])
        .select(`
          *,
          user_profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      toast({
        title: "Post publié",
        description: "Votre post a été publié avec succès"
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier le post"
      });
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('center_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Remove like
        await supabase
          .from('center_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);

        // Update post likes count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Add like
        await supabase
          .from('center_post_likes')
          .insert([{ post_id: postId, user_id: user?.id }]);

        // Update post likes count
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      // Refresh posts
      fetchPosts();
    } catch (error: any) {
      console.error('Error handling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <PostCreator onPostCreated={handleNewPost} />
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun post à afficher. Soyez le premier à partager quelque chose !
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CenterFeed;
