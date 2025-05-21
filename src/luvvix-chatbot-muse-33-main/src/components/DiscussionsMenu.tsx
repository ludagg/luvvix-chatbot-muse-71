
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export function DiscussionsMenu() {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversationId, 
    createNewConversation, 
    deleteConversation 
  } = useAuth();

  const handleNewConversation = () => {
    createNewConversation();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    toast({
      description: "Conversation supprimée",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground"
          title="Discussions"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Conversations</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNewConversation}
            title="Nouvelle conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {conversations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucune conversation</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              size="sm" 
              onClick={handleNewConversation}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle conversation
            </Button>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {conversations.map((conversation) => (
              <DropdownMenuItem 
                key={conversation.id} 
                className={`flex justify-between items-center group ${
                  currentConversationId === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <span className="truncate flex-1">{conversation.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
