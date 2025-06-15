import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Cloud, CheckCircle, Plus } from 'lucide-react';
import { useCloudConnections } from '@/hooks/use-cloud-connections';

// Adopt the type from the cloud hook, which includes created_at
interface CloudConnection {
  id: string;
  provider: string;
  account_info: any;
  is_active: boolean;
  created_at: string; // Ensures created_at is present in type
}

const CloudConnection: React.FC = () => {
  const {
    connections,
    isDropboxConnected,
    connectDropbox,
    disconnectCloud,
    getDropboxConnection,
    loading,
    // --------- Koofr ------------
    isKoofrConnected,
    connectKoofr,
    getKoofrConnection
  } = useCloudConnections();

  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const cloudProviders = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      icon: '📁',
      color: 'bg-blue-500',
      description: 'Synchronisez vos fichiers Google Drive'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      color: 'bg-blue-600',
      description: 'Accédez à vos fichiers Dropbox'
    },
    {
      id: 'icloud',
      name: 'iCloud',
      icon: '☁️',
      color: 'bg-gray-500',
      description: 'Connectez votre iCloud Drive'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '🔵',
      color: 'bg-blue-700',
      description: 'Synchronisez avec Microsoft OneDrive'
    }
  ];

  // Removing loadConnections and setConnections – use only the state from the cloud hook

  const handleConnect = async (providerId: string) => {
    setIsConnecting(true);
    setSelectedProvider(providerId);

    try {
      // Rediriger vers l'OAuth du provider
      // const redirectUrl = `${window.location.origin}/cloud/oauth`;
      // let authUrl = '';

      // switch (providerId) {
      //   case 'google_drive':
      //     authUrl = `https://accounts.google.com/oauth2/auth?` +
      //       `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
      //       `redirect_uri=${redirectUrl}&` +
      //       `scope=https://www.googleapis.com/auth/drive&` +
      //       `response_type=code&` +
      //       `access_type=offline&` +
      //       `prompt=consent&` +
      //       `state=google_drive`;
      //     break;
        
      //   case 'dropbox':
      //     authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      //       `client_id=${import.meta.env.VITE_DROPBOX_CLIENT_ID}&` +
      //       `redirect_uri=${redirectUrl}&` +
      //       `response_type=code&` +
      //       `state=dropbox`;
      //     break;
        
      //   case 'onedrive':
      //     authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      //       `client_id=${import.meta.env.VITE_MICROSOFT_CLIENT_ID}&` +
      //       `redirect_uri=${redirectUrl}&` +
      //       `scope=https://graph.microsoft.com/Files.ReadWrite&` +
      //       `response_type=code&` +
      //       `state=onedrive`;
      //     break;
        
      //   default:
      //     throw new Error('Provider non supporté');
      // }

      // if (authUrl) {
      //   window.location.href = authUrl;
      // } else {
      //   throw new Error('Configuration OAuth manquante');
      // }

    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter au service de stockage"
      });
    } finally {
      setIsConnecting(false);
      setSelectedProvider('');
    }
  };

  const getConnectionStatus = (providerId: string) => {
    return connections.find(conn => conn.provider === providerId);
  };

  const koofrConn = getKoofrConnection();
  const koofrConnected = isKoofrConnected();
  const koofrEmail = koofrConn?.account_info?.email;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Cloud className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold mb-2">LuvviX Cloud</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connectez vos services de stockage cloud préférés pour accéder à tous vos fichiers depuis une interface unifiée.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cloudProviders.map((provider) => {
          const connection = getConnectionStatus(provider.id);
          const isConnected = !!connection;

          return (
            <Card key={provider.id} className="relative">
              <CardHeader className="text-center pb-3">
                <div className={`w-12 h-12 mx-auto mb-2 ${provider.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                  {provider.icon}
                </div>
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                {isConnected && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connecté
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                  {provider.description}
                </p>
                <Button
                  onClick={() => handleConnect(provider.id)}
                  disabled={isConnecting && selectedProvider === provider.id}
                  variant={isConnected ? "outline" : "default"}
                  className="w-full"
                >
                  {isConnecting && selectedProvider === provider.id ? (
                    'Connexion...'
                  ) : isConnected ? (
                    'Reconnecter'
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Connecter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        <Card key="koofr" className="relative">
          <CardHeader className="text-center pb-3">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl">
              <span role="img" aria-label="Koofr">☁️</span>
            </div>
            <CardTitle className="text-lg">Koofr</CardTitle>
            {koofrConnected && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connecté
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Synchronisez vos fichiers Koofr.<br />
              {koofrConnected && koofrEmail ? (
                <span className="text-green-700 text-xs">Connecté comme {koofrEmail}</span>
              ) : (
                <span className="text-gray-500 text-xs">La sécurité slovène 🇸🇮</span>
              )}
            </p>
            {koofrConnected ? (
              <Button
                onClick={() => koofrConn && disconnectCloud(koofrConn.id)}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Déconnecter Koofr
              </Button>
            ) : (
              <Button
                onClick={connectKoofr}
                disabled={loading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connecter Koofr
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services connectés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((connection) => {
                // match provider meta for icon/color
                const provider = cloudProviders.find(p => p.id === connection.provider);
                const { created_at } = connection; // <-- Explicit destructure created_at
                return (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${provider?.color} rounded-full flex items-center justify-center text-white text-sm`}>
                        {provider?.icon}
                      </div>
                      <div>
                        <p className="font-medium">{provider?.name ?? connection.provider}</p>
                        <p className="text-sm text-gray-500">
                          Connecté le {created_at ? new Date(created_at).toLocaleDateString('fr-FR') : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CloudConnection;
