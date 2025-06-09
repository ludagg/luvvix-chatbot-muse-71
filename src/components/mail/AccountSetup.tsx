
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Mail, Plus, Settings, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AccountSetupProps {
  onAccountAdded: () => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onAccountAdded }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showImapForm, setShowImapForm] = useState(false);
  const [imapConfig, setImapConfig] = useState({
    email: '',
    password: '',
    imapServer: '',
    imapPort: '993',
    smtpServer: '',
    smtpPort: '587',
    displayName: ''
  });

  const providers = [
    { id: 'gmail', name: 'Gmail', icon: '📧', authUrl: 'https://accounts.google.com/oauth2/auth' },
    { id: 'outlook', name: 'Outlook', icon: '📨', authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '📩', authUrl: '' },
    { id: 'imap', name: 'IMAP/SMTP', icon: '⚙️', authUrl: '' }
  ];

  const handleOAuthConnect = async (provider: string) => {
    setIsConnecting(true);
    
    try {
      if (provider === 'gmail') {
        const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // À configurer
        const redirectUri = `${window.location.origin}/mail`;
        const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';
        
        const authUrl = `https://accounts.google.com/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
        
        window.location.href = authUrl;
        
      } else if (provider === 'outlook') {
        const clientId = 'YOUR_MICROSOFT_CLIENT_ID'; // À configurer
        const redirectUri = `${window.location.origin}/mail`;
        const scope = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read';
        
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
        
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter au service de messagerie"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImapConnect = async () => {
    setIsConnecting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non trouvée');
      }

      const { data, error } = await supabase.functions.invoke('imap-connect', {
        body: {
          email: imapConfig.email,
          password: imapConfig.password,
          imapServer: imapConfig.imapServer,
          imapPort: parseInt(imapConfig.imapPort),
          smtpServer: imapConfig.smtpServer,
          smtpPort: parseInt(imapConfig.smtpPort),
          displayName: imapConfig.displayName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Compte IMAP connecté",
        description: "Votre compte a été configuré avec succès"
      });

      onAccountAdded();
      setShowImapForm(false);
      
    } catch (error) {
      console.error('Erreur IMAP:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion IMAP",
        description: "Vérifiez vos paramètres de connexion"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Connecter votre messagerie</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez vos comptes email pour commencer à utiliser LuvviX Mail
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!showImapForm ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card 
                    key={provider.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      if (provider.id === 'imap') {
                        setShowImapForm(true);
                      } else {
                        setSelectedProvider(provider.id);
                        handleOAuthConnect(provider.id);
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{provider.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.id === 'imap' ? 'Configuration manuelle' : 'Connexion sécurisée'}
                      </p>
                      <Button 
                        className="mt-4 w-full" 
                        variant="outline"
                        disabled={isConnecting}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connecter
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div className="text-center">
                <h3 className="font-semibold mb-2">Configuration avancée</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Pour d'autres fournisseurs ou configurations personnalisées
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImapForm(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration IMAP/SMTP
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowImapForm(false)}
                  className="mr-4"
                >
                  ← Retour
                </Button>
                <h3 className="text-lg font-semibold">Configuration IMAP/SMTP</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={imapConfig.email}
                      onChange={(e) => setImapConfig(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Mot de passe / App Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={imapConfig.password}
                      onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Input
                      id="displayName"
                      value={imapConfig.displayName}
                      onChange={(e) => setImapConfig(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="imapServer">Serveur IMAP</Label>
                      <Input
                        id="imapServer"
                        value={imapConfig.imapServer}
                        onChange={(e) => setImapConfig(prev => ({ ...prev, imapServer: e.target.value }))}
                        placeholder="imap.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imapPort">Port IMAP</Label>
                      <Input
                        id="imapPort"
                        value={imapConfig.imapPort}
                        onChange={(e) => setImapConfig(prev => ({ ...prev, imapPort: e.target.value }))}
                        placeholder="993"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="smtpServer">Serveur SMTP</Label>
                      <Input
                        id="smtpServer"
                        value={imapConfig.smtpServer}
                        onChange={(e) => setImapConfig(prev => ({ ...prev, smtpServer: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">Port SMTP</Label>
                      <Input
                        id="smtpPort"
                        value={imapConfig.smtpPort}
                        onChange={(e) => setImapConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                        placeholder="587"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleImapConnect} 
                className="w-full"
                disabled={isConnecting || !imapConfig.email || !imapConfig.password}
              >
                {isConnecting ? 'Connexion...' : 'Connecter le compte'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSetup;
