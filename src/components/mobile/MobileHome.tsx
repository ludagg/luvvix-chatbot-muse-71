
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchLatestNews } from '@/services/news-service';
import { NewsItem } from '@/types/news';
import { useNotifications } from '@/hooks/use-notifications';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Cloud, 
  Newspaper, 
  Globe, 
  Calendar, 
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Users,
  MessageCircle,
  Share2,
  Heart,
  Camera,
  Mail,
  FileText,
  BarChart3
} from 'lucide-react';

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
  const [showWeatherPage, setShowWeatherPage] = useState(false);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const currentTime = new Date();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex';

  // Charger la météo avec géolocalisation
  useEffect(() => {
    const loadWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // En production, utiliser une vraie API météo
              setWeather({
                temperature: Math.round(15 + Math.random() * 20),
                condition: 'Ensoleillé',
                location: 'Paris', // Obtenir via géocodage inversé
                icon: '☀️'
              });
            },
            (error) => {
              console.error('Erreur géolocalisation:', error);
              setWeather({
                temperature: 22,
                condition: 'Ensoleillé',
                location: 'Paris',
                icon: '☀️'
              });
            }
          );
        }
      } catch (error) {
        console.error('Erreur météo:', error);
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
        setNews(newsItems.slice(0, 3));
      } catch (error) {
        console.error('Erreur actualités:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    loadNews();
  }, []);

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
      action: () => setShowWeatherPage(true)
    },
    {
      id: 'news',
      title: 'Actualités',
      icon: <Newspaper className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-red-500 to-orange-500',
      action: () => setShowNewsPage(true)
    },
    {
      id: 'translate',
      title: 'Traduire',
      icon: <Globe className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      action: () => {
        toast({
          title: "LuvviX Translate",
          description: "Service de traduction disponible dans Services",
        });
      }
    }
  ];

  const importantApps = [
    {
      id: 'center',
      name: 'LuvviX Center',
      icon: <Users className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-rose-500 to-pink-500',
      action: () => toast({ title: "LuvviX Center", description: "Réseau social professionnel" })
    },
    {
      id: 'mail',
      name: 'Mail',
      icon: <Mail className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      action: () => toast({ title: "LuvviX Mail", description: "Messagerie intelligente" })
    },
    {
      id: 'docs',
      name: 'Docs',
      icon: <FileText className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      action: () => toast({ title: "LuvviX Docs", description: "Documentation collaborative" })
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      action: () => toast({ title: "LuvviX Analytics", description: "Analyse de données avancée" })
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Import des composants de pages
  const MobileWeatherPage = React.lazy(() => import('./MobileWeatherPage'));
  const MobileNewsPage = React.lazy(() => import('./MobileNewsPage'));

  if (showWeatherPage) {
    return (
      <React.Suspense fallback={<div>Chargement...</div>}>
        <MobileWeatherPage onBack={() => setShowWeatherPage(false)} />
      </React.Suspense>
    );
  }

  if (showNewsPage) {
    return (
      <React.Suspense fallback={<div>Chargement...</div>}>
        <MobileNewsPage onBack={() => setShowNewsPage(false)} />
      </React.Suspense>
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
          
          {weather && !loadingWeather && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl">{weather.icon}</span>
                <span className="text-2xl font-light">{weather.temperature}°C</span>
              </div>
              <p className="text-sm text-blue-100">{weather.condition}</p>
              <p className="text-xs text-blue-200 flex items-center justify-end">
                <MapPin className="w-3 h-3 mr-1" />
                {weather.location}
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

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-600">Services actifs</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">2.4M</p>
          <p className="text-xs text-gray-600">Utilisateurs</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">99.9%</p>
          <p className="text-xs text-gray-600">Uptime</p>
        </div>
      </div>

      {/* Actualités en bref */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Newspaper className="w-5 h-5 mr-2 text-red-500" />
            Actualités
          </h3>
          <button 
            onClick={() => setShowNewsPage(true)}
            className="text-blue-500 text-sm font-medium"
          >
            Voir tout →
          </button>
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
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
              className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {/* Prochain événement */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Prochain événement</h3>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Réunion équipe projet</h4>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Aujourd'hui à 14:30</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
