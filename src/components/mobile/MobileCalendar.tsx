import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, MapPin, Bell, ChevronLeft, ChevronRight, Search, Filter, Sparkles, Trash2, Edit3, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
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

  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { holidays, isHoliday } = useHolidays();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), date));
    const holiday = isHoliday(date);
    
    if (holiday) {
      dayEvents.push({
        id: `holiday-${holiday.date}`,
        title: holiday.name,
        description: 'Jour férié',
        start_time: holiday.date + 'T00:00:00',
        end_time: holiday.date + 'T23:59:59',
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
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const generateAIEventSuggestion = async () => {
    const suggestions = [
      {
        title: 'Révision quotidienne',
        event_type: 'task',
        description: 'Réviser les notes de la veille'
      },
      {
        title: 'Pause créative',
        event_type: 'personal',
        description: 'Temps de réflexion et brainstorming'
      },
      {
        title: 'Exercice physique',
        event_type: 'personal',
        description: 'Séance de sport pour rester en forme'
      }
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    toast({
      title: "Suggestion IA",
      description: `L'IA suggère: "${suggestion.title}"`,
    });
  };

  const completeTask = async (eventId: string, completed: boolean) => {
    await updateEvent(eventId, { completed: !completed });
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setSelectedEvent(null);
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
        <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
          {day}
        </div>
      ))}
      
      {monthDays.map(day => {
        const dayEvents = getEventsForDate(day);
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);
        const holiday = isHoliday(day);
        
        return (
          <button
            key={day.toString()}
            onClick={() => setSelectedDate(day)}
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
    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun événement prévu</p>
            <button
              onClick={() => setShowAddEvent(true)}
              className="mt-2 text-blue-500 font-medium"
            >
              Ajouter un événement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => !event.isHoliday && setSelectedEvent(event)}
                className={`p-4 rounded-xl border-l-4 bg-white shadow-sm ${!event.isHoliday ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
                style={{ borderLeftColor: event.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      {event.title}
                      {event.isHoliday && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Jour férié</span>}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  {event.event_type === 'task' && !event.isHoliday && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeTask(event.id, event.completed);
                      }}
                      className={`p-1 rounded-full ${
                        event.completed ? 'text-green-600' : 'text-gray-400'
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
    
    return (
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun événement trouvé</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-xl border-l-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
              style={{ borderLeftColor: event.color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {format(new Date(event.start_time), 'dd/MM - HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
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
          ))
        )}
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
        {/* Vue et navigation de mois */}
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

        {/* Barre de recherche et filtres */}
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

        {/* Sélecteur de vue */}
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

      {/* Event Creator */}
      <EventCreator 
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        selectedDate={selectedDate}
      />

      {/* Modal détails événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => toast({ title: "Modification", description: "Fonctionnalité bientôt disponible" })}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedEvent.description && (
                <p className="text-gray-600">{selectedEvent.description}</p>
              )}
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{format(new Date(selectedEvent.start_time), 'dd/MM/yyyy HH:mm')} - {format(new Date(selectedEvent.end_time), 'HH:mm')}</span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.attendees.join(', ')}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
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
                      completeTask(selectedEvent.id, selectedEvent.completed);
                      setSelectedEvent(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedEvent.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {selectedEvent.completed ? 'Terminé' : 'Marquer terminé'}
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
