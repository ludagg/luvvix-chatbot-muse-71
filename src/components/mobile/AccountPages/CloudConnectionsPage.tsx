import React from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Link as LinkIcon, Unlink, Shield } from 'lucide-react';
import { useCloudConnections } from '@/hooks/use-cloud-connections';

interface CloudConnectionsPageProps {
  onBack: () => void;
}

const CloudConnectionsPage = ({ onBack }: CloudConnectionsPageProps) => {
  const { 
    connections, 
    loading, 
    connectKoofr, 
    connectDropbox,
    disconnectCloud, 
    isKoofrConnected,
    isDropboxConnected
  } = useCloudConnections();

  const koofrConnection = connections.find(conn => conn.provider === 'koofr');
  const dropboxConnection = connections.find(conn => conn.provider === 'dropbox');

  // Ajout détection Dropbox connecté
  const dropboxConnected = !!dropboxConnection;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Connexions Cloud</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Koofr */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,10L12,14L8.5,10L12,6Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Koofr
                  <Shield className="w-4 h-4 text-green-500" />
                </h3>
                <p className="text-sm text-gray-600">
                  {isKoofrConnected() 
                    ? `Connecté: ${koofrConnection?.account_info?.email || 'Utilisateur'}`
                    : '10GB gratuit - Sécurité slovène 🇸🇮'
                  }
                </p>
              </div>
            </div>
            
            {isKoofrConnected() ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            )}
          </div>
          
          {isKoofrConnected() ? (
            <button
              onClick={() => koofrConnection && disconnectCloud(koofrConnection.id)}
              className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Déconnecter
            </button>
          ) : (
            <button
              onClick={connectKoofr}
              disabled={loading}
              className="w-full bg-green-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              {loading ? 'Connexion...' : 'Connecter Koofr'}
            </button>
          )}
        </div>

        {/* Dropbox */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                 <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <path fill="currentColor" d="M7.71,3.5L1.15,8L7.71,12.5L12.39,8L7.71,3.5M21.15,8L14.59,3.5L9.91,8L14.59,12.5L21.15,8M14.59,14.5L21.15,19L12.39,19L7.71,14.5L14.59,14.5M7.71,14.5L1.15,19L9.91,19L14.59,14.5L7.71,14.5Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dropbox</h3>
                <p className="text-sm text-gray-600">
                  {dropboxConnected
                    ? `Connecté: ${dropboxConnection?.account_info?.email || 'Utilisateur'}`
                    : 'Le leader de la synchro cloud'
                  }
                </p>
              </div>
            </div>
            {dropboxConnected ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            )}
          </div>
          
          {dropboxConnected ? (
            <button
              onClick={() => dropboxConnection && disconnectCloud(dropboxConnection.id)}
              className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Déconnecter
            </button>
          ) : (
            <button
              onClick={connectDropbox}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              {loading ? 'Connexion...' : 'Connecter Dropbox'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudConnectionsPage;
