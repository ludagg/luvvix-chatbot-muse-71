
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Newspaper, Bot, Sparkles } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import WeatherWidget from './weather/WeatherWidget';
import NewsNotification from './news/NewsNotification';

const Navbar = () => {
  // Using React.useState instead of directly importing useState
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Safely access auth with error handling
  let user, loading;
  try {
    const auth = useAuth();
    user = auth?.user;
    loading = auth?.loading;
  } catch (error) {
    console.error("Auth context not available:", error);
    user = null;
    loading = false;
  }

  React.useEffect(() => {
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
              <a href="#ecosystem" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Écosystème
              </a>
              <a href="#products" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Produits
              </a>
              <a href="#developers" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Développeurs
              </a>
              <Link to="/news" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Link>
              {/* Add AI Studio link with highlight effect */}
              <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-300 hover:text-indigo-200 transition-colors">
                <Bot className="w-4 h-4 mr-1" />
                AI Studio
                <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
              </Link>
              <a href="#lab" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Lab
              </a>
              <a href="#careers" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Carrières
              </a>
            </div>
            <div className="flex items-center space-x-3">
              {/* Weather Widget - Positioned at the beginning of this section */}
              <WeatherWidget />
              
              {/* News Notifications */}
              <NewsNotification />
              
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
              <a href="#ecosystem" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Écosystème
              </a>
              <a href="#products" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Produits
              </a>
              <a href="#developers" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Développeurs
              </a>
              <Link to="/news" className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center">
                <Newspaper className="w-4 h-4 mr-1" />
                News
              </Link>
              {/* Add AI Studio link with highlight effect in mobile menu */}
              <Link to="/ai-studio" className="text-sm font-medium flex items-center text-indigo-300 hover:text-indigo-200 transition-colors">
                <Bot className="w-4 h-4 mr-1" />
                AI Studio
                <Sparkles className="w-3 h-3 ml-1 text-yellow-300" />
              </Link>
              <a href="#lab" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Lab
              </a>
              <a href="#careers" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Carrières
              </a>
              
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
