
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserBadgeComponent from '@/components/ui/user-badge';
import { useBadges } from '@/hooks/use-badges';
import { Heart, MessageCircle, Share, MoreHorizontal, Plus } from 'lucide-react';

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
}

const MobileCenter = () => {
  const { user, profile } = useAuth();
  const { getTopBadges } = useBadges();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const userBadges = getTopBadges(2);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Simulate loading posts with real user data structure
      const mockPosts: Post[] = [
        {
          id: '1',
          user: {
            id: user?.id || '1',
            username: profile?.username || 'user',
            full_name: user?.user_metadata?.full_name || profile?.full_name || 'Utilisateur',
            avatar_url: user?.user_metadata?.avatar_url || profile?.avatar_url
          },
          content: "Découverte de l'interface cognitive de LuvviX ! L'IA prédit vraiment mes besoins avant même que j'y pense 🤯",
          created_at: new Date().toISOString(),
          likes_count: 12,
          comments_count: 3,
          media_urls: []
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
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
          
          <p className="text-sm text-gray-500 mb-2">@{post.user.username}</p>
          
          <p className="text-gray-900 mb-3">{post.content}</p>
          
          <div className="flex items-center justify-between text-gray-500">
            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.user_metadata?.avatar_url || profile?.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-white/20 text-white">
                {(user?.user_metadata?.full_name || profile?.full_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  {user?.user_metadata?.full_name || profile?.full_name || 'Utilisateur'}
                </h2>
                {userBadges.slice(0, 2).map(badge => (
                  <UserBadgeComponent key={badge.id} badge={badge} size="sm" />
                ))}
              </div>
              <p className="text-blue-100 text-sm">@{profile?.username || 'utilisateur'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="pb-20">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bienvenue sur LuvviX Center</h3>
            <p className="text-gray-500 text-sm">Commencez à partager vos expériences avec la communauté !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCenter;
