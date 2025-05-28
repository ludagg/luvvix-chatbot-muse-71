
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PostCardProps {
  post: {
    id: string;
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
  };
  onLike: () => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: fr
  });

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user_profiles?.avatar_url || ''} />
              <AvatarFallback>
                {post.user_profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.user_profiles?.full_name || 'Utilisateur'}
                </p>
                <Badge variant="luvvix" className="text-xs">
                  Vérifié
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.user_profiles?.username} • {timeAgo}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              {post.media_type === 'image' ? (
                <img
                  src={post.media_url}
                  alt="Post media"
                  className="w-full h-auto"
                />
              ) : post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  controls
                  className="w-full h-auto"
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`space-x-2 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2 text-gray-500 hover:text-blue-500">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2 text-gray-500 hover:text-green-500">
              <Share2 className="h-5 w-5" />
              <span>{post.shares_count}</span>
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-yellow-500">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
