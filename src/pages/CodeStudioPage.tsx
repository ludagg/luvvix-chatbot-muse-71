
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixCodeStudio from '@/components/LuvvixCodeStudio';

const CodeStudioPage = () => {
  return (
    <>
      <Helmet>
        <title>LuvviX Code Studio - Générateur et Analyseur de Code IA</title>
        <meta
          name="description"
          content="Studio de développement IA avancé pour générer, analyser et optimiser du code dans plus de 12 langages de programmation avec l'intelligence artificielle."
        />
        <meta
          name="keywords"
          content="code, programmation, IA, générateur code, analyseur code, développement, AI programming"
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <main className="flex-1">
            <LuvvixCodeStudio />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CodeStudioPage;
