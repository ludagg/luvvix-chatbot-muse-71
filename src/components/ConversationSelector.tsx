
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, MessageSquare, FileText, MoreVertical, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ConversationSelector() {
  const { 
    user, 
    conversations, 
    currentConversationId, 
    createNewConversation, 
    loadConversation,
    deleteConversation 
  } = useAuth();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  if (!user) return null;

  const handleNewConversation = () => {
    createNewConversation();
    setIsOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setIsOpen(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setDeleteConfirmId(conversationId);
  };

  const confirmDelete = (confirm: boolean) => {
    if (confirm && deleteConfirmId) {
      deleteConversation(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  // Get the current conversation title
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const conversationTitle = currentConversation?.title || 'Nouvelle discussion';

  return (
    <>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 truncate w-[180px] md:w-[220px] justify-between flex-shrink-0 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <div className="flex items-center gap-2 truncate flex-1">
                <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="truncate font-medium">{conversationTitle}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Mes discussions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={handleNewConversation}
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              Nouvelle discussion
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <ScrollArea className="h-[220px]">
              <div className="p-1 space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer transition-all duration-200",
                      conversation.id === currentConversationId
                        ? "bg-primary/15 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[160px]">
                      <MessageSquare className={cn(
                        "h-4 w-4 flex-shrink-0",
                        conversation.id === currentConversationId ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="truncate">{conversation.title}</span>
                    </div>
                    {conversations.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                        className="h-6 w-6 opacity-70 hover:opacity-100 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={createNewConversation}
          title="Nouvelle discussion"
          className="h-8 w-8"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-border"
          >
            <h3 className="text-lg font-medium mb-2 text-primary">Supprimer la discussion ?</h3>
            <p className="text-muted-foreground mb-4">
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette discussion ?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => confirmDelete(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={() => confirmDelete(true)}>
                Supprimer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
