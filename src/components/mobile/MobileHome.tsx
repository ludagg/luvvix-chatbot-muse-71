
import React from 'react';
import { Calendar, FileText, Globe, CloudSun, Users, Sparkles, ArrowRight, TrendingUp, MessageCircle, Heart } from 'lucide-react';

const MobileHome = () => {
  const quickActions = [
    {
      id: 'calendar',
      title: 'Calendrier',
      subtitle: 'Gérez vos événements',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-calendar'))
    },
    {
      id: 'forms',
      title: 'Formulaires',
      subtitle: 'Créez des formulaires',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-forms'))
    },
    {
      id: 'translate',
      title: 'Traduction',
      subtitle: 'Traduisez instantanément',
      icon: Globe,
      color: 'from-purple-500 to-purple-600',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-translate'))
    },
    {
      id: 'weather',
      title: 'Météo',
      subtitle: 'Prévisions détaillées',
      icon: CloudSun,
      color: 'from-orange-500 to-orange-600',
      action: () => window.dispatchEvent(new CustomEvent('navigate-to-weather'))
    }
  ];

  const centerStats = [
    { label: 'Posts actifs', value: '1.2k', icon: MessageCircle },
    { label: 'Communauté', value: '5.4k', icon: Users },
    { label: 'Interactions', value: '12.8k', icon: Heart }
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue sur LuvviX OS
        </h1>
        <p className="text-gray-600">
          Votre écosystème intelligent pour la productivité
        </p>
      </div>

      {/* LuvviX Center Promo */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">LuvviX Center</h2>
            <p className="text-purple-100 mb-4">
              Rejoignez notre communauté dynamique et partagez vos idées
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {centerStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <IconComponent className="w-5 h-5 mx-auto mb-1 text-purple-200" />
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs text-purple-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <Users className="w-8 h-8 text-purple-200" />
        </div>
        
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-center'))}
          className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors"
        >
          <span className="font-medium">Découvrir Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-left">{action.title}</h3>
                <p className="text-sm text-gray-600 text-left">{action.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assistant AI Promo */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Assistant IA</h3>
            <p className="text-sm text-gray-600">
              Posez vos questions à notre IA avancée
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-assistant'))}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Essayer
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Tendances</h3>
        </div>
        <div className="space-y-3">
          {[
            { topic: '#LuvviXAI', engagement: '2.1k' },
            { topic: '#ProductivitéIA', engagement: '1.8k' },
            { topic: '#Innovation2024', engagement: '1.5k' }
          ].map((trend, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-blue-600 font-medium">{trend.topic}</span>
              <span className="text-sm text-gray-500">{trend.engagement} posts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
