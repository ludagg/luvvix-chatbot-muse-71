
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Smartphone, 
  Cloud, 
  Shield, 
  Zap, 
  Users, 
  Code, 
  Database,
  Cpu,
  Globe,
  Lock,
  FileText,
  Bot,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  Network
} from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Brain,
  Smartphone,
  Cloud,
  Shield,
  Zap,
  Users,
  Code,
  Database,
  Cpu,
  Globe,
  Lock,
  FileText,
  Bot,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  Network
} as const;

// Enhanced node styles with better visibility
const nodeStyles = {
  core: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: '3px solid #4c51bf',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    minWidth: '200px',
    minHeight: '80px'
  },
  platform: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: '2px solid #e53e3e',
    borderRadius: '15px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '15px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    minWidth: '160px'
  },
  service: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    border: '2px solid #0ea5e9',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    padding: '12px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    minWidth: '140px'
  },
  feature: {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: 'white',
    border: '2px solid #10b981',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '500',
    padding: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '120px'
  },
  integration: {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: 'white',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '500',
    padding: '8px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    minWidth: '100px'
  }
};

// Custom node component with enhanced styling
const CustomNode = ({ data }: { data: any }) => {
  const IconComponent = iconMap[data.icon as keyof typeof iconMap];
  
  return (
    <div style={nodeStyles[data.type as keyof typeof nodeStyles]} className="flex flex-col items-center text-center">
      {IconComponent && <IconComponent className="h-6 w-6 mb-2" />}
      <div className="font-semibold">{data.label}</div>
      {data.description && (
        <div className="text-xs opacity-90 mt-1">{data.description}</div>
      )}
      {data.status && (
        <Badge className="mt-2 text-xs" variant={data.status === 'active' ? 'default' : 'secondary'}>
          {data.status}
        </Badge>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 500, y: 300 },
    data: { 
      label: 'LuvviX Ecosystem', 
      type: 'core',
      icon: 'Brain',
      description: 'Écosystème technologique unifié'
    },
    style: nodeStyles.core
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 200, y: 100 },
    data: { 
      label: 'LuvviX ID', 
      type: 'platform',
      icon: 'Shield',
      description: 'Authentification centralisée',
      status: 'active'
    },
    style: nodeStyles.platform
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 800, y: 100 },
    data: { 
      label: 'LuvviX Cloud', 
      type: 'platform',
      icon: 'Cloud',
      description: 'Stockage et synchronisation',
      status: 'active'
    },
    style: nodeStyles.platform
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 50, y: 300 },
    data: { 
      label: 'LuvviX AI Studio', 
      type: 'service',
      icon: 'Bot',
      description: 'Agents IA intelligents',
      status: 'active'
    },
    style: nodeStyles.service
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 950, y: 300 },
    data: { 
      label: 'LuvviX Forms', 
      type: 'service',
      icon: 'FileText',
      description: 'Formulaires dynamiques',
      status: 'active'
    },
    style: nodeStyles.service
  },
  {
    id: '6',
    type: 'custom',
    position: { x: 250, y: 500 },
    data: { 
      label: 'LuvviX Code Studio', 
      type: 'service',
      icon: 'Code',
      description: 'Développement IA avancé',
      status: 'active'
    },
    style: nodeStyles.service
  },
  {
    id: '7',
    type: 'custom',
    position: { x: 500, y: 500 },
    data: { 
      label: 'LuvviX Neural Nexus', 
      type: 'service',
      icon: 'Cpu',
      description: 'Assistant IA quantique',
      status: 'active'
    },
    style: nodeStyles.service
  },
  {
    id: '8',
    type: 'custom',
    position: { x: 750, y: 500 },
    data: { 
      label: 'LuvviX MindMap', 
      type: 'service',
      icon: 'Network',
      description: 'Cartes mentales IA',
      status: 'active'
    },
    style: nodeStyles.service
  },
  {
    id: '9',
    type: 'custom',
    position: { x: 100, y: 50 },
    data: { 
      label: 'Authentivix', 
      type: 'feature',
      icon: 'Lock',
      description: 'Biométrie WebAuthn'
    },
    style: nodeStyles.feature
  },
  {
    id: '10',
    type: 'custom',
    position: { x: 300, y: 50 },
    data: { 
      label: 'OAuth 2.0', 
      type: 'feature',
      icon: 'Shield',
      description: 'Connexion sécurisée'
    },
    style: nodeStyles.feature
  },
  {
    id: '11',
    type: 'custom',
    position: { x: 700, y: 50 },
    data: { 
      label: 'API REST', 
      type: 'feature',
      icon: 'Globe',
      description: 'Interface programmable'
    },
    style: nodeStyles.feature
  },
  {
    id: '12',
    type: 'custom',
    position: { x: 900, y: 50 },
    data: { 
      label: 'Chiffrement', 
      type: 'feature',
      icon: 'Lock',
      description: 'Données sécurisées'
    },
    style: nodeStyles.feature
  },
  {
    id: '13',
    type: 'custom',
    position: { x: 150, y: 650 },
    data: { 
      label: 'Gemini AI', 
      type: 'integration',
      icon: 'Sparkles',
      description: 'IA générative'
    },
    style: nodeStyles.integration
  },
  {
    id: '14',
    type: 'custom',
    position: { x: 350, y: 650 },
    data: { 
      label: 'Supabase', 
      type: 'integration',
      icon: 'Database',
      description: 'Backend as a Service'
    },
    style: nodeStyles.integration
  },
  {
    id: '15',
    type: 'custom',
    position: { x: 550, y: 650 },
    data: { 
      label: 'WebAuthn', 
      type: 'integration',
      icon: 'Shield',
      description: 'Standard biométrique'
    },
    style: nodeStyles.integration
  },
  {
    id: '16',
    type: 'custom',
    position: { x: 750, y: 650 },
    data: { 
      label: 'Analytics', 
      type: 'integration',
      icon: 'BarChart3',
      description: 'Métriques temps réel'
    },
    style: nodeStyles.integration
  }
];

const initialEdges: Edge[] = [
  // Core connections avec des styles améliorés
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-4', 
    source: '1', 
    target: '4', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-5', 
    source: '1', 
    target: '5', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-6', 
    source: '1', 
    target: '6', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-7', 
    source: '1', 
    target: '7', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  { 
    id: 'e1-8', 
    source: '1', 
    target: '8', 
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' }
  },
  
  // Feature connections
  { 
    id: 'e2-9', 
    source: '2', 
    target: '9',
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' }
  },
  { 
    id: 'e2-10', 
    source: '2', 
    target: '10',
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' }
  },
  { 
    id: 'e3-11', 
    source: '3', 
    target: '11',
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' }
  },
  { 
    id: 'e3-12', 
    source: '3', 
    target: '12',
    style: { stroke: '#f093fb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' }
  },
  
  // Integration connections
  { 
    id: 'e6-13', 
    source: '6', 
    target: '13',
    style: { stroke: '#4facfe', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' }
  },
  { 
    id: 'e7-13', 
    source: '7', 
    target: '13',
    style: { stroke: '#4facfe', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' }
  },
  { 
    id: 'e1-14', 
    source: '1', 
    target: '14',
    style: { stroke: '#43e97b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#43e97b' }
  },
  { 
    id: 'e9-15', 
    source: '9', 
    target: '15',
    style: { stroke: '#fa709a', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fa709a' }
  },
  { 
    id: 'e8-16', 
    source: '8', 
    target: '16',
    style: { stroke: '#4facfe', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' }
  }
];

const LuvvixMindMap: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAnimated, setIsAnimated] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toggleAnimation = () => {
    setIsAnimated(!isAnimated);
    setEdges(edges => 
      edges.map(edge => ({
        ...edge,
        animated: !isAnimated
      }))
    );
  };

  const resetLayout = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              LuvviX Mind Map
            </h1>
          </div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Visualisation interactive de l'écosystème technologique LuvviX avec tous ses composants et intégrations
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contrôles de la Mind Map
            </CardTitle>
            <CardDescription className="text-purple-200">
              Explorez les connexions et interactions entre les composants de l'écosystème
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={toggleAnimation}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isAnimated ? 'Désactiver' : 'Activer'} animations
              </Button>
              <Button
                onClick={resetLayout}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-purple-600">Core: Composants principaux</Badge>
                <Badge className="bg-pink-600">Platform: Plateformes</Badge>
                <Badge className="bg-blue-600">Service: Services</Badge>
                <Badge className="bg-green-600">Feature: Fonctionnalités</Badge>
                <Badge className="bg-orange-600">Integration: Intégrations</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-[800px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/20 shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="rounded-xl"
          >
            <Background 
              color="#ffffff" 
              gap={20} 
              size={1}
              variant={BackgroundVariant.Dots}
              style={{ opacity: 0.1 }}
            />
            <Controls className="bg-white/10 backdrop-blur-lg border-white/20 [&>button]:bg-white/10 [&>button]:text-white [&>button]:border-white/20 [&>button]:hover:bg-white/20" />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.data.type) {
                  case 'core': return '#667eea';
                  case 'platform': return '#f093fb';
                  case 'service': return '#4facfe';
                  case 'feature': return '#43e97b';
                  case 'integration': return '#fa709a';
                  default: return '#667eea';
                }
              }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
            />
            <Panel position="top-right" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              <div className="text-white">
                <h3 className="font-semibold mb-2">Légende</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Écosystème central</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span>Plateformes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Fonctionnalités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Intégrations</span>
                  </div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default LuvvixMindMap;
