
import React, { useState } from 'react';
import { ArrowLeft, Shield, Key, Smartphone, Eye, EyeOff, Check, X } from 'lucide-react';

interface SecurityPageProps {
  onBack: () => void;
}

const SecurityPage = ({ onBack }: SecurityPageProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const passwordRequirements = [
    { rule: 'Au moins 8 caractères', met: passwords.new.length >= 8 },
    { rule: 'Une majuscule', met: /[A-Z]/.test(passwords.new) },
    { rule: 'Une minuscule', met: /[a-z]/.test(passwords.new) },
    { rule: 'Un chiffre', met: /\d/.test(passwords.new) },
    { rule: 'Un caractère spécial', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new) }
  ];

  const connectedDevices = [
    { id: 1, name: 'iPhone 14 Pro', location: 'Paris, France', lastActive: 'Actuel', status: 'active' },
    { id: 2, name: 'MacBook Pro', location: 'Paris, France', lastActive: 'Il y a 2h', status: 'active' },
    { id: 3, name: 'iPad Air', location: 'Lyon, France', lastActive: 'Il y a 1j', status: 'inactive' }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Sécurité</h1>
        <div className="w-10"></div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Changer le mot de passe */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Key className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              
              {/* Exigences du mot de passe */}
              {passwords.new && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.met ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-green-600' : 'text-red-600'}`}>
                        {req.rule}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors">
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>

        {/* Authentification à deux facteurs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {twoFactorEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-700">
                L'authentification à deux facteurs est activée. Vous recevrez un code par SMS.
              </p>
            </div>
          )}
        </div>

        {/* Authentification biométrique */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Authentification biométrique</h3>
                <p className="text-sm text-gray-600">Touch ID / Face ID</p>
              </div>
            </div>
            <button
              onClick={() => setBiometricEnabled(!biometricEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                biometricEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Appareils connectés */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appareils connectés</h3>
          
          <div className="space-y-3">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-sm text-gray-600">{device.location}</p>
                    <p className="text-xs text-gray-500">{device.lastActive}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  {device.status !== 'active' && (
                    <button className="text-red-500 text-sm font-medium">
                      Déconnecter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journal des connexions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Connexion réussie</p>
                <p className="text-sm text-gray-600">iPhone 14 Pro • Paris, France</p>
              </div>
              <p className="text-xs text-gray-500">Il y a 10 min</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Connexion réussie</p>
                <p className="text-sm text-gray-600">MacBook Pro • Paris, France</p>
              </div>
              <p className="text-xs text-gray-500">Il y a 2h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
