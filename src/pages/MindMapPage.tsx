
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixMindMap from '@/components/LuvvixMindMap';
import { useLanguage } from '@/hooks/useLanguage';

const MindMapPage = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <Helmet>
        <title>{t('mindmap.title')} - {t('mindmap.subtitle')}</title>
        <meta name="description" content={t('mindmap.description')} />
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
