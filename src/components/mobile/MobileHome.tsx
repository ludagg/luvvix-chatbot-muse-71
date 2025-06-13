
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Bell, Plus, ChevronRight, Sun, CloudRain, Thermometer, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const MobileHome = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);

  useEffect(() => {
    loadWeatherData();
    loadNextEvent();
  }, []);

  const loadWeatherData = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          // Simuler des données météo réelles
          setWeather({
            temperature: 22,
            condition: 'Ensoleillé',
            location: 'Paris, France',
            icon: '☀️'
          });
        });
      }
    } catch (error) {
      console.error('Erreur météo:', error);
    }
  };

  const loadNextEvent = () => {
    // Simuler un prochain événement
    setNextEvent({
      title: 'Réunion équipe',
      time: '14:00',
      date: 'Aujourd\'hui',
      location: 'Salle de conférence'
    });
  };

  const importantApps = [
    {
      id: 'center',
      name: 'LuvviX Center',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      action: () => console.log('Ouvrir Center')
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      action: () => {
        const event = new CustomEvent('navigate-to-calendar');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      action: () => {
        const event = new CustomEvent('navigate-to-forms');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'translate',
      name: 'Translate',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      action: () => {
        const event = new CustomEvent('navigate-to-translate');
        window.dispatchEvent(event);
      }
    }
  ];

  const handleConsultCalendar = () => {
    const event = new CustomEvent('navigate-to-calendar');
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 pb-20">
      {/* Header avec salutation */}
      <div className="bg-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'} 👋
            </h1>
            <p className="text-gray-600">Que souhaitez-vous faire aujourd'hui ?</p>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Widget météo */}
      {weather && (
        <div className="mx-4 mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm opacity-90">{weather.location}</span>
              </div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm opacity-90">{weather.condition}</div>
            </div>
            <div className="text-4xl">{weather.icon}</div>
          </div>
        </div>
      )}

      {/* Prochain événement du calendrier */}
      <div className="mx-4 mb-6 bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Prochain événement</h3>
          <Calendar className="w-5 h-5 text-blue-500" />
        </div>
        {nextEvent ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{nextEvent.title}</h4>
              <span className="text-sm text-gray-500">{nextEvent.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{nextEvent.date}</span>
              <span>•</span>
              <span>{nextEvent.location}</span>
            </div>
            <button
              onClick={handleConsultCalendar}
              className="w-full mt-3 bg-blue-50 text-blue-600 font-medium py-2 rounded-xl text-sm hover:bg-blue-100 transition-colors"
            >
              Consulter mon calendrier
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-3">Aucun événement prévu</p>
            <button
              onClick={handleConsultCalendar}
              className="bg-blue-50 text-blue-600 font-medium px-4 py-2 rounded-xl text-sm hover:bg-blue-100 transition-colors"
            >
              Consulter mon calendrier
            </button>
          </div>
        )}
      </div>

      {/* Applications importantes */}
      <div className="mx-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Applications importantes</h3>
        <div className="flex space-x-3 overflow-x-auto">
          {importantApps.map((app) => (
            <button
              key={app.id}
              onClick={app.action}
              className="flex-shrink-0 flex flex-col items-center space-y-2 p-3 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 ${app.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {app.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actualités */}
      <div className="mx-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Actualités</h3>
          <button className="text-blue-500 text-sm font-medium">Voir tout</button>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    Titre de l'actualité {item}
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    Description courte de l'actualité...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Il y a 2h</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="mx-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {[
            { icon: <TrendingUp className="w-4 h-4" />, text: "Nouveau formulaire créé", time: "il y a 1h" },
            { icon: <Users className="w-4 h-4" />, text: "Invitation de groupe acceptée", time: "il y a 3h" },
            { icon: <Calendar className="w-4 h-4" />, text: "Événement ajouté au calendrier", time: "il y a 5h" }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
