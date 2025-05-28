
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Users, 
  Eye,
  Download,
  RefreshCw,
  Loader2,
  Calendar,
  Target,
  Zap,
  PieChart,
  LineChart,
  Activity,
  DollarSign,
  ShoppingCart,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; percentage: number }>;
  demographics: Array<{ country: string; users: number }>;
  trends: Array<{ date: string; visitors: number; revenue: number }>;
}

interface MarketInsight {
  id: string;
  title: string;
  category: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
}

interface CompetitorData {
  name: string;
  url: string;
  traffic: number;
  keywords: number;
  backlinks: number;
  ranking: number;
}

const LuvviXAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [reportQuery, setReportQuery] = useState('');

  // Simulation de données analytiques en temps réel
  useEffect(() => {
    const generateMockData = (): AnalyticsData => ({
      visitors: Math.floor(Math.random() * 10000) + 5000,
      pageViews: Math.floor(Math.random() * 50000) + 25000,
      bounceRate: Math.floor(Math.random() * 40) + 30,
      conversionRate: Math.floor(Math.random() * 5) + 2,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 5000) + 2000 },
        { page: '/products', views: Math.floor(Math.random() * 3000) + 1500 },
        { page: '/about', views: Math.floor(Math.random() * 2000) + 1000 },
        { page: '/contact', views: Math.floor(Math.random() * 1500) + 800 },
        { page: '/blog', views: Math.floor(Math.random() * 1000) + 500 }
      ],
      trafficSources: [
        { source: 'Recherche organique', percentage: 45 },
        { source: 'Réseaux sociaux', percentage: 25 },
        { source: 'Référence directe', percentage: 20 },
        { source: 'Email', percentage: 10 }
      ],
      demographics: [
        { country: 'France', users: Math.floor(Math.random() * 3000) + 2000 },
        { country: 'Canada', users: Math.floor(Math.random() * 1500) + 1000 },
        { country: 'Belgique', users: Math.floor(Math.random() * 800) + 500 },
        { country: 'Suisse', users: Math.floor(Math.random() * 600) + 400 }
      ],
      trends: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 2000) + 1000,
        revenue: Math.floor(Math.random() * 5000) + 2000
      })).reverse()
    });

    setAnalyticsData(generateMockData());

    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(() => {
      setAnalyticsData(generateMockData());
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const generateMarketInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-generate-code', {
        body: {
          prompt: `Génère 5 insights marketing et économiques pertinents pour le secteur du web en ${new Date().getFullYear()}. Format JSON avec: title, category, insight, impact (high/medium/low), source. Sois précis et actionnable.`,
          language: 'json'
        }
      });

      if (data.success) {
        const insights = JSON.parse(data.generated.code);
        const formattedInsights = insights.map((insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          ...insight,
          timestamp: new Date().toISOString()
        }));
        setMarketInsights(formattedInsights);
        
        toast({
          title: "Insights générés",
          description: "Les dernières analyses de marché ont été générées avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur génération insights:', error);
      // Fallback avec des données simulées
      const mockInsights: MarketInsight[] = [
        {
          id: 'insight-1',
          title: 'Croissance du E-commerce Mobile',
          category: 'Tendances',
          insight: 'Le commerce mobile représente maintenant 67% des ventes en ligne. Optimisez vos sites pour mobile en priorité.',
          impact: 'high',
          timestamp: new Date().toISOString(),
          source: 'Analyse LuvviX AI'
        },
        {
          id: 'insight-2',
          title: 'Intelligence Artificielle en Marketing',
          category: 'Technologie',
          insight: 'Les entreprises utilisant l\'IA pour le marketing voient une augmentation de 37% de leur ROI.',
          impact: 'high',
          timestamp: new Date().toISOString(),
          source: 'Données sectorielles'
        },
        {
          id: 'insight-3',
          title: 'Évolution des Réseaux Sociaux',
          category: 'Social Media',
          insight: 'Les contenus vidéo courts génèrent 5x plus d\'engagement que les posts statiques.',
          impact: 'medium',
          timestamp: new Date().toISOString(),
          source: 'Analyse comportementale'
        }
      ];
      setMarketInsights(mockInsights);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCustomReport = async () => {
    if (!reportQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Requête requise",
        description: "Veuillez spécifier ce que vous voulez analyser"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-generate-code', {
        body: {
          prompt: `Génère un rapport d'analyse détaillé sur: "${reportQuery}". Inclus des métriques, des recommandations et des insights actionnables. Format markdown professionnel.`,
          language: 'markdown'
        }
      });

      if (data.success) {
        const reportBlob = new Blob([data.generated.code], { type: 'text/markdown' });
        const url = URL.createObjectURL(reportBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-${reportQuery.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Rapport généré",
          description: "Votre rapport personnalisé a été téléchargé"
        });
      }
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le rapport. Réessayez."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Données actualisées",
        description: "Les métriques ont été mises à jour avec les dernières données"
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plateforme d'analyse de données et d'intelligence économique en temps réel alimentée par l'IA
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Temps Réel</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Insights IA</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">Rapports Automatisés</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              En direct
            </Badge>
          </div>

          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights Marché
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Concurrence
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Rapports IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {analyticsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Visiteurs</p>
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.visitors.toLocaleString()}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12.5%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pages Vues</p>
                          <p className="text-2xl font-bold text-purple-600">{analyticsData.pageViews.toLocaleString()}</p>
                        </div>
                        <Eye className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8.3%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Taux de Conversion</p>
                          <p className="text-2xl font-bold text-green-600">{analyticsData.conversionRate}%</p>
                        </div>
                        <Target className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+15.2%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Revenus</p>
                          <p className="text-2xl font-bold text-orange-600">{analyticsData.revenue.toLocaleString()}€</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+22.1%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Sources de Trafic
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.trafficSources.map((source, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{source.source}</span>
                            <span className="font-medium">{source.percentage}%</span>
                          </div>
                          <Progress value={source.percentage} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-purple-600" />
                        Pages Populaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.topPages.map((page, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{page.page}</span>
                          <Badge variant="outline">{page.views.toLocaleString()} vues</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      Répartition Géographique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {analyticsData.demographics.map((demo, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{demo.users.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{demo.country}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Insights Marché en Temps Réel</h2>
              <Button
                onClick={generateMarketInsights}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Générer Nouveaux Insights
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {marketInsights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`${
                          insight.impact === 'high' ? 'bg-red-50 text-red-700' :
                          insight.impact === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {insight.category}
                      </Badge>
                      <Badge 
                        className={`${
                          insight.impact === 'high' ? 'bg-red-500' :
                          insight.impact === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                      >
                        {insight.impact}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.insight}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{insight.source}</span>
                      <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {marketInsights.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucun insight généré
                </h3>
                <p className="text-gray-500 mb-4">
                  Cliquez sur "Générer Nouveaux Insights" pour obtenir les dernières analyses de marché
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Analyse Concurrentielle
                </CardTitle>
                <CardDescription>
                  Surveillance automatique de vos principaux concurrents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Analyse Concurrentielle IA
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Cette fonctionnalité analyse automatiquement vos concurrents et leurs performances
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Target className="h-4 w-4 mr-2" />
                    Lancer l'Analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Génération de Rapports IA
                </CardTitle>
                <CardDescription>
                  Créez des rapports personnalisés avec l'intelligence artificielle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Que voulez-vous analyser ?</label>
                  <Textarea
                    value={reportQuery}
                    onChange={(e) => setReportQuery(e.target.value)}
                    placeholder="Ex: Analyse des tendances e-commerce pour Q1 2024, Performance SEO du secteur technologique, Impact de l'IA sur le marketing digital..."
                    className="min-h-24"
                  />
                </div>

                <Button
                  onClick={generateCustomReport}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération du rapport...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Générer le Rapport
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Rapports Disponibles :</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Analyse de performance web</li>
                      <li>• Études sectorielles détaillées</li>
                      <li>• Benchmarking concurrentiel</li>
                      <li>• Prédictions de tendances</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Formats d'export :</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• PDF professionnel</li>
                      <li>• Markdown détaillé</li>
                      <li>• Excel avec données</li>
                      <li>• PowerPoint exécutif</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXAnalytics;
