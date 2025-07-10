
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Phone, 
  Video, 
  MoreVertical, 
  Send,
  Paperclip,
  Smile,
  Mic,
  Camera,
  Image,
  File,
  Users,
  Settings,
  CheckCheck,
  Check,
  MessageCircle,
  UserPlus
} from 'lucide-react';
import { useMessengerLuvvix, useConversationMessages } from '@/hooks/useMessengerLuvvix';
import { Conversation, Message, MessengerUser } from '@/services/messengerLuvvixService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileMessengerLuvvixProps {
  onBack: () => void;
}

const MobileMessengerLuvvix = ({ onBack }: MobileMessengerLuvvixProps) => {
  const [activeView, setActiveView] = useState<'conversations' | 'chat' | 'newChat' | 'newGroup'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    conversations, 
    currentUser, 
    loading, 
    createDirectConversation,
    createGroup,
    searchUsers 
  } = useMessengerLuvvix();

  const { 
    messages, 
    sendMessage, 
    addReaction, 
    uploadFile 
  } = useConversationMessages(selectedConversation?.id || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      const url = await uploadFile(file);
      if (url) {
        let messageType: Message['message_type'] = 'file';
        
        if (file.type.startsWith('image/')) messageType = 'image';
        else if (file.type.startsWith('video/')) messageType = 'video';
        else if (file.type.startsWith('audio/')) messageType = 'audio';

        await sendMessage(file.name, messageType, url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleEmojiReaction = async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    return conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.participants?.some(p => 
             p.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
           );
  });

  // Vue de conversation individuelle
  if (activeView === 'chat' && selectedConversation) {
    const otherParticipant = selectedConversation.type === 'direct' 
      ? selectedConversation.participants?.find(p => p.user_id !== currentUser?.user_id)
      : null;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header de conversation */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveView('conversations')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedConversation.type === 'group' 
                      ? selectedConversation.name?.charAt(0) || 'G'
                      : otherParticipant?.user?.display_name?.charAt(0) || 'U'
                    }
                  </span>
                </div>
                {selectedConversation.type === 'direct' && otherParticipant?.user?.status === 'online' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.type === 'group' 
                    ? selectedConversation.name
                    : otherParticipant?.user?.display_name || 'Utilisateur'
                  }
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation.type === 'group' 
                    ? `${selectedConversation.participants?.length} membres`
                    : otherParticipant?.user?.status === 'online' ? 'En ligne' : 'Hors ligne'
                  }
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
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUser?.user_id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender_id === currentUser?.user_id
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
              }`}>
                {message.message_type === 'image' && message.media_url && (
                  <img 
                    src={message.media_url} 
                    alt="Image partagée" 
                    className="rounded-lg mb-2 max-w-full h-auto" 
                  />
                )}
                
                {message.message_type === 'video' && message.media_url && (
                  <video 
                    src={message.media_url} 
                    controls 
                    className="rounded-lg mb-2 max-w-full h-auto" 
                  />
                )}
                
                {message.message_type === 'audio' && message.media_url && (
                  <audio 
                    src={message.media_url} 
                    controls 
                    className="mb-2" 
                  />
                )}
                
                {message.message_type === 'file' && message.media_url && (
                  <div className="flex items-center space-x-2 mb-2">
                    <File className="w-4 h-4" />
                    <a 
                      href={message.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      {message.content || 'Fichier partagé'}
                    </a>
                  </div>
                )}
                
                {message.content && (
                  <p className="text-sm">{message.content}</p>
                )}
                
                <div className={`flex items-center justify-between mt-1 space-x-2 ${
                  message.sender_id === currentUser?.user_id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                  
                  {message.sender_id === currentUser?.user_id && (
                    <div className="text-xs">
                      {message.delivery_status === 'read' && <CheckCheck className="w-3 h-3" />}
                      {message.delivery_status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-60" />}
                      {message.delivery_status === 'sent' && <Check className="w-3 h-3 opacity-60" />}
                    </div>
                  )}
                </div>

                {/* Réactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.id}
                        className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs"
                        onClick={() => handleEmojiReaction(message.id, reaction.emoji)}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-end space-x-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              />
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    );
  }

  // Vue principale des conversations
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Messenger</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveView('newChat')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <UserPlus className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setActiveView('newGroup')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-gray-500 text-sm mb-4">Commencez une conversation avec quelqu'un !</p>
            <button 
              onClick={() => setActiveView('newChat')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Nouvelle conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.type === 'direct' 
              ? conversation.participants?.find(p => p.user_id !== currentUser?.user_id)
              : null;

            return (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setActiveView('chat');
                }}
                className="w-full p-4 hover:bg-gray-100 border-b border-gray-100 text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {conversation.type === 'group' 
                          ? conversation.name?.charAt(0) || 'G'
                          : otherParticipant?.user?.display_name?.charAt(0) || 'U'
                        }
                      </span>
                    </div>
                    {conversation.type === 'direct' && otherParticipant?.user?.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {conversation.type === 'group' 
                          ? conversation.name
                          : otherParticipant?.user?.display_name || 'Utilisateur'
                        }
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.type === 'group' 
                          ? `${conversation.participants?.length} membres`
                          : otherParticipant?.user?.status || 'Hors ligne'
                        }
                      </p>
                      {conversation.unread_count && conversation.unread_count > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileMessengerLuvvix;
