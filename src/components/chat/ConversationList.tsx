
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, MessageCircle } from 'lucide-react';
import { Conversation } from '@/hooks/use-chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  loading = false 
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
        <p className="text-muted-foreground text-sm">
          Commencez une nouvelle conversation pour démarrer
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant={activeConversation === conversation.id ? "secondary" : "ghost"}
            className="w-full justify-start p-3 h-auto hover:bg-accent"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.avatar_url || ''} />
                  <AvatarFallback>
                    {conversation.type === 'group' ? (
                      <Users className="h-6 w-6" />
                    ) : (
                      conversation.name?.charAt(0) || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {conversation.name || 'Conversation'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {conversation.type === 'group' && (
                      <Badge variant="outline" className="text-xs">
                        Groupe
                      </Badge>
                    )}
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message?.content || 'Aucun message'}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
