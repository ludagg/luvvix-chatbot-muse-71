
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
    { id: 'gmail', name: 'Gmail', icon: '📧', description: 'Configuration IMAP/SMTP sécurisée' },
    { id: 'outlook', name: 'Outlook', icon: '📨', description: 'Configuration IMAP/SMTP sécurisée' },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '📩', description: 'Configuration IMAP/SMTP' },
    { id: 'imap', name: 'IMAP/SMTP', icon: '⚙️', description: 'Configuration manuelle' }
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setShowImapForm(true);
    
    // Pré-remplir les configurations connues
    if (providerId === 'gmail') {
      setImapConfig(prev => ({
        ...prev,
        imapServer: 'imap.gmail.com',
        imapPort: '993',
        smtpServer: 'smtp.gmail.com',
        smtpPort: '587'
      }));
    } else if (providerId === 'outlook') {
      setImapConfig(prev => ({
        ...prev,
        imapServer: 'outlook.office365.com',
        imapPort: '993',
        smtpServer: 'smtp-mail.outlook.com',
        smtpPort: '587'
      }));
    } else if (providerId === 'yahoo') {
      setImapConfig(prev => ({
        ...prev,
        imapServer: 'imap.mail.yahoo.com',
        imapPort: '993',
        smtpServer: 'smtp.mail.yahoo.com',
        smtpPort: '587'
      }));
    }
  };

  const handleImapConnect = async () => {
    if (!imapConfig.email || !imapConfig.password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non trouvée');
      }

      const { data, error } = await supabase
        .from('mail_accounts')
        .insert({
          user_id: session.user.id,
          email_address: imapConfig.email,
          provider: selectedProvider === 'imap' ? 'imap' : selectedProvider,
          app_password: imapConfig.password,
          provider_config: {
            imap_server: imapConfig.imapServer,
            imap_port: parseInt(imapConfig.imapPort),
            smtp_server: imapConfig.smtpServer,
            smtp_port: parseInt(imapConfig.smtpPort),
            use_ssl: true,
            display_name: imapConfig.displayName || imapConfig.email
          }
        });

      if (error) throw error;

      toast({
        title: "Compte connecté",
        description: "Votre compte a été configuré avec succès"
      });

      onAccountAdded();
      setShowImapForm(false);
      setImapConfig({
        email: '',
        password: '',
        imapServer: '',
        imapPort: '993',
        smtpServer: '',
        smtpPort: '587',
        displayName: ''
      });
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
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
              Pour Gmail et Outlook, utilisez un mot de passe d'application généré depuis les paramètres de sécurité de votre compte.
            </AlertDescription>
          </Alert>

          {!showImapForm ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card 
                    key={provider.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleProviderSelect(provider.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{provider.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {provider.description}
                      </p>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Connecter
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                <h3 className="text-lg font-semibold">Configuration {providers.find(p => p.id === selectedProvider)?.name}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={imapConfig.email}
                      onChange={(e) => setImapConfig(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Mot de passe d'application *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={imapConfig.password}
                      onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mot de passe d'application"
                      required
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
                <h4 className="font-medium mb-2">Comment obtenir un mot de passe d'application :</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Gmail:</strong> Compte Google → Sécurité → Validation en 2 étapes → Mots de passe d'application
                  </div>
                  <div>
                    <strong>Outlook:</strong> Compte Microsoft → Sécurité → Options de sécurité avancées → Mots de passe d'application
                  </div>
                  <div>
                    <strong>Yahoo:</strong> Compte Yahoo → Sécurité du compte → Générer un mot de passe d'application
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
