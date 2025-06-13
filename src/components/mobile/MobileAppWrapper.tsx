
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SplashScreen from './SplashScreen';
import OnboardingFlow from './OnboardingFlow';
import MobileAuthFlow from './MobileAuthFlow';
import MobileHome from './MobileHome';
import MobileServices from './MobileServices';
import MobileSettings from './MobileSettings';
import MobileAssistant from './MobileAssistant';
import MobileCalendar from './MobileCalendar';
import MobileForms from './MobileForms';
import MobileTranslate from './MobileTranslate';
import MobileWeather from './MobileWeather';
import MobileNewsPage from './MobileNewsPage';
import MobileBottomNav from './MobileBottomNav';
import AIFloatingButton from './AIFloatingButton';

const MobileAppWrapper = () => {
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'splash' | 'onboarding' | 'auth' | 'app'>('splash');
  const [currentPage, setCurrentPage] = useState('home');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'onboarding
    const onboardingSeen = localStorage.getItem('luvvix_onboarding_seen');
    setHasSeenOnboarding(!!onboardingSeen);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentStep('app');
      } else if (hasSeenOnboarding) {
        setCurrentStep('auth');
      } else {
        // L'étape splash se terminera automatiquement
      }
    }
  }, [user, loading, hasSeenOnboarding]);

  // Gestion des événements de navigation
  useEffect(() => {
    const handleNavigationEvents = () => {
      window.addEventListener('navigate-to-services', () => setCurrentPage('services'));
      window.addEventListener('navigate-to-assistant', () => setCurrentPage('assistant'));
      window.addEventListener('navigate-to-calendar', () => setCurrentPage('calendar'));
      window.addEventListener('navigate-to-forms', () => setCurrentPage('forms'));
      window.addEventListener('navigate-to-translate', () => setCurrentPage('translate'));
      window.addEventListener('navigate-to-weather', () => setCurrentPage('weather'));
      window.addEventListener('navigate-to-news', () => setCurrentPage('news'));
      window.addEventListener('navigate-to-settings', () => setCurrentPage('settings'));
      window.addEventListener('navigate-to-home', () => setCurrentPage('home'));
    };

    handleNavigationEvents();

    return () => {
      window.removeEventListener('navigate-to-services', () => setCurrentPage('services'));
      window.removeEventListener('navigate-to-assistant', () => setCurrentPage('assistant'));
      window.removeEventListener('navigate-to-calendar', () => setCurrentPage('calendar'));
      window.removeEventListener('navigate-to-forms', () => setCurrentPage('forms'));
      window.removeEventListener('navigate-to-translate', () => setCurrentPage('translate'));
      window.removeEventListener('navigate-to-weather', () => setCurrentPage('weather'));
      window.removeEventListener('navigate-to-news', () => setCurrentPage('news'));
      window.removeEventListener('navigate-to-settings', () => setCurrentPage('settings'));
      window.removeEventListener('navigate-to-home', () => setCurrentPage('home'));
    };
  }, []);

  const handleSplashComplete = () => {
    if (hasSeenOnboarding) {
      setCurrentStep(user ? 'app' : 'auth');
    } else {
      setCurrentStep('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('luvvix_onboarding_seen', 'true');
    setHasSeenOnboarding(true);
    setCurrentStep(user ? 'app' : 'auth');
  };

  const handleAuthSuccess = () => {
    setCurrentStep('app');
  };

  const handleAuthBack = () => {
    setCurrentStep('onboarding');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <MobileHome />;
      case 'services':
        return <MobileServices />;
      case 'assistant':
        return <MobileAssistant />;
      case 'calendar':
        return <MobileCalendar />;
      case 'forms':
        return <MobileForms />;
      case 'translate':
        return <MobileTranslate />;
      case 'weather':
        return <MobileWeather />;
      case 'news':
        return <MobileNewsPage />;
      case 'settings':
        return <MobileSettings />;
      default:
        return <MobileHome />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (currentStep === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentStep === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (currentStep === 'auth') {
    return (
      <MobileAuthFlow
        onSuccess={handleAuthSuccess}
        onBack={handleAuthBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>

      {/* Navigation du bas */}
      <MobileBottomNav 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      {/* Bouton flottant IA */}
      <AIFloatingButton />
    </div>
  );
};

export default MobileAppWrapper;
