
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Heart, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
}

const CommentsModal = ({ postId, onClose }: CommentsModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('center_post_comments')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('center_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast.success('Commentaire ajouté');
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      toast.error('Impossible d\'ajouter le commentaire');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Commentaires</h1>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">Aucun commentaire pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {comment.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.user_profiles?.full_name || comment.user_profiles?.username || 'Utilisateur'}
                      </span>
                    </div>
                    <p className="text-gray-900">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 ml-3">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">J'aime</span>
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Répondre
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrivez un commentaire..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim() || posting}
              className="p-2 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
