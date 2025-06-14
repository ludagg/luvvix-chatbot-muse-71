
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Gift,
  Star,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';

const CenterRightPanel = () => {
  const trendingTopics = [
    { tag: '#LuvviXAI', posts: 1234 },
    { tag: '#Innovation', posts: 892 },
    { tag: '#TechFrance', posts: 567 },
    { tag: '#IA2024', posts: 445 },
    { tag: '#CodeStudio', posts: 321 }
  ];

  const suggestedUsers = [
    {
      id: '1',
      name: 'Marie Dubois',
      username: 'marie_dev',
      avatar: '',
      followers: '2.1k',
      isVerified: true
    },
    {
      id: '2',
      name: 'Pierre Martin',
      username: 'pierre_tech',
      avatar: '',
      followers: '1.8k',
      isVerified: false
    },
    {
      id: '3',
      name: 'Sarah Chen',
      username: 'sarah_ai',
      avatar: '',
      followers: '3.2k',
      isVerified: true
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'LuvviX Meetup Paris',
      date: '15 Déc',
      time: '19:00',
      attendees: 45
    },
    {
      id: '2',
      title: 'AI Workshop',
      date: '18 Déc',
      time: '14:00',
      attendees: 28
    },
    {
      id: '3',
      title: 'Code Review Session',
      date: '20 Déc',
      time: '16:00',
      attendees: 12
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Tendances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                    {topic.tag}
                  </p>
                  <p className="text-sm text-gray-500">{topic.posts} posts</p>
                </div>
                <Badge variant="outline">{index + 1}</Badge>
              </div>
            ))}
            <Button variant="link" className="w-full text-sm p-0">
              Voir plus
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-purple-500" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      {user.isVerified && (
                        <Star className="h-3 w-3 text-blue-500 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-400">{user.followers} abonnés</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Suivre
                </Button>
              </div>
            ))}
            <Button variant="link" className="w-full text-sm p-0">
              Voir plus
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-green-500" />
            Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{event.date} à {event.time}</span>
                  <span>{event.attendees} participants</span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                  Participer
                </Button>
              </div>
            ))}
            <Button variant="link" className="w-full text-sm p-0">
              Voir tous les événements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LuvviX Premium Promo */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              LuvviX Premium
            </h3>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
            Accédez à des fonctionnalités exclusives et soutenez la communauté
          </p>
          <div className="space-y-2 text-xs text-purple-700 dark:text-purple-300 mb-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-3 w-3" />
              <span>Posts prioritaires</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3 w-3" />
              <span>Messages illimités</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3" />
              <span>Badge exclusif</span>
            </div>
          </div>
          <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
            Découvrir Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterRightPanel;
