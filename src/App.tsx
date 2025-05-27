
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
import TranslatePage from "./pages/TranslatePage";
import MindMapPage from "./pages/MindMapPage";
import CodeStudioPage from "./pages/CodeStudioPage";
import NeuralNexusPage from "./pages/NeuralNexusPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <DecentralizedStorageProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth" element={<OAuth />} />
            <Route path="/oauth-test" element={<OAuthTest />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/mindmap" element={<MindMapPage />} />
            <Route path="/code-studio" element={<CodeStudioPage />} />
            <Route path="/neural-nexus" element={<NeuralNexusPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cloud"
              element={
                <ProtectedRoute>
                  <CloudPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <ProtectedRoute>
                  <FormsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/editor/:id?"
              element={
                <ProtectedRoute>
                  <FormEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:id"
              element={<FormViewPage />}
            />
            <Route
              path="/forms/:id/settings"
              element={
                <ProtectedRoute>
                  <FormSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:id/responses"
              element={
                <ProtectedRoute>
                  <FormResponsesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-studio"
              element={
                <ProtectedRoute>
                  <AIStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-studio/dashboard"
              element={
                <ProtectedRoute>
                  <AIStudioDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-studio/agent/:id"
              element={
                <ProtectedRoute>
                  <AIStudioAgentPage />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </DecentralizedStorageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
