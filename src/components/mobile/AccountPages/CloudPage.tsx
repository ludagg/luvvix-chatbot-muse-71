
import React from 'react';
import { ArrowLeft, Cloud, CheckCircle, AlertCircle, Link as LinkIcon, Unlink } from 'lucide-react';
import { useCloudConnections } from '@/hooks/use-cloud-connections';

interface CloudPageProps {
  onBack: () => void;
}

const CloudPage = ({ onBack }: CloudPageProps) => {
  const { 
    connections, 
    loading, 
    connectDropbox, 
    disconnectCloud, 
    isDropboxConnected 
  } = useCloudConnections();

  const dropboxConnection = connections.find(conn => conn.provider === 'dropbox');

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
                  {isDropboxConnected() 
                    ? `Connecté comme ${dropboxConnection?.account_info?.email || 'Utilisateur'}`
                    : 'Non connecté'
                  }
                </p>
              </div>
            </div>
            
            {isDropboxConnected() ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Connecté</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Non connecté</span>
              </div>
            )}
          </div>
          
          {isDropboxConnected() ? (
            <button
              onClick={() => dropboxConnection && disconnectCloud(dropboxConnection.id)}
              className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Déconnecter Dropbox
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

        {/* Avantages */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Pourquoi connecter Dropbox ?
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Accès à vos fichiers depuis LuvviX Cloud
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Synchronisation automatique
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Gestion unifiée de vos documents
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Sauvegarde sécurisée
            </li>
          </ul>
        </div>

        {!isDropboxConnected() && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
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
      </div>
    </div>
  );
};

export default CloudPage;
