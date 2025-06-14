
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'share';
  user_id: string;
  target_user_id?: string;
  post_id?: string;
  content?: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  target_user_profiles?: {
    full_name: string;
    username: string;
  };
}

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Simuler des activités pour la démo
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'like',
          user_id: 'user1',
          post_id: 'post1',
          created_at: new Date(Date.now() - 60000).toISOString(),
          user_profiles: {
            full_name: 'Alice Martin',
            username: 'alice_martin',
            avatar_url: ''
          }
        },
        {
          id: '2',
          type: 'follow',
          user_id: 'user2',
          target_user_id: user.id,
          created_at: new Date(Date.now() - 120000).toISOString(),
          user_profiles: {
            full_name: 'Thomas Durand',
            username: 'thomas_d',
            avatar_url: ''
          }
        },
        {
          id: '3',
          type: 'comment',
          user_id: 'user3',
          post_id: 'post2',
          content: 'Excellente idée ! J\'aimerais en savoir plus.',
          created_at: new Date(Date.now() - 300000).toISOString(),
          user_profiles: {
            full_name: 'Sophie Laurent',
            username: 'sophie_l',
            avatar_url: ''
          }
        },
        {
          id: '4',
          type: 'post',
          user_id: 'user4',
          content: 'Nouveau projet lancé avec LuvviX AI Studio !',
          created_at: new Date(Date.now() - 600000).toISOString(),
          user_profiles: {
            full_name: 'Marc Dubois',
            username: 'marc_dubois',
            avatar_url: ''
          }
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'like':
        return 'a aimé votre post';
      case 'comment':
        return 'a commenté votre post';
      case 'follow':
        return 'a commencé à vous suivre';
      case 'post':
        return 'a publié un nouveau post';
      case 'share':
        return 'a partagé votre post';
      default:
        return 'a interagi avec vous';
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
          <Activity className="h-5 w-5 text-purple-500" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user_profiles?.avatar_url} />
                <AvatarFallback>
                  {activity.user_profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <p className="text-sm">
                    <span className="font-semibold">
                      {activity.user_profiles?.full_name}
                    </span>
                    {' '}{getActivityText(activity)}
                  </p>
                </div>
                
                {activity.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                    "{activity.content}"
                  </p>
                )}
                
                <div className="flex items-center space-x-2 mt-2 ml-6">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              </div>
              
              {activity.type !== 'follow' && (
                <Button variant="ghost" size="sm" className="text-purple-600">
                  Voir
                </Button>
              )}
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune activité récente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
