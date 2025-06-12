
import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, Users, Globe, Database, Download } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage = ({ onBack }: PrivacyPageProps) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, friends, private
    onlineStatus: true,
    activityTracking: true,
    dataCollection: true,
    personalization: true,
    thirdPartySharing: false,
    locationTracking: true,
    usageAnalytics: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Confidentialité</h1>
        <div className="w-10"></div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Visibilité du profil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Visibilité du profil</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { value: 'public', label: 'Public', desc: 'Visible par tous les utilisateurs' },
              { value: 'friends', label: 'Contacts uniquement', desc: 'Visible par vos contacts' },
              { value: 'private', label: 'Privé', desc: 'Visible par vous uniquement' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting('profileVisibility', option.value)}
                className={`w-full p-3 rounded-xl text-left transition-colors ${
                  settings.profileVisibility === option.value
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Activité et statut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité et statut</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Statut en ligne</p>
                  <p className="text-sm text-gray-600">Afficher quand vous êtes actif</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.onlineStatus}
                onToggle={() => updateSetting('onlineStatus', !settings.onlineStatus)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Suivi d'activité</p>
                  <p className="text-sm text-gray-600">Permettre le suivi de votre activité</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.activityTracking}
                onToggle={() => updateSetting('activityTracking', !settings.activityTracking)}
              />
            </div>
          </div>
        </div>

        {/* Collecte de données */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Collecte de données</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Collecte de données d'usage</p>
                <p className="text-sm text-gray-600">Améliorer l'expérience utilisateur</p>
              </div>
              <ToggleSwitch 
                enabled={settings.dataCollection}
                onToggle={() => updateSetting('dataCollection', !settings.dataCollection)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Personnalisation</p>
                <p className="text-sm text-gray-600">Personnaliser le contenu et les suggestions</p>
              </div>
              <ToggleSwitch 
                enabled={settings.personalization}
                onToggle={() => updateSetting('personalization', !settings.personalization)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Géolocalisation</p>
                <p className="text-sm text-gray-600">Services basés sur la localisation</p>
              </div>
              <ToggleSwitch 
                enabled={settings.locationTracking}
                onToggle={() => updateSetting('locationTracking', !settings.locationTracking)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Analyses d'utilisation</p>
                <p className="text-sm text-gray-600">Données anonymisées pour améliorer le service</p>
              </div>
              <ToggleSwitch 
                enabled={settings.usageAnalytics}
                onToggle={() => updateSetting('usageAnalytics', !settings.usageAnalytics)}
              />
            </div>
          </div>
        </div>

        {/* Partage avec des tiers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Partage de données</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Partage avec des partenaires</p>
                <p className="text-sm text-gray-600">Données anonymisées uniquement</p>
              </div>
              <ToggleSwitch 
                enabled={settings.thirdPartySharing}
                onToggle={() => updateSetting('thirdPartySharing', !settings.thirdPartySharing)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-700">
                <Shield className="w-4 h-4 inline mr-1" />
                Vos données personnelles ne sont jamais vendues ou partagées sans votre consentement explicite.
              </p>
            </div>
          </div>
        </div>

        {/* Contrôle des données */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrôle de vos données</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Télécharger mes données</p>
                  <p className="text-sm text-gray-600">Exporter toutes vos données</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <EyeOff className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Demander l'effacement</p>
                  <p className="text-sm text-gray-600">Supprimer définitivement vos données</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Rapport de confidentialité</p>
                  <p className="text-sm text-gray-600">Voir comment vos données sont utilisées</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Liens légaux */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents légaux</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Politique de confidentialité</p>
              <p className="text-sm text-gray-600">Mise à jour le 12 juin 2024</p>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Conditions d'utilisation</p>
              <p className="text-sm text-gray-600">Mise à jour le 12 juin 2024</p>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Politique des cookies</p>
              <p className="text-sm text-gray-600">Mise à jour le 12 juin 2024</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
