
import { Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import CloudPage from './pages/CloudPage';
import FormsPage from './pages/FormsPage';
import FormEditorPage from './pages/FormEditorPage';
import FormViewPage from './pages/FormViewPage';
import FormResponsesPage from './pages/FormResponsesPage';
import FormSettingsPage from './pages/FormSettingsPage';
import NewsPage from './pages/NewsPage';
import OAuth from './pages/OAuth';
import OAuthTest from './pages/OAuthTest';
import WeatherPage from './pages/WeatherPage';
import AIStudioPage from './pages/AIStudioPage';
import AIStudioDashboardPage from './pages/AIStudioDashboardPage';
import AIStudioCreateAgentPage from './pages/AIStudioCreateAgentPage';
import AIStudioEditAgentPage from './pages/AIStudioEditAgentPage';
import AIStudioAgentPage from './pages/AIStudioAgentPage';
import AIStudioChatPage from './pages/AIStudioChatPage';
import AIStudioMarketplacePage from './pages/AIStudioMarketplacePage';
import AIStudioAdminPage from './pages/AIStudioAdminPage';
import AIEmbedPage from './pages/AIEmbedPage';
import AdminPanel from './pages/AdminPanel';
import ApiDocs from './pages/ApiDocs';

// Docs pages
import DocsPage from './pages/docs/DocsPage';
import CookiesPage from './pages/legal/CookiesPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';

// Components
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Gestionnaire event load pour les widgets (nouveau)
import './integrations/widget-loader';

import './App.css';

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <title>LuvviX - Votre plateforme d'innovation</title>
          <meta name="description" content="Plateforme LuvviX d'innovation, de collaboration et de développement d'applications" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
        </Helmet>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth" element={<OAuth />} />
          <Route path="/oauth-test" element={<OAuthTest />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          
          <Route path="/cloud/*" element={<ProtectedRoute><CloudPage /></ProtectedRoute>} />
          
          <Route path="/forms" element={<ProtectedRoute><FormsPage /></ProtectedRoute>} />
          <Route path="/forms/editor/:formId" element={<ProtectedRoute><FormEditorPage /></ProtectedRoute>} />
          <Route path="/forms/view/:formId" element={<FormViewPage />} />
          <Route path="/forms/responses/:formId" element={<ProtectedRoute><FormResponsesPage /></ProtectedRoute>} />
          <Route path="/forms/settings/:formId" element={<ProtectedRoute><FormSettingsPage /></ProtectedRoute>} />
          
          <Route path="/news" element={<NewsPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          
          <Route path="/ai-studio" element={<AIStudioPage />} />
          <Route path="/ai-studio/dashboard" element={<ProtectedRoute><AIStudioDashboardPage /></ProtectedRoute>} />
          <Route path="/ai-studio/create" element={<ProtectedRoute><AIStudioCreateAgentPage /></ProtectedRoute>} />
          <Route path="/ai-studio/edit/:agentId" element={<ProtectedRoute><AIStudioEditAgentPage /></ProtectedRoute>} />
          <Route path="/ai-studio/agent/:agentId" element={<AIStudioAgentPage />} />
          <Route path="/ai-studio/chat/:agentId" element={<AIStudioChatPage />} />
          <Route path="/ai-studio/marketplace" element={<AIStudioMarketplacePage />} />
          <Route path="/ai-studio/admin" element={<ProtectedRoute adminOnly><AIStudioAdminPage /></ProtectedRoute>} />
          
          {/* Route pour l'intégration AI Embed */}
          <Route path="/ai-embed/:agentId" element={<AIEmbedPage />} />
          
          <Route path="/api" element={<ApiDocs />} />
          
          <Route path="/docs/*" element={<DocsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </HelmetProvider>
  );
}

export default App;
