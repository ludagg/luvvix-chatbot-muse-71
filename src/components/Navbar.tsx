
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Newspaper, Bot, Sparkles, FileText, Search, Cloud, Shield } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import WeatherWidget from './weather/WeatherWidget';
import NewsNotification from './news/NewsNotification';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? 'bg-[#1A1F2C] shadow-lg py-4' 
      : 'bg-transparent py-6'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">LuvviX</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {/* Replace old links with LuvviX tools */}
              <Link to="/forms" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Forms
              </Link>
              <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-300 hover:text-indigo-200 transition-colors">
                <Bot className="w-4 h-4 mr-1" />
                AI Studio
                <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
              </Link>
              <Link to="/news" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Link>
              <Link to="/cloud" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Cloud className="w-4 h-4 mr-1" />
                Cloud
              </Link>
              <Link to="/docs" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Documentation
              </Link>
              <div className="relative group">
                <button className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                  Plus
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-50">
                  <div className="py-1">
                    <Link to="/weather" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Cloud className="w-4 h-4 mr-2" />
                      Météo
                    </Link>
                    <Link to="/privacy" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Confidentialité
                    </Link>
                    <Link to="/terms" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FileText className="w-4 h-4 mr-2" />
                      CGU
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Weather Widget */}
              <WeatherWidget />
              
              {/* News Notifications */}
              <NewsNotification />
              
              {/* Search Button */}
              <button 
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              
              {!loading && (
                user ? (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true">
                      <Button size="sm" className="bg-white text-luvvix-purple hover:bg-white/90">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Add WeatherWidget in mobile view before the menu button */}
            <WeatherWidget />
            <div className="ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 animate-fade-in bg-[#1A1F2C] mt-4 rounded-lg">
            <div className="flex flex-col space-y-4 p-4">
<Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                Accueil
              </Link>
              <Link to="/forms" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Forms
              </Link>
              
              <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-300 hover:text-indigo-200 transition-colors">
                <Bot className="w-4 h-4 mr-1" />
                AI Studio
                <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
              </Link>
              <Link to="/news" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Link>
              <Link to="/cloud" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Cloud className="w-4 h-4 mr-1" />
                Cloud
              </Link>
              <Link to="/weather" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Cloud className="w-4 h-4 mr-1" />
                Météo
              </Link>
              <Link to="/docs" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to="/privacy" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Confidentialité
              </Link>
              <Link to="/terms" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                CGU
              </Link>
              
              <div className="flex items-center space-x-4">
                <NewsNotification />
              </div>
              
              {!loading && (
                user ? (
                  <Link to="/dashboard">
                    <Button variant="ghost" className="text-white hover:bg-white/10 justify-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link to="/auth">
                      <Button variant="ghost" className="text-white hover:bg-white/10 justify-center w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true">
                      <Button className="bg-white text-luvvix-purple hover:bg-white/90 justify-center w-full">
                        Créer un compte
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
