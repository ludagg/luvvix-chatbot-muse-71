
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, MessageCircle, Plus, MoreVertical, Crown, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  creator_id: string;
  is_private: boolean;
  members_count: number;
  created_at: string;
  user_role?: 'admin' | 'moderator' | 'member';
}

interface GroupPost {
  id: string;
  content: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupMember {
  id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail = ({ groupId, onBack }: GroupDetailProps) => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'settings'>('posts');
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      // Récupérer les infos du groupe
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

      // Récupérer les posts du groupe
      const { data: postsData, error: postsError } = await supabase
        .from('center_group_posts')
        .select(`
          *,
          user_profiles!inner(username, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Récupérer les membres du groupe
      const { data: membersData, error: membersError } = await supabase
        .from('center_group_members')
        .select(`
          *,
          user_profiles!inner(username, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);

    } catch (error) {
      console.error('Erreur chargement groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du groupe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

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
      setShowComposer(false);
      fetchGroupData();
      
      toast({
        title: "Post publié",
        description: "Votre post a été publié dans le groupe"
      });
    } catch (error) {
      console.error('Erreur création post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Modérateur';
      default: return 'Membre';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Groupe introuvable</h3>
          <button onClick={onBack} className="text-blue-500">Retour</button>
        </div>
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
            <h1 className="text-lg font-bold text-gray-900">{group.name}</h1>
            <p className="text-sm text-gray-500">{group.members_count} membre{group.members_count > 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {(group.user_role === 'admin' || group.user_role === 'moderator') && (
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Banner */}
      {group.banner_url && (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500">
          <img src={group.banner_url} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Group Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
            {group.description && (
              <p className="text-gray-600 text-sm">{group.description}</p>
            )}
          </div>
        </div>
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
          Posts
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
        {(group.user_role === 'admin' || group.user_role === 'moderator') && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Paramètres
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'posts' && (
          <div>
            {/* Composer */}
            <div className="p-4 border-b border-gray-200">
              {showComposer ? (
                <div className="space-y-3">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Partagez quelque chose avec le groupe..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createPost}
                      disabled={!newPost.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      Publier
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowComposer(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:bg-gray-50"
                >
                  Partagez quelque chose avec le groupe...
                </button>
              )}
            </div>

            {/* Posts */}
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {post.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {post.user_profiles?.full_name || 'Utilisateur'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                          <span>❤️</span>
                          <span>{post.likes_count}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-4 space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">
                      {member.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {member.user_profiles?.full_name || 'Utilisateur'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      @{member.user_profiles?.username || 'user'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                    {getRoleIcon(member.role)}
                    <span className="text-xs font-medium">{getRoleText(member.role)}</span>
                  </div>
                  
                  {(group.user_role === 'admin' && member.role !== 'admin') && (
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (group.user_role === 'admin' || group.user_role === 'moderator') && (
          <div className="p-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informations du groupe</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={group.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={group.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Paramètres de confidentialité</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Groupe privé</p>
                  <p className="text-sm text-gray-500">
                    {group.is_private ? 'Le groupe est privé' : 'Le groupe est public'}
                  </p>
                </div>
                <div className={`w-12 h-6 rounded-full ${group.is_private ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${group.is_private ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB pour créer un post */}
      {activeTab === 'posts' && (
        <button
          onClick={() => setShowComposer(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default GroupDetail;
