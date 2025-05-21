
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, MessageSquarePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

export function DiscussionsMenu() {
  const { 
    user, 
    conversations, 
    currentConversationId, 
    setCurrentConversation,
    createNewConversation,
  } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleCreateNew = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      await createNewConversation();
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
  };

  const showAllConversations = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-foreground">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Discussions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleCreateNew}
            disabled={isCreating}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4" />
            )}
            <span>Nouvelle discussion</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {!user ? (
            <div className="text-center py-2 text-xs text-muted-foreground px-2">
              Connectez-vous pour sauvegarder vos discussions
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-2 text-xs text-muted-foreground">
              Aucune discussion
            </div>
          ) : (
            <>
              {conversations.slice(0, 5).map((conv) => (
                <DropdownMenuItem 
                  key={conv.id}
                  className={cn(
                    "cursor-pointer",
                    currentConversationId === conv.id && "bg-accent"
                  )}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="w-full truncate text-sm">
                    {conv.title || "Nouvelle discussion"}
                  </div>
                </DropdownMenuItem>
              ))}
              
              {conversations.length > 5 && (
                <DropdownMenuItem 
                  onClick={showAllConversations}
                  className="text-primary cursor-pointer"
                >
                  Voir toutes les discussions...
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Toutes les discussions</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
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
                  onClick={() => {
                    handleSelectConversation(conv.id);
                    setIsDialogOpen(false);
                  }}
                >
                  <div className="flex-1 truncate text-sm">
                    {conv.title || "Nouvelle discussion"}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
