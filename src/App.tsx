import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import MailPage from "./pages/MailPage";
import DeveloperPage from "./pages/DeveloperPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthHandler from "./components/OAuthHandler";

// Existing app pages
import LuvviXAnalytics from "./components/LuvviXAnalytics";
import LuvviXCrawler from "./components/LuvviXCrawler";
import LuvviXDocs from "./components/LuvviXDocs";
import LuvviXLearnComplete from "./components/LuvviXLearnComplete";
import LuvvixTranslate from "./components/LuvvixTranslate";
import CodeStudio from "./components/CodeStudio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/oauth/callback" element={<OAuthHandler />} />
              <Route path="/developers" element={<DeveloperPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/mail" element={
                <ProtectedRoute>
                  <MailPage />
                </ProtectedRoute>
              } />

              {/* Existing App Routes */}
              <Route path="/ai-studio" element={
                <ProtectedRoute>
                  <CodeStudio />
                </ProtectedRoute>
              } />
              
              <Route path="/cloud" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/forms" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/translate" element={
                <ProtectedRoute>
                  <LuvvixTranslate />
                </ProtectedRoute>
              } />

              <Route path="/explore" element={
                <ProtectedRoute>
                  <LuvviXCrawler />
                </ProtectedRoute>
              } />

              <Route path="/analytics" element={
                <ProtectedRoute>
                  <LuvviXAnalytics />
                </ProtectedRoute>
              } />

              <Route path="/docs" element={
                <ProtectedRoute>
                  <LuvviXDocs />
                </ProtectedRoute>
              } />

              <Route path="/learn" element={
                <ProtectedRoute>
                  <LuvviXLearnComplete />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
