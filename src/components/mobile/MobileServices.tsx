
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const MobileServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const services = [
    {
      id: 'luvvix-ai-studio',
      name: 'LuvviX AI Studio',
      description: 'Studio de création d\'agents IA',
      icon: '🤖',
      bgColor: 'bg-purple-500',
      badge: 'Populaire',
      category: 'ai',
      url: '/ai-studio'
    },
    {
      id: 'luvvix-translate',
      name: 'LuvviX Translate',
      description: 'Traduction instantanée multilingue',
      icon: '🌐',
      bgColor: 'bg-green-500',
      category: 'productivity',
      url: '/translate'
    },
    {
      id: 'luvvix-weather',
      name: 'LuvviX Weather',
      description: 'Prévisions météo avancées',
      icon: '🌤️',
      bgColor: 'bg-blue-500',
      category: 'lifestyle',
      url: '/weather'
    },
    {
      id: 'luvvix-forms',
      name: 'LuvviX Forms',
      description: 'Création de formulaires intelligents',
      icon: '📝',
      bgColor: 'bg-orange-500',
      category: 'productivity',
      url: '/forms'
    },
    {
      id: 'luvvix-learn',
      name: 'LuvviX Learn',
      description: 'Plateforme d\'apprentissage IA',
      icon: '🎓',
      bgColor: 'bg-indigo-500',
      badge: 'Nouveau',
      category: 'education',
      url: '/learn'
    },
    {
      id: 'luvvix-news',
      name: 'LuvviX News',
      description: 'Actualités personnalisées',
      icon: '📰',
      bgColor: 'bg-red-500',
      category: 'information',
      url: '/news'
    },
    {
      id: 'luvvix-cloud',
      name: 'LuvviX Cloud',
      description: 'Stockage et partage sécurisé',
      icon: '☁️',
      bgColor: 'bg-cyan-500',
      category: 'storage',
      url: '/cloud'
    },
    {
      id: 'luvvix-mail',
      name: 'LuvviX Mail',
      description: 'Messagerie intelligente',
      icon: '✉️',
      bgColor: 'bg-pink-500',
      category: 'communication',
      url: '/mail'
    },
    {
      id: 'luvvix-analytics',
      name: 'LuvviX Analytics',
      description: 'Analyse de données avancée',
      icon: '📊',
      bgColor: 'bg-emerald-500',
      category: 'analytics',
      url: '/analytics'
    },
    {
      id: 'luvvix-docs',
      name: 'LuvviX Docs',
      description: 'Documentation collaborative',
      icon: '📚',
      bgColor: 'bg-violet-500',
      category: 'productivity',
      url: '/docs'
    },
    {
      id: 'luvvix-center',
      name: 'LuvviX Center',
      description: 'Réseau social professionnel',
      icon: '👥',
      bgColor: 'bg-rose-500',
      category: 'social',
      url: '/center'
    },
    {
      id: 'luvvix-crawler',
      name: 'LuvviX Crawler',
      description: 'Exploration web intelligente',
      icon: '🕷️',
      bgColor: 'bg-gray-500',
      category: 'tools',
      url: '/crawler'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous', icon: '⚡' },
    { id: 'ai', label: 'IA', icon: '🤖' },
    { id: 'productivity', label: 'Productivité', icon: '📊' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'education', label: 'Éducation', icon: '🎓' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || service.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (service: typeof services[0]) => {
    toast({
      title: service.name,
      description: `Ouverture de ${service.description}`,
    });

    // Simuler l'ouverture du service
    setTimeout(() => {
      if (service.url.startsWith('/')) {
        window.location.href = service.url;
      } else {
        window.open(service.url, '_blank');
      }
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-auto pb-20">
      {/* Header avec recherche */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Services LuvviX</h1>
        
        {/* Barre de recherche */}
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

        {/* Onglets de catégories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des services */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform text-left"
            >
              <div className="relative">
                <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-3`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                
                {service.badge && (
                  <div className="absolute -top-2 -right-2">
                    <span className={`text-white text-xs px-2 py-1 rounded-full ${
                      service.badge === 'Nouveau' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
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
            </button>
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

      {/* Section des statistiques */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Écosystème LuvviX</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-purple-100">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-purple-100">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-purple-100">Possibilités</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileServices;
