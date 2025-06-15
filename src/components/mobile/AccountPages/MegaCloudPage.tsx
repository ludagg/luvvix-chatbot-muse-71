
import React, { useState } from 'react';
import { ArrowLeft, Cloud, CheckCircle, AlertCircle, Link as LinkIcon, Unlink, Shield } from 'lucide-react';
import { useMegaConnections } from '@/hooks/use-mega-connections';

interface MegaCloudPageProps {
  onBack: () => void;
}

const MegaCloudPage = ({ onBack }: MegaCloudPageProps) => {
  const { 
    connections, 
    loading, 
    connectMega, 
    disconnectCloud, 
    isMegaConnected 
  } = useMegaConnections();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  const megaConnection = connections.find(conn => conn.provider === 'mega');

  const handleConnect = async () => {
    if (!email || !password) return;
    
    const result = await connectMega(email, password);
    if (result.success) {
      setEmail('');
      setPassword('');
      setShowForm(false);
    }
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
        {/* Mega */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,10L12,14L8.5,10L12,6Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Mega
                  <Shield className="w-4 h-4 text-green-500" />
                </h3>
                <p className="text-sm text-gray-600">
                  {isMegaConnected() 
                    ? `Connecté comme ${megaConnection?.account_info?.email || 'Utilisateur'}`
                    : '50GB gratuit - Chiffrement E2E'
                  }
                </p>
              </div>
            </div>
            
            {isMegaConnected() ? (
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
          
          {isMegaConnected() ? (
            <button
              onClick={() => megaConnection && disconnectCloud(megaConnection.id)}
              className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Déconnecter Mega
            </button>
          ) : (
            <div className="space-y-3">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-red-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Connecter Mega
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Mega"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConnect}
                      disabled={loading || !email || !password}
                      className="flex-1 bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Connexion...' : 'Connecter'}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avantages */}
        <div className="bg-red-50 rounded-2xl p-4 mb-4">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Pourquoi connecter Mega ?
          </h4>
          <ul className="text-sm text-red-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              50GB de stockage gratuit
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Chiffrement de bout en bout
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Confidentialité maximale
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Accès depuis LuvviX Cloud
            </li>
          </ul>
        </div>

        {!isMegaConnected() && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">
                  Connexion requise
                </h4>
                <p className="text-sm text-orange-800">
                  Vous devez connecter votre Mega pour utiliser les fonctionnalités de stockage cloud de LuvviX.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaCloudPage;
