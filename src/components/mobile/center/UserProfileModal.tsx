import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, UserMinus, MessageCircle, MoreHorizontal, MapPin, Calendar, Users, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  friends_count: number;
}

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const UserProfileModal = ({ userId, onClose }: UserProfileModalProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    friends_count: 0
  });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserStats();
      fetchUserPosts();
      checkFriendshipStatus();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, bio, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Erreur SQL user_profiles:", error);
      }

      if (!data) {
        console.warn("Aucune donnée user_profiles pour:", userId);
        setProfile({
          id: userId,
          username: `user_${userId.slice(0, 8)}`,
          full_name: 'Utilisateur',
          created_at: new Date().toISOString()
        });
        return;
      }

      console.log("Profil récupéré:", data);
      setProfile(data);
    } catch (error) {
      console.error('Erreur suppresion profil:', error);
      setProfile({
        id: userId,
        username: `user_${userId.slice(0, 8)}`,
        full_name: 'Utilisateur',
        created_at: new Date().toISOString()
      });
    }
  };

  const fetchUserStats = async () => {
    try {
      // Compter les posts
      const { count: postsCount } = await supabase
        .from('center_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Compter les amitiés
      const { count: friendsCount } = await supabase
        .from('center_friendships')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      setStats({
        posts_count: postsCount || 0,
        followers_count: 0,
        following_count: 0,
        friends_count: friendsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('center_posts')
        .select('id, content, media_urls, video_url, likes_count, comments_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user || user.id === userId) {
      setFriendshipStatus('none');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('center_friendships')
        .select('id, requester_id, addressee_id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        setFriendshipStatus('none');
        return;
      }

      if (data.status === 'accepted') {
        setFriendshipStatus('friends');
      } else if (data.status === 'pending') {
        if (data.requester_id === user.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      } else {
        setFriendshipStatus('none');
      }
    } catch (error) {
      setFriendshipStatus('none');
      console.error('Error checking friendship:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!user) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('center_friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      // Notif optionnelle côté base (déjà en place côté UI mobile)
      setFriendshipStatus('pending_sent');
      toast({
        title: "Demande d'amitié envoyée",
        description: "Votre demande a bien été envoyée."
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!user) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('center_friendships')
        .update({ status: 'accepted' })
        .eq('requester_id', userId)
        .eq('addressee_id', user.id);

      if (error) throw error;

      setFriendshipStatus('friends');
      fetchUserStats();
      toast({
        title: "Amitié acceptée",
        description: "Vous êtes maintenant amis !"
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const removeFriend = async () => {
    if (!user) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('center_friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);

      if (error) throw error;

      setFriendshipStatus('none');
      fetchUserStats();
      toast({
        title: "Ami retiré",
        description: "Vous n'êtes plus amis avec cette personne."
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer cet ami.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButton = () => {
    if (!user || user.id === userId) return null;

    switch (friendshipStatus) {
      case 'none':
        return (
          <button
            onClick={sendFriendRequest}
            disabled={actionLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full font-medium disabled:opacity-70"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter comme ami</span>
          </button>
        );
      case 'pending_sent':
        return (
          <button
            disabled
            className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-full font-medium"
          >
            <span>Demande envoyée</span>
          </button>
        );
      case 'pending_received':
        return (
          <button
            onClick={acceptFriendRequest}
            disabled={actionLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-full font-medium disabled:opacity-70"
          >
            <span>Accepter</span>
          </button>
        );
      case 'friends':
        return (
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full font-medium">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button
              onClick={removeFriend}
              disabled={actionLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full font-medium disabled:opacity-70"
            >
              <UserMinus className="w-4 h-4" />
              <span>Retirer</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Profil</h1>
          <div></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Profil</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="p-4">
        {/* Avatar et infos de base */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white font-bold text-2xl">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {profile.full_name || 'Utilisateur'}
            </h2>
            <p className="text-gray-600">@{profile.username || `user_${profile.id?.slice(0, 8)}`}</p>
            <p className="text-gray-500 text-sm mt-1">
              Membre depuis {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '...'}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 mb-4">{profile.bio || <span className="text-gray-400">Pas de bio</span>}</p>

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-4">
          <div className="text-center">
            <div className="font-bold text-lg">{stats.posts_count}</div>
            <div className="text-gray-500 text-sm">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{stats.friends_count}</div>
            <div className="text-gray-500 text-sm">Amis</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-4">
          {renderActionButton()}
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
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'about'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          À propos
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'posts' ? (
          <div className="p-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun post publié</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 mb-3">{post.content}</p>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.media_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt=""
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </div>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Membre depuis {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {stats.friends_count} amis
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
