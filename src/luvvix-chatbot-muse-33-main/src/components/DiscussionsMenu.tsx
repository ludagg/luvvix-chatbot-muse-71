import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle, Trash } from 'lucide-react';
import { useAuth } from '@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DiscussionsMenu() {
  const { conversations, currentConversationId, setCurrentConversation, createNewConversation, deleteConversation, user } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
    setIsDropdownOpen(false);
  };
  
  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    setIsDropdownOpen(false);
  };
  
  const confirmDeleteConversation = (id: string) => {
    setConversationToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConversation = async () => {
    if (conversationToDelete) {
      await deleteConversation(conversationToDelete);
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
      setIsDropdownOpen(false);
      toast({
        title: "Discussion supprimée",
        description: "La discussion a été supprimée avec succès.",
      });
    }
  };
  
  // Get current conversation title
  const currentConversationTitle = () => {
    if (!currentConversationId) return "Nouvelle discussion";
    const currentConv = conversations.find(c => c.id === currentConversationId);
    return currentConv?.title || "Nouvelle discussion";
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-40 justify-start truncate">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="truncate">{currentConversationTitle()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mes discussions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleNewConversation} className="cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Nouvelle discussion</span>
          </DropdownMenuItem>
          
          {conversations.length > 0 && <DropdownMenuSeparator />}
          
          {conversations.map((conversation) => (
            <DropdownMenuItem 
              key={conversation.id} 
              className="flex items-start justify-between cursor-pointer group"
              onSelect={(e) => {
                e.preventDefault();
                handleSelectConversation(conversation.id);
              }}
            >
              <div className="flex flex-col">
                <span className={`truncate ${currentConversationId === conversation.id ? 'font-medium' : ''}`}>
                  {conversation.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(conversation.updatedAt)}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  confirmDeleteConversation(conversation.id);
                }}
              >
                <Trash className="h-3 w-3 text-destructive" />
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={handleDeleteConversation}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
