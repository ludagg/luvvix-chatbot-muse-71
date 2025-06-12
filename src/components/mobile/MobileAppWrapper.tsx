
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/use-notifications';
import { Bell } from 'lucide-react';
import SplashScreen from './SplashScreen';
import OnboardingFlow from './OnboardingFlow';
import MobileAuthFlow from './MobileAuthFlow';
import MobileHome from './MobileHome';
import MobileServices from './MobileServices';
import MobileAssistant from './MobileAssistant';
import MobileCloud from './MobileCloud';
import MobileProfile from './MobileProfile';
import MobileSettings from './MobileSettings';
import MobileBottomNav from './MobileBottomNav';
import MobileNotifications from './MobileNotifications';

type MobileView = 'home' | 'services' | 'assistant' | 'cloud' | 'profile' | 'settings';

const MobileAppWrapper = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { notificationsEnabled } = useNotifications();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeView, setActiveView] = useState<MobileView>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Vérifier si c'est la première visite
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('luvvix_onboarding_seen');
    if (!hasSeenOnboarding && isMobile) {
      setShowOnboarding(true);
    }
  }, [isMobile]);

  // Gérer la fin du splash screen
  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenOnboarding = localStorage.getItem('luvvix_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  // Gérer la fin de l'onboarding
  const handleOnboardingComplete = () => {
    localStorage.setItem('luvvix_onboarding_seen', 'true');
    setShowOnboarding(false);
    if (!user) {
      setShowAuth(true);
    }
  };

  // Gérer le succès de l'authentification
  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  // Gérer le retour depuis l'auth
  const handleAuthBack = () => {
    setShowAuth(false);
    setShowOnboarding(true);
  };

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

  // Afficher le splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Afficher l'onboarding
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Afficher l'authentification si pas connecté
  if (showAuth || !user) {
    return (
      <MobileAuthFlow 
        onSuccess={handleAuthSuccess} 
        onBack={handleAuthBack}
      />
    );
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
      case 'settings':
        return <MobileSettings />;
      default:
        return <MobileHome />;
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setHasUnreadNotifications(false);
  };

  const handleSettingsClick = () => {
    setActiveView('settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header amélioré */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">LuvviX OS</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bouton notifications avec vraie icône */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {hasUnreadNotifications && (
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -right-1 border-2 border-white"></div>
            )}
            <Bell className="w-6 h-6 text-gray-600" />
          </button>

          {/* Bouton paramètres avec vraie icône */}
          <button 
            onClick={handleSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
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
