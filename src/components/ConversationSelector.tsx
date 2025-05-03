
import { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossAuth } from '@/contexts/CrossAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, MessageSquarePlus, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';

interface ConversationSelectorProps {
  closeMenu?: () => void;
}

export function ConversationSelector({ closeMenu }: ConversationSelectorProps) {
  // Try CrossAuth first, then fallback to standard Auth
  const crossAuth = useCrossAuth();
  const standardAuth = useAuth();
  
  // Use CrossAuth if available, otherwise use standard Auth
  const { 
    user, 
    conversations, 
    currentConversationId, 
    setCurrentConversation,
    createNewConversation,
    deleteConversation,
    updateConversationTitle 
  } = crossAuth || standardAuth;
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isMobile = useIsMobile();

  const handleCreateNew = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      await createNewConversation();
      if (closeMenu) closeMenu();
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    if (closeMenu) closeMenu();
  };

  const handleStartDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      await deleteConversation(deletingId);
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleStartEdit = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      await updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Conversations</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateNew}
            disabled={isCreating}
            className="gap-1"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
            Nouvelle
          </Button>
        </div>
        
        <ScrollArea className="flex-1 pr-3 -mr-3">
          {!user ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Connectez-vous pour sauvegarder vos discussions
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune conversation
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                    currentConversationId === conv.id 
                      ? "bg-primary/10 text-primary hover:bg-primary/15" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  {editingId === conv.id ? (
                    <form 
                      onSubmit={(e) => handleSaveEdit(conv.id, e)} 
                      className="flex-1 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onBlur={() => setEditingId(null)}
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2"
                      >
                        OK
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 truncate text-sm">
                        {conv.title || "Nouvelle discussion"}
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Actions</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={(e) => handleStartEdit(conv.id, conv.title || "Nouvelle discussion", e)}>
                              Renommer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleStartDelete(conv.id, e)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la conversation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
