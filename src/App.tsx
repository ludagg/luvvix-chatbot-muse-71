
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import { useLocalStorage } from "./hooks/use-local-storage";
import { Theme } from "./components/ThemeToggle";
import { DialogProvider } from "./contexts/DialogContext";
import { KeyboardShortcutsEnhanced } from "./components/KeyboardShortcutsEnhanced";
import { CommandPalette } from "./components/CommandPalette";
import { OfflineMode } from "./components/OfflineMode";
import { NotificationCenter } from "./components/NotificationCenter";

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apply the saved theme
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'theme-purple', 'theme-blue', 'theme-green');
    
    if (theme === 'purple') {
      root.classList.add('dark', 'theme-purple');
    } else if (theme === 'blue') {
      root.classList.add('dark', 'theme-blue');
    } else if (theme === 'green') {
      root.classList.add('dark', 'theme-green');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Add a scroll smoothing effect
  useEffect(() => {
    // Smooth scroll function
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#') && anchor.href.includes(window.location.pathname)) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Ajout d'un gestionnaire de touches globales pour l'aide aux raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ pour afficher l'aide des raccourcis
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        console.log('Afficher l\'aide des raccourcis');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Affichage d'une info-bulle sur le raccourci espace dès le premier chargement
  useEffect(() => {
    // On vérifie si c'est la première visite pour éviter de montrer la notification à chaque fois
    const hasSeenVoiceTip = localStorage.getItem('hasSeenVoiceTip');
    
    if (!hasSeenVoiceTip) {
      // On utilise setTimeout pour s'assurer que tout est chargé
      const timer = setTimeout(() => {
        const toast = document.querySelector('.sonner-toast');
        if (!toast) {  // Si aucun toast n'est déjà affiché
          import('sonner').then(({ toast }) => {
            toast.info("Astuce : Appuyez sur la touche Espace pour activer le mode vocal", {
              duration: 5000,
            });
          });
        }
        localStorage.setItem('hasSeenVoiceTip', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  if (!mounted) return null; // Wait until theme is determined

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DialogProvider>
            <Toaster />
            <Sonner position="top-right" closeButton className="z-50" />
            <OfflineMode />
            <KeyboardShortcutsEnhanced />
            <CommandPalette />
            
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/aide" element={<Help />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DialogProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
