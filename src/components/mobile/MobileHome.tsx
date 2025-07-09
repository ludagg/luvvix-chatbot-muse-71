
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom';
import ModernNewsBriefing from '@/components/news/ModernNewsBriefing';

interface MobileHomeProps {
  setActiveSection?: (section: string) => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ setActiveSection }) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNewsClick = () => {
    if (setActiveSection) {
      setActiveSection('news');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header section */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">LuvviX</span>
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                    <AvatarFallback>{user.user_metadata?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/account')}>{t.nav.account}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>{t.nav.logout}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              {t.nav.login}
            </Button>
          )}
        </div>
      </header>

      {/* Section actualités améliorée */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Actualités IA
              </h2>
              <p className="text-xs text-muted-foreground">
                Résumés personnalisés en temps réel
              </p>
            </div>
          </div>
          <Button
            onClick={handleNewsClick}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          <ModernNewsBriefing 
            showSetup={true}
            onPreferencesSet={(categories) => {
              console.log('Categories set:', categories);
            }}
          />
        </div>
      </section>

      {/* Main content section */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.home.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t.home.features.aiStudio.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t.home.features.aiStudio.description}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t.home.features.forms.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t.home.features.forms.description}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t.home.features.cloud.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t.home.features.cloud.description}</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.home.testimonials.title}</h2>
          <p className="text-gray-700 dark:text-gray-300">{t.home.testimonials.subtitle}</p>
        </section>
      </main>

      {/* Footer section */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-700 dark:text-gray-300">
            {t.home.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MobileHome;
