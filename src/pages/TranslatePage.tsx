
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LuvvixTranslate from '@/components/LuvvixTranslate';
import { useLanguage } from '@/hooks/useLanguage';

const TranslatePage = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <Helmet>
        <title>{t('translate.title')} - {t('translate.subtitle')}</title>
        <meta
          name="description"
          content={t('translate.description')}
        />
        <meta
          name="keywords"
          content="traduction, IA, intelligence artificielle, reconnaissance vocale, temps réel, langues"
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-55 flex-1">
          <main className="flex-1">
            <LuvvixTranslate />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TranslatePage;
