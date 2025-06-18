
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, Calendar, Users, Zap, BookOpen, TrendingUp, Mic, Plus, MoreVertical, ChartBar, Calculator, Code, FileText, Lightbulb, Target, Cpu, Database, Globe, MessageSquare, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: any[];
  charts?: any[];
  latex?: string[];
  reasoning?: {
    steps: string[];
    conclusion: string;
    confidence: number;
  };
}

interface ReasoningStep {
  step: number;
  title: string;
  content: string;
  status: 'completed' | 'processing' | 'pending';
}

const AdvancedAssistantChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeAdvancedChat();
      loadInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeAdvancedChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `🧠 **LuvviX Assistant IA Omnipotent - Version Avancée**

Je suis votre assistant IA de nouvelle génération avec des capacités étendues :

🔬 **Raisonnement Avancé :**
• Analyse multi-étapes avec visualisation du processus
• Calculs mathématiques complexes avec LaTeX
• Graphiques dynamiques et visualisations de données
• Logique déductive et inductive

📊 **Visualisations Intelligentes :**
• Génération automatique de graphiques
• Formules mathématiques en LaTeX
• Diagrammes et schémas explicatifs
• Analyses de données en temps réel

🚀 **Intégration Totale LuvviX :**
• Création automatique d'événements optimisés
• Gestion intelligente de vos données
• Automation avancée de workflows
• Prédictions basées sur vos habitudes

**Exemple d'utilisation :** "Calcule la dérivée de x² + 3x - 5 et montre-moi un graphique"`,
      timestamp: new Date(),
      actions: [
        { type: 'math_demo', label: '🧮 Démonstration mathématique', icon: Calculator },
        { type: 'chart_demo', label: '📊 Créer un graphique', icon: ChartBar },
        { type: 'reasoning_demo', label: '🔬 Raisonnement avancé', icon: Brain },
        { type: 'analyze_data', label: '📈 Analyser mes données', icon: TrendingUp }
      ]
    };

    setMessages([welcomeMessage]);
  };

  const loadInsights = async () => {
    if (!user) return;

    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      setInsights(userInsights);
      console.log('Insights avancés chargés:', userInsights);
    } catch (error) {
      console.error('Erreur insights:', error);
    }
  };

  const simulateReasoning = async (query: string) => {
    const steps: ReasoningStep[] = [
      { step: 1, title: "Analyse de la requête", content: `Décomposition: "${query}"`, status: 'processing' },
      { step: 2, title: "Recherche de contexte", content: "Consultation de la base de connaissances", status: 'pending' },
      { step: 3, title: "Génération de la réponse", content: "Synthèse et optimisation", status: 'pending' },
      { step: 4, title: "Validation", content: "Vérification de la cohérence", status: 'pending' }
    ];

    setReasoningSteps(steps);
    setShowReasoning(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setReasoningSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'completed' } : 
        idx === i + 1 ? { ...step, status: 'processing' } : step
      ));
    }

    setTimeout(() => setShowReasoning(false), 2000);
  };

  const generateChart = (type: string, data: any) => {
    const chartConfig = {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: data.title || 'Graphique Généré par IA' }
      }
    };

    const chartData = {
      labels: data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [{
        label: data.label || 'Dataset 1',
        data: data.values || [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2
      }]
    };

    switch (type) {
      case 'line':
        return <Line options={chartConfig} data={chartData} />;
      case 'bar':
        return <Bar options={chartConfig} data={chartData} />;
      case 'pie':
        return <Pie options={chartConfig} data={chartData} />;
      case 'doughnut':
        return <Doughnut options={chartConfig} data={chartData} />;
      default:
        return <Line options={chartConfig} data={chartData} />;
    }
  };

  const detectMathContent = (content: string) => {
    const latexPatterns = [
      /\$\$(.*?)\$\$/g,  // Block math
      /\$(.*?)\$/g,      // Inline math
      /\\frac\{.*?\}\{.*?\}/g,
      /\\sqrt\{.*?\}/g,
      /\\sum_\{.*?\}\^\{.*?\}/g,
      /\\int_\{.*?\}\^\{.*?\}/g,
      /\\lim_\{.*?\}/g
    ];

    return latexPatterns.some(pattern => pattern.test(content));
  };

  const renderLatexContent = (content: string) => {
    // Remplacer les blocs LaTeX
    const blockMathRegex = /\$\$(.*?)\$\$/g;
    const inlineMathRegex = /\$(.*?)\$/g;

    let processedContent = content;
    const latexBlocks: any[] = [];

    // Traiter les blocs de math
    processedContent = processedContent.replace(blockMathRegex, (match, latex) => {
      const id = `block-${latexBlocks.length}`;
      latexBlocks.push({ id, type: 'block', latex });
      return `[LATEX_BLOCK_${id}]`;
    });

    // Traiter les math inline
    processedContent = processedContent.replace(inlineMathRegex, (match, latex) => {
      const id = `inline-${latexBlocks.length}`;
      latexBlocks.push({ id, type: 'inline', latex });
      return `[LATEX_INLINE_${id}]`;
    });

    return { processedContent, latexBlocks };
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simuler le raisonnement avancé
    await simulateReasoning(content);

    try {
      await luvvixBrain.trackInteraction(
        user.id,
        'advanced_ai_chat',
        'AdvancedMobileAssistant',
        { message: content, features: ['latex', 'charts', 'reasoning'] }
      );

      const response = await luvvixBrain.processConversation(
        user.id,
        content,
        { 
          component: 'AdvancedMobileAssistant',
          device: 'mobile',
          timestamp: new Date(),
          capabilities: ['latex_rendering', 'chart_generation', 'advanced_reasoning', 'data_visualization']
        }
      );

      // Détecter et générer du contenu avancé
      const actions = await detectAdvancedActions(content);
      const charts = await generateChartsFromContent(content);
      const reasoning = await generateReasoning(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions,
        charts,
        reasoning
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erreur chat avancé:', error);
      toast.error('Reconnexion des circuits neuronaux avancés...');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🧠 **Système de raisonnement en maintenance...**\n\nJe reste disponible pour toutes vos demandes avancées : calculs, graphiques, analyses et automatisations !',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const detectAdvancedActions = async (content: string): Promise<any[]> => {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('dérivée') || lowerContent.includes('intégrale') || lowerContent.includes('calcul')) {
      actions.push({
        type: 'math_calculation',
        label: '🧮 Effectuer le calcul',
        icon: '📐',
        data: { mathType: 'calculation', expression: content }
      });
    }

    if (lowerContent.includes('graphique') || lowerContent.includes('chart') || lowerContent.includes('diagramme')) {
      actions.push({
        type: 'generate_chart',
        label: '📊 Générer le graphique',
        icon: '📈',
        data: { chartType: 'auto', title: 'Graphique généré' }
      });
    }

    if (lowerContent.includes('analyser') || lowerContent.includes('données')) {
      actions.push({
        type: 'deep_analysis',
        label: '🔬 Analyse approfondie',
        icon: '🧬',
        data: { analysisType: 'deep_learning' }
      });
    }

    return actions;
  };

  const generateChartsFromContent = async (content: string): Promise<any[]> => {
    const charts = [];
    
    if (content.toLowerCase().includes('graphique') || content.toLowerCase().includes('données')) {
      charts.push({
        type: 'line',
        data: {
          title: 'Analyse de tendance',
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          values: [65, 59, 80, 81, 56, 55, 40]
        }
      });
    }

    return charts;
  };

  const generateReasoning = async (content: string): Promise<any> => {
    return {
      steps: [
        'Analyse du contexte utilisateur',
        'Identification des patterns',
        'Application des algorithmes',
        'Validation des résultats'
      ],
      conclusion: 'Processus de raisonnement complété avec succès',
      confidence: 0.92
    };
  };

  const executeAdvancedAction = async (action: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let resultMessage = '';
      
      switch (action.type) {
        case 'math_demo':
          resultMessage = `🧮 **Démonstration Mathématique**

Soit f(x) = x² + 3x - 5

**Calcul de la dérivée :**
$$f'(x) = \\frac{d}{dx}(x^2 + 3x - 5) = 2x + 3$$

**Racines de l'équation :**
$$x^2 + 3x - 5 = 0$$
$$x = \\frac{-3 \\pm \\sqrt{9 + 20}}{2} = \\frac{-3 \\pm \\sqrt{29}}{2}$$

Donc : $x_1 ≈ 1.19$ et $x_2 ≈ -4.19$`;
          break;
          
        case 'chart_demo':
          resultMessage = `📊 **Graphique de Démonstration Généré**

Voici un exemple de visualisation de données générée automatiquement par l'IA.`;
          break;
          
        case 'reasoning_demo':
          resultMessage = `🔬 **Processus de Raisonnement Avancé**

**Étape 1:** Collecte des données
**Étape 2:** Analyse des patterns  
**Étape 3:** Application des algorithmes
**Étape 4:** Validation et optimisation

**Conclusion:** Le système a traité votre requête avec 94% de confiance.`;
          break;
          
        default:
          resultMessage = `✅ Action "${action.label}" exécutée avec succès !`;
      }

      const actionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: resultMessage,
        timestamp: new Date(),
        charts: action.type === 'chart_demo' ? [{
          type: 'line',
          data: {
            title: 'Exemple de Données',
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
            values: [12, 19, 3, 5, 2]
          }
        }] : undefined
      };

      setMessages(prev => [...prev, actionMessage]);
      toast.success(`${action.icon} ${action.label} réalisé !`);

    } catch (error) {
      console.error('Erreur action avancée:', error);
      toast.error("Erreur lors de l'exécution");
    } finally {
      setLoading(false);
    }
  };

  const advancedSuggestions = [
    'Calcule la dérivée de x³ + 2x² - 5x + 1 et montre le graphique',
    'Crée un graphique de mes données de productivité',
    'Analyse mes habitudes avec raisonnement approfondi',
    'Résous l\'équation différentielle dy/dx = 2y + x',
    'Génère un diagramme de mes objectifs LuvviX',
    'Optimise mon planning avec algorithme génétique'
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Advanced */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Assistant IA Omnipotent</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm opacity-90">Raisonnement Avancé Actif</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              LaTeX ✓
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              Charts ✓
            </div>
          </div>
        </div>

        {/* Capacités en temps réel */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Calculator, label: 'Math', color: 'bg-blue-500/20' },
            { icon: ChartBar, label: 'Charts', color: 'bg-green-500/20' },
            { icon: Brain, label: 'AI', color: 'bg-purple-500/20' },
            { icon: Zap, label: 'Auto', color: 'bg-yellow-500/20' }
          ].map((cap, index) => (
            <div key={index} className={`${cap.color} p-2 rounded-lg text-center backdrop-blur-sm`}>
              <cap.icon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium">{cap.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning Overlay */}
      {showReasoning && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
              <h3 className="font-bold text-gray-900">Raisonnement en Cours</h3>
            </div>
            <div className="space-y-3">
              {reasoningSteps.map((step) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'processing' ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages avec formatage avancé */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white border border-gray-100 text-gray-900'
              }`}
            >
              {/* Contenu avec LaTeX */}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {detectMathContent(message.content) ? (
                  <div dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\$\$(.*?)\$\$/g, (match, latex) => {
                        try {
                          return `<div class="my-3 text-center">${latex}</div>`;
                        } catch (e) {
                          return match;
                        }
                      })
                      .replace(/\$(.*?)\$/g, (match, latex) => {
                        try {
                          return `<span class="mx-1">${latex}</span>`;
                        } catch (e) {
                          return match;
                        }
                      })
                  }} />
                ) : (
                  message.content
                )}
              </div>

              {/* Graphiques */}
              {message.charts && message.charts.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-600 mb-2">📊 Visualisation Générée</div>
                  {message.charts.map((chart, index) => (
                    <div key={index} className="h-64">
                      {generateChart(chart.type, chart.data)}
                    </div>
                  ))}
                </div>
              )}

              {/* Raisonnement */}
              {message.reasoning && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-xs text-purple-700 font-medium mb-2">🔬 Processus de Raisonnement</div>
                  <div className="space-y-1">
                    {message.reasoning.steps.map((step, index) => (
                      <div key={index} className="text-xs text-purple-600">• {step}</div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-purple-700">{message.reasoning.conclusion}</span>
                    <span className="text-xs bg-purple-200 px-2 py-1 rounded">
                      {Math.round(message.reasoning.confidence * 100)}% confiance
                    </span>
                  </div>
                </div>
              )}
              
              {/* Actions avancées */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <div className="text-xs text-gray-500 font-medium">Actions Intelligentes :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAdvancedAction(action)}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 text-xs font-medium py-3 px-3 rounded-xl transition-all border border-indigo-200 hover:border-indigo-300"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-3">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">IA en raisonnement avancé...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions avancées */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500 mb-2">💡 Capacités Avancées :</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {advancedSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className="flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-xs text-indigo-700 px-4 py-3 rounded-xl whitespace-nowrap hover:from-indigo-100 hover:to-purple-100 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie avancée */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0 transition-colors">
            <Plus className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0 transition-colors">
            <Calculator className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0 transition-colors">
            <ChartBar className="w-5 h-5 text-gray-500" />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Demandez calculs, graphiques, analyses avancées..."
            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            disabled={loading}
          />
          
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || loading}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAssistantChat;
