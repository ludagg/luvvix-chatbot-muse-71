
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Camera,
  Save
} from 'lucide-react';

const CenterSettings = () => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      posts: true,
      messages: true,
      friends: true,
      events: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      messagePermissions: 'friends',
      tagPermissions: 'friends'
    },
    appearance: {
      theme: 'auto',
      language: 'fr'
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleAppearanceChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences et paramètres de confidentialité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Changer la photo
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    defaultValue={profile?.full_name || ''}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    defaultValue={profile?.username || ''}
                    placeholder="@nomutilisateur"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder le profil
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nouveaux posts</p>
                  <p className="text-sm text-gray-500">Notifications pour les nouveaux posts de vos amis</p>
                </div>
                <Switch
                  checked={settings.notifications.posts}
                  onCheckedChange={(checked) => handleNotificationChange('posts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-gray-500">Notifications pour les nouveaux messages</p>
                </div>
                <Switch
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Demandes d'amis</p>
                  <p className="text-sm text-gray-500">Notifications pour les nouvelles demandes</p>
                </div>
                <Switch
                  checked={settings.notifications.friends}
                  onCheckedChange={(checked) => handleNotificationChange('friends', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Événements</p>
                  <p className="text-sm text-gray-500">Rappels d'événements et invitations</p>
                </div>
                <Switch
                  checked={settings.notifications.events}
                  onCheckedChange={(checked) => handleNotificationChange('events', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing</p>
                  <p className="text-sm text-gray-500">Nouvelles fonctionnalités et promotions</p>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Visibilité du profil</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Amis seulement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Qui peut m'envoyer des messages</Label>
                <Select
                  value={settings.privacy.messagePermissions}
                  onValueChange={(value) => handlePrivacyChange('messagePermissions', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Tout le monde</SelectItem>
                    <SelectItem value="friends">Amis seulement</SelectItem>
                    <SelectItem value="none">Personne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Qui peut me taguer</Label>
                <Select
                  value={settings.privacy.tagPermissions}
                  onValueChange={(value) => handlePrivacyChange('tagPermissions', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Tout le monde</SelectItem>
                    <SelectItem value="friends">Amis seulement</SelectItem>
                    <SelectItem value="none">Personne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Thème</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleAppearanceChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Langue</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => handleAppearanceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Télécharger mes données
              </Button>
              <Button variant="outline" className="w-full">
                Désactiver le compte
              </Button>
              <Button variant="destructive" className="w-full">
                Supprimer le compte
              </Button>
            </CardContent>
          </Card>

          {/* LuvviX Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Intégration LuvviX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gérez vos connexions avec les autres applications LuvviX
              </p>
              <Button variant="outline" className="w-full">
                Voir les applications connectées
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CenterSettings;
