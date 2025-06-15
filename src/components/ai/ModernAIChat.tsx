import React, { useRef, useState, useEffect } from "react";
import { Send, Menu, X, Brain, Bot, User, Sparkles, Calendar, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "./ImageUploader";
import ConversationSidebar from "./ConversationSidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePersistentConversations, Message } from "@/hooks/use-persistent-conversations";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PERSONALITIES = [
  { 
    key: "expert", 
    label: "🎯 Expert", 
    description: "Précis et professionnel",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  { 
    key: "coach", 
    label: "💪 Coach", 
    description: "Motivant et encourageant",
    color: "bg-green-50 text-green-600 border-green-200"
  },
  { 
    key: "secretary", 
    label: "📋 Assistant", 
    description: "Organisé et efficace",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  { 
    key: "friend", 
    label: "😊 Ami", 
    description: "Décontracté et sympathique",
    color: "bg-orange-50 text-orange-600 border-orange-200"
  }
];

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Planifier", prompt: "Aide-moi à organiser ma journée" },
  { icon: TrendingUp, label: "Analyser", prompt: "Analyse mes habitudes récentes" },
  { icon: Zap, label: "Automatiser", prompt: "Que peux-tu automatiser pour moi ?" },
  { icon: Brain, label: "Recommander", prompt: "Quelles sont tes recommandations ?" }
];

const ModernAIChat = () => {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    loading: conversationsLoading,
    createConversation,
    saveMessage,
    loadConversation,
    deleteConversation,
    startNewConversation
  } = usePersistentConversations();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Salut ! 👋 Je suis votre assistant IA personnel LuvviX Brain.\n\n🧠 **Je vous connais** et j'apprends de toutes vos interactions\n🎯 **Je peux vous aider** avec vos tâches quotidiennes\n⚡ **J'agis directement** sur vos applications LuvviX\n\nComment puis-je vous assister aujourd'hui ?",
      createdAt: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [personality, setPersonality] = useState(PERSONALITIES[0].key);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les messages de la conversation courante
  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
      setCurrentConversationId(currentConversation.id);
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Salut ! 👋 Je suis votre assistant IA personnel LuvviX Brain.\n\n🧠 **Je vous connais** et j'apprends de toutes vos interactions\n🎯 **Je peux vous aider** avec vos tâches quotidiennes\n⚡ **J'agis directement** sur vos applications LuvviX\n\nComment puis-je vous assister aujourd'hui ?",
          createdAt: new Date(),
        },
      ]);
      setCurrentConversationId(null);
    }
  }, [currentConversation]);

  // Preview the image selected
  useEffect(() => {
    if (!selectedImage) return setPreviewUrl(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string || null);
    reader.readAsDataURL(selectedImage);
    return () => reader.abort();
  }, [selectedImage]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim() && !selectedImage) return;
    if (!user) return toast.error("Connectez-vous pour chatter !");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      imageUrl: previewUrl ?? undefined,
      createdAt: new Date(),
    };

    // Ajouter le message immédiatement à l'UI
    setMessages(prev => [...prev, userMessage]);
    
    // Créer une conversation si nécessaire
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createConversation(input.trim());
      if (!conversationId) {
        toast.error("Erreur lors de la création de la conversation");
        return;
      }
      setCurrentConversationId(conversationId);
    }

    // Sauvegarder le message utilisateur
    await saveMessage(conversationId, {
      role: "user",
      content: input,
      imageUrl: previewUrl ?? undefined
    });

    setInput("");
    setIsTyping(true);

    // Envoi à l'edge function (multimodal)
    const formData = new FormData();
    const selectedPersonality = PERSONALITIES.find(p => p.key === personality);
    const personalizedPrompt = `[Mode: ${selectedPersonality?.label}] ${input.trim()}`;
    formData.append("message", personalizedPrompt);
    if (selectedImage) formData.append("image", selectedImage);

    setSelectedImage(null);
    setPreviewUrl(null);

    try {
      const res = await fetch("/functions/v1/gemini-chat-response", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Erreur réponse Gemini");
      }
      const { response, responseImage } = await res.json();

      const assistantMessage: Message = {
        id: Date.now().toString() + "ai",
        role: "assistant",
        content: response,
        imageUrl: responseImage || undefined,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Sauvegarder la réponse de l'assistant
      await saveMessage(conversationId, {
        role: "assistant",
        content: response,
        imageUrl: responseImage || undefined
      });

    } catch (e) {
      const errorMessage: Message = {
        id: Date.now().toString() + "fail",
        role: "assistant",
        content: "Désolé, je n'ai pas pu obtenir de réponse 🤖💔.",
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Sauvegarder le message d'erreur
      await saveMessage(conversationId, {
        role: "assistant",
        content: "Désolé, je n'ai pas pu obtenir de réponse 🤖💔."
      });
    } finally {
      setIsTyping(false);
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setShowSidebar(false);
  };

  const handleNewConversation = () => {
    startNewConversation();
    setShowSidebar(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const selectedPersonality = PERSONALITIES.find(p => p.key === personality);

  return (
    <div className="h-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <ConversationSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          loading={conversationsLoading}
        />
      </div>

      {/* Overlay pour mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat principale */}
      <div className="flex-1 flex flex-col">
        {/* Header épuré */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden text-gray-600 hover:bg-gray-100 rounded-full"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="relative">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentConversation?.title || "LuvviX Brain"}
                </h1>
                <p className="text-sm text-gray-500">Assistant IA personnel</p>
              </div>
            </div>
            
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              En ligne
            </Badge>
          </div>

          {/* Sélecteur de personnalité épuré */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Mode :</p>
            <div className="flex flex-wrap gap-2">
              {PERSONALITIES.map(p => (
                <motion.button
                  key={p.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPersonality(p.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    p.key === personality
                      ? p.color
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-3 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-50' 
                          : 'bg-gray-50'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={`px-4 py-3 rounded-2xl max-w-full ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-50 text-gray-900 border border-gray-100'
                      } ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="Image envoyée"
                            className="rounded-xl shadow mb-3 max-w-xs border"
                          />
                        )}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {message.createdAt.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Indicateur de frappe */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatBottomRef} />
            </div>
          </ScrollArea>

          {/* Actions rapides */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {QUICK_ACTIONS.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-all flex-shrink-0"
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Zone de saisie */}
            <div className="flex items-center space-x-3">
              <ImageUploader
                previewUrl={previewUrl}
                onImageSelected={setSelectedImage}
                disabled={isTyping}
              />
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder={`Écrivez votre message...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                  className="bg-gray-50 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleSend}
                  disabled={isTyping || (!input.trim() && !selectedImage)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-10 w-10 p-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAIChat;
