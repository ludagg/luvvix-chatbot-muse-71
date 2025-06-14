
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, MapPin, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  location?: string;
  bio?: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

const UserDiscovery = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
    fetchFollowingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(12);

      if (error) throw error;

      const usersWithStats = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Utilisateur',
        username: profile.username || 'user',
        avatar_url: profile.avatar_url || '',
        location: profile.location || '',
        bio: profile.bio || '',
        is_verified: Math.random() > 0.8,
        followers_count: Math.floor(Math.random() * 1000),
        following_count: Math.floor(Math.random() * 500),
        posts_count: Math.floor(Math.random() * 100)
      })) || [];

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowingUsers(new Set(data?.map(f => f.following_id) || []));
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      setFollowingUsers(prev => new Set([...prev, userId]));
      toast({
        title: "Utilisateur suivi",
        description: "Vous suivez maintenant cet utilisateur"
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de suivre cet utilisateur"
      });
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      toast({
        title: "Utilisateur non suivi",
        description: "Vous ne suivez plus cet utilisateur"
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'arrêter de suivre cet utilisateur"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Découvrir des utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((discoveredUser) => (
            <div key={discoveredUser.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={discoveredUser.avatar_url} />
                    <AvatarFallback>
                      {discoveredUser.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <h3 className="font-semibold text-sm">{discoveredUser.full_name}</h3>
                      {discoveredUser.is_verified && (
                        <Badge variant="outline" className="h-4 w-4 p-0">
                          <Sparkles className="h-2 w-2" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{discoveredUser.username}</p>
                    {discoveredUser.location && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{discoveredUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={followingUsers.has(discoveredUser.id) ? "outline" : "default"}
                  onClick={() => followingUsers.has(discoveredUser.id) 
                    ? unfollowUser(discoveredUser.id) 
                    : followUser(discoveredUser.id)
                  }
                  className="gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  {followingUsers.has(discoveredUser.id) ? 'Suivi' : 'Suivre'}
                </Button>
              </div>

              {discoveredUser.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {discoveredUser.bio}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{discoveredUser.followers_count} abonnés</span>
                <span>{discoveredUser.following_count} abonnements</span>
                <span>{discoveredUser.posts_count} posts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDiscovery;
