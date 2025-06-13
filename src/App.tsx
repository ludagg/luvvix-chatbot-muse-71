import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MobileAppWrapper from "./components/mobile/MobileAppWrapper";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountSettings from "./pages/AccountSettings";
import AdminPanel from "./pages/AdminPanel";
import EcosystemPage from "./pages/EcosystemPage";
import FormsPage from "./pages/FormsPage";
import FormEditorPage from "./pages/FormEditorPage";
import FormViewPage from "./pages/FormViewPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import FormSettingsPage from "./pages/FormSettingsPage";
import LuvviXLearnPage from "./pages/LuvviXLearnPage";
import LearnPage from "./pages/LearnPage";
import NewsPage from "./pages/NewsPage";
import WeatherPage from "./pages/WeatherPage";
import TranslatePage from "./pages/TranslatePage";
import MindMapPage from "./pages/MindMapPage";
import CodeStudioPage from "./pages/CodeStudioPage";
import CloudPage from "./pages/CloudPage";
import MailPage from "./pages/MailPage";
import CenterPage from "./pages/CenterPage";
import ExplorePage from "./pages/ExplorePage";
import CrawlerPage from "./pages/CrawlerPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DocsGeneratorPage from "./pages/DocsGeneratorPage";
import LuvvixAIIntegrationPage from "./pages/LuvvixAIIntegrationPage";
import AIStudioPage from "./pages/AIStudioPage";
import AIStudioDashboardPage from "./pages/AIStudioDashboardPage";
import AIStudioCreateAgentPage from "./pages/AIStudioCreateAgentPage";
import AIStudioEditAgentPage from "./pages/AIStudioEditAgentPage";
import AIStudioMarketplacePage from "./pages/AIStudioMarketplacePage";
import AIStudioAgentPage from "./pages/AIStudioAgentPage";
import AIStudioChatPage from "./pages/AIStudioChatPage";
import AIStudioAdminPage from "./pages/AIStudioAdminPage";
import AIEmbedPage from "./pages/AIEmbedPage";
import DocsPage from "./pages/docs/DocsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import CookiesPage from "./pages/legal/CookiesPage";
import ApiDocs from "./pages/ApiDocs";
import OAuth from "./pages/OAuth";
import OAuthTest from "./pages/OAuthTest";
import NotFound from "./pages/NotFound";
import RevolutionaryDashboard from "./pages/RevolutionaryDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MobileAppWrapper />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth" element={<OAuth />} />
          <Route path="/oauth-test" element={<OAuthTest />} />
          
          {/* Revolutionary Dashboard */}
          <Route 
            path="/revolutionary" 
            element={
              <ProtectedRoute>
                <RevolutionaryDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard and Settings */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* Core Apps */}
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/mindmap" element={<MindMapPage />} />
          <Route path="/code-studio" element={<CodeStudioPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/crawler" element={<CrawlerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Cloud routes */}
          <Route 
            path="/cloud" 
            element={
              <ProtectedRoute>
                <CloudPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cloud/folder/:folderId" 
            element={
              <ProtectedRoute>
                <CloudPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cloud/file/:fileId" 
            element={
              <ProtectedRoute>
                <CloudPage />
              </ProtectedRoute>
            } 
          />

          {/* Mail routes */}
          <Route 
            path="/mail" 
            element={
              <ProtectedRoute>
                <MailPage />
              </ProtectedRoute>
            } 
          />

          {/* Center routes */}
          <Route 
            path="/center" 
            element={
              <ProtectedRoute>
                <CenterPage />
              </ProtectedRoute>
            } 
          />

          {/* Forms routes */}
          <Route 
            path="/forms" 
            element={
              <ProtectedRoute>
                <FormsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms/create" 
            element={
              <ProtectedRoute>
                <FormEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms/:id/edit" 
            element={
              <ProtectedRoute>
                <FormEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/forms/:id/view" element={<FormViewPage />} />
          <Route 
            path="/forms/:id/responses" 
            element={
              <ProtectedRoute>
                <FormResponsesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms/:id/settings" 
            element={
              <ProtectedRoute>
                <FormSettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* Learn routes */}
          <Route path="/luvvix-learn" element={<LuvviXLearnPage />} />
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            } 
          />

          {/* AI Studio routes */}
          <Route path="/ai-studio" element={<AIStudioPage />} />
          <Route 
            path="/ai-studio/dashboard" 
            element={
              <ProtectedRoute>
                <AIStudioDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-studio/create" 
            element={
              <ProtectedRoute>
                <AIStudioCreateAgentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-studio/edit/:id" 
            element={
              <ProtectedRoute>
                <AIStudioEditAgentPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
          <Route path="/ai-studio/agent/:slug" element={<AIStudioAgentPage />} />
          <Route path="/ai-studio/chat/:agentId" element={<AIStudioChatPage />} />
          <Route 
            path="/ai-studio/admin" 
            element={
              <ProtectedRoute>
                <AIStudioAdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/ai-embed/:agentId" element={<AIEmbedPage />} />

          {/* Documentation and Legal */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs-generator" element={<DocsGeneratorPage />} />
          <Route path="/ai-integration" element={<LuvvixAIIntegrationPage />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
