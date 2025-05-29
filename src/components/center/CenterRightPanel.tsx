
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Users, 
  UserPlus, 
  Hash,
  Sparkles,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TrendingTopic {
  hashtag: string;
  count: number;
}

interface SuggestedUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  followers_count: number;
  is_verified: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  participants_count: number;
}

const CenterRightPanel = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([
    { hashtag: '#LuvviXCenter', count: 1234 },
    { hashtag: '#IA2024', count: 892 },
    { hashtag: '#CommunautéFR', count: 567 },
    { hashtag: '#Innovation', count: 445 },
    { hashtag: '#TechNews', count: 321 }
  ]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Conférence LuvviX IA',
      date: '2024-12-15',
      location: 'Paris, France',
      participants_count: 156
    },
    {
      id: '2',
      title: 'Meetup Développeurs',
      date: '2024-12-20',
      location: 'Lyon, France',
      participants_count: 89
    }
  ]);

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      // Get users the current user is not following
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;

      // Transform data to match interface
      const suggested = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Utilisateur',
        username: profile.username || 'user',
        avatar_url: profile.avatar_url || '',
        followers_count: Math.floor(Math.random() * 1000), // Random for demo
        is_verified: Math.random() > 0.7 // Random verification
      })) || [];

      setSuggestedUsers(suggested);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, [user]);

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

      toast({
        title: "Utilisateur suivi",
        description: "Vous suivez maintenant cet utilisateur"
      });

      // Remove from suggested list
      setSuggestedUsers(users => users.filter(u => u.id !== userId));

    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de suivre cet utilisateur"
      });
    }
  };

  return (
    <div className="w-full space-y-4 p-4">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des personnes, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Tendances
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div
                key={topic.hashtag}
                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">{topic.hashtag}</p>
                    <p className="text-xs text-gray-500">
                      {topic.count.toLocaleString()} posts
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {suggestedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <p className="font-medium text-sm">{user.full_name}</p>
                      {user.is_verified && (
                        <Badge variant="luvvix" className="h-4 w-4 p-0">
                          <Sparkles className="h-2 w-2" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      @{user.username} • {user.followers_count} abonnés
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => followUser(user.id)}
                  className="gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Suivre
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-3 text-sm">
            Voir plus de suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            Événements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <Users className="h-3 w-3" />
                  <span>{event.participants_count} participants</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LuvviX Ecosystem */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Écosystème LuvviX
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-sm">
              🤖 AI Studio - Créer des agents IA
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              ☁️ Cloud - Stockage décentralisé
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              📰 News - Actualités personnalisées
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              📝 Forms - Créateur de formulaires
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterRightPanel;
