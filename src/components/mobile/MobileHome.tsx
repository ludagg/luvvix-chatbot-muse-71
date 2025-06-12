
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MobileHome = () => {
  const { user } = useAuth();
  const currentTime = new Date();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';

  const quickActions = [
    {
      id: 'ai-chat',
      title: 'Parler à l\'IA',
      icon: '🤖',
      bgColor: 'bg-purple-500',
      action: () => console.log('AI Chat')
    },
    {
      id: 'news',
      title: 'Découvrir les actualités',
      icon: '📰',
      bgColor: 'bg-blue-500',
      action: () => console.log('News')
    },
    {
      id: 'mail',
      title: 'Consulter ma messagerie',
      icon: '✉️',
      bgColor: 'bg-green-500',
      action: () => console.log('Mail')
    },
    {
      id: 'calendar',
      title: 'Voir mon agenda',
      icon: '📅',
      bgColor: 'bg-orange-500',
      action: () => console.log('Calendar')
    }
  ];

  return (
    <div className="flex-1 overflow-auto p-4 pb-20">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bonjour {userName} !
        </h2>
        
        <p className="text-gray-600 text-center max-w-sm mx-auto leading-relaxed">
          Votre écosystème intelligent est prêt. Que souhaitez-vous accomplir aujourd'hui ?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Que souhaitez-vous faire ?
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 text-left leading-snug">
                {action.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90">
                {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-3xl font-light">
                {format(currentTime, 'HH:mm')}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-2xl font-light">22°C</span>
              </div>
              <p className="text-sm opacity-90">Ensoleillé</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-sm">Paris, France</span>
            </div>
            <button className="text-sm opacity-90 hover:opacity-100">
              Voir plus →
            </button>
          </div>
        </div>
      </div>

      {/* Next Event */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h3 className="font-semibold text-gray-900">Prochain événement</h3>
          <button className="ml-auto text-blue-500 text-sm">Voir agenda ↗</button>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h2.5l6 6H4zm16.5-9.5L19 7l-7.5 7.5L9 12l-2 2 5.5 5.5L22 9.5h-1.5z"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Réunion équipe projet</h4>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Aujourd'hui à 14:30</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Salle de conférence A</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span>5 participants</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileHome;
