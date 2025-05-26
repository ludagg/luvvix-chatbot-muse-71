
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Zap, 
  Network, 
  Database, 
  Brain, 
  Cloud, 
  FileText, 
  Newspaper,
  ArrowRight,
  Sparkles,
  Settings,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  TrendingUp,
  Users,
  Globe,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EcosystemInteraction {
  id: string;
  interaction_type: string;
  source_app: string;
  target_app: string;
  data: any;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
}

interface AppStatus {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'online' | 'offline' | 'maintenance';
  load: number;
  interactions: number;
  lastActivity: string;
  color: string;
}

const EcosystemOrchestrator = () => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<EcosystemInteraction[]>([]);
  const [appStatuses, setAppStatuses] = useState<AppStatus[]>([
    {
      name: 'LuvviX AI',
      icon: Brain,
      status: 'online',
      load: 75,
      interactions: 1243,
      lastActivity: '2s',
      color: 'bg-purple-500'
    },
    {
      name: 'LuvviX Cloud',
      icon: Cloud,
      status: 'online',
      load: 45,
      interactions: 856,
      lastActivity: '5s',
      color: 'bg-blue-500'
    },
    {
      name: 'LuvviX Forms',
      icon: FileText,
      status: 'online',
      load: 30,
      interactions: 432,
      lastActivity: '12s',
      color: 'bg-orange-500'
    },
    {
      name: 'LuvviX News',
      icon: Newspaper,
      status: 'maintenance',
      load: 0,
      interactions: 0,
      lastActivity: '2h',
      color: 'bg-red-500'
    }
  ]);

  const [selectedSourceApp, setSelectedSourceApp] = useState<string>('');
  const [selectedTargetApp, setSelectedTargetApp] = useState<string>('');
  const [interactionType, setInteractionType] = useState<string>('');
  const [interactionData, setInteractionData] = useState<string>('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInteractions();
      
      // Simuler les mises à jour en temps réel
      const interval = setInterval(() => {
        updateAppStatuses();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchInteractions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ecosystem_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const updateAppStatuses = () => {
    setAppStatuses(prev => prev.map(app => ({
      ...app,
      load: Math.max(0, Math.min(100, app.load + (Math.random() - 0.5) * 10)),
      interactions: app.status === 'online' ? app.interactions + Math.floor(Math.random() * 5) : app.interactions,
      lastActivity: app.status === 'online' ? ['1s', '2s', '3s', '5s'][Math.floor(Math.random() * 4)] : app.lastActivity
    })));
  };

  const createInteraction = async () => {
    if (!user || !selectedSourceApp || !selectedTargetApp || !interactionType) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis"
      });
      return;
    }

    setIsOrchestrating(true);

    try {
      const interactionPayload = {
        user_id: user.id,
        interaction_type: interactionType,
        source_app: selectedSourceApp,
        target_app: selectedTargetApp,
        data: interactionData ? JSON.parse(interactionData) : {},
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          source: 'ecosystem_orchestrator'
        },
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('ecosystem_interactions')
        .insert([interactionPayload])
        .select()
        .single();

      if (error) throw error;

      // Simuler le traitement de l'interaction
      setTimeout(async () => {
        await supabase
          .from('ecosystem_interactions')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', data.id);

        setTimeout(async () => {
          await supabase
            .from('ecosystem_interactions')
            .update({ status: 'completed' })
            .eq('id', data.id);

          await fetchInteractions();
          setIsOrchestrating(false);

          toast({
            title: "Interaction créée",
            description: `Communication établie entre ${selectedSourceApp} et ${selectedTargetApp}`
          });
        }, 2000);
      }, 1000);

      // Reset form
      setSelectedSourceApp('');
      setSelectedTargetApp('');
      setInteractionType('');
      setInteractionData('');

    } catch (error) {
      console.error('Error creating interaction:', error);
      setIsOrchestrating(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'interaction"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-500';
      case 'maintenance': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getInteractionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalInteractions = appStatuses.reduce((sum, app) => sum + app.interactions, 0);
  const avgLoad = Math.round(appStatuses.reduce((sum, app) => sum + app.load, 0) / appStatuses.length);
  const onlineApps = appStatuses.filter(app => app.status === 'online').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Network className="h-10 w-10 text-blue-400" />
              Orchestrateur d'Écosystème LuvviX
              <Sparkles className="h-10 w-10 text-purple-400" />
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Gérez et orchestrez les interactions entre toutes les applications LuvviX en temps réel
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Applications en ligne</p>
                  <p className="text-3xl font-bold text-white">{onlineApps}/4</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Interactions totales</p>
                  <p className="text-3xl font-bold text-white">{totalInteractions.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Charge moyenne</p>
                  <p className="text-3xl font-bold text-white">{avgLoad}%</p>
                </div>
                <Database className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Utilisateurs actifs</p>
                  <p className="text-3xl font-bold text-white">2,847</p>
                </div>
                <Users className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
              <Activity className="w-4 h-4 mr-2" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="orchestrate" className="data-[state=active]:bg-white/20">
              <Zap className="w-4 h-4 mr-2" />
              Orchestrer
            </TabsTrigger>
            <TabsTrigger value="interactions" className="data-[state=active]:bg-white/20">
              <Network className="w-4 h-4 mr-2" />
              Interactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* App Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {appStatuses.map((app) => {
                const IconComponent = app.icon;
                return (
                  <Card key={app.name} className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${app.color}/20`}>
                            <IconComponent className={`h-6 w-6 text-white`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{app.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(app.status)} border-current`}
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Charge CPU</span>
                            <span className="text-white">{app.load}%</span>
                          </div>
                          <Progress value={app.load} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Interactions</span>
                          <span className="text-white">{app.interactions.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Dernière activité</span>
                          <span className="text-white">{app.lastActivity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="orchestrate" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Créer une nouvelle interaction
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Orchestrez la communication entre les applications de l'écosystème
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Application source</label>
                    <Select value={selectedSourceApp} onValueChange={setSelectedSourceApp}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Sélectionner l'app source" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {appStatuses.filter(app => app.status === 'online').map(app => (
                          <SelectItem key={app.name} value={app.name} className="text-white">
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Application cible</label>
                    <Select value={selectedTargetApp} onValueChange={setSelectedTargetApp}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Sélectionner l'app cible" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {appStatuses.filter(app => app.status === 'online' && app.name !== selectedSourceApp).map(app => (
                          <SelectItem key={app.name} value={app.name} className="text-white">
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Type d'interaction</label>
                  <Select value={interactionType} onValueChange={setInteractionType}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="data_sync" className="text-white">Synchronisation de données</SelectItem>
                      <SelectItem value="ai_process" className="text-white">Traitement IA</SelectItem>
                      <SelectItem value="file_transfer" className="text-white">Transfert de fichier</SelectItem>
                      <SelectItem value="notification" className="text-white">Notification</SelectItem>
                      <SelectItem value="workflow" className="text-white">Workflow automatisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Données JSON (optionnel)</label>
                  <Input
                    placeholder='{"key": "value"}'
                    value={interactionData}
                    onChange={(e) => setInteractionData(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <Button 
                  onClick={createInteraction}
                  disabled={isOrchestrating || !selectedSourceApp || !selectedTargetApp || !interactionType}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isOrchestrating ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Orchestration en cours...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Lancer l'orchestration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-6 w-6" />
                  Historique des interactions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Suivez toutes les interactions entre applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Network className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune interaction trouvée</p>
                      <p className="text-gray-500 text-sm">Créez votre première orchestration pour voir l'historique</p>
                    </div>
                  ) : (
                    interactions.map((interaction) => (
                      <div key={interaction.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getInteractionStatusColor(interaction.status)} text-white`}>
                              {interaction.status}
                            </Badge>
                            <span className="text-white font-medium">{interaction.interaction_type}</span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(interaction.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-300">
                          <span>{interaction.source_app}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{interaction.target_app}</span>
                        </div>
                        
                        {Object.keys(interaction.data).length > 0 && (
                          <div className="mt-2">
                            <details className="text-gray-400">
                              <summary className="cursor-pointer text-sm">Données</summary>
                              <pre className="text-xs mt-1 bg-black/20 p-2 rounded overflow-auto">
                                {JSON.stringify(interaction.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EcosystemOrchestrator;
