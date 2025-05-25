
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixMindMap from '@/components/LuvvixMindMap';

const MindMapPage = () => {
  return (
    <>
      <Helmet>
        <title>LuvviX MindMap - Cartes Mentales IA Intelligentes</title>
        <meta name="description" content="Créez des cartes mentales intelligentes avec l'IA pour organiser vos idées, stimuler votre créativité et structurer vos connaissances." />
        <meta name="keywords" content="carte mentale, mindmap, IA, brainstorming, créativité, organisation, idées" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <LuvvixMindMap />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MindMapPage;
