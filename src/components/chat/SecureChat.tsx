
import React, { useState } from 'react';
import { useSecureChat } from '@/hooks/useSecureChat';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Lock, 
  Users,
  Plus,
  Search,
  Key
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const SecureChat = () => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    activeConversation,
    isKeysInitialized,
    setActiveConversation,
    loadMessages,
    sendMessage
  } = useSecureChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    await sendMessage(activeConversation, newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  if (loading || !isKeysInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Initialisation du chiffrement...</p>
            <p className="text-sm text-muted-foreground">Configuration des clés de sécurité</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Liste des conversations */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Chat Sécurisé</h2>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>E2E</span>
            </Badge>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button size="sm" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants?.find(
                p => p.user_id !== user?.id
              );

              return (
                <Button
                  key={conversation.id}
                  variant={activeConversation === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto hover:bg-accent"
                  onClick={() => {
                    setActiveConversation(conversation.id);
                    loadMessages(conversation.id);
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.user_profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {conversation.conversation_type === 'group' ? (
                            <Users className="h-6 w-6" />
                          ) : (
                            otherParticipant?.user_profiles?.full_name?.charAt(0) || 'U'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-background rounded-full">
                        <Lock className="h-2 w-2 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.name || 
                           otherParticipant?.user_profiles?.full_name || 
                           'Conversation'}
                        </h4>
                        {conversation.conversation_type === 'group' && (
                          <Badge variant="outline" className="text-xs">
                            Groupe
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message?.content || 'Aucun message'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updated_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* En-tête du chat */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <MessageCircle className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Conversation sécurisée</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-3 w-3 text-green-500" />
                      <span>Chiffrement bout-à-bout actif</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Key className="h-3 w-3" />
                  <span>Sécurisé</span>
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(message.sent_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                        <Lock className="h-3 w-3 opacity-50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="border-t border-border p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Tapez votre message sécurisé..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Shield className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Vos messages sont chiffrés bout-à-bout
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle>Messagerie Sécurisée</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Sélectionnez une conversation pour commencer à discuter en toute sécurité.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Lock className="h-4 w-4" />
                    <span>Chiffrement bout-à-bout</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Key className="h-4 w-4" />
                    <span>Clés cryptographiques RSA</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-purple-600">
                    <Shield className="h-4 w-4" />
                    <span>Confidentialité garantie</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureChat;
