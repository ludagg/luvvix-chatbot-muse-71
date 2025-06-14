
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Settings,
  MessageCircle,
  Globe,
  Lock,
  Star,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

const CenterGroups = () => {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [searchQuery, setSearchQuery] = useState('');

  const myGroups = [
    {
      id: '1',
      name: 'Développeurs LuvviX',
      description: 'Communauté officielle des développeurs LuvviX',
      members: 1247,
      privacy: 'public',
      isAdmin: true,
      lastActivity: '2 min',
      unreadMessages: 5,
      avatar: '',
      category: 'Technologie'
    },
    {
      id: '2',
      name: 'AI Enthusiasts France',
      description: 'Passionnés d\'intelligence artificielle en France',
      members: 892,
      privacy: 'public',
      isAdmin: false,
      lastActivity: '15 min',
      unreadMessages: 2,
      avatar: '',
      category: 'Intelligence Artificielle'
    },
    {
      id: '3',
      name: 'Startup Paris',
      description: 'Entrepreneurs et startups à Paris',
      members: 634,
      privacy: 'private',
      isAdmin: false,
      lastActivity: '1h',
      unreadMessages: 0,
      avatar: '',
      category: 'Business'
    }
  ];

  const discoveredGroups = [
    {
      id: '4',
      name: 'Machine Learning Masters',
      description: 'Groupe avancé pour les experts en ML',
      members: 567,
      privacy: 'public',
      isJoined: false,
      trending: true,
      avatar: '',
      category: 'Machine Learning'
    },
    {
      id: '5',
      name: 'UX/UI Designers',
      description: 'Communauté de designers UX/UI',
      members: 789,
      privacy: 'public',
      isJoined: false,
      trending: false,
      avatar: '',
      category: 'Design'
    },
    {
      id: '6',
      name: 'Remote Workers France',
      description: 'Télétravail et nomadisme digital',
      members: 1123,
      privacy: 'public',
      isJoined: false,
      trending: true,
      avatar: '',
      category: 'Lifestyle'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Meetup Développeurs LuvviX',
      group: 'Développeurs LuvviX',
      date: '15 Déc',
      time: '19:00',
      location: 'Paris',
      attendees: 45
    },
    {
      id: '2',
      title: 'Workshop IA',
      group: 'AI Enthusiasts France',
      date: '18 Déc',
      time: '14:00',
      location: 'En ligne',
      attendees: 28
    }
  ];

  const categories = [
    'Tous', 'Technologie', 'Intelligence Artificielle', 'Business', 
    'Design', 'Machine Learning', 'Lifestyle', 'Marketing'
  ];

  const tabs = [
    { id: 'my-groups', label: 'Mes Groupes', count: myGroups.length },
    { id: 'discover', label: 'Découvrir', count: discoveredGroups.length },
    { id: 'events', label: 'Événements', count: upcomingEvents.length }
  ];

  const getPrivacyIcon = (privacy: string) => {
    return privacy === 'public' ? (
      <Globe className="h-4 w-4 text-green-500" />
    ) : (
      <Lock className="h-4 w-4 text-orange-500" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Groupes LuvviX
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rejoignez des communautés passionnantes et créez des connexions
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un Groupe
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher des groupes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 gap-2"
          >
            {tab.label}
            <Badge variant="secondary">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'my-groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {myGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          {getPrivacyIcon(group.privacy)}
                          {group.isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {group.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {group.members.toLocaleString()} membres
                          </span>
                          <span className="text-sm text-gray-500">
                            Activité: {group.lastActivity}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {group.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.unreadMessages > 0 && (
                        <Badge variant="destructive">
                          {group.unreadMessages}
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {group.isAdmin && (
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Groupes rejoints</span>
                    <span className="font-semibold">{myGroups.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages envoyés</span>
                    <span className="font-semibold">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Événements participés</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Groupes actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{group.lastActivity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoveredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {group.trending && (
                    <Badge className="bg-orange-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Tendance
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {group.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPrivacyIcon(group.privacy)}
                    <span className="text-sm text-gray-500">
                      {group.members.toLocaleString()} membres
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {group.category}
                  </Badge>
                </div>
                
                <Button className="w-full" variant={group.isJoined ? "outline" : "default"}>
                  {group.isJoined ? 'Rejoint' : 'Rejoindre'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-purple-600 text-sm mb-2">{event.group}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date} à {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} participants</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline">
                    Participer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterGroups;
