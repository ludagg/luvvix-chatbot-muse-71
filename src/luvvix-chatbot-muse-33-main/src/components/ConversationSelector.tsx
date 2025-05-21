
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

interface ConversationSelectorProps {
  closeMenu?: () => void;
}

export function ConversationSelector({ closeMenu }: ConversationSelectorProps) {
  const { conversations, currentConversationId, setCurrentConversationId, createNewConversation, deleteConversation } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    if (closeMenu) closeMenu();
  };

  const handleCreateConversation = () => {
    createNewConversation();
    if (closeMenu) closeMenu();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    toast({
      description: "Conversation supprimée",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between py-2">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <Button
          onClick={handleCreateConversation}
          variant="outline"
          size="icon"
          title="Nouvelle conversation"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Nouvelle conversation</span>
        </Button>
      </div>
      <Separator className="mb-4" />
      <ScrollArea className="flex-1 pr-4">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune conversation</p>
            <p className="text-sm">Commencez une nouvelle conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left relative group"
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <span className="truncate flex-1">{conversation.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-2"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
