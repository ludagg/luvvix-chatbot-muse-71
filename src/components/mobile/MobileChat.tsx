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
  Check,
  Users,
  MessageCircle,
  UserPlus,
  Settings,
  Archive,
  Star,
  Volume2,
  VolumeX,
  Image,
  FileText,
  MapPin,
  Gift,
  Zap,
  Languages,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { aiChatService } from '@/services/ai-chat-service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface MobileChatProps {
  showBottomNav?: boolean;
}

const MobileChat = ({ showBottomNav = true }: MobileChatProps) => {
  const {
    conversations,
    contacts,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    loadMessages,
    sendMessage,
    createPrivateConversation,
    createGroup,
    addContact,
    searchUsers
  } = useChat();

  const [currentView, setCurrentView] = useState<'conversations' | 'contacts' | 'search' | 'chat' | 'new-group'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactUsername, setNewContactUsername] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === activeConversation);
  const currentMessages = activeConversation ? messages[activeConversation] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Fonction pour démarrer une conversation avec un contact
  const startConversation = async (contactUserId: string) => {
    try {
      const conversationId = await createPrivateConversation(contactUserId);
      if (conversationId) {
        setActiveConversation(conversationId);
        setCurrentView('chat');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation, loadMessages]);

  // Recherche d'utilisateurs
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (message.trim() && activeConversation) {
      await sendMessage(activeConversation, 'text', message.trim());
      setMessage('');
      setShowAIFeatures(false);
    }
  };

  // Fonctionnalités IA
  const loadAISuggestions = async () => {
    if (activeConversation) {
      const suggestions = await aiChatService.suggestReply(activeConversation);
      setAiSuggestions(suggestions);
    }
  };

  const translateMessage = async (text: string, targetLang: string) => {
    const translated = await aiChatService.translateMessage(text, targetLang);
    toast({
      title: "Traduction",
      description: translated
    });
  };

  const enhanceMessage = async (enhancement: 'formal' | 'casual' | 'emoji' | 'correct') => {
    if (message.trim()) {
      const enhanced = await aiChatService.enhanceMessage(message, enhancement);
      setMessage(enhanced);
    }
  };

  // Gestion de l'enregistrement vocal
  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implémenter l'enregistrement vocal
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Arrêter l'enregistrement et envoyer
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vue Chat (conversation active)
  if (currentView === 'chat' && currentConversation) {
    return (
      <div className={`flex flex-col h-screen bg-background ${showBottomNav ? 'pb-16' : ''}`}>
        {/* Header de conversation */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                setActiveConversation(null);
                setCurrentView('conversations');
              }}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  {currentConversation.type === 'group' ? (
                    <Users className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className="text-primary-foreground font-semibold text-sm">
                      {currentConversation.name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground">
                  {currentConversation.name || 'Conversation'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentConversation.type === 'group' 
                    ? `${currentConversation.participants?.length || 0} membres`
                    : 'En ligne'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Video className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentConversation?.created_by ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender_id === currentConversation?.created_by
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    {msg.message_type === 'text' && (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    {msg.message_type === 'voice' && (
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">{msg.duration}s</span>
                      </div>
                    )}
                    {msg.message_type === 'image' && (
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4" />
                        <span className="text-sm">Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions IA sur les messages */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => translateMessage(msg.content || '', 'en')}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Languages className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  msg.sender_id === currentConversation?.created_by ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true, locale: fr })}
                  </span>
                  {msg.sender_id === currentConversation?.created_by && (
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

        {/* Fonctionnalités IA */}
        {showAIFeatures && (
          <div className="bg-card border-t border-border p-3">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Assistant IA</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => enhanceMessage('formal')}
                className="p-2 bg-accent rounded-lg text-xs text-center"
              >
                🎩 Formel
              </button>
              <button
                onClick={() => enhanceMessage('casual')}
                className="p-2 bg-accent rounded-lg text-xs text-center"
              >
                😎 Décontracté
              </button>
              <button
                onClick={() => enhanceMessage('emoji')}
                className="p-2 bg-accent rounded-lg text-xs text-center"
              >
                😊 + Emojis
              </button>
              <button
                onClick={() => enhanceMessage('correct')}
                className="p-2 bg-accent rounded-lg text-xs text-center"
              >
                ✏️ Corriger
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion.text)}
                    className="w-full p-2 bg-accent rounded-lg text-left text-sm"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Zone de saisie */}
        <div className="bg-card border-t border-border px-4 py-3">
          <div className="flex items-end space-x-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Camera className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setShowAIFeatures(!showAIFeatures);
                if (!showAIFeatures) loadAISuggestions();
              }}
              className={`p-2 transition-colors ${showAIFeatures ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-accent rounded-2xl px-4 py-2 flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
              />
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            {message.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
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
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
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

  // Vue Recherche
  if (currentView === 'search') {
    return (
      <div className={`flex flex-col h-screen bg-background ${showBottomNav ? 'pb-16' : ''}`}>
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={() => setCurrentView('conversations')}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Nouvelle conversation</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-accent rounded-full outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => startConversation(user.id)}
              className="w-full flex items-center px-4 py-4 hover:bg-accent border-b border-border transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-foreground font-semibold">
                  {user.full_name?.[0] || user.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">{user.full_name || user.username}</h4>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Vue Contacts
  if (currentView === 'contacts') {
    return (
      <div className={`flex flex-col h-screen bg-background ${showBottomNav ? 'pb-16' : ''}`}>
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('conversations')}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Contacts</h1>
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Options principales comme WhatsApp */}
          <div className="border-b border-border">
            <button
              onClick={() => setCurrentView('new-group')}
              className="w-full flex items-center px-4 py-4 hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">Nouveau groupe</h4>
                <p className="text-sm text-muted-foreground">Créer un groupe avec vos contacts</p>
              </div>
            </button>
            
            <button
              onClick={() => setShowAddContact(true)}
              className="w-full flex items-center px-4 py-4 hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">Nouveau contact</h4>
                <p className="text-sm text-muted-foreground">Ajouter un contact LuvviX</p>
              </div>
            </button>
          </div>

          {/* Liste des contacts */}
          {contacts.length > 0 && (
            <div className="mt-4">
              <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Mes contacts ({contacts.length})
              </h3>
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => startConversation(contact.contact_user_id)}
                  className="w-full flex items-center px-4 py-4 hover:bg-accent border-b border-border transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-semibold">
                      {contact.user_profiles?.full_name?.[0] || contact.contact_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">
                      {contact.contact_name || contact.user_profiles?.full_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      @{contact.user_profiles?.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {contacts.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Aucun contact</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Ajoutez vos premiers contacts LuvviX pour commencer à discuter
              </p>
              <button
                onClick={() => setShowAddContact(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                Ajouter un contact
              </button>
            </div>
          )}
        </div>

        {/* Modal d'ajout de contact */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Ajouter un contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom d'utilisateur LuvviX
                  </label>
                  <input
                    type="text"
                    value={newContactUsername}
                    onChange={(e) => setNewContactUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-accent rounded-lg outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom d'affichage (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Nom personnalisé"
                    className="w-full px-3 py-2 bg-accent rounded-lg outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContactName('');
                    setNewContactUsername('');
                  }}
                  className="flex-1 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (newContactUsername.trim()) {
                      // Chercher l'utilisateur par username
                      const users = await searchUsers(newContactUsername.replace('@', ''));
                      if (users.length > 0) {
                        await addContact(users[0].id, newContactName || undefined);
                        setShowAddContact(false);
                        setNewContactName('');
                        setNewContactUsername('');
                      } else {
                        toast({
                          title: "Erreur",
                          description: "Utilisateur non trouvé",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                  disabled={!newContactUsername.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vue Nouveau Groupe
  if (currentView === 'new-group') {
    return (
      <div className={`flex flex-col h-screen bg-background ${showBottomNav ? 'pb-16' : ''}`}>
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentView('contacts')}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Nouveau groupe</h1>
          </div>
        </div>

        <div className="p-4">
          <p className="text-muted-foreground text-center">
            Fonctionnalité en cours de développement
          </p>
        </div>
      </div>
    );
  }

  // Vue principale - Liste des conversations
  return (
    <div className={`flex flex-col h-screen bg-background ${showBottomNav ? 'pb-16' : ''}`}>
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentView('search')}
              className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('conversations')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentView === 'conversations' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-muted-foreground'
            }`}
          >
            Discussions
          </button>
          <button
            onClick={() => setCurrentView('contacts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (currentView as string) === 'contacts' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-muted-foreground'
            }`}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Aucune conversation</h3>
            <p className="text-muted-foreground text-sm mb-4">Commencez une nouvelle conversation !</p>
            <button
              onClick={() => setCurrentView('search')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Nouvelle conversation
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setActiveConversation(conversation.id);
                setCurrentView('chat');
              }}
              className="w-full flex items-center px-4 py-4 hover:bg-accent border-b border-border transition-colors"
            >
              <div className="relative mr-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  {conversation.type === 'group' ? (
                    <Users className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <span className="text-primary-foreground font-semibold">
                      {conversation.name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground truncate">
                    {conversation.name || 'Conversation'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.updated_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.last_message?.content || 'Aucun message'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileChat;