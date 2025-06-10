
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvviXUnifiedDashboard from '@/components/revolutionary/LuvviXUnifiedDashboard';
import { useAuth } from '@/hooks/useAuth';

const RevolutionaryDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              LuvviX Revolutionary Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in to access your AI-powered digital life orchestrator
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <LuvviXUnifiedDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default RevolutionaryDashboard;
