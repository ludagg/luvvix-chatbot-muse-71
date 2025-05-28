
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  TrendingUp, 
  Users, 
  Calendar,
  Gamepad2
} from 'lucide-react';

const CenterRightPanel = () => {
  const suggestedFriends = [
    { name: 'Alice Martin', username: 'alice_m', avatar: null, mutualFriends: 5 },
    { name: 'Thomas Durand', username: 'tdurand', avatar: null, mutualFriends: 3 },
    { name: 'Sophie Laurent', username: 'sophie_l', avatar: null, mutualFriends: 8 },
  ];

  const trendingTopics = [
    { tag: '#LuvviXCenter', posts: '1,2k posts' },
    { tag: '#IA2024', posts: '850 posts' },
    { tag: '#CommunautéFR', posts: '692 posts' },
    { tag: '#Innovation', posts: '456 posts' },
  ];

  const upcomingEvents = [
    { title: 'Tournoi Gaming LuvviX', date: 'Demain 20h', participants: 156 },
    { title: 'Live Tech Talk IA', date: 'Vendredi 18h', participants: 89 },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Suggestions d'amis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Suggestions d'amis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedFriends.map((friend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar || ''} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{friend.name}</p>
                  <p className="text-xs text-gray-500">
                    {friend.mutualFriends} amis en commun
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ajouter
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tendances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tendances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-purple-600">{topic.tag}</p>
                <p className="text-xs text-gray-500">{topic.posts}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Événements à venir */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Événements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-xs text-gray-500 mb-2">{event.date}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                {event.participants} participants
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mini-jeux populaires */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Gamepad2 className="h-5 w-5 mr-2" />
            Jeux populaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Quiz LuvviX</p>
              <p className="text-xs text-gray-500">Joueurs en ligne: 234</p>
            </div>
            <Button size="sm">Jouer</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Memory Game</p>
              <p className="text-xs text-gray-500">Joueurs en ligne: 156</p>
            </div>
            <Button size="sm">Jouer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterRightPanel;
