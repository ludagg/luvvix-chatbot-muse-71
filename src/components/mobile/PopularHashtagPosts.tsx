
import React from 'react';
import { TwitterPost } from './TwitterPost';

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

interface PopularHashtagPostsProps {
  posts: Post[];
  hashtag: string;
  onComment: (postId: string) => void;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  onUserClick?: (userId: string) => void;
}

const PopularHashtagPosts: React.FC<PopularHashtagPostsProps> = ({
  posts, hashtag, onComment, onLike, onShare, isLiked, isSaved, onUserClick
}) => {
  if (!hashtag) return null;
  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">Aucun post populaire pour <span className="font-bold text-blue-700">#{hashtag}</span></div>
    );
  }
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2 text-blue-700">Posts populaires pour <span className="font-bold">#{hashtag}</span></h2>
      <div className="space-y-4">
        {posts.map(post => (
          <TwitterPost
            key={post.id}
            post={post}
            isLiked={isLiked(post.id)}
            isSaved={isSaved(post.id)}
            onComment={() => onComment(post.id)}
            onLike={() => onLike(post.id)}
            onShare={() => onShare(post.id)}
            onRetweet={() => {}}
            onSave={() => {}}
            userReaction={undefined}
            postReactions={undefined}
            onShowReactions={() => {}}
            onUserClick={onUserClick ? () => onUserClick(post.user_profiles?.id || post.user_id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularHashtagPosts;

