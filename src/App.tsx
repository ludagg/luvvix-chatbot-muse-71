
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import AccountSettings from "./pages/AccountSettings";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthTest from "./pages/OAuthTest";
import OAuth from "./pages/OAuth";
import AIStudioPage from "./pages/AIStudioPage";
import AIStudioMarketplacePage from "./pages/AIStudioMarketplacePage";
import AIStudioDashboardPage from "./pages/AIStudioDashboardPage";
import AIStudioChatPage from "./pages/AIStudioChatPage";
import AIStudioCreateAgentPage from "./pages/AIStudioCreateAgentPage";
import AIStudioEditAgentPage from "./pages/AIStudioEditAgentPage";
import AIStudioAgentPage from "./pages/AIStudioAgentPage";
import AIStudioAdminPage from "./pages/AIStudioAdminPage";
import AIEmbedPage from "./pages/AIEmbedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NewsPage from "./pages/NewsPage";
import FormsPage from "./pages/FormsPage";
import FormEditorPage from "./pages/FormEditorPage";
import FormViewPage from "./pages/FormViewPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import FormSettingsPage from "./pages/FormSettingsPage";
import CenterPage from "./pages/CenterPage";
import CloudPage from "./pages/CloudPage";
import WeatherPage from "./pages/WeatherPage";
import TranslatePage from "./pages/TranslatePage";
import LearnPage from "./pages/LearnPage";
import MindMapPage from "./pages/MindMapPage";
import CrawlerPage from "./pages/CrawlerPage";
import CodeStudioPage from "./pages/CodeStudioPage";
import DocsGeneratorPage from "./pages/DocsGeneratorPage";
import EcosystemPage from "./pages/EcosystemPage";
import EcosystemApiPage from "./pages/EcosystemApiPage";
import LuvvixAIIntegrationPage from "./pages/LuvvixAIIntegrationPage";
import DocsPage from "./pages/docs/DocsPage";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import CookiesPage from "./pages/legal/CookiesPage";

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/oauth-test" element={<OAuthTest />} />
                <Route path="/oauth" element={<OAuth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <AccountSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/ai-studio" element={<AIStudioPage />} />
                <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
                <Route path="/ai-studio/dashboard" element={
                  <ProtectedRoute>
                    <AIStudioDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/ai-studio/chat/:agentId" element={<AIStudioChatPage />} />
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
                <Route path="/ai-studio/agent/:slug" element={<AIStudioAgentPage />} />
                <Route path="/ai-studio/admin" element={
                  <ProtectedRoute>
                    <AIStudioAdminPage />
                  </ProtectedRoute>
                } />
                <Route path="/ai-embed" element={<AIEmbedPage />} />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/forms" element={<FormsPage />} />
                <Route path="/forms/editor/:formId?" element={
                  <ProtectedRoute>
                    <FormEditorPage />
                  </ProtectedRoute>
                } />
                <Route path="/forms/view/:formId" element={<FormViewPage />} />
                <Route path="/forms/responses/:formId" element={
                  <ProtectedRoute>
                    <FormResponsesPage />
                  </ProtectedRoute>
                } />
                <Route path="/forms/settings/:formId" element={
                  <ProtectedRoute>
                    <FormSettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/center" element={
                  <ProtectedRoute>
                    <CenterPage />
                  </ProtectedRoute>
                } />
                <Route path="/cloud" element={
                  <ProtectedRoute>
                    <CloudPage />
                  </ProtectedRoute>
                } />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/translate" element={<TranslatePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/mind-map" element={<MindMapPage />} />
                <Route path="/crawler" element={<CrawlerPage />} />
                <Route path="/code-studio" element={<CodeStudioPage />} />
                <Route path="/docs-generator" element={<DocsGeneratorPage />} />
                <Route path="/ecosystem" element={<EcosystemPage />} />
                <Route path="/ecosystem/api" element={<EcosystemApiPage />} />
                <Route path="/luvvix-ai-integration" element={<LuvvixAIIntegrationPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export default App;
