
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { BookUser, Search, Bookmark, Users, Bot, Frown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/ai-studio/FavoriteButton";
import FollowButton from "@/components/ai-studio/FollowButton";
import { supabase } from "@/integrations/supabase/client";

const AIStudioFavoritesPage = () => {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [followed, setFollowed] = useState<any[]>([]);
  const [followedCreators, setFollowedCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("favorites");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    
    try {
      // Fetch favorite agents
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('ai_favorites')
        .select(`
          id,
          agent_id,
          agent:ai_agents(
            id, 
            name, 
            objective, 
            personality, 
            avatar_style, 
            user_id, 
            views, 
            rating, 
            is_public,
            is_paid,
            price,
            slug
          )
        `)
        .eq('user_id', session.user.id);
        
      if (favoriteError) throw favoriteError;
      
      // Fetch followed creators
      const { data: followData, error: followError } = await supabase
        .from('ai_follows')
        .select(`
          id,
          creator_id,
          creator:user_profiles!creator_id(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('follower_id', session.user.id);
        
      if (followError) throw followError;
      
      // Get agents from followed creators
      const creatorIds = followData?.map(follow => follow.creator_id) || [];
      
      if (creatorIds.length > 0) {
        const { data: creatorAgents, error: creatorAgentsError } = await supabase
          .from('ai_agents')
          .select('*')
          .in('user_id', creatorIds)
          .eq('is_public', true)
          .order('created_at', { ascending: false });
          
        if (creatorAgentsError) throw creatorAgentsError;
        
        setFollowed(creatorAgents || []);
      }
      
      setFavorites(favoriteData || []);
      setFollowedCreators(followData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getBotInitial = (name: string) => {
    return name ? name[0].toUpperCase() : "B";
  };
  
  const filteredFavorites = favorites.filter(fav => 
    fav.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.agent?.objective?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFollowed = followed.filter(agent => 
    agent?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent?.objective?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCreators = followedCreators.filter(follow => 
    follow.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follow.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getAvatarColor = (style: string) => {
    const colors: {[key: string]: string} = {
      'professional': 'bg-blue-600',
      'friendly': 'bg-green-600',
      'creative': 'bg-purple-600',
      'technical': 'bg-gray-700',
      'assistant': 'bg-indigo-600',
    };
    
    return colors[style] || 'bg-violet-600';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Favoris et Abonnements</h1>
              <p className="text-gray-600 mt-1">
                Retrouvez vos agents préférés et créateurs suivis
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="favorites" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Favoris</span>
              </TabsTrigger>
              <TabsTrigger value="followed" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Agents suivis</span>
              </TabsTrigger>
              <TabsTrigger value="creators" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Créateurs</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-32 bg-gray-200"></CardHeader>
                      <CardContent className="py-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredFavorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavorites.map((favorite) => (
                    <Card key={favorite.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className={`${getAvatarColor(favorite.agent?.avatar_style)}`}>
                              <AvatarFallback>{getBotInitial(favorite.agent?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h3 className="font-semibold text-lg">{favorite.agent?.name}</h3>
                              <p className="text-sm text-gray-500">{favorite.agent?.personality}</p>
                            </div>
                          </div>
                          <FavoriteButton agentId={favorite.agent?.id} initialIsFavorite={true} />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 line-clamp-3">{favorite.agent?.objective}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div>{favorite.agent?.views || 0} vues</div>
                            <div>•</div>
                            <div>{favorite.agent?.rating || 0} étoiles</div>
                          </div>
                          {favorite.agent?.is_paid && (
                            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                              {favorite.agent?.price || 0}€
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-2">
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={() => navigate(`/ai-studio/agent/${favorite.agent?.slug || favorite.agent?.id}`)}
                        >
                          Voir l'agent
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Frown className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-xl font-medium text-gray-700">Aucun favori trouvé</h3>
                  <p className="text-gray-500 mb-6">Vous n'avez pas encore d'agents dans vos favoris</p>
                  <Button onClick={() => navigate('/ai-studio/marketplace')}>
                    Explorer le marketplace
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="followed" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-32 bg-gray-200"></CardHeader>
                      <CardContent className="py-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredFollowed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFollowed.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className={`${getAvatarColor(agent?.avatar_style)}`}>
                              <AvatarFallback>{getBotInitial(agent?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h3 className="font-semibold text-lg">{agent?.name}</h3>
                              <p className="text-sm text-gray-500">{agent?.personality}</p>
                            </div>
                          </div>
                          <FavoriteButton agentId={agent?.id} />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 line-clamp-3">{agent?.objective}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div>{agent?.views || 0} vues</div>
                            <div>•</div>
                            <div>{agent?.rating || 0} étoiles</div>
                          </div>
                          {agent?.is_paid && (
                            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                              {agent?.price || 0}€
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-2">
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={() => navigate(`/ai-studio/agent/${agent?.slug || agent?.id}`)}
                        >
                          Voir l'agent
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Frown className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-xl font-medium text-gray-700">Aucun agent trouvé</h3>
                  <p className="text-gray-500 mb-6">Les créateurs que vous suivez n'ont pas encore publié d'agents</p>
                  <Button onClick={() => navigate('/ai-studio/marketplace')}>
                    Explorer le marketplace
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="creators" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((follow) => (
                    <Card key={follow.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(follow.creator?.full_name || follow.creator?.username || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {follow.creator?.full_name || "Utilisateur"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                @{follow.creator?.username || "anonyme"}
                              </p>
                            </div>
                          </div>
                          <FollowButton 
                            creatorId={follow.creator_id} 
                            initialIsFollowing={true}
                          />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setActiveTab("followed");
                              setSearchQuery(follow.creator?.username || "");
                            }}
                          >
                            <BookUser className="mr-2 h-4 w-4" />
                            Voir ses agents
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Frown className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-xl font-medium text-gray-700">Aucun créateur suivi</h3>
                  <p className="text-gray-500 mb-6">Vous ne suivez aucun créateur pour le moment</p>
                  <Button onClick={() => navigate('/ai-studio/marketplace')}>
                    Découvrir des créateurs
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioFavoritesPage;
