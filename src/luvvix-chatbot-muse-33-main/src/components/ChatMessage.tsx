
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <Avatar className="h-8 w-8 border border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8 bg-gradient-to-br from-violet-500 to-indigo-700">
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/placeholder.svg" />
          </Avatar>
        )}
      </div>
      
      {/* Message bubble */}
      <div className={cn(
        "flex-1 rounded-lg px-4 py-2 space-y-2 max-w-[80%] md:max-w-[70%]",
        isUser ? 
          "bg-primary text-primary-foreground ml-auto" : 
          "bg-muted"
      )}>
        {/* Message content */}
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>LuvviX AI est en train de réfléchir...</span>
          </div>
        ) : (
          <div className="prose dark:prose-invert prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
