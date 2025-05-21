
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider as LuvvixAIAuthProvider } from '@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext';
import LuvvixAIIndex from '@/luvvix-chatbot-muse-33-main/src/pages/Index';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';

const LuvvixAIPage = () => {
  const { theme } = useTheme();

  // Sync theme with Luvvix AI
  useEffect(() => {
    localStorage.setItem('luvvix-ai-theme', theme);
  }, [theme]);

  return (
    <>
      <Helmet>
        <title>LuvviX AI - Assistant IA intelligent</title>
        <meta name="description" content="Découvrez LuvviX AI, votre assistant IA personnel pour répondre à toutes vos questions et vous aider dans vos tâches quotidiennes." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Intégration de l'application LuvviX AI */}
        <div className="pt-16">
          <LuvvixAIAuthProvider>
            <LuvvixAIIndex />
            <Toaster />
          </LuvvixAIAuthProvider>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LuvvixAIPage;
