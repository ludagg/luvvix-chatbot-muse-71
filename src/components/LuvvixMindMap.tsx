
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
  const svgRef = useRef<SVGSVGElement>(null);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const generateMindMap = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text: `Create a comprehensive mind map structure for: "${topic}". 
          
          Return ONLY a JSON object with this exact structure:
          {
            "title": "${topic}",
            "mainBranches": [
              {
                "name": "Branch Name",
                "subBranches": ["Sub 1", "Sub 2", "Sub 3"]
              }
            ]
          }
          
          Generate 5-6 main branches with 2-4 sub-branches each.`,
          fromLanguage: 'auto',
          toLanguage: 'fr',
          context: 'Mind mapping - return structured JSON only'
        }
      });

      if (error) throw error;

      let parsedData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.translatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback: create structure manually
        parsedData = {
          title: topic,
          mainBranches: [
            { name: "Définition", subBranches: ["Concepts", "Principes", "Bases"] },
            { name: "Applications", subBranches: ["Pratique", "Exemples", "Cas d'usage"] },
            { name: "Avantages", subBranches: ["Bénéfices", "Efficacité", "Innovation"] },
            { name: "Défis", subBranches: ["Obstacles", "Limitations", "Solutions"] },
            { name: "Futur", subBranches: ["Tendances", "Évolutions", "Perspectives"] }
          ]
        };
      }

      const mindMapNodes = createMindMapFromData(parsedData, topic);
      
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

  const createMindMapFromData = (data: any, mainTopic: string): MindMapNode[] => {
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
    
    // Main branches
    const mainBranches = data.mainBranches || [];
    mainBranches.forEach((branch: any, index: number) => {
      const angle = (index * (360 / mainBranches.length)) * (Math.PI / 180);
      const radius = 180;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const branchId = `branch-${index}`;
      nodes.push({
        id: branchId,
        text: branch.name,
        x,
        y,
        level: 1,
        parentId: 'center',
        color: colors[index + 1] || colors[index % colors.length],
        children: []
      });
      
      // Sub-branches
      const subBranches = branch.subBranches || [];
      subBranches.forEach((subBranch: string, subIndex: number) => {
        const subAngle = angle + (subIndex - (subBranches.length - 1) / 2) * 0.4;
        const subRadius = 100;
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

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 pt-20">
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
          </div>

          {/* SVG Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                {currentMindMap ? (
                  <div className="relative">
                    <svg
                      ref={svgRef}
                      width="100%"
                      height="600"
                      viewBox="0 0 800 600"
                      className="border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
                    >
                      {/* Connections */}
                      <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      
                      {currentMindMap.connections.map((connection, index) => {
                        const fromNode = currentMindMap.nodes.find(n => n.id === connection.from);
                        const toNode = currentMindMap.nodes.find(n => n.id === connection.to);
                        
                        if (!fromNode || !toNode) return null;
                        
                        return (
                          <line
                            key={index}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="url(#connectionGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        );
                      })}
                      
                      {/* Nodes */}
                      {currentMindMap.nodes.map((node) => {
                        const isSelected = selectedNode === node.id;
                        const radius = node.level === 0 ? 50 : node.level === 1 ? 35 : 25;
                        
                        return (
                          <g key={node.id}>
                            {/* Node shadow */}
                            <circle
                              cx={node.x + 2}
                              cy={node.y + 2}
                              r={radius}
                              fill="rgba(0,0,0,0.1)"
                            />
                            
                            {/* Node circle */}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={radius}
                              fill={node.color}
                              stroke={isSelected ? "#FFD700" : "white"}
                              strokeWidth={isSelected ? 4 : 2}
                              className="cursor-pointer hover:brightness-110 transition-all"
                              onClick={() => handleNodeClick(node.id)}
                            />
                            
                            {/* Node text */}
                            <text
                              x={node.x}
                              y={node.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize={node.level === 0 ? 14 : node.level === 1 ? 12 : 10}
                              fontWeight="bold"
                              className="pointer-events-none select-none"
                            >
                              {node.text.length > 15 ? node.text.substring(0, 15) + '...' : node.text}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
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
