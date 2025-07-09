
import React from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedNewsInterface from '@/components/news/EnhancedNewsInterface';

const NewsPage = () => {
  return (
    <>
      <Helmet>
        <title>Actualités IA - LuvviX</title>
        <meta name="description" content="Actualités intelligentes avec résumés IA et sources multiples" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <EnhancedNewsInterface />
      </div>
    </>
  );
};

export default NewsPage;
