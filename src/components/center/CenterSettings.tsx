
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  Globe, 
  Smartphone,
  Lock,
  UserX,
  Download,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Settings {
  notifications: {
    posts: boolean;
    messages: boolean;
    follows: boolean;
    mentions: boolean;
    gameInvites: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    profileVisible: boolean;
    postsPublic: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
    allowTagging: boolean;
  };
  preferences: {
    darkMode: boolean;
    language: string;
    autoplay: boolean;
    dataSync: boolean;
  };
}

const CenterSettings = () => {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      posts: true,
      messages: true,
      follows: true,
      mentions: true,
      gameInvites: true,
      email: false,
      push: true
    },
    privacy: {
      profileVisible: true,
      postsPublic: true,
      allowMessages: true,
      showOnlineStatus: true,
      allowTagging: true
    },
    preferences: {
      darkMode: false,
      language: 'fr',
      autoplay: true,
      dataSync: true
    }
  });
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data?.preferences) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data.preferences
        }));
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('center_profiles')
        .upsert({
          id: user.id,
          preferences: settings
        });

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleDataExport = async () => {
    try {
      // Export user data
      const { data: posts } = await supabase
        .from('center_posts')
        .select('*')
        .eq('user_id', user?.id);

      const { data: messages } = await supabase
        .from('center_chat_messages')
        .select('*')
        .eq('sender_id', user?.id);

      const exportData = {
        posts,
        messages,
        profile: user,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'luvvix-center-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export terminé",
        description: "Vos données ont été téléchargées"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exporter les données"
      });
    }
  };

  const handleAccountDeletion = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Delete user data
      await Promise.all([
        supabase.from('center_posts').delete().eq('user_id', user?.id),
        supabase.from('center_chat_messages').delete().eq('sender_id', user?.id),
        supabase.from('center_profiles').delete().eq('id', user?.id)
      ]);

      await signOut();

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le compte"
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Paramètres Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences et votre confidentialité
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-posts">Nouveaux posts des amis</Label>
              <Switch
                id="notifications-posts"
                checked={settings.notifications.posts}
                onCheckedChange={(checked) => updateSetting('notifications', 'posts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-messages">Messages privés</Label>
              <Switch
                id="notifications-messages"
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => updateSetting('notifications', 'messages', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-follows">Nouveaux abonnés</Label>
              <Switch
                id="notifications-follows"
                checked={settings.notifications.follows}
                onCheckedChange={(checked) => updateSetting('notifications', 'follows', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-mentions">Mentions</Label>
              <Switch
                id="notifications-mentions"
                checked={settings.notifications.mentions}
                onCheckedChange={(checked) => updateSetting('notifications', 'mentions', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-games">Invitations aux jeux</Label>
              <Switch
                id="notifications-games"
                checked={settings.notifications.gameInvites}
                onCheckedChange={(checked) => updateSetting('notifications', 'gameInvites', checked)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-email">Notifications par email</Label>
              <Switch
                id="notifications-email"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-push">Notifications push</Label>
              <Switch
                id="notifications-push"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-profile">Profil visible publiquement</Label>
              <Switch
                id="privacy-profile"
                checked={settings.privacy.profileVisible}
                onCheckedChange={(checked) => updateSetting('privacy', 'profileVisible', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-posts">Posts publics</Label>
              <Switch
                id="privacy-posts"
                checked={settings.privacy.postsPublic}
                onCheckedChange={(checked) => updateSetting('privacy', 'postsPublic', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-messages">Autoriser les messages de tous</Label>
              <Switch
                id="privacy-messages"
                checked={settings.privacy.allowMessages}
                onCheckedChange={(checked) => updateSetting('privacy', 'allowMessages', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-online">Afficher le statut en ligne</Label>
              <Switch
                id="privacy-online"
                checked={settings.privacy.showOnlineStatus}
                onCheckedChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-tagging">Autoriser le marquage</Label>
              <Switch
                id="privacy-tagging"
                checked={settings.privacy.allowTagging}
                onCheckedChange={(checked) => updateSetting('privacy', 'allowTagging', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="preferences-dark">Mode sombre</Label>
              <Switch
                id="preferences-dark"
                checked={settings.preferences.darkMode}
                onCheckedChange={(checked) => updateSetting('preferences', 'darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="preferences-autoplay">Lecture automatique des médias</Label>
              <Switch
                id="preferences-autoplay"
                checked={settings.preferences.autoplay}
                onCheckedChange={(checked) => updateSetting('preferences', 'autoplay', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="preferences-sync">Synchronisation des données</Label>
              <Switch
                id="preferences-sync"
                checked={settings.preferences.dataSync}
                onCheckedChange={(checked) => updateSetting('preferences', 'dataSync', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Données et compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleDataExport}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter mes données
            </Button>
            
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full justify-start"
            >
              <UserX className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
            
            <Separator />
            
            <Button
              variant="destructive"
              onClick={handleAccountDeletion}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </Button>
      </div>

      {/* Help */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm">
              Besoin d'aide ? Consultez notre{' '}
              <Button variant="link" className="p-0 text-sm">
                centre d'aide
              </Button>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterSettings;
