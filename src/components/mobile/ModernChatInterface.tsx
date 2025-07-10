
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, Paperclip, RotateCcw, Square, Sparkles, 
  Moon, Sun, Search, Plus, Bot, User, Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const ModernChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialisation avec message de bienvenue
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `👋 **Bienvenue sur LuvviX AI !**

Je suis votre assistant IA personnel, prêt à vous aider dans tous vos projets.

**Mes capacités :**
• 💬 Conversation naturelle intelligente
• 📝 Rédaction et création de contenu
• 💻 Aide à la programmation
• 🌍 Traduction multilingue
• 🧮 Calculs et analyses
• 🎨 Brainstorming créatif

**Comment puis-je vous assister aujourd'hui ?**`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  // Envoyer un message
  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Appel à l'API LuvviX AI
      const response = await supabase.functions.invoke('gemini-chat-response', {
        body: { message: content }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Erreur LuvviX AI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erreur de connexion à LuvviX AI');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des touches
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Suggestions intelligentes
  const suggestions = [
    'Explique-moi un concept complexe',
    'Aide-moi à rédiger un email',
    'Créer une présentation',
    'Analyser des données',
    'Brainstorming d\'idées',
    'Corriger un texte'
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-all duration-300`}>
      
      {/* Header moderne */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b px-6 py-4 sticky top-0 z-10`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-blue-600 to-purple-700'} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
                LuvviX AI
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Assistant personnel
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-xl transition-colors`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-xl transition-colors`}
            >
              <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Zone de chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center ${
                    message.role === 'user'
                      ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                      : isDarkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  } shadow-lg`}
                >
                  {message.role === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-white" />
                  }
                </motion.div>

                {/* Bulle de message */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`relative px-4 py-3 rounded-3xl shadow-sm ${
                    message.role === 'user'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 border border-gray-700 text-gray-100'
                        : 'bg-white border border-gray-200 text-gray-900 shadow-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-blue-100' 
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicateur de chargement */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-md'} border px-4 py-3 rounded-3xl`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className={`w-2 h-2 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    LuvviX AI réfléchit...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions si pas de messages */}
      {messages.length <= 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4"
        >
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
            Suggestions pour commencer :
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInput(suggestion)}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-300' 
                    : 'bg-white/60 hover:bg-white border-gray-200 text-gray-700'
                } backdrop-blur-sm border text-xs px-3 py-2 rounded-2xl transition-all shadow-sm`}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Zone de saisie moderne */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-t p-4`}
      >
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-3xl border shadow-lg overflow-hidden`}>
          <div className="flex items-end space-x-3 p-4">
            
            {/* Bouton pièce jointe */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-2xl transition-colors`}
            >
              <Paperclip className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </motion.button>

            {/* Zone de texte */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Message à LuvviX AI..."
                disabled={isLoading}
                className={`w-full resize-none border-none outline-none text-sm leading-relaxed ${
                  isDarkMode 
                    ? 'bg-transparent text-white placeholder-gray-400' 
                    : 'bg-transparent text-gray-900 placeholder-gray-500'
                } max-h-[120px] overflow-y-auto`}
                style={{ height: 'auto', minHeight: '20px' }}
              />
            </div>

            {/* Bouton micro */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-2xl transition-colors ${
                isRecording ? 'bg-red-100 text-red-600' : ''
              }`}
            >
              <Mic className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRecording ? 'animate-pulse' : ''}`} />
            </motion.button>

            {/* Bouton envoyer */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-2xl transition-all shadow-md ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Powered by */}
        <div className={`text-center mt-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          🚀 Propulsé par LuvviX AI • Intelligence • Vision • Multimodal
        </div>
      </motion.div>
    </div>
  );
};

export default ModernChatInterface;
