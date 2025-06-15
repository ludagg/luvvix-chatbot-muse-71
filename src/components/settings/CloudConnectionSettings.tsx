
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCloudConnections } from '@/hooks/use-cloud-connections';
import { Link as LinkIcon, Unlink, Cloud, CheckCircle, AlertCircle } from 'lucide-react';

const CloudConnectionSettings = () => {
  const { 
    connections, 
    loading, 
    connectDropbox, 
    disconnectCloud, 
    isDropboxConnected 
  } = useCloudConnections();

  const dropboxConnection = connections.find(conn => conn.provider === 'dropbox');

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

        {/* Infos importantes */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Pourquoi connecter Dropbox ?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Accès à vos fichiers depuis LuvviX Cloud</li>
            <li>• Synchronisation automatique</li>
            <li>• Gestion unifiée de vos documents</li>
            <li>• Sauvegarde sécurisée</li>
          </ul>
        </div>

        {!isDropboxConnected() && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">
                  Connexion requise
                </h4>
                <p className="text-sm text-orange-800">
                  Vous devez connecter votre Dropbox pour utiliser les fonctionnalités de stockage cloud de LuvviX.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CloudConnectionSettings;
