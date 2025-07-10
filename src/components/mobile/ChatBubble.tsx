
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import StreamingText from './StreamingText';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatBubbleProps {
  message: Message;
  isDarkMode: boolean;
  onAction?: (action: string, messageId: string) => void;
}

const ChatBubble = ({ message, isDarkMode, onAction }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        
        {/* Avatar avec animation */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : 'bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600'
          }`}
        >
          {isUser ? 
            <User className="w-4 h-4 text-white" /> : 
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="w-4 h-4 text-white" />
            </motion.div>
          }
        </motion.div>

        {/* Contenu de la bulle */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`relative px-5 py-4 rounded-3xl shadow-sm backdrop-blur-sm ${
              isUser
                ? isDarkMode
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800/90 border border-gray-700/50 text-gray-100'
                  : 'bg-white/90 border border-gray-200/50 text-gray-900 shadow-lg'
            }`}
          >
            {/* Contenu du message */}
            <div className="text-sm leading-relaxed">
              {message.isStreaming ? (
                <StreamingText text={message.content} />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isUser 
                ? 'text-blue-100' 
                : isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </div>

            {/* Triangle de la bulle */}
            <div className={`absolute top-4 ${
              isUser ? '-right-1' : '-left-1'
            } w-3 h-3 ${
              isUser
                ? isDarkMode
                  ? 'bg-blue-600'
                  : 'bg-blue-500'
                : isDarkMode
                  ? 'bg-gray-800 border-l border-t border-gray-700'
                  : 'bg-white border-l border-t border-gray-200'
            } rotate-45 ${isUser ? '' : 'shadow-sm'}`} />
          </motion.div>

          {/* Actions pour les messages de l'assistant */}
          {!isUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction?.('copy', message.id)}
                className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } rounded-lg transition-colors`}
              >
                <Copy className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction?.('like', message.id)}
                className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } rounded-lg transition-colors`}
              >
                <ThumbsUp className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction?.('dislike', message.id)}
                className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } rounded-lg transition-colors`}
              >
                <ThumbsDown className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction?.('regenerate', message.id)}
                className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } rounded-lg transition-colors`}
              >
                <RefreshCw className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
