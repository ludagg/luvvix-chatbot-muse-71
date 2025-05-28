
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  MessageCircle,
  Settings,
  Camera
} from 'lucide-react';

const CenterProfile = () => {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-4 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-20 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">
                  {profile?.full_name || 'Nom d\'utilisateur'}
                </h1>
                <Badge variant="luvvix">Vérifié</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{profile?.username || user?.email?.split('@')[0]}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Passionné de technologie et membre actif de la communauté LuvviX 🚀
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Paris, France</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis janvier 2024</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <span><strong>156</strong> abonnés</span>
                <span><strong>89</strong> abonnements</span>
                <span><strong>42</strong> posts</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Likes reçus</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Commentaires</span>
                <span className="font-semibold">567</span>
              </div>
              <div className="flex justify-between">
                <span>Partages</span>
                <span className="font-semibold">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Communauté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Groupes</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Événements</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Mentions</span>
                <span className="font-semibold">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Badge className="h-5 w-5 mr-2 text-purple-500" />
              Récompenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Points LuvviX</span>
                <span className="font-semibold">2,450</span>
              </div>
              <div className="flex justify-between">
                <span>Niveau</span>
                <span className="font-semibold">Expert</span>
              </div>
              <div className="flex justify-between">
                <span>Badges</span>
                <span className="font-semibold">15</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Publications récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Vos publications récentes apparaîtront ici
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterProfile;
