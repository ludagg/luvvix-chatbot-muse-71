
import React from 'react';
import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, Play } from 'lucide-react';

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

interface TwitterPostProps {
  post: Post;
  isLiked: boolean;
  isSaved: boolean;
  userReaction?: string;
  postReactions?: {[key: string]: number};
  onLike: () => void;
  onComment: () => void;
  onRetweet: () => void;
  onShare: () => void;
  onSave: () => void;
  onShowReactions: () => void;
  onUserClick?: () => void;
}

const TwitterPost = ({
  post,
  isLiked,
  isSaved,
  userReaction,
  postReactions,
  onLike,
  onComment,
  onRetweet,
  onShare,
  onSave,
  onShowReactions,
  onUserClick
}: TwitterPostProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}j`;
    }
  };

  const handleUserClick = () => {
    console.log('User clicked for post:', post);
    console.log('User profiles:', post.user_profiles);
    console.log('User ID to navigate to:', post.user_profiles?.id || post.user_id);
    
    if (onUserClick) {
      onUserClick();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      {/* Header */}
      <div className="flex items-start space-x-3">
        <button 
          onClick={handleUserClick}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleUserClick}
              className="text-left"
            >
              <h4 className="font-bold text-gray-900 text-sm truncate hover:underline">
                {post.user_profiles?.full_name || 'Utilisateur'}
              </h4>
            </button>
            <button 
              onClick={handleUserClick}
              className="text-gray-500 text-sm hover:underline"
            >
              @{post.user_profiles?.username || 'username'}
            </button>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
          </div>
          
          {/* Content */}
          <div className="mt-2">
            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {post.media_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt=""
                    className="w-full h-32 object-cover bg-gray-100"
                  />
                ))}
              </div>
            )}
            
            {/* Video */}
            {post.video_url && (
              <div className="mt-3 relative bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex items-center justify-center">
                  <button className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                    <Play className="w-8 h-8 text-gray-800 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={onComment}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>
            
            <button
              onClick={onRetweet}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <Repeat2 className="w-5 h-5" />
              <span className="text-sm font-medium">0</span>
            </button>
            
            <button
              onClick={onLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>
            
            <button
              onClick={onShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
            
            <button
              onClick={onSave}
              className={`text-gray-500 hover:text-yellow-500 transition-colors ${
                isSaved ? 'text-yellow-500' : ''
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TwitterPost;
