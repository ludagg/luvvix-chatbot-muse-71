
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Calendar, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCategories from "@/components/news/NewsCategories";
import NewsHeadlines from "@/components/news/NewsHeadlines";
import TrendingTopics from "@/components/news/TrendingTopics";
import NewsletterSignup from "@/components/news/NewsletterSignup";
import NewsNotification from "@/components/news/NewsNotification";
import { fetchLatestNews } from "@/services/news-service";
import { NewsItem } from "@/types/news";
import { useLanguage } from "@/hooks/useLanguage";

const NewsPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("headlines");
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const newsData = await fetchLatestNews("general");
      setArticles(newsData);
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Simuler une recherche filtrée
      const filteredArticles = articles.filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setArticles(filteredArticles);
    } else {
      fetchNews();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Here you could fetch news for the specific category
    // fetchLatestNews(category);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t.news.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t.news.subtitle}
            </p>
          </div>

          {/* Notification Component */}
          <NewsNotification />

          {/* Search Bar */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher des actualités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Rechercher des articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="headlines">{t.news.headlines}</TabsTrigger>
              <TabsTrigger value="categories">{t.news.categories}</TabsTrigger>
              <TabsTrigger value="trending">{t.news.trending}</TabsTrigger>
              <TabsTrigger value="newsletter">{t.news.newsletter}</TabsTrigger>
            </TabsList>

            <TabsContent value="headlines">
              <NewsHeadlines newsItems={articles} isLoading={loading} error={null} />
            </TabsContent>

            <TabsContent value="categories">
              <NewsCategories 
                selectedCategory={selectedCategory} 
                onCategoryChange={handleCategoryChange} 
              />
            </TabsContent>

            <TabsContent value="trending">
              <TrendingTopics />
            </TabsContent>

            <TabsContent value="newsletter">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Restez informé</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Recevez les dernières actualités directement dans votre boîte mail
                    </p>
                  </CardHeader>
                  <CardContent>
                    <NewsletterSignup />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;
