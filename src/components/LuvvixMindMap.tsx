
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Plus, 
  Download, 
  Share2, 
  Zap,
  Eye,
  Lightbulb,
  Network,
  Sparkles,
  Trash2,
  Edit3
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
  color: string;
  children: string[];
}

interface MindMapData {
  id: string;
  title: string;
  nodes: MindMapNode[];
  connections: Array<{ from: string; to: string }>;
  createdAt: Date;
}

const LuvvixMindMap = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMindMap, setCurrentMindMap] = useState<MindMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragState, setDragState] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const generateMindMap = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text: `Create a comprehensive mind map structure for the topic: "${topic}". 
          
          Generate a hierarchical structure with:
          1. Central topic
          2. 4-6 main branches (level 1)
          3. 2-4 sub-branches for each main branch (level 2)
          4. 1-3 detail items for each sub-branch (level 3)
          
          Format the response as a JSON structure with:
          - title: the main topic
          - branches: array of main branches with their sub-branches and details
          
          Make it creative, comprehensive and useful for learning or brainstorming.`,
          fromLanguage: 'auto',
          toLanguage: 'fr',
          context: 'Mind mapping and knowledge organization'
        }
      });

      if (error) throw error;

      // Parse the AI response and create mind map structure
      const mindMapNodes = createMindMapFromAI(data.translatedText, topic);
      
      const newMindMap: MindMapData = {
        id: Date.now().toString(),
        title: topic,
        nodes: mindMapNodes,
        connections: generateConnections(mindMapNodes),
        createdAt: new Date()
      };
      
      setCurrentMindMap(newMindMap);
      
      toast({
        title: "Carte mentale générée",
        description: "Votre carte mentale a été créée avec succès par Gemini AI"
      });
      
    } catch (error: any) {
      console.error('Mind map generation error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer la carte mentale. Veuillez réessayer."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createMindMapFromAI = (aiResponse: string, mainTopic: string): MindMapNode[] => {
    const nodes: MindMapNode[] = [];
    const centerX = 400;
    const centerY = 300;
    
    // Central node
    nodes.push({
      id: 'center',
      text: mainTopic,
      x: centerX,
      y: centerY,
      level: 0,
      color: colors[0],
      children: []
    });
    
    // Generate main branches based on common knowledge structure
    const mainBranches = [
      'Définition & Concepts',
      'Applications Pratiques',
      'Avantages & Bénéfices',
      'Défis & Limitations',
      'Tendances Futures',
      'Ressources & Outils'
    ];
    
    mainBranches.forEach((branch, index) => {
      const angle = (index * 60) * (Math.PI / 180);
      const radius = 150;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const branchId = `branch-${index}`;
      nodes.push({
        id: branchId,
        text: branch,
        x,
        y,
        level: 1,
        parentId: 'center',
        color: colors[index + 1] || colors[index % colors.length],
        children: []
      });
      
      // Add sub-branches
      const subBranches = generateSubBranches(branch, mainTopic);
      subBranches.forEach((subBranch, subIndex) => {
        const subAngle = angle + (subIndex - 1) * 0.3;
        const subRadius = 80;
        const subX = x + Math.cos(subAngle) * subRadius;
        const subY = y + Math.sin(subAngle) * subRadius;
        
        const subBranchId = `sub-${index}-${subIndex}`;
        nodes.push({
          id: subBranchId,
          text: subBranch,
          x: subX,
          y: subY,
          level: 2,
          parentId: branchId,
          color: colors[index + 1] || colors[index % colors.length],
          children: []
        });
      });
    });
    
    return nodes;
  };

  const generateSubBranches = (mainBranch: string, topic: string): string[] => {
    const subBranchMap: { [key: string]: string[] } = {
      'Définition & Concepts': ['Principes de base', 'Terminologie', 'Histoire'],
      'Applications Pratiques': ['Cas d\'usage', 'Exemples réels', 'Implémentation'],
      'Avantages & Bénéfices': ['Efficacité', 'Économies', 'Innovation'],
      'Défis & Limitations': ['Obstacles', 'Risques', 'Solutions'],
      'Tendances Futures': ['Évolutions', 'Technologies', 'Perspectives'],
      'Ressources & Outils': ['Documentation', 'Logiciels', 'Formation']
    };
    
    return subBranchMap[mainBranch] || ['Aspect 1', 'Aspect 2', 'Aspect 3'];
  };

  const generateConnections = (nodes: MindMapNode[]) => {
    const connections: Array<{ from: string; to: string }> = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        connections.push({
          from: node.parentId,
          to: node.id
        });
      }
    });
    
    return connections;
  };

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMindMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first
    ctx.strokeStyle = '#CBD5E0';
    ctx.lineWidth = 2;
    
    currentMindMap.connections.forEach(connection => {
      const fromNode = currentMindMap.nodes.find(n => n.id === connection.from);
      const toNode = currentMindMap.nodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    currentMindMap.nodes.forEach(node => {
      const isSelected = selectedNode === node.id;
      const radius = node.level === 0 ? 40 : node.level === 1 ? 25 : 15;
      
      // Node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Node text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${node.level === 0 ? '14' : node.level === 1 ? '12' : '10'}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text for longer content
      const maxWidth = radius * 1.8;
      const words = node.text.split(' ');
      let line = '';
      let y = node.y;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, node.x, y);
          line = words[i] + ' ';
          y += 12;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });
  };

  useEffect(() => {
    drawMindMap();
  }, [currentMindMap, selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMindMap) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = currentMindMap.nodes.find(node => {
      const radius = node.level === 0 ? 40 : node.level === 1 ? 25 : 15;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    setSelectedNode(clickedNode ? clickedNode.id : null);
  };

  const addNode = () => {
    if (!currentMindMap || !selectedNode) return;
    
    const parentNode = currentMindMap.nodes.find(n => n.id === selectedNode);
    if (!parentNode) return;
    
    const newNodeId = `node-${Date.now()}`;
    const angle = Math.random() * 2 * Math.PI;
    const radius = 80;
    const x = parentNode.x + Math.cos(angle) * radius;
    const y = parentNode.y + Math.sin(angle) * radius;
    
    const newNode: MindMapNode = {
      id: newNodeId,
      text: 'Nouvelle idée',
      x,
      y,
      level: parentNode.level + 1,
      parentId: selectedNode,
      color: parentNode.color,
      children: []
    };
    
    setCurrentMindMap({
      ...currentMindMap,
      nodes: [...currentMindMap.nodes, newNode],
      connections: [...currentMindMap.connections, { from: selectedNode, to: newNodeId }]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full mr-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX MindMap
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Générez des cartes mentales intelligentes avec l'IA pour organiser vos idées et stimuler votre créativité
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              <Brain className="w-4 h-4 mr-1" />
              IA Générative
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Network className="w-4 h-4 mr-1" />
              Mapping Intelligent
            </Badge>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">
              <Lightbulb className="w-4 h-4 mr-1" />
              Brainstorming
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Sparkles className="w-4 h-4 mr-1" />
              Créativité
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Nouveau MindMap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sujet principal</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Intelligence Artificielle"
                  />
                </div>
                
                <Button
                  onClick={generateMindMap}
                  disabled={!topic.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {currentMindMap && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Outils
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'edit' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('edit')}
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      variant={viewMode === 'view' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('view')}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  </div>
                  
                  {viewMode === 'edit' && (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNode}
                        disabled={!selectedNode}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter nœud
                      </Button>
                      
                      {selectedNode && (
                        <p className="text-xs text-gray-500">
                          Nœud sélectionné: {currentMindMap.nodes.find(n => n.id === selectedNode)?.text}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentMindMap && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nœuds totaux:</span>
                      <span className="font-medium">{currentMindMap.nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connexions:</span>
                      <span className="font-medium">{currentMindMap.connections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Niveaux:</span>
                      <span className="font-medium">{Math.max(...currentMindMap.nodes.map(n => n.level)) + 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                {currentMindMap ? (
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      onClick={handleCanvasClick}
                      className="border rounded-lg cursor-pointer bg-white"
                      style={{ width: '100%', height: 'auto', aspectRatio: '4/3' }}
                    />
                    
                    {selectedNode && viewMode === 'edit' && (
                      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg border">
                        <p className="text-xs text-gray-600 mb-2">Nœud sélectionné</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    <div className="text-center">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">Aucune carte mentale</p>
                      <p className="text-sm">Entrez un sujet et générez votre première carte mentale avec l'IA</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuvvixMindMap;
