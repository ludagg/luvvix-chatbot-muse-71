
import React, { useState, useEffect } from 'react';
import { useSecureChat } from '@/hooks/useSecureChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft,
  Send, 
  Shield, 
  Lock, 
  Users,
  Plus,
  Search,
  MessageCircle,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileSecureChatProps {
  onBack?: () => void;
  showBottomNav?: boolean;
}

const MobileSecureChat = ({ onBack, showBottomNav = false }: MobileSecureChatProps) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    contacts,
    loading,
    activeConversation,
    isKeysInitialized,
    setActiveConversation,
    loadMessages,
    sendMessage,
    createPrivateConversation,
    addContact
  } = useSecureChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'conversations' | 'chat' | 'contacts' | 'add-contact'>('conversations');
  const [newContactId, setNewContactId] = useState('');
  const [newContactName, setNewContactName] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    await sendMessage(activeConversation, newMessage);
    setNewMessage('');
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    loadMessages(conversationId);
    setView('chat');
  };

  const handleAddContact = async () => {
    if (!newContactId.trim()) return;
    
    await addContact(newContactId.trim(), newContactName.trim() || undefined);
    setNewContactId('');
    setNewContactName('');
    setView('contacts');
  };

  const handleStartConversation = async (contactId: string) => {
    const conversationId = await createPrivateConversation(contactId);
    if (conversationId) {
      setActiveConversation(conversationId);
      loadMessages(conversationId);
      setView('chat');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  if (loading || !isKeysInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">Initialisation du chiffrement...</p>
            <p className="text-sm text-gray-600">Configuration des clés de sécurité</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue des conversations
  if (view === 'conversations') {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <Shield className="h-5 w-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900">Chat Sécurisé</h1>
            <Badge variant="outline" className="flex items-center space-x-1 text-xs">
              <Lock className="h-3 w-3" />
              <span>E2E</span>
            </Badge>
          </div>
          <button 
            onClick={() => setView('contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Users className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Recherche */}
        <div className="p-4">
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

        {/* Liste des conversations */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Aucune conversation</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ajoutez des contacts pour commencer à discuter
                </p>
                <Button onClick={() => setView('contacts')} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Voir mes contacts
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants?.find(
                  p => p.user_id !== user?.id
                );

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherParticipant?.user_profiles?.avatar_url || ''} />
                          <AvatarFallback className="bg-blue-100">
                            {conversation.conversation_type === 'group' ? (
                              <Users className="h-6 w-6 text-blue-600" />
                            ) : (
                              otherParticipant?.user_profiles?.full_name?.charAt(0) || 'U'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full">
                          <Lock className="h-2 w-2 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate text-gray-900">
                            {conversation.name || 
                             otherParticipant?.user_profiles?.full_name || 
                             'Conversation'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.updated_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          🔒 Message chiffré
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Vue du chat
  if (view === 'chat' && activeConversation) {
    const activeConv = conversations.find(c => c.id === activeConversation);
    const otherParticipant = activeConv?.participants?.find(p => p.user_id !== user?.id);

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header du chat */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setView('conversations')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherParticipant?.user_profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100">
                {otherParticipant?.user_profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherParticipant?.user_profiles?.full_name || 'Conversation'}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Shield className="h-3 w-3" />
                <span>Chiffré E2E</span>
              </div>
            </div>
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
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.sender_id === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
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
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Message chiffré..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-10"
              />
              <Shield className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={handleSendMessage} size="sm" className="px-3">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Vue des contacts
  if (view === 'contacts') {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setView('conversations')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <Users className="h-5 w-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900">Contacts</h1>
          </div>
          <button 
            onClick={() => setView('add-contact')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Recherche */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des contacts */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Aucun contact</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ajoutez vos premiers contacts pour commencer
                </p>
                <Button onClick={() => setView('add-contact')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un contact
                </Button>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.user_profiles?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-100">
                        {(contact.contact_name || contact.user_profiles?.full_name)?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {contact.contact_name || contact.user_profiles?.full_name || 'Contact'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        @{contact.user_profiles?.username || 'utilisateur'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleStartConversation(contact.contact_user_id)}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Vue d'ajout de contact
  if (view === 'add-contact') {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <button 
            onClick={() => setView('contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <UserPlus className="h-5 w-5 text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-900">Ajouter un contact</h1>
        </div>

        {/* Formulaire */}
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Utilisateur *
            </label>
            <Input
              placeholder="UUID de l'utilisateur à ajouter"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom personnalisé (optionnel)
            </label>
            <Input
              placeholder="Nom d'affichage pour ce contact"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAddContact} 
              disabled={!newContactId.trim()}
              className="w-full"
            >
              Ajouter le contact
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setView('contacts')}
              className="w-full"
            >
              Annuler
            </Button>
          </div>

          {/* Info sécurité */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Sécurité garantie</span>
            </div>
            <p className="text-sm text-blue-700">
              Tous vos contacts et conversations sont chiffrés bout-à-bout. 
              Supabase ne peut pas lire vos données.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileSecureChat;
