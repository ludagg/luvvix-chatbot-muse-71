
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '@/hooks/use-notifications';
import { useCalendar } from '@/hooks/use-calendar';
import { useWeather } from '@/hooks/use-weather';
import { useForms } from '@/hooks/use-forms';
import { useTranslations } from '@/hooks/use-translations';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Cloud, 
  Globe, 
  Calendar, 
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Users,
  FileText,
  BarChart3,
  CalendarDays,
  Bell,
  Languages,
  FormInput,
  Newspaper,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AINewsPreferences from '@/components/news/AINewsPreferences';
import AINewsBriefing from '@/components/news/AINewsBriefing';

const MobileHome = () => {
  const { user } = useAuth();
  const { notificationsEnabled, requestPermission } = useNotifications();
  const { events } = useCalendar();
  const { weatherData, fetchWeather } = useWeather();
  const { forms } = useForms();
  const { history } = useTranslations();
  const currentTime = new Date();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';

  // États pour les actualités IA
  const [showNewsPreferences, setShowNewsPreferences] = useState(false);
  const [newsPreferences, setNewsPreferences] = useState(null);
  const [hasSetPreferences, setHasSetPreferences] = useState(false);

  // Charger les données météo au démarrage
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        () => {
          fetchWeather(undefined, undefined, 'Paris');
        }
      );
    } else {
      fetchWeather(undefined, undefined, 'Paris');
    }
  }, []);

  // Charger les préférences de l'utilisateur
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('news_preferences')
          .eq('user_id', user.id)
          .single();

        if (data?.news_preferences) {
          setNewsPreferences(data.news_preferences);
          setHasSetPreferences(true);
        } else {
          // Première visite - afficher les préférences après un délai
          setTimeout(() => {
            setShowNewsPreferences(true);
          }, 3000);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user]);

  // Demander les permissions de notification
  useEffect(() => {
    if (!notificationsEnabled && 'Notification' in window) {
      setTimeout(() => {
        requestPermission();
      }, 2000);
    }
  }, [notificationsEnabled, requestPermission]);

  const quickActions = [
    {
      id: 'ai-chat',
      title: 'Assistant IA',
      icon: <Sparkles className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      action: () => {
        const event = new CustomEvent('navigate-to-assistant');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'weather',
      title: 'Météo complète',
      icon: <Cloud className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      action: () => {
        const event = new CustomEvent('navigate-to-weather');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'calendar',
      title: 'Mon Calendrier',
      icon: <CalendarDays className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      action: () => {
        const event = new CustomEvent('navigate-to-calendar');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'forms',
      title: 'Formulaires',
      icon: <FormInput className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      action: () => {
        const event = new CustomEvent('navigate-to-forms');
        window.dispatchEvent(event);
      }
    }
  ];

  const importantApps = [
    {
      id: 'translate',
      name: 'Translate',
      icon: <Languages className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      action: () => {
        const event = new CustomEvent('navigate-to-translate');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: <FileText className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      action: () => {
        const event = new CustomEvent('navigate-to-forms');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      action: () => {
        const event = new CustomEvent('navigate-to-calendar');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      action: () => toast({ title: "LuvviX Analytics", description: "Analyse de données avancée" })
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Prochain événement du calendrier
  const nextEvent = events?.find(event => new Date(event.start_date) > new Date()) || null;

  // Statistiques réelles
  const stats = {
    activeServices: 4,
    totalForms: forms?.length || 0,
    totalTranslations: history?.length || 0,
    totalEvents: events?.length || 0
  };

  const handlePreferencesSet = (preferences: any) => {
    setNewsPreferences(preferences);
    setHasSetPreferences(true);
    setShowNewsPreferences(false);
    toast({
      title: 'Actualités IA configurées',
      description: 'Votre briefing personnalisé est maintenant prêt'
    });
  };

  // Afficher les préférences si pas encore configurées
  if (showNewsPreferences && !hasSetPreferences) {
    return (
      <div className="flex-1 overflow-auto pb-20">
        <AINewsPreferences
          onPreferencesSet={handlePreferencesSet}
          onSkip={() => {
            setShowNewsPreferences(false);
            setHasSetPreferences(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 pb-20">
      {/* Section de bienvenue avec météo intégrée */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white mb-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {getGreeting()} {userName} !
            </h2>
            <p className="text-blue-100 text-sm flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          
          {weatherData && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Cloud className="w-6 h-6" />
                <span className="text-2xl font-light">{weatherData.current.temperature}°C</span>
              </div>
              <p className="text-sm text-blue-100">{weatherData.current.condition}</p>
              <p className="text-xs text-blue-200 flex items-center justify-end">
                <MapPin className="w-3 h-3 mr-1" />
                {weatherData.location.name}
              </p>
            </div>
          )}
        </div>
        
        <p className="text-blue-100 text-center leading-relaxed">
          Votre écosystème intelligent est prêt. Que souhaitez-vous accomplir aujourd'hui ?
        </p>
      </div>

      {/* Actions rapides */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          Actions rapides
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform hover:shadow-md"
            >
              <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-3 text-white shadow-lg`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium text-gray-900 text-left leading-snug">
                {action.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Applications importantes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Applications importantes
        </h3>
        
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {importantApps.map((app) => (
            <button
              key={app.id}
              onClick={app.action}
              className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all min-w-20"
            >
              <div className={`w-12 h-12 ${app.bgColor} rounded-xl flex items-center justify-center mb-2 text-white shadow-lg mx-auto`}>
                {app.icon}
              </div>
              <p className="text-xs font-medium text-gray-900 text-center leading-tight">
                {app.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques réelles */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.activeServices}</p>
          <p className="text-xs text-gray-600">Services actifs</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalForms}</p>
          <p className="text-xs text-gray-600">Formulaires</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalTranslations}</p>
          <p className="text-xs text-gray-600">Traductions</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalEvents}</p>
          <p className="text-xs text-gray-600">Événements</p>
        </div>
      </div>

      {/* Notifications si désactivées */}
      {!notificationsEnabled && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-orange-900">Notifications désactivées</h4>
              <p className="text-sm text-orange-700">Activez pour recevoir les alertes importantes</p>
            </div>
            <button 
              onClick={requestPermission}
              className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {/* Prochain événement du calendrier */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Prochain événement
          </h3>
          <button
            onClick={() => {
              const event = new CustomEvent('navigate-to-calendar');
              window.dispatchEvent(event);
            }}
            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Voir le calendrier →
          </button>
        </div>
        
        {nextEvent ? (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{nextEvent.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(nextEvent.start_date), 'dd/MM à HH:mm')}</span>
                </p>
                {nextEvent.attendees && nextEvent.attendees.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {nextEvent.attendees.length} participants
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucun événement prévu</p>
            <button
              onClick={() => {
                const event = new CustomEvent('navigate-to-calendar');
                window.dispatchEvent(event);
              }}
              className="text-blue-500 text-sm font-medium mt-2 hover:text-blue-600 transition-colors"
            >
              Planifier un événement
            </button>
          </div>
        )}
      </div>

      {/* Section Actualités IA */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            Actualités IA
          </h3>
          <div className="flex items-center space-x-2">
            {!hasSetPreferences && (
              <button
                onClick={() => setShowNewsPreferences(true)}
                className="text-purple-500 text-sm font-medium hover:text-purple-600 transition-colors flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                Configurer
              </button>
            )}
            <button
              onClick={() => setShowNewsPreferences(true)}
              className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Préférences
            </button>
          </div>
        </div>

        {hasSetPreferences && newsPreferences ? (
          <AINewsBriefing preferences={newsPreferences} />
        ) : (
          <div className="text-center py-6">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Actualités personnalisées</h4>
            <p className="text-sm text-gray-600 mb-4">
              Configurez vos préférences pour recevoir un briefing IA personnalisé
            </p>
            <button
              onClick={() => setShowNewsPreferences(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center mx-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Configurer maintenant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileHome;
