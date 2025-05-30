
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewsPage from "./pages/NewsPage";
import TranslatePage from "./pages/TranslatePage";
import MindMapPage from "./pages/MindMapPage";
import WeatherPage from "./pages/WeatherPage";
import ExplorePage from "./pages/ExplorePage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/translate" element={<TranslatePage />} />
              <Route path="/mindmap" element={<MindMapPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
