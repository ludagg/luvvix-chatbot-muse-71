import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Settings, 
  Camera, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  Globe,
  Heart,
  Users,
  Trophy,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  preferences: any;
}

interface ProfileStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  likes_received: number;
}

const CenterProfile = () => {
  const { user, profile, refreshUser } = useAuth();
  const [centerProfile, setCenterProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    likes_received: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    preferences: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Fetch Center-specific profile
      const { data: centerData, error: centerError } = await supabase
        .from('center_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (centerError && centerError.code !== 'PGRST116') {
        console.error('Error fetching center profile:', centerError);
      } else if (centerData) {
        setCenterProfile(centerData);
        setEditForm({
          full_name: centerData.full_name || '',
          username: centerData.username || '',
          bio: centerData.bio || '',
          preferences: centerData.preferences || {}
        });
      }

      // Fetch stats using Promise.allSettled to handle errors better
      const [postsResult, followersResult, followingResult, likesResult] = await Promise.allSettled([
        supabase
          .from('center_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('center_follows')
          .select('id', { count: 'exact' })
          .eq('following_id', user.id),
        supabase
          .from('center_follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', user.id),
        // Fix the likes query - get posts first, then count likes
        (async () => {
          const { data: userPosts } = await supabase
            .from('center_posts')
            .select('id')
            .eq('user_id', user.id);
          
          if (!userPosts || userPosts.length === 0) {
            return { count: 0 };
          }
          
          const postIds = userPosts.map(post => post.id);
          return supabase
            .from('center_likes')
            .select('id', { count: 'exact' })
            .in('post_id', postIds);
        })()
      ]);

      setStats({
        posts_count: postsResult.status === 'fulfilled' ? (postsResult.value.count || 0) : 0,
        followers_count: followersResult.status === 'fulfilled' ? (followersResult.value.count || 0) : 0,
        following_count: followingResult.status === 'fulfilled' ? (followingResult.value.count || 0) : 0,
        likes_received: likesResult.status === 'fulfilled' ? (likesResult.value.count || 0) : 0
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le profil"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      // Update or create Center profile
      const { error } = await supabase
        .from('center_profiles')
        .upsert({
          id: user.id,
          username: editForm.username,
          full_name: editForm.full_name,
          bio: editForm.bio,
          preferences: editForm.preferences
        });

      if (error) throw error;

      // Update main user profile
      const { error: mainError } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name,
          username: editForm.username
        })
        .eq('id', user.id);

      if (mainError) throw mainError;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées"
      });

      setIsEditing(false);
      fetchProfile();
      refreshUser();

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le profil"
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const displayProfile = centerProfile || profile;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="relative">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg relative">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
            >
              <Camera className="h-4 w-4 mr-2" />
              Modifier la bannière
            </Button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={displayProfile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {displayProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full p-2"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayProfile?.full_name || 'Nom d\'utilisateur'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      @{displayProfile?.username || user?.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <Badge variant="luvvix">Vérifié</Badge>
                      <Badge variant="outline">Membre depuis 2024</Badge>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0">
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "outline" : "default"}
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Modifier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              {isEditing ? (
                <Textarea
                  placeholder="Parlez-nous de vous..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {centerProfile?.bio || "Aucune bio disponible"}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.posts_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.followers_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abonnés</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.following_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abonnements</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.likes_received}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Likes reçus</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Modifier le profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="votre_nom_utilisateur"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={saveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Heart className="h-5 w-5 text-red-500" />
              <p className="text-sm">
                Votre post a reçu <span className="font-semibold">5 likes</span>
              </p>
              <span className="text-xs text-gray-500">Il y a 2 heures</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <p className="text-sm">
                <span className="font-semibold">3 nouvelles personnes</span> vous suivent
              </p>
              <span className="text-xs text-gray-500">Il y a 1 jour</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <p className="text-sm">
                Vous avez atteint <span className="font-semibold">100 points</span> de réputation
              </p>
              <span className="text-xs text-gray-500">Il y a 3 jours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterProfile;
