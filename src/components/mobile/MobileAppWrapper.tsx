
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHome from './MobileHome';
import MobileServices from './MobileServices';
import MobileAssistant from './MobileAssistant';
import MobileCloud from './MobileCloud';
import MobileProfile from './MobileProfile';
import MobileBottomNav from './MobileBottomNav';
import MobileNotifications from './MobileNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/use-notifications';

type MobileView = 'home' | 'services' | 'assistant' | 'cloud' | 'profile';

const MobileAppWrapper = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { notificationsEnabled } = useNotifications();
  const [activeView, setActiveView] = useState<MobileView>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Écouter les événements de navigation personnalisés
  useEffect(() => {
    const handleNavigateToAssistant = () => {
      setActiveView('assistant');
    };

    window.addEventListener('navigate-to-assistant', handleNavigateToAssistant);

    return () => {
      window.removeEventListener('navigate-to-assistant', handleNavigateToAssistant);
    };
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  const renderMobileView = () => {
    switch (activeView) {
      case 'services':
        return <MobileServices />;
      case 'assistant':
        return <MobileAssistant />;
      case 'cloud':
        return <MobileCloud />;
      case 'profile':
        return <MobileProfile />;
      default:
        return <MobileHome />;
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">LuvviX OS</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bouton notifications */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {hasUnreadNotifications && (
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
            )}
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 0 1 1.5 17H6l3-7 3 7h4.5a2.5 2.5 0 0 1-2.5 2.5z"/>
            </svg>
          </button>

          {/* Bouton paramètres */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderMobileView()}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeView={activeView} setActiveView={setActiveView} />

      {/* Notifications Modal */}
      <MobileNotifications 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default MobileAppWrapper;
