
import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSelector from "@/components/LanguageSelector";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-luvvix-purple to-luvvix-teal inline-block text-transparent bg-clip-text">
                LuvviX
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.description')}
            </p>
            <div className="pt-4">
              <LanguageSelector />
            </div>
          </div>
          
          {/* Produits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.products')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ai-studio" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('app.aiStudio')}
                </Link>
              </li>
              <li>
                <Link to="/cloud" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('app.cloud')}
                </Link>
              </li>
              <li>
                <Link to="/translate" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('app.translate')}
                </Link>
              </li>
              <li>
                <Link to="/forms" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('app.forms')}
                </Link>
              </li>
              <li>
                <Link to="/mindmap" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('app.mindmap')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Ressources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('footer.documentation')}
                </Link>
              </li>
              <li>
                <Link to="/ecosystem/api" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('footer.api')}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('nav.news')}
                </Link>
              </li>
              <li>
                <Link to="/ecosystem" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('nav.ecosystem')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Légal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">{t('footer.availableLanguages')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
