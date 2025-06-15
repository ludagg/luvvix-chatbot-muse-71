
import React, { useState } from 'react';
import { ArrowLeft, Cloud, CheckCircle, AlertCircle, Link as LinkIcon, Unlink, Shield } from 'lucide-react';
import { useCloudConnections } from '@/hooks/use-cloud-connections';

interface KoofrCloudPageProps {
  onBack: () => void;
}

const KoofrCloudPage = ({ onBack }: KoofrCloudPageProps) => {
  const { 
    connections, 
    loading, 
    connectKoofr, 
    disconnectCloud, 
    isKoofrConnected 
  } = useCloudConnections();

  const koofrConnection = connections.find(conn => conn.provider === 'koofr');

  const handleConnect = async () => {
    await connectKoofr();
  };

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
                    ? `Connecté comme ${koofrConnection?.account_info?.email || 'Utilisateur'}`
                    : '10GB gratuit - Sécurité slovène 🇸🇮'
                  }
                </p>
              </div>
            </div>
            
            {isKoofrConnected() ? (
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
          
          {isKoofrConnected() ? (
            <button
              onClick={() => koofrConnection && disconnectCloud(koofrConnection.id)}
              className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Déconnecter Koofr
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-green-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              {loading ? 'Connexion...' : 'Connecter Koofr'}
            </button>
          )}
        </div>

        {/* Avantages */}
        <div className="bg-green-50 rounded-2xl p-4 mb-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Pourquoi connecter Koofr ?
          </h4>
          <ul className="text-sm text-green-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              10GB de stockage gratuit
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Basé en Slovénie (Europe)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Respect de la vie privée
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Accès depuis LuvviX Cloud
            </li>
          </ul>
        </div>

        {!isKoofrConnected() && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">
                  Connexion requise
                </h4>
                <p className="text-sm text-orange-800">
                  Vous devez connecter votre Koofr pour utiliser les fonctionnalités de stockage cloud de LuvviX.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KoofrCloudPage;
