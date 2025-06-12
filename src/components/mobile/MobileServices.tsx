
import React, { useState } from 'react';

const MobileServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const services = [
    {
      id: 'luvvix-learn',
      name: 'LuvviX Learn',
      description: 'Plateforme d\'apprentissage',
      icon: '🎓',
      bgColor: 'bg-blue-500',
      badge: 'Nouveau',
      category: 'education'
    },
    {
      id: 'luvvix-mail',
      name: 'LuvviX Mail',
      description: 'Messagerie intelligente',
      icon: '✉️',
      bgColor: 'bg-red-500',
      category: 'communication'
    },
    {
      id: 'luvvix-translate',
      name: 'LuvviX Translate',
      description: 'Traduction instantanée',
      icon: '🌐',
      bgColor: 'bg-green-500',
      category: 'productivity'
    },
    {
      id: 'luvvix-weather',
      name: 'LuvviX Weather',
      description: 'Prévisions météo',
      icon: '☀️',
      bgColor: 'bg-yellow-500',
      category: 'lifestyle'
    },
    {
      id: 'luvvix-forms',
      name: 'LuvviX Forms',
      description: 'Création de formulaires',
      icon: '📝',
      bgColor: 'bg-purple-500',
      category: 'productivity'
    },
    {
      id: 'luvvix-cloud',
      name: 'LuvviX Cloud',
      description: 'Stockage cloud',
      icon: '☁️',
      bgColor: 'bg-indigo-500',
      category: 'storage'
    },
    {
      id: 'luvvix-ai',
      name: 'LuvviX AI Studio',
      description: 'Assistant IA avancé',
      icon: '🤖',
      bgColor: 'bg-pink-500',
      category: 'ai'
    },
    {
      id: 'luvvix-news',
      name: 'LuvviX News',
      description: 'Actualités personnalisées',
      icon: '📰',
      bgColor: 'bg-orange-500',
      category: 'information'
    }
  ];

  const tabs = [
    { id: 'all', label: 'Tous', icon: '⚡' },
    { id: 'recent', label: 'Récents', icon: '🕐' },
    { id: 'productive', label: 'Productivité', icon: '📊' }
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto pb-20">
      {/* Header */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Services</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className="relative">
                <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-3`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                
                {service.badge && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                {service.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600">Essayez avec d'autres mots-clés</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileServices;
