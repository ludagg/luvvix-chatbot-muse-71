
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const MobileProfile = () => {
  const { user, signOut } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';
  const userEmail = user?.email || 'alex@luvvix.com';

  const profileOptions = [
    { id: 'account', icon: '👤', title: 'Informations du compte', description: 'Gérer vos données personnelles' },
    { id: 'security', icon: '🔒', title: 'Sécurité et confidentialité', description: 'Paramètres de sécurité' },
    { id: 'notifications', icon: '🔔', title: 'Notifications', description: 'Préférences de notification' },
    { id: 'storage', icon: '💾', title: 'Stockage', description: 'Gestion de l\'espace de stockage' },
    { id: 'appearance', icon: '🎨', title: 'Apparence', description: 'Thème et personnalisation' },
    { id: 'language', icon: '🌐', title: 'Langue et région', description: 'Paramètres de localisation' },
    { id: 'help', icon: '❓', title: 'Aide et support', description: 'Centre d\'aide et contact' },
    { id: 'about', icon: 'ℹ️', title: 'À propos', description: 'Version et informations légales' },
  ];

  const stats = [
    { label: 'Services utilisés', value: '12', color: 'text-blue-600' },
    { label: 'Stockage utilisé', value: '15.2 GB', color: 'text-green-600' },
    { label: 'Jours actifs', value: '247', color: 'text-purple-600' },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">👤</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{userName}</h2>
          <p className="text-blue-100">{userEmail}</p>
          
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-blue-100">En ligne</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-2">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <p className="font-medium text-gray-900 text-sm">Modifier le profil</p>
          </button>
          
          <button className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </div>
            <p className="font-medium text-gray-900 text-sm">Partager profil</p>
          </button>
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {profileOptions.map((option, index) => (
            <button
              key={option.id}
              className={`w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                index !== profileOptions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">{option.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="px-4 mt-6">
        <button
          onClick={() => signOut()}
          className="w-full bg-red-500 text-white rounded-2xl p-4 font-medium active:scale-95 transition-transform"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default MobileProfile;
