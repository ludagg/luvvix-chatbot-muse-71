
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
              {t.home.hero.description}
            </p>
            <div className="pt-4">
              <LanguageSelector />
            </div>
          </div>
          
          {/* Produits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.nav.applications}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ai-studio" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.aiStudio.title}
                </Link>
              </li>
              <li>
                <Link to="/cloud" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.cloud.title}
                </Link>
              </li>
              <li>
                <Link to="/translate" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  LuvviX Translate
                </Link>
              </li>
              <li>
                <Link to="/forms" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.forms.title}
                </Link>
              </li>
              <li>
                <Link to="/mindmap" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  LuvviX MindMap
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Ressources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/ecosystem/api" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.news.title}
                </Link>
              </li>
              <li>
                <Link to="/ecosystem" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  Écosystème
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Légal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.common.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.common.terms}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-luvvix-purple transition-colors">
                  {t.common.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.home.footer.copyright}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">Langues disponibles</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
