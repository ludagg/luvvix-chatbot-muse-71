
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import LuvviXWorld from "./pages/LuvviXWorld";
import NotFound from "./pages/NotFound";
import { useLocalStorage } from "./hooks/use-local-storage";
import { Theme } from "./components/ThemeToggle";

const queryClient = new QueryClient();

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

  if (!mounted) return null; // Wait until theme is determined

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/world" element={<LuvviXWorld />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
