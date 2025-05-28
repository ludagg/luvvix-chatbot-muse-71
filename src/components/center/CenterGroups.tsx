
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Crown,
  MessageCircle,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';

const CenterGroups = () => {
  const myGroups = [
    {
      id: 1,
      name: 'Développeurs LuvviX',
      description: 'Communauté des développeurs utilisant l\'écosystème LuvviX',
      members: 1234,
      posts: 89,
      isAdmin: true,
      isPrivate: false,
      avatar: null
    },
    {
      id: 2,
      name: 'Gamers Center',
      description: 'Pour tous les passionnés de jeux sur Center',
      members: 567,
      posts: 156,
      isAdmin: false,
      isPrivate: false,
      avatar: null
    },
    {
      id: 3,
      name: 'Équipe Marketing',
      description: 'Discussions privées de l\'équipe marketing',
      members: 12,
      posts: 45,
      isAdmin: false,
      isPrivate: true,
      avatar: null
    }
  ];

  const suggestedGroups = [
    {
      id: 4,
      name: 'IA & Machine Learning',
      description: 'Partage et discussions sur l\'intelligence artificielle',
      members: 2345,
      posts: 234,
      isPrivate: false,
      avatar: null
    },
    {
      id: 5,
      name: 'Entrepreneurs Français',
      description: 'Réseau d\'entrepreneurs et de startups françaises',
      members: 1876,
      posts: 167,
      isPrivate: false,
      avatar: null
    }
  ];

  const recentActivity = [
    {
      group: 'Développeurs LuvviX',
      user: 'Alice Martin',
      action: 'a publié un nouveau post',
      time: '2h'
    },
    {
      group: 'Gamers Center',
      user: 'Thomas Durand',
      action: 'a rejoint le groupe',
      time: '4h'
    },
    {
      group: 'Équipe Marketing',
      user: 'Sophie Laurent',
      action: 'a partagé un document',
      time: '6h'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Groupes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous avec des communautés qui partagent vos intérêts
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Créer un groupe
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des groupes..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Mes groupes ({myGroups.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myGroups.map((group) => (
                <div key={group.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.avatar || ''} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{group.name}</h3>
                          {group.isAdmin && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {group.isPrivate ? (
                            <Lock className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Globe className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{group.members} membres</span>
                          <span>{group.posts} posts</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Groupes suggérés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedGroups.map((group) => (
                <div key={group.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.avatar || ''} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{group.name}</h3>
                          <Globe className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{group.members} membres</span>
                          <span>{group.posts} posts</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Rejoindre
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vos statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Groupes rejoints</span>
                <span className="font-semibold">{myGroups.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Posts publiés</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between">
                <span>Groupes gérés</span>
                <span className="font-semibold">
                  {myGroups.filter(g => g.isAdmin).length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activity.action} dans <span className="font-medium">{activity.group}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Événements à venir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-medium text-sm">Meetup Développeurs</p>
                <p className="text-xs text-gray-500">Demain 19h</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-sm">Gaming Tournament</p>
                <p className="text-xs text-gray-500">Vendredi 20h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CenterGroups;
