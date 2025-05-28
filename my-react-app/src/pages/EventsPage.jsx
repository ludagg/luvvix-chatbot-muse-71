import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { createEvent, listUpcomingEvents, rsvpToEvent, getEventDetails } from '../services/eventService'; // Adjust path
import { Timestamp } from 'firebase/firestore'; // For date handling

// Helper to format Firestore Timestamp for display
const formatEventTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString([], { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

// Event Card Component (local to this page for simplicity or can be moved)
const EventCard = ({ event, onRsvp, currentUserId, onSelectEvent }) => {
  if (!event) return null;
  const isAttending = event.attendees?.includes(currentUserId);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      {/* Add event image placeholder if model supports it */}
      {/* <img src={event.photoURL || 'https://via.placeholder.com/400x200?text=Event'} alt={`${event.title}`} className="w-full h-32 object-cover"/> */}
      <div className="p-4">
        <h3 
            className="text-lg font-semibold text-indigo-700 mb-1 truncate cursor-pointer hover:underline" 
            title={event.title}
            onClick={() => onSelectEvent ? onSelectEvent(event.id) : null} // For viewing details
        >
          {event.title}
        </h3>
        <p className="text-xs text-gray-500 mb-1">
          Starts: {formatEventTimestamp(event.startTime)}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Ends: {formatEventTimestamp(event.endTime)}
        </p>
        <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis">
          {event.description || 'No description.'}
        </p>
        <p className="text-xs text-gray-500 mb-1">Location: {event.location || 'Not specified'}</p>
        <p className="text-xs text-gray-500 mb-3">Attendees: {event.attendees?.length || 0}</p>

        {currentUserId && ( // Show RSVP only if user is logged in
             <button
                onClick={() => onRsvp(event.id, isAttending ? 'not_attending' : 'attending')}
                className={`w-full text-xs py-1.5 px-3 rounded-md transition-colors ${
                isAttending 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
                {isAttending ? 'Cancel RSVP' : 'RSVP (Attend)'}
            </button>
        )}
      </div>
    </div>
  );
};


// Create Event Form (local or component)
const CreateEventForm = ({ onEventCreated, onClose, groupId }) => {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(''); // ISO string format for input type datetime-local
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) { setError("Must be logged in."); return; }
        if (!title || !startTime || !endTime) { setError("Title, start time, and end time are required."); return; }
        
        setLoading(true); setError('');
        try {
            const eventData = {
                title, description, 
                startTime: new Date(startTime), // Convert to Date object for service
                endTime: new Date(endTime),   // Convert to Date object for service
                location, 
                groupId: groupId || null 
            };
            const eventId = await createEvent(currentUser.uid, eventData);
            onEventCreated(eventId, eventData); // Callback
            setTitle(''); setDescription(''); setStartTime(''); setEndTime(''); setLocation('');
            if (onClose) onClose();
        } catch (err) {
            setError(err.message || "Failed to create event.");
        } finally {
            setLoading(false);
        }
    };
    
    // Helper to format date for datetime-local input: YYYY-MM-DDTHH:mm
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };


    return (
        <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto my-4">
            <h3 className="text-lg font-semibold mb-3">Create New Event</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Event Title*" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded"/>
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                <div>
                    <label className="text-xs">Start Time*</label>
                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="text-xs">End Time*</label>
                    <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border rounded"/>
                </div>
                <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded"/>
                <div className="flex justify-end space-x-2">
                    {onClose && <button type="button" onClick={onClose} className="py-1 px-3 text-sm border rounded">Cancel</button>}
                    <button type="submit" disabled={loading} className="py-1 px-3 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// Main EventsPage Component
const EventsPage = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  // const [selectedEventDetails, setSelectedEventDetails] = useState(null); // For viewing single event details

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // For now, list global upcoming events. Could add filters for group events later.
      const upcomingEvents = await listUpcomingEvents(20, null); 
      setEvents(upcomingEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRsvp = async (eventId, status) => {
    if (!currentUser?.uid) {
      alert("Please log in to RSVP.");
      return;
    }
    try {
      await rsvpToEvent(eventId, currentUser.uid, status);
      // Refresh event details or the list to show updated attendee count/status
      fetchEvents(); 
      // If viewing single event, refresh that:
      // if (selectedEventDetails && selectedEventDetails.id === eventId) {
      //    const updatedEvent = await getEventDetails(eventId);
      //    setSelectedEventDetails(updatedEvent);
      // }
      alert(`Successfully RSVP'd ${status}`);
    } catch (err) {
      alert(err.message || "Failed to RSVP.");
    }
  };
  
  const handleEventCreated = (eventId, eventData) => {
    setShowCreateForm(false);
    fetchEvents(); // Refresh the list
    // Optionally, set this new event as selected or navigate to its page
  };
  
  // const handleSelectEventForDetails = async (eventId) => {
  //   setLoading(true);
  //   const details = await getEventDetails(eventId);
  //   setSelectedEventDetails(details);
  //   setLoading(false);
  //   // Could open a modal or navigate to a new route for event details
  //   console.log("Selected event details:", details);
  // };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
        {currentUser && (
            <button 
                onClick={() => setShowCreateForm(true)}
                className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
                Create Event
            </button>
        )}
      </div>

      {showCreateForm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-0 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CreateEventForm 
                    onEventCreated={handleEventCreated} 
                    onClose={() => setShowCreateForm(false)}
                />
            </div>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading events...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500 text-center">No upcoming events found.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <EventCard 
                key={event.id} 
                event={event} 
                onRsvp={handleRsvp} 
                currentUserId={currentUser?.uid}
                // onSelectEvent={handleSelectEventForDetails}
            />
          ))}
        </div>
      )}
      
      {/* Placeholder for viewing selectedEventDetails in a modal or separate view */}
      {/* {selectedEventDetails && ( ... modal for event details ... )} */}
    </div>
  );
};

export default EventsPage;
