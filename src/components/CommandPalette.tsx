
import { useState, useEffect } from "react";
import { Command } from "cmdk";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDialogContext } from "@/contexts/DialogContext";
import { useToast } from "@/hooks/use-toast";

interface CommandAction {
  id: string;
  name: string;
  shortcut?: string;
  icon?: React.ReactNode;
  section: string;
  action: () => void;
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useDialogContext();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const runAction = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setSearch("");
  };

  // Définir les commandes disponibles
  const commands: CommandAction[] = [
    {
      id: "new-conversation",
      name: "Nouvelle conversation",
      shortcut: "Alt+N",
      section: "Conversations",
      action: () => {
        toast({
          title: "Nouvelle conversation",
          description: "Une nouvelle conversation a été créée",
        });
      },
    },
    {
      id: "save-conversation",
      name: "Enregistrer la conversation",
      shortcut: "Alt+S",
      section: "Conversations",
      action: () => {
        toast({
          title: "Conversation enregistrée",
          description: "La conversation actuelle a été enregistrée",
        });
      },
    },
    {
      id: "switch-theme",
      name: "Changer de thème",
      shortcut: "Alt+D",
      section: "Apparence",
      action: () => {
        toast({
          title: "Thème modifié",
          description: "Le thème a été changé",
        });
      },
    },
    {
      id: "toggle-keyboard-shortcuts",
      name: "Afficher les raccourcis clavier",
      shortcut: "?",
      section: "Aide",
      action: () => {
        toast({
          title: "Raccourcis clavier",
          description: "Les raccourcis clavier sont affichés",
        });
      },
    },
    {
      id: "search",
      name: "Rechercher dans les conversations",
      shortcut: "Alt+F",
      section: "Recherche",
      action: () => {
        toast({
          title: "Recherche",
          description: "La recherche a été activée",
        });
      },
    },
    {
      id: "export",
      name: "Exporter la conversation",
      shortcut: "Alt+E",
      section: "Exportation",
      action: () => {
        toast({
          title: "Exportation",
          description: "La boîte de dialogue d'exportation a été ouverte",
        });
      },
    },
    {
      id: "share",
      name: "Partager la conversation",
      shortcut: "Alt+P",
      section: "Partage",
      action: () => {
        toast({
          title: "Partage",
          description: "Les options de partage ont été affichées",
        });
      },
    },
    {
      id: "accessibility",
      name: "Paramètres d'accessibilité",
      shortcut: "Alt+A",
      section: "Accessibilité",
      action: () => {
        toast({
          title: "Accessibilité",
          description: "Les paramètres d'accessibilité ont été ouverts",
        });
      },
    },
  ];

  // Grouper par section
  const sections = Array.from(new Set(commands.map((command) => command.section)));

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput
        placeholder="Tapez une commande ou recherchez..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Aucune commande trouvée.</CommandEmpty>
        {sections.map((section) => (
          <CommandGroup key={section} heading={section}>
            {commands
              .filter((command) => command.section === section)
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runAction(command.action)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{command.name}</span>
                    {command.shortcut && (
                      <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {command.shortcut}
                      </kbd>
                    )}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Aide">
          <CommandItem
            onSelect={() => {
              runAction(() => {
                toast({
                  title: "Aide",
                  description: "Le centre d'aide a été ouvert",
                });
              });
            }}
          >
            Centre d'aide
          </CommandItem>
          <CommandItem
            onSelect={() => {
              runAction(() => {
                toast({
                  title: "Tutoriel",
                  description: "Le tutoriel a été lancé",
                });
              });
            }}
          >
            Tutoriel interactif
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
