
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, MessageSquare, FileText, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export function ConversationSelector() {
  const { 
    user, 
    conversations, 
    currentConversationId, 
    createNewConversation, 
    loadConversation,
    deleteConversation 
  } = useAuth();
  
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  if (!user) return null;

  const handleNewConversation = () => {
    createNewConversation();
    setOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setOpen(false);
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

  const ConversationsList = () => (
    <div className="py-2">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-semibold text-foreground">Mes discussions</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewConversation}
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nouvelle
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="px-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm rounded-md cursor-pointer transition-all duration-200",
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
                  className="h-7 w-7 opacity-70 hover:opacity-100 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      <div className="flex items-center space-x-2">
        {isMobile ? (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-0 pt-0">
              <div className="h-full px-4 py-6">
                <ConversationsList />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 pt-12">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <ConversationsList />
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[140px] md:max-w-[200px]">{conversationTitle}</span>
        </div>
        
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
