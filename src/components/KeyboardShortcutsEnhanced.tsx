
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialogContext } from "@/contexts/DialogContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function KeyboardShortcutsEnhanced() {
  const { isKeyboardShortcutsOpen, setKeyboardShortcutsOpen } = useDialogContext();
  const [activeTab, setActiveTab] = useState("general");

  // Définir les raccourcis globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Touche '?' avec Shift pour ouvrir les raccourcis clavier
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setKeyboardShortcutsOpen(true);
      }
      
      // Échap pour fermer les boîtes de dialogue
      if (e.key === "Escape" && isKeyboardShortcutsOpen) {
        setKeyboardShortcutsOpen(false);
      }
      
      // Ctrl+K pour ouvrir la palette de commandes
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        console.log("Ouvrir la palette de commandes");
      }
      
      // Alt+N pour créer une nouvelle conversation
      if (e.key === "n" && e.altKey) {
        e.preventDefault();
        console.log("Créer une nouvelle conversation");
      }
      
      // Alt+S pour enregistrer la conversation
      if (e.key === "s" && e.altKey) {
        e.preventDefault();
        console.log("Enregistrer la conversation");
      }
      
      // Alt+D pour activer/désactiver le mode sombre
      if (e.key === "d" && e.altKey) {
        e.preventDefault();
        console.log("Activer/désactiver le mode sombre");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKeyboardShortcutsOpen, setKeyboardShortcutsOpen]);

  const renderShortcut = (key: string, description: string) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{description}</span>
      <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">{key}</kbd>
    </div>
  );

  return (
    <Dialog open={isKeyboardShortcutsOpen} onOpenChange={setKeyboardShortcutsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raccourcis clavier</DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer rapidement dans l'application.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="edition">Édition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-1 divide-y divide-border">
            {renderShortcut("? (Maj + ?)", "Afficher les raccourcis clavier")}
            {renderShortcut("Ctrl + K", "Ouvrir la palette de commandes")}
            {renderShortcut("Alt + N", "Nouvelle conversation")}
            {renderShortcut("Alt + S", "Enregistrer la conversation")}
            {renderShortcut("Alt + D", "Changer de thème (clair/sombre)")}
            {renderShortcut("Échap", "Fermer la boîte de dialogue")}
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-1 divide-y divide-border">
            {renderShortcut("Alt + ←", "Conversation précédente")}
            {renderShortcut("Alt + →", "Conversation suivante")}
            {renderShortcut("Alt + H", "Accueil")}
            {renderShortcut("Alt + P", "Profil")}
            {renderShortcut("Alt + F", "Rechercher")}
            {renderShortcut("J", "Message suivant")}
            {renderShortcut("K", "Message précédent")}
          </TabsContent>
          
          <TabsContent value="edition" className="space-y-1 divide-y divide-border">
            {renderShortcut("Ctrl + B", "Texte en gras")}
            {renderShortcut("Ctrl + I", "Texte en italique")}
            {renderShortcut("Ctrl + U", "Texte souligné")}
            {renderShortcut("Ctrl + Z", "Annuler")}
            {renderShortcut("Ctrl + Maj + Z", "Rétablir")}
            {renderShortcut("Tab", "Indenter")}
            {renderShortcut("Maj + Tab", "Désindenter")}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
