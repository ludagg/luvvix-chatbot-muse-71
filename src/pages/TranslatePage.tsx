
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixTranslate from '@/components/LuvvixTranslate';

const TranslatePage = () => {
  return (
    <>
      <Helmet>
        <title>LuvviX Translate - Traduction IA en Temps Réel</title>
        <meta name="description" content="Traduisez instantanément dans plus de 50 langues avec l'intelligence artificielle avancée, la reconnaissance vocale et la traduction en temps réel." />
        <meta name="keywords" content="traduction, IA, intelligence artificielle, reconnaissance vocale, temps réel, langues" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
      <div className="pt-45 flex-1">
      <div className="pt-24 flex-1">
        <main className="flex-1">
          <LuvvixTranslate />
        </main>
<div></div>
        <Footer />
      </div>
    </>
  );
};

export default TranslatePage;
