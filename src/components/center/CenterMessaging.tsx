
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Phone, Video, Send, Smile, Paperclip, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

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
  user_profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

const CenterMessaging = () => {
  const { user, profile } = useAuth();
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
      
      // Transform the data to match our interface
      const transformedData: Conversation[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        center_chat_participants: item.center_chat_participants.map(participant => ({
          user_id: participant.user_id,
          user_profiles: {
            full_name: participant.user_profiles.full_name,
            username: participant.user_profiles.username,
            avatar_url: participant.user_profiles.avatar_url
          }
        })),
        center_chat_messages: item.center_chat_messages || []
      }));

      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les conversations"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('center_chat_messages')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages"
      });
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

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message"
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

  // Real-time subscription for messages
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

  const filteredConversations = conversations.filter(conv =>
    conv.center_chat_participants.some(p =>
      p.user_profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.center_chat_participants.find(
                p => p.user_id !== user?.id
              );
              const lastMessage = conversation.center_chat_messages[conversation.center_chat_messages.length - 1];

              return (
                <Button
                  key={conversation.id}
                  variant={selectedConversation === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherParticipant?.user_profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {otherParticipant?.user_profiles.full_name.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {otherParticipant?.user_profiles.full_name || 'Utilisateur'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          En ligne
                        </Badge>
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lastMessage.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Nom d'utilisateur</p>
                    <p className="text-sm text-green-500">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
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
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choisissez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterMessaging;
