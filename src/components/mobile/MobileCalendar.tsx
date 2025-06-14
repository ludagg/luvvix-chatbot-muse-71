
import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Users, Edit3, Trash2, Check } from 'lucide-react';
import { useCalendar } from '@/hooks/use-calendar';
import { toast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileCalendarProps {
  onBack: () => void;
}

const MobileCalendar = ({ onBack }: MobileCalendarProps) => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    priority: 'medium',
    color: 'bg-blue-500',
    event_type: 'personal'
  });

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const success = await createEvent({
      ...newEvent,
      start_time: new Date(newEvent.start_time).toISOString(),
      end_time: new Date(newEvent.end_time).toISOString(),
      attendees: []
    });

    if (success) {
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        priority: 'medium',
        color: 'bg-blue-500',
        event_type: 'personal'
      });
    }
  };

  const handleCompleteEvent = async (event: any) => {
    await updateEvent(event.id, { completed: !event.completed });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      await deleteEvent(eventId);
      setSelectedEvent(null);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => 
      format(new Date(event.start_time), 'yyyy-MM-dd') === dateStr
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(currentDate, { locale: fr }), i);
    return {
      date,
      dayName: format(date, 'EEE', { locale: fr }),
      dayNumber: format(date, 'd'),
      events: getEventsForDate(date)
    };
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  if (loading && events.length === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <button onClick={onBack} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">LuvviX Calendar</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-center p-4 bg-gray-50 border-b">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          {['week', 'month', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mode === 'week' ? 'Semaine' : mode === 'month' ? 'Mois' : 'Liste'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'week' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map(({ date, dayName, dayNumber, events: dayEvents }) => (
                <div key={dayNumber} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{dayName}</div>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700'
                  }`}>
                    {dayNumber}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Events for today */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Événements d'aujourd'hui</h3>
              {getEventsForDate(new Date()).map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {event.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
                        {event.priority}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteEvent(event);
                        }}
                        className={`p-1 rounded-full ${
                          event.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="p-4 space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {event.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(event.start_time), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[event.priority as keyof typeof priorityColors]}`}>
                    {event.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Nouvel événement</h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre de l'événement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Description de l'événement"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Lieu de l'événement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateEvent}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Créer l'événement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}

                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>
                    {format(new Date(selectedEvent.start_time), 'dd/MM/yyyy HH:mm', { locale: fr })} - 
                    {format(new Date(selectedEvent.end_time), 'HH:mm')}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[selectedEvent.priority as keyof typeof priorityColors]}`}>
                    Priorité {selectedEvent.priority}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCompleteEvent(selectedEvent)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedEvent.completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedEvent.completed ? 'Terminé' : 'Marquer terminé'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
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
