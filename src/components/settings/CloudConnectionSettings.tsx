
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCloudConnections } from '@/hooks/use-cloud-connections';
import { Link as LinkIcon, Unlink, Cloud, CheckCircle, AlertCircle, Shield } from 'lucide-react';

const CloudConnectionSettings = () => {
  const { 
    connections, 
    loading, 
    connectDropbox,
    connectKoofr,
    disconnectCloud, 
    isDropboxConnected,
    isKoofrConnected,
  } = useCloudConnections();

  const dropboxConnection = connections.find(conn => conn.provider === 'dropbox');
  const koofrConnection = connections.find(conn => conn.provider === 'koofr');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Connexions cloud
        </CardTitle>
        <CardDescription>
          Gérez vos connexions aux services de stockage cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropbox */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                <path fill="currentColor" d="M7.71,3.5L1.15,8L7.71,12.5L12.39,8L7.71,3.5M21.15,8L14.59,3.5L9.91,8L14.59,12.5L21.15,8M14.59,14.5L21.15,19L12.39,19L7.71,14.5L14.59,14.5M7.71,14.5L1.15,19L9.91,19L14.59,14.5L7.71,14.5Z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Dropbox</h3>
              <p className="text-sm text-gray-600">
                {isDropboxConnected() 
                  ? `Connecté comme ${dropboxConnection?.account_info?.email || 'Utilisateur'}`
                  : 'Non connecté'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isDropboxConnected() ? (
              <>
                <Badge variant="secondary" className="text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => dropboxConnection && disconnectCloud(dropboxConnection.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Déconnecter
                </Button>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non connecté
                </Badge>
                <Button 
                  onClick={connectDropbox}
                  disabled={loading}
                  size="sm"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connecter
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Koofr */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,10L12,14L8.5,10L12,6Z"/>
                </svg>
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2">
                Koofr
                <Shield className="w-4 h-4 text-green-500" />
              </h3>
              <p className="text-sm text-gray-600">
                {isKoofrConnected() 
                  ? `Connecté comme ${koofrConnection?.account_info?.email || 'Utilisateur'}`
                  : '10GB gratuit - Sécurité slovène 🇸🇮'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isKoofrConnected() ? (
              <>
                <Badge variant="secondary" className="text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => koofrConnection && disconnectCloud(koofrConnection.id)}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Déconnecter
                </Button>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non connecté
                </Badge>
                <Button 
                  onClick={connectKoofr}
                  disabled={loading}
                  size="sm"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connecter
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Infos importantes */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Pourquoi connecter un service cloud ?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Accès à tous vos fichiers depuis LuvviX Cloud</li>
            <li>• Synchronisation automatique entre vos appareils</li>
            <li>• Gestion unifiée de vos documents importants</li>
            <li>• Sauvegarde sécurisée et centralisée de vos données</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudConnectionSettings;
