
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CrossAuthProvider } from "./contexts/CrossAuthContext";
import { AuthProvider } from "./contexts/AuthContext"; // Keep the original AuthProvider
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useLocalStorage } from "./hooks/use-local-storage";
import { Theme } from "./components/ThemeToggle";

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
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apply the saved theme
    const root = document.documentElement;
    root.classList.remove("light", "dark", "theme-purple", "theme-blue", "theme-green");
    
    if (theme === "purple") {
      root.classList.add("dark", "theme-purple");
    } else if (theme === "blue") {
      root.classList.add("dark", "theme-blue");
    } else if (theme === "green") {
      root.classList.add("dark", "theme-green");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Add a scroll smoothing effect
  useEffect(() => {
    // Smooth scroll function
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.hash && anchor.hash.startsWith("#") && anchor.href.includes(window.location.pathname)) {
        e.preventDefault();
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!mounted) return null; // Wait until theme is determined

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CrossAuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </CrossAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
