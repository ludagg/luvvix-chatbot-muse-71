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
import MobileSearch from './MobileSearch';
import MobileBottomNav from './MobileBottomNav';
import MobileNotifications from './MobileNotifications';
import AIFloatingButton from './AIFloatingButton';
import MobileCalendar from './MobileCalendar';
import MobileForms from './MobileForms';
import MobileTranslate from './MobileTranslate';
import MobileWeather from './MobileWeather';
import MobileCenter from './MobileCenter';

type MobileView = 'home' | 'services' | 'assistant' | 'cloud' | 'profile' | 'settings' | 'search' | 'calendar' | 'forms' | 'translate' | 'weather' | 'center';

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

    const handleNavigateToCalendar = () => {
      setActiveView('calendar');
    };

    const handleNavigateToForms = () => {
      setActiveView('forms');
    };

    const handleNavigateToTranslate = () => {
      setActiveView('translate');
    };

    const handleNavigateToWeather = () => {
      setActiveView('weather');
    };

    const handleNavigateToCenter = () => {
      setActiveView('center');
    };

    window.addEventListener('navigate-to-assistant', handleNavigateToAssistant);
    window.addEventListener('navigate-to-calendar', handleNavigateToCalendar);
    window.addEventListener('navigate-to-forms', handleNavigateToForms);
    window.addEventListener('navigate-to-translate', handleNavigateToTranslate);
    window.addEventListener('navigate-to-weather', handleNavigateToWeather);
    window.addEventListener('navigate-to-center', handleNavigateToCenter);

    return () => {
      window.removeEventListener('navigate-to-assistant', handleNavigateToAssistant);
      window.removeEventListener('navigate-to-calendar', handleNavigateToCalendar);
      window.removeEventListener('navigate-to-forms', handleNavigateToForms);
      window.removeEventListener('navigate-to-translate', handleNavigateToTranslate);
      window.removeEventListener('navigate-to-weather', handleNavigateToWeather);
      window.removeEventListener('navigate-to-center', handleNavigateToCenter);
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
        return <MobileAssistant onBack={() => setActiveView('home')} />;
      case 'cloud':
        return <MobileCloud />;
      case 'profile':
        return <MobileProfile />;
      case 'settings':
        return <MobileSettings />;
      case 'search':
        return <MobileSearch />;
      case 'calendar':
        return <MobileCalendar onBack={() => setActiveView('home')} />;
      case 'forms':
        return <MobileForms onBack={() => setActiveView('home')} />;
      case 'translate':
        return <MobileTranslate onBack={() => setActiveView('home')} />;
      case 'weather':
        return <MobileWeather onBack={() => setActiveView('home')} />;
      case 'center':
        return <MobileCenter onBack={() => setActiveView('home')} />;
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

  const handleSearchClick = () => {
    setActiveView('search');
  };

  // Ne pas afficher le header et la navigation pour les vues en plein écran
  const isFullScreenView = ['calendar', 'forms', 'translate', 'weather', 'center'].includes(activeView);

  if (isFullScreenView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderMobileView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header professionnel */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <img 
              src="/lovable-uploads/4e135247-8f83-4117-8247-edc3de222f86.png" 
              alt="LuvviX Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900">LuvviX OS</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bouton recherche */}
          <button
            onClick={handleSearchClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          {/* Bouton notifications avec icône Lucide */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {hasUnreadNotifications && (
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 -right-1 border-2 border-white"></div>
            )}
            <Bell className="w-6 h-6 text-gray-600" />
          </button>

          {/* Bouton paramètres */}
          <button 
            onClick={handleSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
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

      {/* Bouton IA flottant */}
      <AIFloatingButton />
    </div>
  );
};

export default MobileAppWrapper;
