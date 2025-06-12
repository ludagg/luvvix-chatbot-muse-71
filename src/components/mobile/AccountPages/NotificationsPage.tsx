
import React, { useState } from 'react';
import { ArrowLeft, Bell, Mail, MessageCircle, Calendar, Zap, Volume2, Moon } from 'lucide-react';

interface NotificationsPageProps {
  onBack: () => void;
}

const NotificationsPage = ({ onBack }: NotificationsPageProps) => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      security: true,
      updates: true,
      social: false,
      marketing: false,
      reminders: true,
      news: true,
      weather: true,
      ai: true
    }
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCategorySetting = (category: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
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
        <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        <div className="w-10"></div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Notifications push</p>
                  <p className="text-sm text-gray-600">Alertes sur l'appareil</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.pushNotifications}
                onToggle={() => updateSetting('pushNotifications', !settings.pushNotifications)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Notifications email</p>
                  <p className="text-sm text-gray-600">Recevoir par email</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.emailNotifications}
                onToggle={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Notifications SMS</p>
                  <p className="text-sm text-gray-600">Recevoir par SMS</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.smsNotifications}
                onToggle={() => updateSetting('smsNotifications', !settings.smsNotifications)}
              />
            </div>
          </div>
        </div>

        {/* Sons et vibrations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sons et vibrations</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Sons</p>
                  <p className="text-sm text-gray-600">Jouer un son</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.soundEnabled}
                onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Vibrations</p>
                  <p className="text-sm text-gray-600">Vibrer à la réception</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.vibrationEnabled}
                onToggle={() => updateSetting('vibrationEnabled', !settings.vibrationEnabled)}
              />
            </div>
          </div>
        </div>

        {/* Mode Ne pas déranger */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ne pas déranger</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium text-gray-900">Mode silencieux</p>
                  <p className="text-sm text-gray-600">Désactiver toutes les notifications</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.doNotDisturb}
                onToggle={() => updateSetting('doNotDisturb', !settings.doNotDisturb)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">Heures de silence</p>
                  <p className="text-sm text-gray-600">Programmer le mode silencieux</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.quietHours.enabled}
                onToggle={() => updateSetting('quietHours', {...settings.quietHours, enabled: !settings.quietHours.enabled})}
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="pl-8 space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">De</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateSetting('quietHours', {...settings.quietHours, start: e.target.value})}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">À</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateSetting('quietHours', {...settings.quietHours, end: e.target.value})}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Catégories de notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de notifications</h3>
          
          <div className="space-y-4">
            {Object.entries({
              security: { label: 'Sécurité', desc: 'Alertes de sécurité importantes', icon: '🔒' },
              updates: { label: 'Mises à jour', desc: 'Nouvelles fonctionnalités', icon: '🔄' },
              social: { label: 'Social', desc: 'Activité sur LuvviX Center', icon: '👥' },
              marketing: { label: 'Marketing', desc: 'Promotions et offres', icon: '🎯' },
              reminders: { label: 'Rappels', desc: 'Rappels et échéances', icon: '⏰' },
              news: { label: 'Actualités', desc: 'Nouvelles importantes', icon: '📰' },
              weather: { label: 'Météo', desc: 'Alertes météorologiques', icon: '🌤️' },
              ai: { label: 'Assistant IA', desc: 'Suggestions intelligentes', icon: '🤖' }
            }).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{config.label}</p>
                    <p className="text-sm text-gray-600">{config.desc}</p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={settings.categories[key as keyof typeof settings.categories]}
                  onToggle={() => updateCategorySetting(key, !settings.categories[key as keyof typeof settings.categories])}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Paramètres avancés */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres avancés</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Tester les notifications</p>
              <p className="text-sm text-gray-600">Envoyer une notification de test</p>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Historique des notifications</p>
              <p className="text-sm text-gray-600">Voir toutes les notifications reçues</p>
            </button>
            
            <button className="w-full text-left p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
              <p className="font-medium text-red-600">Réinitialiser les paramètres</p>
              <p className="text-sm text-red-500">Revenir aux paramètres par défaut</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
