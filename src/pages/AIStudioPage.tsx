
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Plus, 
  Store, 
  Settings, 
  Users, 
  BookUser, 
  Star, 
  Heart,
  User,
  Sparkles,
  Zap,
  MessageSquare,
  TrendingUp,
  BarChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIStudioPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    myAgents: 0,
    favorites: 0,
    follows: 0
  });

  useEffect(() => {
    document.title = "LuvviX AI Studio";
    
    const getUser = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Fetch user stats
        fetchUserStats(session.user.id);
        
        // Fetch recent agents
        fetchRecentAgents();
      }
      
      setLoading(false);
    };
    
    getUser();
  }, []);
  
  const fetchUserStats = async (userId: string) => {
    try {
      // Get count of user's agents
      const { count: agentsCount, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      // Get count of user's favorites
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('ai_favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      // Get count of user's follows
      const { count: followsCount, error: followsError } = await supabase
        .from('ai_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);
        
      if (!agentsError && !favoritesError && !followsError) {
        setStats({
          myAgents: agentsCount || 0,
          favorites: favoritesCount || 0,
          follows: followsCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  const fetchRecentAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (!error && data) {
        setRecentAgents(data);
      }
    } catch (error) {
      console.error('Error fetching recent agents:', error);
    }
  };

  // Si chargement en cours, afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-purple-600">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si pas d'utilisateur connecté, rediriger vers la page d'authentification
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  LuvviX AI Studio
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Créez et gérez vos assistants IA personnalisés
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/ai-studio/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un agent
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 text-violet-500 mr-2" />
                    Mes agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.myAgents}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="text-violet-600">
                    <Link to="/ai-studio/dashboard">
                      Voir tous mes agents
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Star className="h-5 w-5 text-amber-500 mr-2" />
                    Favoris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.favorites}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="text-amber-600">
                    <Link to="/ai-studio/favorites">
                      Voir mes favoris
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    Abonnements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.follows}</div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild className="text-blue-600">
                    <Link to="/ai-studio/favorites">
                      Voir mes abonnements
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent agents in marketplace */}
            {recentAgents.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Agents récents dans le marketplace</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/ai-studio/marketplace">
                      Voir tout
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 mr-3">
                            {agent.avatar_style === "bot" ? (
                              <Bot className="h-5 w-5" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-md">{agent.name}</CardTitle>
                            <CardDescription>{agent.personality}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                          {agent.objective}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="secondary" size="sm" asChild className="w-full">
                          <Link to={`/ai-studio/agent/${agent.slug || agent.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Essayer
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Main navigation grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/ai-studio/dashboard" className="group">
                <Card className="h-full border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900 w-fit mb-2 group-hover:scale-110 transition-transform">
                      <Bot className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                    </div>
                    <CardTitle>Mes agents</CardTitle>
                    <CardDescription>
                      Consultez, modifiez et suivez les performances de vos agents IA.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Dashboard
                      </Badge>
                      <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300">
                        <BarChart className="h-3 w-3 mr-1" />
                        Analytics
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/ai-studio/marketplace" className="group">
                <Card className="h-full border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 w-fit mb-2 group-hover:scale-110 transition-transform">
                      <Store className="h-6 w-6 text-green-600 dark:text-green-300" />
                    </div>
                    <CardTitle>Marketplace</CardTitle>
                    <CardDescription>
                      Découvrez des agents IA créés par d'autres utilisateurs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Populaire
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                        <Zap className="h-3 w-3 mr-1" />
                        Tendance
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/ai-studio/favorites" className="group">
                <Card className="h-full border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 w-fit mb-2 group-hover:scale-110 transition-transform">
                      <Star className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                    </div>
                    <CardTitle>Favoris et Abonnements</CardTitle>
                    <CardDescription>
                      Retrouvez vos agents favoris et les créateurs que vous suivez.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">
                        <Heart className="h-3 w-3 mr-1" />
                        Favoris
                      </Badge>
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">
                        <BookUser className="h-3 w-3 mr-1" />
                        Créateurs
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Card className="h-full border-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900 w-fit mb-2">
                    <Heart className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                  </div>
                  <CardTitle>Version Pro</CardTitle>
                  <CardDescription>
                    Débloquez des fonctionnalités avancées et plus de capacités.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Bientôt disponible
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="h-full border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 w-fit mb-2">
                    <User className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <CardTitle>Mon Profil</CardTitle>
                  <CardDescription>
                    Gérez votre profil de créateur et vos informations personnelles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                      <Users className="h-3 w-3 mr-1" />
                      Créateur
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Bientôt disponible
                  </Button>
                </CardFooter>
              </Card>
              
              <Link to="/ai-studio/admin?token=luvvix-id-admin-secret-token">
                <Card className="h-full border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-fit mb-2">
                      <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <CardTitle>Administration</CardTitle>
                    <CardDescription>
                      Options d'administration pour gérer la plateforme AI Studio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Settings className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
            
            {/* CTA Banner */}
            <div className="mt-10 p-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Créez un agent IA en quelques minutes</h2>
                <p className="text-violet-100 mb-6">
                  Concevez des assistants intelligents adaptés à vos besoins sans compétences techniques.
                  Personnalisez leurs connaissances, comportement et apparence en quelques clics.
                </p>
                <Button asChild size="lg" variant="secondary" className="bg-white text-violet-700 hover:bg-gray-100">
                  <Link to="/ai-studio/create">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Commencer maintenant
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioPage;
