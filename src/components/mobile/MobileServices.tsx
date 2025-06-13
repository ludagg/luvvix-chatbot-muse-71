
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Grid3X3, 
  Bot,
  Globe, 
  FileText, 
  Cloud, 
  Mail, 
  BarChart3, 
  Users, 
  BookOpen, 
  Code, 
  Newspaper,
  MessageCircle,
  Shield,
  Camera,
  Calendar,
  Palette,
  Zap,
  Database,
  Settings
} from 'lucide-react';

const MobileServices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const services = [
    {
      id: 'luvvix-ai-studio',
      name: 'LuvviX AI Studio',
      description: 'Studio de création d\'agents IA',
      icon: <Bot className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      badge: 'Populaire',
      category: 'ai',
      url: '/ai-studio'
    },
    {
      id: 'luvvix-translate',
      name: 'LuvviX Translate',
      description: 'Traduction instantanée multilingue',
      icon: <Globe className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      category: 'productivity',
      url: '/translate'
    },
    {
      id: 'luvvix-weather',
      name: 'LuvviX Weather',
      description: 'Prévisions météo avancées',
      icon: <Cloud className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      category: 'lifestyle',
      url: '/weather'
    },
    {
      id: 'luvvix-forms',
      name: 'LuvviX Forms',
      description: 'Création de formulaires intelligents',
      icon: <FileText className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      category: 'productivity',
      url: '/forms'
    },
    {
      id: 'luvvix-learn',
      name: 'LuvviX Learn',
      description: 'Plateforme d\'apprentissage IA',
      icon: <BookOpen className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      badge: 'Nouveau',
      category: 'education',
      url: '/learn'
    },
    {
      id: 'luvvix-news',
      name: 'LuvviX News',
      description: 'Actualités personnalisées',
      icon: <Newspaper className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
      category: 'information',
      url: '/news'
    },
    {
      id: 'luvvix-cloud',
      name: 'LuvviX Cloud',
      description: 'Stockage et partage sécurisé',
      icon: <Database className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      category: 'storage',
      url: '/cloud'
    },
    {
      id: 'luvvix-mail',
      name: 'LuvviX Mail',
      description: 'Messagerie intelligente',
      icon: <Mail className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-pink-500 to-rose-600',
      category: 'communication',
      url: '/mail'
    },
    {
      id: 'luvvix-analytics',
      name: 'LuvviX Analytics',
      description: 'Analyse de données avancée',
      icon: <BarChart3 className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      category: 'analytics',
      url: '/analytics'
    },
    {
      id: 'luvvix-center',
      name: 'LuvviX Center',
      description: 'Réseau social professionnel',
      icon: <Users className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
      category: 'social',
      url: '/center'
    },
    {
      id: 'code-studio',
      name: 'Code Studio',
      description: 'Environnement de développement',
      icon: <Code className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      category: 'development',
      url: '/code-studio'
    },
    {
      id: 'luvvix-security',
      name: 'LuvviX Security',
      description: 'Centre de sécurité',
      icon: <Shield className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
      category: 'security',
      url: '/security'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'ai', label: 'IA', icon: <Bot className="w-4 h-4" /> },
    { id: 'productivity', label: 'Productivité', icon: <Zap className="w-4 h-4" /> },
    { id: 'communication', label: 'Communication', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'education', label: 'Éducation', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'development', label: 'Développement', icon: <Code className="w-4 h-4" /> }
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
  };

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      <div className="bg-white">
        {/* Header */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Services LuvviX</h1>
          
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
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
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des services */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform text-left relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-3 text-white shadow-lg`}>
                  {service.icon}
                </div>
                
                {service.badge && (
                  <div className="absolute top-0 right-0">
                    <span className={`text-white text-xs px-2 py-1 rounded-full ${
                      service.badge === 'Nouveau' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {service.badge}
                    </span>
                  </div>
                )}
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
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
