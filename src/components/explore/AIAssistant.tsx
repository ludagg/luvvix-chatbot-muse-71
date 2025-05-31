
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Brain, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const { t } = useLanguage();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onMessage(input.trim());
      setInput('');
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
      {/* Header élégant */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
              <div className="w-full h-full bg-green-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">LuvviX AI</h3>
            <p className="text-blue-100 text-sm">{t('explore.ai.connected')}</p>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="h-80 relative">
        <ScrollArea className="h-full p-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-500 text-sm">{t('explore.ai.welcome')}</p>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                } p-3 shadow-sm`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </motion.div>
                    <span className="text-sm text-gray-600">{t('explore.ai.thinking')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('explore.ai.placeholder')}
            className="flex-1 rounded-xl border-gray-200 focus:border-blue-400 bg-white"
            disabled={isThinking}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIAssistant;
