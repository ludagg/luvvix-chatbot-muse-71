
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Send, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileCenterMessagingProps {
  onBack: () => void;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  center_chat_participants: {
    user_id: string;
    user_profiles: {
      full_name: string;
      username: string;
      avatar_url: string;
    };
  }[];
  center_chat_messages: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  }[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  type: string;
  media_url?: string;
}

const MobileCenterMessaging = ({ onBack }: MobileCenterMessagingProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_chat_rooms')
        .select(`
          id,
          created_at,
          updated_at,
          center_chat_participants!inner(
            user_id,
            user_profiles!inner(
              full_name,
              username,
              avatar_url
            )
          ),
          center_chat_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('center_chat_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: Conversation[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        center_chat_participants: item.center_chat_participants.map(participant => {
          const userProfile = Array.isArray(participant.user_profiles) 
            ? participant.user_profiles[0] 
            : participant.user_profiles;
          
          return {
            user_id: participant.user_id,
            user_profiles: {
              full_name: userProfile.full_name,
              username: userProfile.username,
              avatar_url: userProfile.avatar_url
            }
          };
        }),
        center_chat_messages: item.center_chat_messages || []
      }));

      setConversations(transformedData);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('center_chat_messages')
        .select('*')
        .eq('room_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('center_chat_messages')
        .insert({
          room_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
          type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'center_chat_messages',
          filter: `room_id=eq.${selectedConversation}`
        },
        () => {
          fetchMessages(selectedConversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    const otherParticipant = conversation?.center_chat_participants.find(
      p => p.user_id !== user?.id
    );

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
          <button onClick={() => setSelectedConversation(null)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {otherParticipant?.user_profiles.full_name?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{otherParticipant?.user_profiles.full_name}</h3>
            <p className="text-sm text-green-500">En ligne</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-blue-500"
            />
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Smile className="w-5 h-5" />
            </button>
            <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-gray-500 text-sm">Commencez une conversation avec quelqu'un !</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = conversation.center_chat_participants.find(
              p => p.user_id !== user?.id
            );
            const lastMessage = conversation.center_chat_messages[conversation.center_chat_messages.length - 1];

            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {otherParticipant?.user_profiles.full_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {otherParticipant?.user_profiles.full_name || 'Utilisateur'}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {lastMessage.content}
                      </p>
                    )}
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

export default MobileCenterMessaging;
