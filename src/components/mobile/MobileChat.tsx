
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

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar: string;
  isOnline: boolean;
  isTyping?: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

const MobileChat = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - remplacez par vos vraies données
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Marie Dupont',
      lastMessage: 'Salut ! Comment ça va ?',
      lastMessageTime: '14:30',
      unreadCount: 2,
      avatar: '',
      isOnline: true,
      isTyping: false
    },
    {
      id: '2',
      name: 'Équipe Projet',
      lastMessage: 'La réunion est reportée à demain',
      lastMessageTime: '12:15',
      unreadCount: 0,
      avatar: '',
      isOnline: false
    },
    {
      id: '3',
      name: 'Jean Martin',
      lastMessage: 'Merci pour le document !',
      lastMessageTime: 'Hier',
      unreadCount: 0,
      avatar: '',
      isOnline: true
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: 'Salut ! Comment ça va ?',
      timestamp: '14:30',
      isOwn: false,
      status: 'read'
    },
    {
      id: '2',
      text: 'Ça va très bien merci ! Et toi ?',
      timestamp: '14:32',
      isOwn: true,
      status: 'read'
    },
    {
      id: '3',
      text: 'Super ! Tu as vu le nouveau projet ?',
      timestamp: '14:33',
      isOwn: false,
      status: 'read'
    },
    {
      id: '4',
      text: 'Oui, c\'est vraiment intéressant ! On peut en discuter demain ?',
      timestamp: '14:35',
      isOwn: true,
      status: 'delivered'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Logique d'envoi de message
      console.log('Envoi du message:', message);
      setMessage('');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Logique d'enregistrement vocal
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Logique d'arrêt d'enregistrement
  };

  if (activeChat) {
    const currentChat = chats.find(chat => chat.id === activeChat);
    
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header de conversation */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveChat(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {currentChat?.name.charAt(0)}
                  </span>
                </div>
                {currentChat?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">{currentChat?.name}</h3>
                <p className="text-xs text-gray-500">
                  {currentChat?.isTyping ? 'En train de taper...' : currentChat?.isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.isOwn
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">{msg.timestamp}</span>
                  {msg.isOwn && (
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat.id)}
            className="flex items-center px-4 py-4 hover:bg-gray-100 border-b border-gray-100 cursor-pointer transition-colors"
          >
            <div className="relative mr-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {chat.name.charAt(0)}
                </span>
              </div>
              {chat.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">
                  {chat.isTyping ? (
                    <span className="text-blue-500 italic">En train de taper...</span>
                  ) : (
                    chat.lastMessage
                  )}
                </p>
                {chat.unreadCount > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileChat;
