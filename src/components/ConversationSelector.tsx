
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, MessageSquare, FileText } from 'lucide-react';
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
            variant="outline" 
            size="sm" 
            className="gap-2 truncate w-[180px] md:w-[220px] justify-start flex-shrink-0 border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="truncate font-medium">{conversationTitle}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-primary">Mes discussions</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button 
              variant="outline" 
              onClick={handleNewConversation}
              className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              Nouvelle discussion
            </Button>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-all duration-200",
                      conversation.id === currentConversationId
                        ? "bg-primary/15 text-primary font-medium border border-primary/20"
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
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
                        className="h-7 w-7 opacity-70 hover:opacity-100 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
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
