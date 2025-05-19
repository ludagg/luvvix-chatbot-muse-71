
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsHeadlines from '@/components/news/NewsHeadlines';
import NewsCategories from '@/components/news/NewsCategories';
import NewsletterSignup from '@/components/news/NewsletterSignup';
import TrendingTopics from '@/components/news/TrendingTopics';
import { Button } from '@/components/ui/button';
import { Globe, Rss, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestNews, getUserLocation } from '@/services/news-service';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Obtenir la géolocalisation de l'utilisateur
  useEffect(() => {
    const getLocation = async () => {
      const location = await getUserLocation();
      if (location?.country) {
        setUserCountry(location.country);
      }
    };
    
    getLocation();
  }, []);

  const { data: newsItems, isLoading, error, refetch } = useQuery({
    queryKey: ['news', selectedCategory, userCountry, searchQuery],
    queryFn: () => fetchLatestNews(selectedCategory, userCountry, searchQuery),
    enabled: true,
  });

  useEffect(() => {
    // Set the document title
    document.title = "LuvviX News - Restez informé";
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="pt-24 flex-1">
        {/* Hero section */}
        <section className="gradient-bg py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="max-w-2xl mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  LuvviX News
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  Restez informé avec des actualités personnalisées provenant de sources diverses à travers le web.
                  {userCountry && (
                    <span className="flex items-center mt-2 text-base">
                      <MapPin className="h-5 w-5 mr-1" />
                      Actualités adaptées à votre région
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" variant="white" className="hero-button">
                    <Globe className="mr-2 h-5 w-5" />
                    Explorer les sources
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent border-white text-white hover:bg-white/10 hero-button"
                    onClick={() => {
                      const newsletterSection = document.getElementById('newsletter-section');
                      if (newsletterSection) {
                        newsletterSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Rss className="mr-2 h-5 w-5" />
                    S'abonner au flux
                  </Button>
                </div>
              </div>
              <div className="relative w-full max-w-md">
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="News illustration" 
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and categories section */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="w-full md:w-auto">
                <NewsCategories 
                  selectedCategory={selectedCategory} 
                  onCategoryChange={handleCategoryChange} 
                />
              </div>
              
              <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
                <Input
                  type="text"
                  placeholder="Rechercher des actualités..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* News headlines section */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-8">Dernières actualités</h2>
              <NewsHeadlines 
                isLoading={isLoading} 
                error={error} 
                newsItems={newsItems} 
              />
            </div>
            <div className="space-y-10">
              <TrendingTopics />
              <div id="newsletter-section">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default NewsPage;
