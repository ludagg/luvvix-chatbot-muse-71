import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Brain, Lightbulb, Share2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedResults?: string[];
}

interface AIAssistantProps {
  messages: AIMessage[];
  isThinking: boolean;
  onMessage: (message: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ messages, isThinking, onMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onMessage(inputMessage);
    setInputMessage('');
  };

  const quickActions = [
    { 
      icon: Lightbulb, 
      text: t.explore.assistant.actions.summarize, 
      action: language === 'fr' 
        ? "Peux-tu résumer les principaux résultats de recherche ?" 
        : "Can you summarize the main search results?"
    },
    { 
      icon: Brain, 
      text: t.explore.assistant.actions.deepen, 
      action: language === 'fr'
        ? "Quelles sont les informations complémentaires importantes ?"
        : "What additional important information should I know?"
    },
    { 
      icon: Plus, 
      text: t.explore.assistant.actions.suggestions, 
      action: language === 'fr'
        ? "Quelles recherches complémentaires recommandes-tu ?"
        : "What additional searches do you recommend?"
    },
    { 
      icon: Share2, 
      text: t.explore.assistant.actions.createContent, 
      action: language === 'fr'
        ? "Comment puis-je utiliser ces informations pour créer du contenu ?"
        : "How can I use this information to create content?"
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t.explore.assistant.title}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">{t.explore.assistant.online}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-80" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-purple-600" />
              </motion.div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t.explore.assistant.copilot}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {t.explore.assistant.helpText}
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage(action.action)}
                    className="text-xs p-2 h-auto flex-col gap-1 hover:bg-purple-50 hover:border-purple-200"
                  >
                    <action.icon className="w-4 h-4" />
                    {action.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDistanceToNow(message.timestamp, { addSuffix: true, locale })}
                    </span>
                    {message.relatedResults && (
                      <Badge variant="secondary" className="text-xs">
                        {message.relatedResults.length} {language === 'fr' ? 'résultats liés' : 'related results'}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 p-3 rounded-xl max-w-[80%]">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </motion.div>
                  <span className="text-sm text-gray-600">
                    {t.explore.assistant.thinking}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.explore.assistant.askQuestion}
            className="flex-1 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {messages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {quickActions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onMessage(action.action)}
                className="text-xs px-2 py-1 h-auto text-gray-600 hover:text-purple-600"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIAssistant;
