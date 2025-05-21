import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { useAuth } from './hooks/useAuth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NewsPage from './pages/NewsPage';
import AIStudioDashboardPage from './pages/AIStudioDashboardPage';
import AIStudioAgentPage from './pages/AIStudioAgentPage';
import AIStudioAgentEditPage from './pages/AIStudioAgentEditPage';
import AIStudioAgentChatPage from './pages/AIStudioAgentChatPage';
import AIStudioAgentCreatePage from './pages/AIStudioAgentCreatePage';
import AIStudioAgentEmbedPage from './pages/AIStudioAgentEmbedPage';
// Ajoutez l'importation de EcosystemPage
import EcosystemPage from './pages/EcosystemPage';

const App = () => {
  const { isLoading, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-ts-gh-pages">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Ajoutez cette nouvelle route pour l'écosystème */}
          <Route path="/ecosystem" element={<EcosystemPage />} />
          
          <Route path="/news" element={<NewsPage />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          
          <Route path="/ai-studio" element={user ? <AIStudioDashboardPage /> : <Navigate to="/auth" />} />
          <Route path="/ai-studio/agents/:agentId" element={user ? <AIStudioAgentPage /> : <Navigate to="/auth" />} />
          <Route path="/ai-studio/edit/:agentId" element={user ? <AIStudioAgentEditPage /> : <Navigate to="/auth" />} />
          <Route path="/ai-studio/chat/:agentId" element={user ? <AIStudioAgentChatPage /> : <Navigate to="/auth" />} />
          <Route path="/ai-studio/create" element={user ? <AIStudioAgentCreatePage /> : <Navigate to="/auth" />} />
          <Route path="/ai-embed/:agentId" element={<AIStudioAgentEmbedPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
