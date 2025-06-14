
import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, Verified } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TwitterPostProps {
  post: {
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
  };
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
  onShowReactions 
}: TwitterPostProps) => {
  const [isRetweeted, setIsRetweeted] = useState(false);

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    onRetweet();
  };

  const totalReactions = Object.values(postReactions || {}).reduce((a, b) => a + b, 0) || post.likes_count;

  return (
    <article className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex p-3 space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-1 mb-1">
            <h3 className="font-bold text-gray-900 truncate">
              {post.user_profiles?.full_name || 'Utilisateur inconnu'}
            </h3>
            <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-gray-500 text-sm">@{post.user_profiles?.username || "anonyme"}</span>
            <span className="text-gray-500 text-sm">·</span>
            <time className="text-gray-500 text-sm hover:underline">
              {format(new Date(post.created_at), 'dd MMM', { locale: fr })}
            </time>
            <div className="ml-auto">
              <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Contenu du tweet */}
          <div className="mb-3">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Médias */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={`mb-3 rounded-2xl overflow-hidden border border-gray-200 ${
              post.media_urls.length === 1 ? '' :
              post.media_urls.length === 2 ? 'grid grid-cols-2 gap-1' :
              post.media_urls.length === 3 ? 'grid grid-cols-2 gap-1' :
              'grid grid-cols-2 gap-1'
            }`}>
              {post.media_urls.slice(0, 4).map((url, index) => (
                <div key={index} className={`relative ${
                  post.media_urls.length === 3 && index === 0 ? 'row-span-2' : ''
                } ${post.media_urls.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                  <img 
                    src={url} 
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {post.media_urls.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{post.media_urls.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vidéo */}
          {post.video_url && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200">
              <div className="aspect-video bg-black flex items-center justify-center">
                <button className="w-16 h-16 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                  <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1"></div>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Réponses */}
            <button 
              onClick={onComment}
              className="flex items-center space-x-2 group hover:bg-blue-50 p-2 rounded-full transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
              {post.comments_count > 0 && (
                <span className="text-sm text-gray-500 group-hover:text-blue-500">
                  {post.comments_count}
                </span>
              )}
            </button>

            {/* Retweet */}
            <button 
              onClick={handleRetweet}
              className={`flex items-center space-x-2 group hover:bg-green-50 p-2 rounded-full transition-colors ${
                isRetweeted ? 'text-green-500' : ''
              }`}
            >
              <Repeat2 className={`w-5 h-5 ${isRetweeted ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`} />
              {isRetweeted && <span className="text-sm text-green-500">1</span>}
            </button>

            {/* J'aime */}
            <button 
              onClick={userReaction ? onShowReactions : onLike}
              className={`flex items-center space-x-2 group hover:bg-red-50 p-2 rounded-full transition-colors ${
                isLiked || userReaction ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-5 h-5 ${
                isLiked || userReaction ? 'text-red-500 fill-current' : 'text-gray-500 group-hover:text-red-500'
              }`} />
              {totalReactions > 0 && (
                <span className={`text-sm ${isLiked || userReaction ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}>
                  {totalReactions}
                </span>
              )}
            </button>

            {/* Partager */}
            <button 
              onClick={onShare}
              className="flex items-center space-x-2 group hover:bg-blue-50 p-2 rounded-full transition-colors"
            >
              <Share className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
            </button>

            {/* Sauvegarder */}
            <button 
              onClick={onSave}
              className="group hover:bg-blue-50 p-2 rounded-full transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${
                isSaved ? 'text-blue-500 fill-current' : 'text-gray-500 group-hover:text-blue-500'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TwitterPost;
