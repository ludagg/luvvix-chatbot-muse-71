
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Zap, MessageCircle } from 'lucide-react';
import GroupsWidget from './GroupsWidget';

const CenterRightPanel = () => {
  const trendingTopics = [
    { tag: '#LuvviXDev', posts: 1247, growth: '+12%' },
    { tag: '#JavaScript', posts: 892, growth: '+8%' },
    { tag: '#React', posts: 567, growth: '+15%' },
    { tag: '#TypeScript', posts: 423, growth: '+6%' },
    { tag: '#WebDev', posts: 334, growth: '+22%' }
  ];

  const onlineUsers = [
    { id: '1', name: 'Alice Martin', username: 'alice_dev', activity: 'En train de coder' },
    { id: '2', name: 'Thomas Durand', username: 'thomas_ui', activity: 'Design UI' },
    { id: '3', name: 'Sarah Chen', username: 'sarah_js', activity: 'Debugging' },
    { id: '4', name: 'Marc Dubois', username: 'marc_react', activity: 'Review de code' }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Tendances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Tendances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-blue-600 text-sm">{topic.tag}</p>
                <p className="text-xs text-gray-500">{topic.posts} posts</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {topic.growth}
              </Badge>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-sm mt-3">
            Voir plus de tendances
          </Button>
        </CardContent>
      </Card>

      {/* Widget Groupes */}
      <GroupsWidget />

      {/* Utilisateurs en ligne */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            En ligne maintenant
            <Badge variant="secondary" className="ml-auto">
              {onlineUsers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.activity}</p>
              </div>
              <Button size="sm" variant="ghost" className="p-1">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Votre activité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">42</p>
              <p className="text-xs text-gray-600">Posts</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-xs text-gray-600">Abonnés</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">89</p>
              <p className="text-xs text-gray-600">Abonnements</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-gray-600">Groupes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterRightPanel;
