import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ConversationSelectorProps {
  closeMenu?: () => void;
}

export function ConversationSelector({ closeMenu }: ConversationSelectorProps) {
  const { conversations, currentConversationId, setCurrentConversation, createNewConversation, deleteConversation, user } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Format date to readable string
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Same day
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Other days
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('fr-FR', options);
  };

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    if (closeMenu) {
      closeMenu();
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer une nouvelle discussion.",
        variant: "destructive",
      });
      return;
    }
    
    createNewConversation();
    if (closeMenu) {
      closeMenu();
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    setDeletingId(null);
    toast({
      title: "Discussion supprimée",
      description: "La discussion a été supprimée avec succès.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-4">
        <h2 className="text-lg font-medium">Mes discussions</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1"
          onClick={handleNewConversation}
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Nouvelle</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 px-2 pb-4">
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune discussion</p>
              <p className="text-xs mt-1">Commencez une nouvelle discussion pour discuter avec LuvviX AI</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.div 
                key={conversation.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="relative group"
              >
                <Button
                  variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex flex-col gap-0.5 items-start">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {conversation.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                </Button>
                
                {/* Delete button */}
                <AlertDialog open={deletingId === conversation.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(conversation.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la discussion ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement cette discussion.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => handleDeleteConversation(conversation.id)}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
