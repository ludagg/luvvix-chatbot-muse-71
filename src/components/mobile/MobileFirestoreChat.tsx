
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send,
  Mic,
  Camera,
  CheckCheck,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreChat } from '@/hooks/useFirestoreChat';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const MobileFirestoreChat = () => {
  const { user, profile } = useAuth();
  const {
    conversations,
    currentMessages,
    loading,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    sendMessage,
    markAsRead
  } = useFirestoreChat();

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Marquer les messages comme lus quand on ouvre une conversation
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead]);

  const handleSendMessage = async () => {
    if (message.trim() && activeConversationId) {
      await sendMessage(activeConversationId, message.trim());
      setMessage('');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast.info('Enregistrement vocal démarré');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.info('Enregistrement vocal arrêté');
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    return conv.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Vue de conversation active
  if (activeConversationId) {
    const currentConversation = conversations.find(conv => conv.id === activeConversationId);
    const otherParticipant = currentConversation?.participants.find(id => id !== user?.id);
    
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header de conversation */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveConversationId(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {currentConversation?.groupName ? 
                      currentConversation.groupName.charAt(0) : 
                      'U'
                    }
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentConversation?.groupName || 'Conversation'}
                </h3>
                <p className="text-xs text-gray-500">En ligne</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.senderId === user?.id
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">
                    {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), {
                      addSuffix: true,
                      locale: fr
                    }) : 'À l\'instant'}
                  </span>
                  {msg.senderId === user?.id && (
                    <div className="text-xs">
                      {msg.status === 'read' && <CheckCheck className="w-3 h-3" />}
                      {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-60" />}
                      {msg.status === 'sent' && <Check className="w-3 h-3 opacity-60" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-end space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              />
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            {message.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vue liste des conversations
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button 
            onClick={() => toast.info('Créer une nouvelle conversation')}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-gray-500 text-sm">Commencez une conversation avec quelqu'un !</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className="flex items-center px-4 py-4 hover:bg-gray-100 border-b border-gray-100 cursor-pointer transition-colors"
            >
              <div className="relative mr-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {conversation.groupName ? conversation.groupName.charAt(0) : 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.groupName || 'Conversation'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.lastMessage?.timestamp ? 
                      formatDistanceToNow(conversation.lastMessage.timestamp.toDate(), {
                        addSuffix: true,
                        locale: fr
                      }) : 'Maintenant'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage?.content || 'Aucun message'}
                  </p>
                  {(conversation.unreadCount?.[user?.id || ''] || 0) > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2">
                      {conversation.unreadCount?.[user?.id || ''] || 0}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileFirestoreChat;
