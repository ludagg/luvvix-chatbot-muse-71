
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixTranslate from '@/components/LuvvixTranslate';
import { useLanguage } from '@/hooks/useLanguage';

const TranslatePage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{t.app.translate}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.app.translate} - Traduction IA instantanée avec reconnaissance vocale et support multilingue.
            </p>
          </div>
          <LuvvixTranslate />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TranslatePage;
