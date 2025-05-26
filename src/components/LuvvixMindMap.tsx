
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download, Share2, Zap, Brain, Network, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  level: number;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
}

const LuvvixMindMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([
    {
      id: '1',
      text: 'LuvviX Ecosystem',
      x: 400,
      y: 300,
      color: '#8B5CF6',
      level: 0,
      connections: ['2', '3', '4', '5']
    },
    {
      id: '2',
      text: 'LuvviX AI',
      x: 200,
      y: 150,
      color: '#06B6D4',
      level: 1,
      connections: ['6', '7']
    },
    {
      id: '3',
      text: 'LuvviX Cloud',
      x: 600,
      y: 150,
      color: '#10B981',
      level: 1,
      connections: ['8', '9']
    },
    {
      id: '4',
      text: 'LuvviX Forms',
      x: 200,
      y: 450,
      color: '#F59E0B',
      level: 1,
      connections: ['10']
    },
    {
      id: '5',
      text: 'LuvviX News',
      x: 600,
      y: 450,
      color: '#EF4444',
      level: 1,
      connections: ['11']
    },
    {
      id: '6',
      text: 'Agents IA',
      x: 100,
      y: 80,
      color: '#06B6D4',
      level: 2,
      connections: []
    },
    {
      id: '7',
      text: 'Chat Intelligence',
      x: 300,
      y: 80,
      color: '#06B6D4',
      level: 2,
      connections: []
    },
    {
      id: '8',
      text: 'Stockage IPFS',
      x: 500,
      y: 80,
      color: '#10B981',
      level: 2,
      connections: []
    },
    {
      id: '9',
      text: 'Chiffrement',
      x: 700,
      y: 80,
      color: '#10B981',
      level: 2,
      connections: []
    },
    {
      id: '10',
      text: 'Formulaires Intelligents',
      x: 100,
      y: 520,
      color: '#F59E0B',
      level: 2,
      connections: []
    },
    {
      id: '11',
      text: 'Actualités Personnalisées',
      x: 700,
      y: 520,
      color: '#EF4444',
      level: 2,
      connections: []
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNodeText, setNewNodeText] = useState('');
  const [newNodeDescription, setNewNodeDescription] = useState('');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B'];

  useEffect(() => {
    drawMindMap();
  }, [nodes]);

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections first (behind nodes)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (targetNode) {
          // Add glow effect to connections
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          
          // Create curved connection
          const midX = (node.x + targetNode.x) / 2;
          const midY = (node.y + targetNode.y) / 2;
          const offsetY = node.level === targetNode.level ? 0 : -50;
          
          ctx.quadraticCurveTo(midX, midY + offsetY, targetNode.x, targetNode.y);
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        }
      });
    });

    ctx.setLineDash([]);

    // Draw nodes
    nodes.forEach(node => {
      const radius = node.level === 0 ? 80 : 60;
      
      // Node shadow/glow
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 20;
      
      // Node background with gradient
      const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
      nodeGradient.addColorStop(0, node.color);
      nodeGradient.addColorStop(1, node.color + '80');
      
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Node border
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // Node text
      ctx.fillStyle = '#ffffff';
      ctx.font = node.level === 0 ? 'bold 16px Arial' : 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Multi-line text for long labels
      const words = node.text.split(' ');
      const maxWidth = radius * 1.5;
      let line = '';
      let y = node.y;
      
      if (words.length > 2) {
        y = node.y - 10;
      }
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, node.x, y);
          line = words[n] + ' ';
          y += 16;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const radius = node.level === 0 ? 80 : 60;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      toast({
        title: "Nœud sélectionné",
        description: `${clickedNode.text} - Niveau ${clickedNode.level}`,
      });
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const radius = node.level === 0 ? 80 : 60;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode.id);
      setDragOffset({
        x: x - clickedNode.x,
        y: y - clickedNode.y
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setNodes(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const addNode = () => {
    if (!newNodeText.trim()) return;

    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: newNodeText,
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      level: selectedNode ? selectedNode.level + 1 : 1,
      connections: []
    };

    if (selectedNode) {
      setNodes(prev => prev.map(node => 
        node.id === selectedNode.id 
          ? { ...node, connections: [...node.connections, newNode.id] }
          : node
      ).concat(newNode));
    } else {
      setNodes(prev => [...prev, newNode]);
    }

    setNewNodeText('');
    setNewNodeDescription('');
    setIsDialogOpen(false);
    
    toast({
      title: "Nouveau nœud ajouté",
      description: `"${newNodeText}" a été ajouté à la carte mentale`,
    });
  };

  const exportMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'luvvix-mindmap.png';
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Carte mentale exportée",
      description: "L'image a été téléchargée avec succès",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Brain className="h-10 w-10 text-purple-400" />
              LuvviX MindMap
              <Sparkles className="h-10 w-10 text-pink-400" />
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Visualisez et explorez l'écosystème LuvviX de manière interactive
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un nœud
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Créer un nouveau nœud</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nom du nœud"
                      value={newNodeText}
                      onChange={(e) => setNewNodeText(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Textarea
                      placeholder="Description (optionnel)"
                      value={newNodeDescription}
                      onChange={(e) => setNewNodeDescription(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={addNode} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Zap className="w-4 h-4 mr-2" />
                      Créer le nœud
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={exportMindMap} variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>

              <Button variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            {selectedNode && (
              <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Nœud sélectionné: {selectedNode.text}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" style={{ backgroundColor: selectedNode.color + '40', color: selectedNode.color }}>
                    Niveau {selectedNode.level}
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-500">
                    {selectedNode.connections.length} connexions
                  </Badge>
                </div>
              </div>
            )}

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-auto border border-white/20 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 cursor-crosshair shadow-2xl"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
              
              <div className="absolute top-4 left-4 bg-black/30 backdrop-blur rounded-lg p-3">
                <p className="text-white text-sm font-medium">💡 Astuce</p>
                <p className="text-gray-300 text-xs">Cliquez pour sélectionner, glissez pour déplacer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">🎯 Fonctionnalités</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Glisser-déposer interactif</li>
                    <li>• Connexions dynamiques</li>
                    <li>• Export haute qualité</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">🌟 Statistiques</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• {nodes.length} nœuds total</li>
                    <li>• {nodes.filter(n => n.level === 0).length} nœud central</li>
                    <li>• {nodes.filter(n => n.level === 1).length} branches principales</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">🚀 Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full text-xs border-purple-400 text-purple-400">
                      Réorganiser
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-xs border-pink-400 text-pink-400">
                      Thème personnalisé
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LuvvixMindMap;
