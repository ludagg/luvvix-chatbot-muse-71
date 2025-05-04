
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandIcon, Keyboard, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  shortcut: string[];
  action: () => void;
}

export const KeyboardShortcuts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const shortcuts: KeyboardShortcut[] = [
    {
      id: 'new-chat',
      name: 'Nouvelle discussion',
      description: 'Commencer une nouvelle conversation',
      shortcut: ['Ctrl', 'N'],
      action: () => {
        toast({
          title: "Nouvelle conversation",
          description: "Une nouvelle conversation a été démarrée",
        });
        // Action pour nouvelle conversation
      },
    },
    {
      id: 'send-message',
      name: 'Envoyer un message',
      description: 'Envoyer le message actuel',
      shortcut: ['Enter'],
      action: () => {
        // Action pour envoyer un message
      },
    },
    {
      id: 'voice-input',
      name: 'Entrée vocale',
      description: 'Activer la reconnaissance vocale',
      shortcut: ['Alt', 'M'],
      action: () => {
        toast({
          title: "Entrée vocale",
          description: "La reconnaissance vocale a été activée",
        });
        // Action pour activer la voix
      },
    },
    {
      id: 'search',
      name: 'Rechercher',
      description: 'Rechercher dans les conversations',
      shortcut: ['Ctrl', 'F'],
      action: () => {
        toast({
          title: "Recherche",
          description: "Le mode recherche a été activé",
        });
        // Action pour rechercher
      },
    },
    {
      id: 'toggle-theme',
      name: 'Changer de thème',
      description: 'Basculer entre thème clair et sombre',
      shortcut: ['Ctrl', 'T'],
      action: () => {
        toast({
          title: "Thème",
          description: "Le thème a été modifié",
        });
        // Action pour changer de thème
      },
    },
  ];

  // Filtrage des raccourcis en fonction de la recherche
  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestionnaire pour les raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ouvrir la palette de commandes avec Ctrl+K ou Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Raccourcis clavier définis
      shortcuts.forEach(shortcut => {
        const lastKey = shortcut.shortcut[shortcut.shortcut.length - 1].toLowerCase();
        
        if (event.key.toLowerCase() === lastKey) {
          // Vérifier les modificateurs (Ctrl, Alt, etc.)
          const needsCtrl = shortcut.shortcut.includes('Ctrl');
          const needsAlt = shortcut.shortcut.includes('Alt');
          const needsShift = shortcut.shortcut.includes('Shift');
          
          if (
            (!needsCtrl || event.ctrlKey || event.metaKey) &&
            (!needsAlt || event.altKey) &&
            (!needsShift || event.shiftKey)
          ) {
            event.preventDefault();
            shortcut.action();
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        <Keyboard className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:inline-block">Raccourcis</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={() => setIsCommandPaletteOpen(true)}
      >
        <CommandIcon className="h-4 w-4" />
        <span className="sr-only">Palette de commandes</span>
      </Button>

      {/* Boîte de dialogue pour la liste des raccourcis */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raccourcis clavier</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground">
              Utilisez ces raccourcis pour naviguer rapidement dans l'application.
            </p>
            
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div 
                  key={shortcut.id} 
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div>
                    <h3 className="font-medium">{shortcut.name}</h3>
                    <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {shortcut.shortcut.map((key, index) => (
                      <kbd 
                        key={index}
                        className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Astuce: Appuyez sur Ctrl+K pour ouvrir la palette de commandes</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Palette de commandes */}
      <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <DialogContent className="max-w-md p-0">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CommandList>
              <CommandGroup heading="Commandes">
                {filteredShortcuts.map((shortcut) => (
                  <CommandItem
                    key={shortcut.id}
                    onSelect={() => {
                      shortcut.action();
                      setIsCommandPaletteOpen(false);
                    }}
                  >
                    <span>{shortcut.name}</span>
                    <div className="ml-auto flex gap-1">
                      {shortcut.shortcut.map((key, index) => (
                        <kbd 
                          key={index} 
                          className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
