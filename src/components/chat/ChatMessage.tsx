
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Languages, Heart, Reply, MoreHorizontal } from 'lucide-react';

interface ChatMessageProps {
  id: string;
  content: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isOwn: boolean;
  onTranslate?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const ChatMessage = ({
  id,
  content,
  senderName,
  senderAvatar,
  timestamp,
  isOwn,
  onTranslate,
  onReply,
  onReact
}: ChatMessageProps) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {!isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <span className="text-xs text-muted-foreground mb-1">{senderName}</span>
          )}
          
          <div
            className={`px-4 py-2 rounded-2xl relative ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}
          >
            <p className="text-sm">{content}</p>
            
            {/* Actions rapides */}
            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1 bg-background border rounded-full p-1 shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onReact?.(id, '❤️')}
                >
                  <Heart className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onReply?.(id)}
                >
                  <Reply className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onTranslate?.(id)}
                >
                  <Languages className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <span className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
