import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path
import { useCall } from '../contexts/CallContext'; // Import useCall
import ChatSidebar from '../components/features/chat/ChatSidebar'; // Adjust path
import ChatWindow from '../components/features/chat/ChatWindow'; // Adjust path
import StartConversationModal from '../components/features/chat/StartConversationModal'; // Adjust path
import { getDoc, doc } from 'firebase/firestore'; // To fetch conversation details if needed
import { db } from '../services/firebase'; // Direct db access for initial load if needed

function ChatPage() {
  const { currentUser } = useAuth();
  const { startCall } = useCall(); // Get startCall from context
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For responsive design: show sidebar or chat window
  const [view, setView] = useState('sidebar'); // 'sidebar' or 'chat' (for mobile)

  useEffect(() => {
    // On larger screens, default to showing both sidebar and a placeholder/selected chat
    // On smaller screens, 'sidebar' is the default.
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setView('both'); 
      } else {
        // If was 'both', switch to sidebar, otherwise keep current mobile view
        if (view === 'both') setView('sidebar');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);


  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (window.innerWidth < 768) { // md breakpoint
        setView('chat'); // Switch to chat view on mobile
    }
  };

  const handleStartNewConversation = () => {
    setIsModalOpen(true);
  };

  const handleConversationStarted = async (conversationId, type, metadata) => {
    // Fetch the full conversation object to set as selectedConversation
    // This ensures the sidebar's real-time listener might not have caught it yet
    // or provides immediate feedback.
    try {
        const convoRef = doc(db, 'conversations', conversationId);
        const convoSnap = await getDoc(convoRef);
        if (convoSnap.exists()) {
            const newConvoData = { id: convoSnap.id, ...convoSnap.data() };
            setSelectedConversation(newConvoData);
             if (window.innerWidth < 768) {
                setView('chat');
            }
        } else {
            console.warn("Newly created conversation not found immediately:", conversationId);
            // Fallback or error handling
        }
    } catch (error) {
        console.error("Error fetching newly started conversation:", error);
    }
    setIsModalOpen(false);
  };
  
  const handleBackToList = () => {
      setView('sidebar');
      setSelectedConversation(null); // Clear selection when going back on mobile
  };

  // SIMULATED USER to call for testing
  const SIMULATED_CALLEE = { 
    userId: 'user2_placeholder_id', 
    displayName: 'Alice Wonderland', 
    email: 'alice@example.com',
    photoURL: 'https://via.placeholder.com/100?text=Alice' // Example photo
  };

  const handleTestCall = (type) => {
    if (currentUser?.uid === SIMULATED_CALLEE.userId) {
      alert("You cannot call yourself. This is a simulated call to Alice.");
      return;
    }
    console.log(`Initiating test ${type} call to Alice (ID: ${SIMULATED_CALLEE.userId})`);
    // Pass calleeInfo directly to startCall
    startCall(SIMULATED_CALLEE.userId, type, SIMULATED_CALLEE);
  };


  if (!currentUser) {
    // This page should ideally be protected by a route that requires authentication
    return <p className="text-center text-gray-600 py-10">Please log in to view your messages.</p>;
  }

  const sidebarComponent = (
    <ChatSidebar
        onSelectConversation={handleSelectConversation}
        currentConversationId={selectedConversation?.id}
        onStartNewConversation={handleStartNewConversation}
    />
  );

  const chatWindowComponent = (
    <ChatWindow 
        conversation={selectedConversation} 
        onBackToList={handleBackToList} 
    />
  );

  return (
    <div className="flex h-screen antialiased text-gray-800 bg-gray-100">
      {/* Main container */}
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {/* Sidebar */}
        {view === 'sidebar' && (
            <div className="w-full md:hidden"> {/* Full width on mobile, hidden on md+ */}
                {sidebarComponent}
                 {/* Test Call Buttons - visible only in sidebar view on mobile for simplicity */}
                <div className="p-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Test Call (Simulated User Alice):</p>
                    <button onClick={() => handleTestCall('audio')} className="w-full mb-1 py-1 px-2 text-xs bg-green-500 text-white rounded hover:bg-green-600">Call Alice (Audio)</button>
                    <button onClick={() => handleTestCall('video')} className="w-full py-1 px-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Call Alice (Video)</button>
                </div>
            </div>
        )}
         <div className="hidden md:flex md:flex-shrink-0"> {/* Visible on md+ */}
            {sidebarComponent}
            {/* Test Call Buttons - visible below sidebar on larger screens */}
            <div className="absolute bottom-0 left-0 m-2 p-2 bg-white shadow-lg rounded border w-72 md:w-auto z-10"> {/* Ensure it's within sidebar width or adjust */}
                 <p className="text-xs text-gray-500 mb-1">Test Call (Simulated User Alice):</p>
                 <button onClick={() => handleTestCall('audio')} className="w-full mb-1 py-1 px-2 text-xs bg-green-500 text-white rounded hover:bg-green-600">Call Alice (Audio)</button>
                 <button onClick={() => handleTestCall('video')} className="w-full py-1 px-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Call Alice (Video)</button>
            </div>
        </div>


        {/* Chat Window */}
        {view === 'chat' && (
            <div className="flex-1 w-full md:hidden">  {/* Full width on mobile, hidden on md+ */}
                {chatWindowComponent}
            </div>
        )}
         <div className="hidden md:flex flex-1"> {/* Visible on md+ */}
             {chatWindowComponent}
        </div>
        
        {/* Fallback for 'both' view on large screens if one component should hide */}
        {/* This logic is simplified; a more robust router/layout manager would handle this. */}
        {/* The above md:flex and md:hidden should manage visibility correctly. */}


      </div>

      <StartConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationStarted={handleConversationStarted}
      />
    </div>
  );
}

export default ChatPage;
