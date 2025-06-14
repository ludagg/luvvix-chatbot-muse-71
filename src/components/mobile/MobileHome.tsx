
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Bell, ArrowRight, Zap, Cloud, FileText, Globe, BarChart3, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/use-calendar';
import { useAINotifications } from '@/hooks/use-ai-notifications';
import { useWeatherService } from '@/hooks/use-weather-service';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MobileHome = () => {
  const { user } = useAuth();
  const { events } = useCalendar();
  const { notifications, unreadCount } = useAINotifications();
  const { weatherData, fetchWeather } = useWeatherService();

  useEffect(() => {
    fetchWeather();
  }, []);

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 3);
  };

  const getEventDateLabel = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const getWeatherIcon = (code: number) => {
    const icons: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌦️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '🌨️', 73: '🌨️', 75: '🌨️',
      95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || '🌤️';
  };

  const upcomingEvents = getUpcomingEvents();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="flex-1 overflow-auto pb-20 bg-gray-50">
      {/* Header avec salutation personnalisée */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Bonjour, {userName}!</h1>
            <p className="text-blue-100">
              {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{unreadCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Météo en temps réel */}
        {weatherData && (
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getWeatherIcon(weatherData.current.weather_code)}</span>
                <div>
                  <p className="text-xl font-semibold">{Math.round(weatherData.current.temperature_2m)}°C</p>
                  <p className="text-blue-100 text-sm">{weatherData.location.name}</p>
                </div>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-weather'))}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <span className="text-sm">Voir plus</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section événements à venir */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Prochains événements
            </h2>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-calendar'))}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-sm font-medium">Consulter mon calendrier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(event.start_time);
                return (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{getEventDateLabel(eventDate)} à {format(eventDate, 'HH:mm')}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aucun événement prévu</p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-calendar'))}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un événement</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications IA récentes */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Notifications IA
            </h2>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-xl ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notification.created_at), 'dd/MM/yyyy à HH:mm')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accès rapide aux services */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Services LuvviX</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-forms'))}
              className="flex items-center space-x-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors"
            >
              <FileText className="w-8 h-8 text-orange-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Forms</p>
                <p className="text-sm text-gray-600">Créer des formulaires</p>
              </div>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-translate'))}
              className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors"
            >
              <Globe className="w-8 h-8 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Translate</p>
                <p className="text-sm text-gray-600">Traduction IA</p>
              </div>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-weather'))}
              className="flex items-center space-x-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl hover:from-cyan-100 hover:to-blue-100 transition-colors"
            >
              <Cloud className="w-8 h-8 text-cyan-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Météo</p>
                <p className="text-sm text-gray-600">Prévisions météo</p>
              </div>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-assistant'))}
              className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <Zap className="w-8 h-8 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Assistant IA</p>
                <p className="text-sm text-gray-600">Chat intelligent</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
