
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Send, User, Bot, LayoutGrid, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Type pour les messages
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Type pour les conversations
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const suggestedQuestions = [
  "Comment puis-je créer un agent IA personnalisé ?",
  "Quels sont les avantages des formulaires LuvviX ?",
  "Comment fonctionne le stockage cloud sur LuvviX ?",
  "Donne-moi les actualités technologiques récentes"
];

const LuvviXAIChat = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'conversations'>('chat');

  // Effet pour initialiser ou charger les conversations
  useEffect(() => {
    if (isAuthenticated && user) {
      // Charger les conversations depuis le stockage local ou créer une nouvelle
      const storedConversations = localStorage.getItem(`luvvix_conversations_${user.id}`);
      
      if (storedConversations) {
        const parsed = JSON.parse(storedConversations);
        setConversations(parsed);
        
        // Définir la conversation la plus récente comme actuelle
        if (parsed.length > 0) {
          setCurrentConversation(parsed[0]);
        } else {
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
    }
  }, [isAuthenticated, user]);

  // Créer une nouvelle conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `Nouvelle conversation ${new Date().toLocaleString()}`,
      messages: [
        {
          id: uuidv4(),
          content: "Bonjour ! Je suis LuvviX AI, votre assistant intelligent. Comment puis-je vous aider aujourd'hui ?",
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    
    // Sauvegarder dans le stockage local
    if (user) {
      localStorage.setItem(`luvvix_conversations_${user.id}`, JSON.stringify([newConversation, ...conversations]));
    }
    
    return newConversation;
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || isProcessing) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    // Ajouter le message de l'utilisateur à la conversation
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date()
    };
    
    // Mettre à jour l'état
    setCurrentConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => conv.id === updatedConversation.id ? updatedConversation : conv)
    );
    setInputValue('');
    setIsProcessing(true);
    
    // Simuler une réponse de l'assistant
    setTimeout(() => {
      const botResponse: Message = {
        id: uuidv4(),
        content: generateBotResponse(inputValue),
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, botResponse],
        updatedAt: new Date()
      };
      
      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === finalConversation.id ? finalConversation : conv)
      );
      
      // Sauvegarder dans le stockage local
      if (user) {
        localStorage.setItem(`luvvix_conversations_${user.id}`, 
          JSON.stringify(conversations.map(conv => 
            conv.id === finalConversation.id ? finalConversation : conv
          ))
        );
      }
      
      setIsProcessing(false);
    }, 1000);
  };
  
  // Génération simplifiée de réponse (à remplacer par une véritable IA)
  const generateBotResponse = (userInput: string) => {
    const responses = [
      `Je comprends votre question sur "${userInput}". Dans l'écosystème LuvviX, nous proposons plusieurs solutions pour répondre à ce besoin.`,
      `Merci pour votre question. LuvviX offre des fonctionnalités avancées qui pourraient vous aider avec "${userInput}".`,
      `C'est une excellente question. En tant qu'assistant LuvviX, je peux vous dire que "${userInput}" est une préoccupation que nous prenons au sérieux dans notre écosystème.`,
      `Votre demande concernant "${userInput}" touche à plusieurs aspects de notre plateforme. Laissez-moi vous guider à travers les options disponibles.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Si l'utilisateur n'est pas authentifié, afficher une page de connexion
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center p-6">
              <Bot className="h-16 w-16 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-6">Chat LuvviX AI</h2>
              <p className="text-center mb-6">
                Connectez-vous avec votre compte LuvviX ID pour accéder au chat IA et obtenir des réponses à toutes vos questions.
              </p>
              <Button onClick={login} className="w-full">
                Se connecter avec LuvviX ID
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-background rounded-xl shadow-lg overflow-hidden border border-border h-[75vh] flex flex-col md:flex-row">
          {/* Conversations sidebar - visible only on desktop */}
          <div className="hidden md:block w-72 border-r border-border bg-muted/40 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Conversations</h3>
              <Button variant="ghost" size="icon" onClick={createNewConversation}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(75vh-6rem)]">
              <div className="space-y-1">
                {conversations.map(conv => (
                  <Button
                    key={conv.id}
                    variant={currentConversation?.id === conv.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setCurrentConversation(conv)}
                  >
                    <div className="truncate">
                      <div className="font-medium truncate">{conv.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {/* Mobile tabs */}
            <div className="md:hidden border-b border-border">
              <Tabs defaultValue="chat" onValueChange={(value) => setActiveTab(value as 'chat' | 'conversations')}>
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                  <TabsTrigger value="conversations" className="flex-1">Conversations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="conversations" className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Conversations</h3>
                    <Button variant="ghost" size="icon" onClick={createNewConversation}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1 max-h-[25vh] overflow-y-auto">
                    {conversations.map(conv => (
                      <Button
                        key={conv.id}
                        variant={currentConversation?.id === conv.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => {
                          setCurrentConversation(conv);
                          setActiveTab('chat');
                        }}
                      >
                        <div className="truncate">
                          <div className="font-medium truncate">{conv.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4">
              {currentConversation?.messages.map(message => (
                <motion.div 
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {message.role === 'assistant' && (
                      <Avatar className="mt-1">
                        <div className="flex items-center justify-center w-full h-full bg-primary rounded-full">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </Avatar>
                    )}
                    
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <div className="mt-1 text-xs opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="mt-1">
                        <div className="flex items-center justify-center w-full h-full bg-secondary rounded-full">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      </Avatar>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex mb-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <div className="flex items-center justify-center w-full h-full bg-primary rounded-full">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </Avatar>
                    
                    <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">LuvviX AI réfléchit...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Suggested questions - shown only for new conversations */}
              {currentConversation?.messages.length === 1 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Questions suggérées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3 text-left"
                        onClick={() => {
                          setInputValue(question);
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
            
            {/* Input area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LuvviXAIChat;
