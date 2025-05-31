
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixMindMap from '@/components/LuvvixMindMap';
import { useLanguage } from '@/hooks/useLanguage';

const MindMapPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{t.app.mindmap}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Créez des cartes mentales intelligentes pour organiser et visualiser vos idées avec l'aide de l'IA.
            </p>
          </div>
          <LuvvixMindMap />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MindMapPage;
