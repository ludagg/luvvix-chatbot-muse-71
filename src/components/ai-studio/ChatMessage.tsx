
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, AlertCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    isError?: boolean;
  };
  agentName?: string;
  agentAvatar?: string;
  userAvatar?: string;
  accentColor?: string;
  onRetry?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  agentName,
  agentAvatar,
  userAvatar,
  accentColor = '#6366F1',
  onRetry
}) => {
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  
  return (
    <div className={`group flex items-start gap-3 ${
      isUser ? 'flex-row-reverse self-end' : ''
    } ${message.isError ? 'opacity-80' : ''}`}>
      
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <User size={16} />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage src={agentAvatar} />
            <AvatarFallback 
              className={message.isError 
                ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300" 
                : "text-white"}
              style={!message.isError ? { backgroundColor: accentColor } : {}}
            >
              {message.isError ? <AlertCircle size={16} /> : (agentName?.charAt(0) || <Bot size={16} />)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      {/* Message Content */}
      <div 
        className={`px-4 py-3 rounded-xl max-w-[75%] ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white' 
            : message.isError
              ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm'
        }`}
      >
        <div className={`
          ${isUser ? '' : 'prose dark:prose-invert prose-sm max-w-none'} 
          ${isUser ? 'text-sm' : ''}
        `}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <pre className="bg-gray-100 dark:bg-gray-900 rounded-md p-2 my-2 overflow-auto text-xs">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 rounded-md px-1 py-0.5 text-xs" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        
          {message.isError && onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
              </svg>
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
