
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Download,
  Trash2,
  Eye,
  Lock,
  Heart,
  MessageCircle,
  Users,
  Archive
} from 'lucide-react';

const CenterSettings = () => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'language', label: 'Langue', icon: Globe },
    { id: 'data', label: 'Données', icon: Download }
  ];

  const [settings, setSettings] = useState({
    // General
    autoSave: true,
    soundEffects: true,
    
    // Notifications
    postLikes: true,
    comments: true,
    follows: true,
    messages: true,
    groupInvites: true,
    eventReminders: true,
    emailNotifications: false,
    pushNotifications: true,
    
    // Privacy
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDMs: true,
    showReadReceipts: false,
    dataAnalytics: true,
    
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Préférences générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save">Sauvegarde automatique</Label>
              <p className="text-sm text-gray-500">Sauvegarder automatiquement vos brouillons</p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-effects">Effets sonores</Label>
              <p className="text-sm text-gray-500">Activer les sons d'interaction</p>
            </div>
            <Switch
              id="sound-effects"
              checked={settings.soundEffects}
              onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              placeholder="Parlez-nous de vous..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="Votre ville, pays"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              placeholder="https://votresite.com"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Likes sur vos posts</Label>
              <p className="text-sm text-gray-500">Recevoir une notification quand quelqu'un like vos posts</p>
            </div>
            <Switch
              checked={settings.postLikes}
              onCheckedChange={(checked) => handleSettingChange('postLikes', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Commentaires</Label>
              <p className="text-sm text-gray-500">Nouveaux commentaires sur vos posts</p>
            </div>
            <Switch
              checked={settings.comments}
              onCheckedChange={(checked) => handleSettingChange('comments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Nouveaux abonnés</Label>
              <p className="text-sm text-gray-500">Quand quelqu'un vous suit</p>
            </div>
            <Switch
              checked={settings.follows}
              onCheckedChange={(checked) => handleSettingChange('follows', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Messages et groupes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Messages directs</Label>
              <p className="text-sm text-gray-500">Nouveaux messages privés</p>
            </div>
            <Switch
              checked={settings.messages}
              onCheckedChange={(checked) => handleSettingChange('messages', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Invitations de groupe</Label>
              <p className="text-sm text-gray-500">Invitations à rejoindre des groupes</p>
            </div>
            <Switch
              checked={settings.groupInvites}
              onCheckedChange={(checked) => handleSettingChange('groupInvites', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Rappels d'événements</Label>
              <p className="text-sm text-gray-500">Notifications avant les événements</p>
            </div>
            <Switch
              checked={settings.eventReminders}
              onCheckedChange={(checked) => handleSettingChange('eventReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canaux de notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications par email</Label>
              <p className="text-sm text-gray-500">Recevoir des emails de notification</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications push</Label>
              <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            Visibilité du profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Qui peut voir votre profil ?</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value) => handleSettingChange('profileVisibility', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Amis seulement</SelectItem>
                <SelectItem value="private">Privé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Statut en ligne</Label>
              <p className="text-sm text-gray-500">Afficher quand vous êtes en ligne</p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-500" />
            Messages et interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Autoriser les messages directs</Label>
              <p className="text-sm text-gray-500">Qui peut vous envoyer des messages</p>
            </div>
            <Switch
              checked={settings.allowDMs}
              onCheckedChange={(checked) => handleSettingChange('allowDMs', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Accusés de lecture</Label>
              <p className="text-sm text-gray-500">Afficher quand vous avez lu les messages</p>
            </div>
            <Switch
              checked={settings.showReadReceipts}
              onCheckedChange={(checked) => handleSettingChange('showReadReceipts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données et analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics d'utilisation</Label>
              <p className="text-sm text-gray-500">Permettre la collecte de données d'usage anonymes</p>
            </div>
            <Switch
              checked={settings.dataAnalytics}
              onCheckedChange={(checked) => handleSettingChange('dataAnalytics', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thème</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mode d'affichage</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange('theme', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Automatique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Taille de la police</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value) => handleSettingChange('fontSize', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petite</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode compact</Label>
              <p className="text-sm text-gray-500">Affichage plus dense</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Animations</Label>
              <p className="text-sm text-gray-500">Activer les animations d'interface</p>
            </div>
            <Switch
              checked={settings.showAnimations}
              onCheckedChange={(checked) => handleSettingChange('showAnimations', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLanguageSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Langue et région</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Langue de l'interface</Label>
          <Select defaultValue="fr">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Format de date</Label>
          <Select defaultValue="dd/mm/yyyy">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Fuseau horaire</Label>
          <Select defaultValue="europe/paris">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="europe/paris">Europe/Paris</SelectItem>
              <SelectItem value="europe/london">Europe/London</SelectItem>
              <SelectItem value="america/new_york">America/New_York</SelectItem>
              <SelectItem value="asia/tokyo">Asia/Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            Exporter vos données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Téléchargez une copie de toutes vos données LuvviX Center.
          </p>
          <Button>Demander l'export</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-orange-500" />
            Archiver le compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Désactiver temporairement votre compte. Vous pourrez le réactiver à tout moment.
          </p>
          <Button variant="outline">Archiver le compte</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Supprimer le compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible.
          </p>
          <Button variant="destructive">Supprimer le compte</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'language':
        return renderLanguageSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <IconComponent className="h-4 w-4" />
                      {section.label}
                    </Button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {renderContent()}
          
          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button>Sauvegarder les modifications</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSettings;
