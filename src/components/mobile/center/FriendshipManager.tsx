
import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, UserMinus, Check, X, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FriendshipManagerProps {
  onClose: () => void;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  requester_profile?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  addressee_profile?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  friendship_status?: string;
}

const FriendshipManager = ({ onClose }: FriendshipManagerProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'discover') {
      await fetchSuggestedUsers();
    } else {
      await fetchFriendships();
    }
  };

  const fetchFriendships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_friendships')
        .select(`
          *,
          requester_profile:user_profiles!requester_id(username, full_name, avatar_url),
          addressee_profile:user_profiles!addressee_id(username, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFriendships(data || []);
    } catch (error) {
      console.error('Erreur chargement amitiés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      // Créer une notification
      await supabase
        .from('center_notifications')
        .insert({
          user_id: userId,
          actor_id: user.id,
          type: 'friend_request',
          entity_type: 'user',
          entity_id: user.id
        });

      toast.success('Demande d\'amitié envoyée');
      fetchData();
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      toast.error('Impossible d\'envoyer la demande');
    }
  };

  const respondToRequest = async (friendshipId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('center_friendships')
        .update({ status })
        .eq('id', friendshipId);

      if (error) throw error;

      if (status === 'accepted') {
        toast.success('Demande acceptée');
      } else {
        toast.success('Demande refusée');
      }
      fetchData();
    } catch (error) {
      console.error('Erreur réponse demande:', error);
      toast.error('Impossible de répondre à la demande');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('center_friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Ami retiré');
      fetchData();
    } catch (error) {
      console.error('Erreur retrait ami:', error);
      toast.error('Impossible de retirer cet ami');
    }
  };

  const getFilteredFriendships = () => {
    if (!user) return [];

    if (activeTab === 'friends') {
      return friendships.filter(f => f.status === 'accepted');
    } else if (activeTab === 'requests') {
      return friendships.filter(f => 
        f.status === 'pending' && f.addressee_id === user.id
      );
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Amis</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Mes amis
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Demandes
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'discover'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Découvrir
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {activeTab === 'discover' ? (
              suggestedUsers.map((suggestedUser) => (
                <div key={suggestedUser.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {suggestedUser.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {suggestedUser.full_name || suggestedUser.username}
                      </h4>
                      <p className="text-xs text-gray-500">@{suggestedUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(suggestedUser.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              ))
            ) : (
              getFilteredFriendships().map((friendship) => {
                const otherUser = friendship.requester_id === user?.id 
                  ? friendship.addressee_profile 
                  : friendship.requester_profile;

                return (
                  <div key={friendship.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {otherUser?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {otherUser?.full_name || otherUser?.username}
                        </h4>
                        <p className="text-xs text-gray-500">@{otherUser?.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {activeTab === 'requests' ? (
                        <>
                          <button
                            onClick={() => respondToRequest(friendship.id, 'accepted')}
                            className="p-2 bg-green-500 text-white rounded-full"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => respondToRequest(friendship.id, 'rejected')}
                            className="p-2 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => removeFriend(friendship.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-red-600 border border-red-200 rounded-full text-sm"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>Retirer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {((activeTab !== 'discover' && getFilteredFriendships().length === 0) || 
              (activeTab === 'discover' && suggestedUsers.length === 0)) && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {activeTab === 'friends' && 'Aucun ami'}
                  {activeTab === 'requests' && 'Aucune demande'}
                  {activeTab === 'discover' && 'Aucun utilisateur trouvé'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'friends' && 'Ajoutez des amis pour commencer !'}
                  {activeTab === 'requests' && 'Vous n\'avez aucune demande d\'amitié'}
                  {activeTab === 'discover' && 'Revenez plus tard'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendshipManager;
