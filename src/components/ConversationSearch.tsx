
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationSearchProps {
  onSearch: (query: string) => void;
  conversations: Array<{ id: string; title: string; lastMessage?: string }>;
  onSelectConversation: (id: string) => void;
}

export function ConversationSearch({
  onSearch,
  conversations,
  onSelectConversation,
}: ConversationSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  useEffect(() => {
    if (query) {
      const results = conversations.filter(
        (conv) => 
          conv.title.toLowerCase().includes(query.toLowerCase()) || 
          (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredConversations(results);
      onSearch(query);
    } else {
      setFilteredConversations(conversations);
      onSearch("");
    }
  }, [query, conversations, onSearch]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={toggleSearch}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Rechercher dans les conversations</span>
      </Button>
      
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "250px" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 z-10"
          >
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-8 w-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-0 top-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {query && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute mt-1 w-full bg-background rounded-md shadow-lg border border-border z-50"
              >
                {filteredConversations.length > 0 ? (
                  <ul className="max-h-60 overflow-auto py-1">
                    {filteredConversations.map((conv) => (
                      <li 
                        key={conv.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          onSelectConversation(conv.id);
                          setIsSearchOpen(false);
                          setQuery("");
                        }}
                      >
                        <p className="font-medium">{conv.title}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    Aucun résultat trouvé
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
