
import React, { useState } from 'react';
import { useGunChat } from '@/hooks/useGunChat';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Users, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const DecentralizedChat = () => {
  const {
    messages,
    conversations,
    currentUser,
    loading,
    activeConversation,
    setActiveConversation,
    loadMessages,
    sendMessage
  } = useGunChat();

  const [newMessage, setNewMessage] = useState('');

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    loadMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    await sendMessage(activeConversation, newMessage);
    setNewMessage('');
  };

  const selectedConversation = conversations.find(c => c.id === activeConversation);
  const conversationMessages = activeConversation ? messages[activeConversation] || [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Liste des conversations */}
      <div className="w-80 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages P2P</h2>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="text-xs">
                Décentralisé
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ID: {currentUser.substring(0, 12)}...
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3" />
                <p>Aucune conversation</p>
                <p className="text-xs">Ajoutez des contacts pour commencer</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={activeConversation === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto mb-2"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-sm truncate">
                        {conversation.name || 'Conversation'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.lastActivity), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* En-tête de conversation */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.name || 'Conversation'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      Réseau décentralisé actif
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === currentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Card
                      className={`max-w-xs lg:max-w-md ${
                        message.sender === currentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {formatDistanceToNow(new Date(message.timestamp), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  placeholder="Message décentralisé..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <Wifi className="h-3 w-3 mr-1 text-green-500" />
                Messages chiffrés et distribués sur le réseau Gun.js
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Chat Décentralisé
              </h3>
              <p className="text-muted-foreground mb-2">
                Sélectionnez une conversation pour commencer
              </p>
              <Badge variant="outline" className="text-xs">
                Powered by Gun.js
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecentralizedChat;
