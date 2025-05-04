
import { createContext, useContext, useState, ReactNode } from 'react';

interface DialogContextType {
  isKeyboardShortcutsOpen: boolean;
  isCommandPaletteOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openKeyboardShortcuts: () => void;
  openCommandPalette: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isKeyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const openKeyboardShortcuts = () => {
    setKeyboardShortcutsOpen(true);
  };
  
  const openCommandPalette = () => {
    setCommandPaletteOpen(true);
  };
  
  return (
    <DialogContext.Provider
      value={{
        isKeyboardShortcutsOpen,
        isCommandPaletteOpen,
        setKeyboardShortcutsOpen,
        setCommandPaletteOpen,
        openKeyboardShortcuts,
        openCommandPalette
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};
