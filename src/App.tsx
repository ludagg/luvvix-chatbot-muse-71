
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import { DecentralizedStorageProvider } from "@/hooks/use-ipfs";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
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
import AIEmbedPage from "./pages/AIEmbedPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import CookiesPage from "./pages/legal/CookiesPage";
import DocsPage from "./pages/docs/DocsPage";
import EcosystemPage from "./pages/EcosystemPage";
import LuvvixAIIntegrationPage from "./pages/LuvvixAIIntegrationPage";
import AccountSettings from "./pages/AccountSettings";
import TranslatePage from "./pages/TranslatePage";
import MindMapPage from "./pages/MindMapPage";
import CodeStudioPage from "./pages/CodeStudioPage";
import LearnPage from "./pages/LearnPage";
import DocsGeneratorPage from "./pages/DocsGeneratorPage";
import CrawlerPage from "./pages/CrawlerPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="app">
      <HelmetProvider>
        <ThemeProvider defaultTheme="light">
          <DecentralizedStorageProvider>
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/translate" element={<TranslatePage />} />
              <Route path="/mindmap" element={<MindMapPage />} />
              <Route path="/code-studio" element={<CodeStudioPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/crawler" element={<CrawlerPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
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
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } />
              <Route path="/cloud/*" element={
                <ProtectedRoute>
                  <CloudPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminPanel />} />
              
              <Route path="/ecosystem" element={<EcosystemPage />} />
              <Route path="/ai-integration" element={<LuvvixAIIntegrationPage />} />
              
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
              
              <Route path="/ai-embed/:agentId" element={<AIEmbedPage />} />
              
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              
              <Route path="/docs/*" element={<DocsPage />} />
              <Route path="/docs-generator" element={<DocsGeneratorPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DecentralizedStorageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
