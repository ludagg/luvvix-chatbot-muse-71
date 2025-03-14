
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 truncate max-w-[200px] justify-start flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{conversationTitle}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mes discussions</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button 
              variant="outline" 
              onClick={handleNewConversation}
              className="w-full justify-start gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nouvelle discussion
            </Button>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer",
                      conversation.id === currentConversationId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="truncate">
                      {conversation.title}
                    </div>
                    {conversations.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                        className="h-7 w-7 opacity-70 hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-medium mb-2">Supprimer la discussion ?</h3>
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
