
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider";
import { useAuth } from './hooks/useAuth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NewsPage from './pages/NewsPage';
import AIStudioDashboardPage from './pages/AIStudioDashboardPage';
import EcosystemPage from './pages/EcosystemPage';

const App = () => {
  const { loading, user } = useAuth(); // Changed from isLoading to loading to match the useAuth hook
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
