
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, Bot, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const MobileCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<any[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
    loadAISuggestions();
  }, [selectedDate]);

  const loadEvents = async () => {
    // Simuler le chargement d'événements
    const mockEvents = [
      {
        id: 1,
        title: 'Réunion équipe',
        time: '14:00',
        duration: '1h',
        location: 'Salle de conférence',
        type: 'meeting',
        color: 'bg-blue-500'
      },
      {
        id: 2,
        title: 'Formation IA',
        time: '16:30',
        duration: '2h',
        location: 'En ligne',
        type: 'training',
        color: 'bg-green-500'
      }
    ];
    setEvents(mockEvents);
  };

  const loadAISuggestions = async () => {
    try {
      // Appel à l'IA Gemini pour des suggestions intelligentes
      const suggestions = [
        {
          type: 'smart_scheduling',
          title: 'Créneaux libres optimaux',
          description: 'L\'IA a identifié des créneaux optimaux pour vos réunions cette semaine',
          action: 'Voir les suggestions'
        },
        {
          type: 'conflict_prevention',
          title: 'Conflit potentiel détecté',
          description: 'Votre réunion de 15h pourrait entrer en conflit avec vos trajets',
          action: 'Résoudre'
        }
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur IA suggestions:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      // Logique de création d'événement
      const newEvent = {
        id: Date.now(),
        ...eventData,
        color: 'bg-purple-500'
      };
      setEvents(prev => [...prev, newEvent]);
      setShowCreateEvent(false);
      toast({
        title: "Événement créé",
        description: "Votre événement a été ajouté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Logique pour filtrer les événements par date
      return true; // Simplification
    });
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">LuvviX Calendar</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation du calendrier */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === viewType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType === 'month' ? 'Mois' : viewType === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Assistant IA</span>
            </div>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-medium mb-1">{suggestion.title}</h4>
                <p className="text-sm text-purple-100 mb-2">{suggestion.description}</p>
                <button className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                  {suggestion.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue calendrier */}
      <div className="p-4">
        {view === 'month' && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = day.date.toDateString() === selectedDate.toDateString();
                const dayEvents = getEventsForDate(day.date);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`relative aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors ${
                      !day.isCurrentMonth
                        ? 'text-gray-300'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : isToday
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{day.date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 flex space-x-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${event.color}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Événements du jour sélectionné */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Événements du {selectedDate.toLocaleDateString('fr-FR')}
        </h3>
        
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-2`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Aucun événement</h4>
            <p className="text-gray-600 text-sm mb-4">
              Vous n'avez aucun événement prévu pour cette date
            </p>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition-colors"
            >
              Créer un événement
            </button>
          </div>
        )}
      </div>

      {/* Bouton flottant pour créer un événement */}
      <button
        onClick={() => setShowCreateEvent(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal de création d'événement */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvel événement</h3>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre de l'événement"
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Lieu"
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 resize-none"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateEvent(false)}
                    className="flex-1 py-3 text-gray-600 font-medium rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleCreateEvent({})}
                    className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-2xl hover:bg-blue-600 transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalendar;
