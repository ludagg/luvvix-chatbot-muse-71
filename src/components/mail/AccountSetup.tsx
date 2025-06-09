
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Plus, Settings, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    { id: 'gmail', name: 'Gmail', icon: '📧', description: 'Connexion sécurisée via OAuth' },
    { id: 'outlook', name: 'Outlook', icon: '📨', description: 'Connexion sécurisée via OAuth' },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '📩', description: 'Configuration IMAP/SMTP' },
    { id: 'imap', name: 'IMAP/SMTP', icon: '⚙️', description: 'Configuration manuelle' }
  ];

  const handleOAuthConnect = async (provider: string) => {
    setIsConnecting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentification requise",
          description: "Veuillez vous connecter pour ajouter un compte email"
        });
        setIsConnecting(false);
        return;
      }

      if (provider === 'gmail') {
        // Configuration pour Gmail OAuth
        const clientId = '877724002157-8e4p4o5j7k6l8m9n0o1p2q3r4s5t6u7v.apps.googleusercontent.com';
        const redirectUri = `${window.location.origin}/oauth`;
        const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
        
        const authUrl = `https://accounts.google.com/oauth2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${scope}&` +
          `response_type=code&` +
          `access_type=offline&` +
          `prompt=consent&` +
          `state=gmail`;
        
        window.location.href = authUrl;
        
      } else if (provider === 'outlook') {
        // Configuration pour Outlook OAuth
        const clientId = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';
        const redirectUri = `${window.location.origin}/oauth`;
        const scope = encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access');
        
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${scope}&` +
          `state=outlook`;
        
        window.location.href = authUrl;
      } else if (provider === 'yahoo') {
        // Yahoo utilise IMAP/SMTP
        setShowImapForm(true);
        setImapConfig(prev => ({
          ...prev,
          imapServer: 'imap.mail.yahoo.com',
          imapPort: '993',
          smtpServer: 'smtp.mail.yahoo.com',
          smtpPort: '587'
        }));
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

      // Sauvegarder la configuration IMAP directement dans la base
      const { data, error } = await supabase
        .from('mail_accounts')
        .insert({
          user_id: session.user.id,
          email_address: imapConfig.email,
          display_name: imapConfig.displayName || imapConfig.email,
          provider: 'imap',
          provider_config: {
            imap_server: imapConfig.imapServer,
            imap_port: parseInt(imapConfig.imapPort),
            smtp_server: imapConfig.smtpServer,
            smtp_port: parseInt(imapConfig.smtpPort),
            use_ssl: true
          },
          app_password: imapConfig.password
        });

      if (error) throw error;

      toast({
        title: "Compte IMAP connecté",
        description: "Votre compte a été configuré avec succès"
      });

      onAccountAdded();
      setShowImapForm(false);
      
    } catch (error: any) {
      console.error('Erreur IMAP:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion IMAP",
        description: error.message || "Vérifiez vos paramètres de connexion"
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
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Note: Les clés API OAuth doivent être configurées côté serveur pour Gmail et Outlook. 
              En attendant, vous pouvez utiliser la configuration IMAP/SMTP.
            </AlertDescription>
          </Alert>

          {!showImapForm ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card 
                    key={provider.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      if (provider.id === 'imap' || provider.id === 'yahoo') {
                        setShowImapForm(true);
                        if (provider.id === 'yahoo') {
                          setImapConfig(prev => ({
                            ...prev,
                            imapServer: 'imap.mail.yahoo.com',
                            imapPort: '993',
                            smtpServer: 'smtp.mail.yahoo.com',
                            smtpPort: '587'
                          }));
                        }
                      } else {
                        setSelectedProvider(provider.id);
                        handleOAuthConnect(provider.id);
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{provider.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {provider.description}
                      </p>
                      <Button 
                        className="w-full" 
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
                      placeholder="Utilisez un mot de passe d'application si disponible"
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

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Configurations rapides :</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Gmail:</strong> IMAP: imap.gmail.com:993, SMTP: smtp.gmail.com:587
                    <br />
                    <em>Utilisez un mot de passe d'application depuis votre compte Google</em>
                  </div>
                  <div>
                    <strong>Outlook/Hotmail:</strong> IMAP: outlook.office365.com:993, SMTP: smtp-mail.outlook.com:587
                  </div>
                  <div>
                    <strong>Yahoo:</strong> IMAP: imap.mail.yahoo.com:993, SMTP: smtp.mail.yahoo.com:587
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
