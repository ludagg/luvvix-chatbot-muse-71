import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/use-theme";
import { DecentralizedStorageProvider } from "@/hooks/use-ipfs";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ApiDocs from "./pages/ApiDocs";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CloudPage from "./pages/CloudPage";
import NewsPage from "./pages/NewsPage";
import WeatherPage from "./pages/WeatherPage";
import OAuth from "./pages/OAuth";
import AdminPanel from "./pages/AdminPanel";
import OAuthTest from "./pages/OAuthTest";
import FormsPage from "./pages/FormsPage";
import FormEditorPage from "./pages/FormEditorPage";
import FormViewPage from "./pages/FormViewPage";
import FormSettingsPage from "./pages/FormSettingsPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import AIStudioPage from "./pages/AIStudioPage";
import AIStudioDashboardPage from "./pages/AIStudioDashboardPage";
import AIStudioAgentPage from "./pages/AIStudioAgentPage";
import AIStudioCreateAgentPage from "./pages/AIStudioCreateAgentPage";
import AIStudioEditAgentPage from "./pages/AIStudioEditAgentPage";
import AIStudioMarketplacePage from "./pages/AIStudioMarketplacePage";
import AIStudioAdminPage from "./pages/AIStudioAdminPage";
import AIStudioChatPage from "./pages/AIStudioChatPage";
import AIStudioFavoritesPage from "./pages/AIStudioFavoritesPage";

// Configure le client de requête avec des paramètres optimisés
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Augmenter le nombre de tentatives
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Ajouter des options de mutation pour optimiser les opérations d'écriture
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <DecentralizedStorageProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/api-docs" element={<ApiDocs />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/oauth/authorize" element={
                    <ProtectedRoute>
                      <OAuth />
                    </ProtectedRoute>
                  } />
                  <Route path="/oauth/test" element={<OAuthTest />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/cloud/*" element={
                    <ProtectedRoute>
                      <CloudPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                  
                  {/* Routes pour LuvviX Forms */}
                  <Route path="/forms" element={<FormsPage />} />
                  <Route path="/forms/create" element={
                    <ProtectedRoute>
                      <FormEditorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/forms/edit/:formId" element={
                    <ProtectedRoute>
                      <FormEditorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/forms/view/:formId" element={<FormViewPage />} />
                  <Route path="/forms/settings/:formId" element={
                    <ProtectedRoute>
                      <FormSettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/forms/responses/:formId" element={
                    <ProtectedRoute>
                      <FormResponsesPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Routes pour LuvviX AI Studio */}
                  <Route path="/ai-studio" element={<AIStudioPage />} />
                  <Route path="/ai-studio/dashboard" element={
                    <ProtectedRoute>
                      <AIStudioDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-studio/agents/:agentId" element={<AIStudioAgentPage />} />
                  <Route path="/ai-studio/create" element={
                    <ProtectedRoute>
                      <AIStudioCreateAgentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-studio/edit/:agentId" element={
                    <ProtectedRoute>
                      <AIStudioEditAgentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
                  <Route path="/ai-studio/chat/:agentId" element={<AIStudioChatPage />} />
                  <Route path="/ai-studio/admin" element={<AIStudioAdminPage />} />
                  <Route path="/ai-studio/favorites" element={<AIStudioFavoritesPage />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DecentralizedStorageProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
