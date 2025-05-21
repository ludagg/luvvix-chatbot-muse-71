
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NewsPage from './pages/NewsPage';
import AIStudioDashboardPage from './pages/AIStudioDashboardPage';
import EcosystemPage from './pages/EcosystemPage';

const App = () => {
  const { loading, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // The ThemeProvider is now moved to main.tsx to wrap the entire app
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/ecosystem" element={<EcosystemPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/ai-studio" element={user ? <AIStudioDashboardPage /> : <Navigate to="/auth" />} />
    </Routes>
  );
};

export default App;
