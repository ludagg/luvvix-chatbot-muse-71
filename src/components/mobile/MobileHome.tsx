
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchLatestNews } from '@/services/news-service';
import { NewsItem } from '@/types/news';
import { useNotifications } from '@/hooks/use-notifications';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
}

const MobileHome = () => {
  const { user } = useAuth();
  const { notificationsEnabled, requestPermission } = useNotifications();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const currentTime = new Date();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';

  // Charger la météo
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch('/api/weather?city=Paris'); // Utilise notre API météo
        if (response.ok) {
          const data = await response.json();
          setWeather({
            temperature: Math.round(data.current?.temperature_2m || 22),
            condition: data.current?.weather_description || 'Ensoleillé',
            location: data.location?.name || 'Paris',
            icon: '☀️'
          });
        }
      } catch (error) {
        console.error('Erreur météo:', error);
        // Données par défaut
        setWeather({
          temperature: 22,
          condition: 'Ensoleillé',
          location: 'Paris',
          icon: '☀️'
        });
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeather();
  }, []);

  // Charger les actualités
  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsItems = await fetchLatestNews('all', 'fr', '');
        setNews(newsItems.slice(0, 3)); // Prendre les 3 premières
      } catch (error) {
        console.error('Erreur actualités:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    loadNews();
  }, []);

  // Demander les permissions de notification au démarrage
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
      icon: '🤖',
      bgColor: 'bg-purple-500',
      action: () => {
        // Naviguer vers l'assistant
        const event = new CustomEvent('navigate-to-assistant');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'weather',
      title: 'Météo complète',
      icon: '🌤️',
      bgColor: 'bg-blue-500',
      action: () => {
        toast({
          title: "Météo",
          description: `${weather?.temperature}°C à ${weather?.location} - ${weather?.condition}`,
        });
      }
    },
    {
      id: 'news',
      title: 'Actualités',
      icon: '📰',
      bgColor: 'bg-red-500',
      action: () => {
        if (news.length > 0) {
          toast({
            title: "Dernière actualité",
            description: news[0].title,
          });
        }
      }
    },
    {
      id: 'translate',
      title: 'Traduire',
      icon: '🌐',
      bgColor: 'bg-green-500',
      action: () => {
        toast({
          title: "LuvviX Translate",
          description: "Service de traduction disponible dans Services",
        });
      }
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="flex-1 overflow-auto p-4 pb-20">
      {/* Section de bienvenue avec météo intégrée */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {getGreeting()} {userName} !
            </h2>
            <p className="text-blue-100 text-sm">
              {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          
          {weather && !loadingWeather && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl">{weather.icon}</span>
                <span className="text-2xl font-light">{weather.temperature}°C</span>
              </div>
              <p className="text-sm text-blue-100">{weather.condition}</p>
              <p className="text-xs text-blue-200">{weather.location}</p>
            </div>
          )}
        </div>
        
        <p className="text-blue-100 text-center leading-relaxed">
          Votre écosystème intelligent est prêt. Que souhaitez-vous accomplir aujourd'hui ?
        </p>
      </div>

      {/* Actions rapides */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
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

      {/* Actualités en bref */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actualités</h3>
          <button className="text-blue-500 text-sm">Voir tout →</button>
        </div>
        
        {loadingNews ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {news.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{item.source}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.publishedAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications si désactivées */}
      {!notificationsEnabled && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🔔</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-orange-900">Notifications désactivées</h4>
              <p className="text-sm text-orange-700">Activez pour recevoir les alertes importantes</p>
            </div>
            <button 
              onClick={requestPermission}
              className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {/* Prochain événement */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h3 className="font-semibold text-gray-900">Prochain événement</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
