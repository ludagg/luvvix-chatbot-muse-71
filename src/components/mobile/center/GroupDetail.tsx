
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Send, Users, Settings, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members_count: number;
  is_private: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
}

interface GroupPost {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user_profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

const GroupDetail = ({ groupId, onBack }: GroupDetailProps) => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchGroupData();
    fetchPosts();
    fetchMembers();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('center_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Vérifier le rôle de l'utilisateur
      const { data: memberData } = await supabase
        .from('center_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user?.id)
        .single();

      setGroup({
        ...groupData,
        user_role: memberData?.role
      });
    } catch (error) {
      console.error('Erreur chargement groupe:', error);
      toast.error('Impossible de charger le groupe');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('center_group_posts')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('center_group_members')
        .select(`
          *,
          user_profiles(username, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('center_group_posts')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newPost.trim()
        });

      if (error) throw error;

      setNewPost('');
      fetchPosts();
      toast.success('Post publié dans le groupe');
    } catch (error) {
      console.error('Erreur création post:', error);
      toast.error('Impossible de publier le post');
    } finally {
      setPosting(false);
    }
  };

  const changeMemberRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      const { error } = await supabase
        .from('center_group_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
      toast.success('Rôle modifié avec succès');
    } catch (error) {
      console.error('Erreur modification rôle:', error);
      toast.error('Impossible de modifier le rôle');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('center_group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
      toast.success('Membre retiré du groupe');
    } catch (error) {
      console.error('Erreur retrait membre:', error);
      toast.error('Impossible de retirer le membre');
    }
  };

  if (loading || !group) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{group.name}</h1>
            <p className="text-xs text-gray-500">{group.members_count} membres</p>
          </div>
        </div>
        {(group.user_role === 'admin' || group.user_role === 'moderator') && (
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'posts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Publications
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'members'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Membres
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'posts' && (
          <div>
            {/* Post Creator */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Partagez quelque chose avec le groupe..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={createPost}
                      disabled={!newPost.trim() || posting}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{posting ? 'Publication...' : 'Publier'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4 p-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune publication dans ce groupe</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-sm">
                            {post.user_profiles?.full_name || post.user_profiles?.username || 'Utilisateur'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mt-1">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{post.likes_count} j'aime</span>
                          <span>{post.comments_count} commentaires</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-4 space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {member.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {member.user_profiles?.full_name || member.user_profiles?.username || 'Utilisateur'}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>
                
                {(group.user_role === 'admin' && member.user_id !== user?.id) && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={member.role}
                      onChange={(e) => changeMemberRole(member.id, e.target.value as any)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="member">Membre</option>
                      <option value="moderator">Modérateur</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
