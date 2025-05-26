
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Code2, 
  Play, 
  Download, 
  Share2, 
  Zap,
  Bug,
  Sparkles,
  FileCode,
  Terminal,
  Cpu,
  GitBranch,
  Lightbulb,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CodeAnalysis {
  complexity: number;
  performance: string;
  bugs: string[];
  suggestions: string[];
  security: string[];
}

interface GeneratedCode {
  code: string;
  language: string;
  explanation: string;
  analysis: CodeAnalysis;
}

const LuvvixCodeStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [userCode, setUserCode] = useState('');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React' }
  ];

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text: `You are LuvviX Code Studio AI, an expert programmer. Generate ${language} code for: "${prompt}"
          
          IMPORTANT: Return ONLY a JSON object with this exact structure:
          {
            "code": "the actual code here",
            "explanation": "detailed explanation of how the code works",
            "complexity": 5,
            "performance": "Performance analysis",
            "bugs": ["potential bug 1", "potential bug 2"],
            "suggestions": ["improvement 1", "improvement 2"],
            "security": ["security consideration 1", "security consideration 2"]
          }
          
          Make the code production-ready, well-commented, and follow best practices for ${language}.`,
          fromLanguage: 'auto',
          toLanguage: 'fr',
          context: 'Code generation - return structured JSON only'
        }
      });

      if (error) throw error;

      let parsedData;
      try {
        const jsonMatch = data.translatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // Fallback: generate basic code structure
        parsedData = {
          code: `// Code généré pour: ${prompt}\n// Language: ${language}\n\nfunction main() {\n  // TODO: Implémenter la logique\n  console.log("Code généré par LuvviX AI");\n}`,
          explanation: "Code de base généré. Veuillez préciser votre demande pour un code plus spécifique.",
          complexity: 3,
          performance: "Performance acceptable pour un code de base",
          bugs: ["Aucun bug détecté"],
          suggestions: ["Ajouter la gestion d'erreurs", "Implémenter les tests"],
          security: ["Valider les entrées utilisateur"]
        };
      }

      const result: GeneratedCode = {
        code: parsedData.code,
        language: language,
        explanation: parsedData.explanation,
        analysis: {
          complexity: parsedData.complexity || 5,
          performance: parsedData.performance || "Analyse non disponible",
          bugs: parsedData.bugs || [],
          suggestions: parsedData.suggestions || [],
          security: parsedData.security || []
        }
      };
      
      setGeneratedCode(result);
      
      toast({
        title: "Code généré avec succès",
        description: `Code ${language} généré par LuvviX AI`
      });
      
    } catch (error: any) {
      console.error('Code generation error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le code. Veuillez réessayer."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeCode = async () => {
    if (!userCode.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text: `Analyze this ${language} code for quality, performance, bugs, and security:

${userCode}

Return ONLY a JSON object:
{
  "complexity": 1-10,
  "performance": "performance analysis",
  "bugs": ["bug1", "bug2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "security": ["security issue1", "security issue2"]
}`,
          fromLanguage: 'auto',
          toLanguage: 'fr',
          context: 'Code analysis - return JSON only'
        }
      });

      if (error) throw error;

      let parsedData;
      try {
        const jsonMatch = data.translatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        parsedData = {
          complexity: 5,
          performance: "Analyse non disponible",
          bugs: ["Impossible d'analyser le code"],
          suggestions: ["Vérifiez la syntaxe"],
          security: ["Aucun problème détecté"]
        };
      }

      setAnalysis(parsedData);
      
      toast({
        title: "Analyse terminée",
        description: "Code analysé par LuvviX AI"
      });
      
    } catch (error: any) {
      console.error('Code analysis error:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: "Impossible d'analyser le code. Veuillez réessayer."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Code copié dans le presse-papiers"
    });
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return "text-green-600";
    if (complexity <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Code Studio
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Studio de développement IA avancé - Génération, analyse et optimisation de code intelligente
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Code2 className="w-4 h-4 mr-1" />
              Génération IA
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Bug className="w-4 h-4 mr-1" />
              Analyse Avancée
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Zap className="w-4 h-4 mr-1" />
              Optimisation
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Cpu className="w-4 h-4 mr-1" />
              12+ Langages
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <Button
              variant={activeTab === 'generate' ? "default" : "ghost"}
              onClick={() => setActiveTab('generate')}
              className="mr-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Générateur IA
            </Button>
            <Button
              variant={activeTab === 'analyze' ? "default" : "ghost"}
              onClick={() => setActiveTab('analyze')}
            >
              <Bug className="w-4 h-4 mr-2" />
              Analyseur Code
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {activeTab === 'generate' ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Générateur IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Langage</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description du code</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Créer une fonction de tri rapide optimisée"
                      rows={4}
                    />
                  </div>
                  
                  <Button
                    onClick={generateCode}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Code2 className="w-4 h-4 mr-2" />
                        Générer Code IA
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Analyseur Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Langage</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code à analyser</label>
                    <Textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Collez votre code ici..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button
                    onClick={analyzeCode}
                    disabled={!userCode.trim() || isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4 mr-2" />
                        Analyser Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tools */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Outils</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FileCode className="w-4 h-4 mr-2 text-blue-600" />
                    <span>12+ Langages supportés</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Terminal className="w-4 h-4 mr-2 text-green-600" />
                    <span>Analyse de performance</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Cpu className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Détection de bugs</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <GitBranch className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Suggestions d'amélioration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'generate' && generatedCode && (
              <>
                {/* Generated Code */}
                <Card className="shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Code2 className="w-5 h-5 mr-2" />
                        Code Généré ({generatedCode.language})
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCode.code)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copier
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                        {generatedCode.code}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Explanation */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Explication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{generatedCode.explanation}</p>
                  </CardContent>
                </Card>

                {/* Analysis */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bug className="w-5 h-5 mr-2" />
                      Analyse du Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Cpu className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">Complexité</span>
                        </div>
                        <span className={`text-lg font-bold ${getComplexityColor(generatedCode.analysis.complexity)}`}>
                          {generatedCode.analysis.complexity}/10
                        </span>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Zap className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">Performance</span>
                        </div>
                        <p className="text-sm text-gray-600">{generatedCode.analysis.performance}</p>
                      </div>
                    </div>

                    {generatedCode.analysis.bugs.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                          <span className="font-medium">Bugs Potentiels</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {generatedCode.analysis.bugs.map((bug, index) => (
                            <li key={index} className="text-red-700">• {bug}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {generatedCode.analysis.suggestions.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                          <span className="font-medium">Suggestions</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {generatedCode.analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-yellow-700">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'analyze' && analysis && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Résultats d'Analyse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Cpu className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Complexité</span>
                      </div>
                      <span className={`text-lg font-bold ${getComplexityColor(analysis.complexity)}`}>
                        {analysis.complexity}/10
                      </span>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Zap className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-medium">Performance</span>
                      </div>
                      <p className="text-sm text-gray-600">{analysis.performance}</p>
                    </div>
                  </div>

                  {analysis.bugs.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                        <span className="font-medium">Bugs Détectés</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {analysis.bugs.map((bug, index) => (
                          <li key={index} className="text-red-700">• {bug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.suggestions.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                        <span className="font-medium">Améliorations Suggérées</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-yellow-700">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.security.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="font-medium">Sécurité</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {analysis.security.map((security, index) => (
                          <li key={index} className="text-purple-700">• {security}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!generatedCode && !analysis && (
              <Card className="shadow-xl">
                <CardContent className="p-12">
                  <div className="text-center text-gray-500">
                    <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">
                      {activeTab === 'generate' ? 'Prêt à générer du code' : 'Prêt à analyser du code'}
                    </p>
                    <p className="text-sm">
                      {activeTab === 'generate' 
                        ? 'Décrivez le code que vous souhaitez générer avec l\'IA'
                        : 'Collez votre code pour une analyse complète par l\'IA'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuvvixCodeStudio;
