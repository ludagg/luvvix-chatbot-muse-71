import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, MapPin, Bell, ChevronLeft, ChevronRight, Search, Filter, Sparkles, Trash2, Edit3, CheckCircle, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useCalendar } from '@/hooks/use-calendar';
import { useHolidays } from '@/hooks/use-holidays';
import EventCreator from './EventCreator';

interface MobileCalendarProps {
  onBack: () => void;
}

const MobileCalendar = ({ onBack }: MobileCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'day' | 'agenda'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEventDetails, setShowEventDetails] = useState(false);

  const { 
    events, 
    loading, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    markTaskComplete,
    getEventsForDate,
    getUpcomingEvents,
    searchEvents,
    getEventsByType,
    getOverdueTasks 
  } = useCalendar();
  
  const { holidays, isHoliday } = useHolidays();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fonctions utilitaires améliorées pour valider et formater les dates
  const parseDate = (dateInput: string | Date | null | undefined): Date | null => {
    if (!dateInput) return null;
    
    try {
      // Si c'est déjà un objet Date
      if (dateInput instanceof Date) {
        return isValid(dateInput) ? dateInput : null;
      }
      
      // Si c'est une string, essayer de la parser
      const parsed = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
      return isValid(parsed) ? parsed : null;
    } catch (error) {
      console.warn('Erreur parsing date:', dateInput, error);
      return null;
    }
  };

  const formatEventDate = (dateInput: string | Date | null | undefined, formatString: string): string => {
    const date = parseDate(dateInput);
    if (!date) return 'Date invalide';
    
    try {
      return format(date, formatString, { locale: fr });
    } catch (error) {
      console.warn('Erreur formatage date:', dateInput, error);
      return 'Date invalide';
    }
  };

  const formatEventTime = (dateInput: string | Date | null | undefined, formatString: string): string => {
    const date = parseDate(dateInput);
    if (!date) return '--:--';
    
    try {
      return format(date, formatString);
    } catch (error) {
      console.warn('Erreur formatage heure:', dateInput, error);
      return '--:--';
    }
  };

  // Fonction pour extraire la date au format string pour les comparaisons
  const getDateString = (dateInput: string | Date | null | undefined): string => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.warn('Erreur extraction date string:', dateInput, error);
      return '';
    }
  };

  const getEventsForDateWithHolidays = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const holiday = isHoliday(date);
    
    if (holiday) {
      dayEvents.push({
        id: `holiday-${holiday.date}`,
        title: holiday.name,
        description: 'Jour férié',
        start_date: holiday.date + 'T00:00:00',
        end_date: holiday.date + 'T23:59:59',
        event_type: 'personal' as const,
        priority: 'low' as const,
        color: holiday.type === 'public' ? '#ef4444' : '#8b5cf6',
        completed: false,
        user_id: '',
        isHoliday: true
      });
    }
    
    return dayEvents;
  };

  const getFilteredEvents = () => {
    let filtered = events;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filterType);
    }
    
    if (searchQuery) {
      filtered = searchEvents(searchQuery);
    }
    
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.start_date);
      const dateB = parseDate(b.start_date);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
  };

  const generateAIEventSuggestion = async () => {
    const now = new Date();
    const suggestions = [
      {
        title: 'Révision quotidienne',
        event_type: 'task' as const,
        description: 'Réviser les notes de la veille',
        start_date: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 90 * 60 * 1000).toISOString()
      },
      {
        title: 'Pause créative',
        event_type: 'personal' as const,
        description: 'Temps de réflexion et brainstorming',
        start_date: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Exercice physique',
        event_type: 'personal' as const,
        description: 'Séance de sport pour rester en forme',
        start_date: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    const eventData = {
      ...suggestion,
      priority: 'medium' as const,
      color: '',
      completed: false
    };
    
    const created = await createEvent(eventData);
    
    if (created) {
      toast({
        title: "Événement suggéré créé",
        description: `"${suggestion.title}" a été ajouté à votre calendrier`,
      });
    }
  };

  const handleCompleteTask = async (eventId: string, completed: boolean) => {
    await markTaskComplete(eventId, !completed);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const success = await deleteEvent(eventId);
    if (success) {
      setSelectedEvent(null);
      setShowEventDetails(false);
    }
  };

  const handleEventClick = (event: any) => {
    if (!event.isHoliday) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
        <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
          {day}
        </div>
      ))}
      
      {monthDays.map(day => {
        const dayEvents = getEventsForDateWithHolidays(day);
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);
        const holiday = isHoliday(day);
        
        return (
          <button
            key={day.toString()}
            onClick={() => {
              setSelectedDate(day);
              if (view === 'month') setView('day');
            }}
            className={`p-2 text-sm relative min-h-12 ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : isTodayDate 
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : holiday
                ? 'bg-red-50 text-red-700'
                : 'hover:bg-gray-100'
            } rounded-lg transition-colors`}
          >
            <div>{format(day, 'd')}</div>
            {dayEvents.length > 0 && (
              <div className="flex justify-center mt-1 space-x-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full`}
                    style={{ backgroundColor: event.color }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs">+{dayEvents.length - 3}</div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDateWithHolidays(selectedDate);
    const overdueTasks = getOverdueTasks();
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          {overdueTasks.length > 0 && (
            <p className="text-sm text-red-600 mt-1">
              {overdueTasks.length} tâche(s) en retard
            </p>
          )}
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun événement prévu</p>
            <button
              onClick={() => setShowAddEvent(true)}
              className="mt-2 text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              Ajouter un événement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`p-4 rounded-xl border-l-4 bg-white shadow-sm ${!event.isHoliday ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
                style={{ borderLeftColor: event.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      {event.title}
                      {event.isHoliday && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Jour férié</span>}
                      {event.event_type === 'task' && event.completed && (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatEventTime(event.start_date, 'HH:mm')} - {formatEventTime(event.end_date, 'HH:mm')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                  </div>
                  {event.event_type === 'task' && !event.isHoliday && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteTask(event.id, event.completed);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        event.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAgendaView = () => {
    const filteredEvents = getFilteredEvents();
    const upcomingEvents = getUpcomingEvents();
    
    return (
      <div className="space-y-4">
        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Prochains événements</h3>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">{event.title}</h4>
                    <span className="text-xs text-blue-600">
                      {formatEventDate(event.start_date, 'dd/MM HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tous les événements</h3>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun événement trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`p-4 rounded-xl border-l-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-all`}
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {event.title}
                        {event.event_type === 'task' && event.completed && (
                          <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatEventDate(event.start_date, 'dd/MM - HH:mm')} - {formatEventTime(event.end_date, 'HH:mm')}
                      </p>
                      {event.attendees && event.attendees.length > 0 && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Users className="w-4 h-4 mr-1" />
                          {event.attendees.length} participant(s)
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.priority === 'high' ? 'bg-red-100 text-red-700' :
                      event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.priority === 'high' ? 'Urgent' : 
                       event.priority === 'medium' ? 'Normal' : 'Faible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Calendar</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={generateAIEventSuggestion}
            className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddEvent(true)}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation et contrôles */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'meeting', 'task', 'reminder', 'personal'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Tous' : 
                 type === 'meeting' ? 'Réunions' :
                 type === 'task' ? 'Tâches' :
                 type === 'reminder' ? 'Rappels' : 'Personnel'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'month', label: 'Mois' },
            { key: 'day', label: 'Jour' },
            { key: 'agenda', label: 'Agenda' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                view === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'day' && renderDayView()}
            {view === 'agenda' && renderAgendaView()}
          </>
        )}
      </div>

      <EventCreator 
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        selectedDate={selectedDate}
      />

      {/* Modal détails événement */}
      {selectedEvent && showEventDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => toast({ title: "Modification", description: "Fonctionnalité bientôt disponible" })}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Horaires</h4>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatEventDate(selectedEvent.start_date, 'dd/MM/yyyy HH:mm')} - {formatEventTime(selectedEvent.end_date, 'HH:mm')}</span>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Lieu</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Participants</h4>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{selectedEvent.attendees.join(', ')}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                  selectedEvent.priority === 'high' ? 'bg-red-100 text-red-700' :
                  selectedEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  Priorité: {selectedEvent.priority === 'high' ? 'Haute' : 
                            selectedEvent.priority === 'medium' ? 'Moyenne' : 'Faible'}
                </span>
                
                {selectedEvent.event_type === 'task' && (
                  <button
                    onClick={() => {
                      handleCompleteTask(selectedEvent.id, selectedEvent.completed);
                      setShowEventDetails(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedEvent.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {selectedEvent.completed ? 'Terminé ✓' : 'Marquer terminé'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalendar;
