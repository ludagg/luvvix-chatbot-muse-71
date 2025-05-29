import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Play, 
  Download, 
  Upload, 
  Zap, 
  Sparkles,
  Copy,
  Loader2,
  Bug,
  BarChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedCode {
  code: string;
  explanation: string;
  language: string;
  complexity: number;
}

interface CodeAnalysis {
  complexity: number;
  performance: number;
  security: number;
  maintainability: number;
  bugs: Array<{
    line: number;
    severity: string;
    message: string;
    suggestion: string;
  }>;
  optimizations: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extensions: ['.js'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts'] },
  { value: 'python', label: 'Python', extensions: ['.py'] },
  { value: 'java', label: 'Java', extensions: ['.java'] },
  { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
  { value: 'csharp', label: 'C#', extensions: ['.cs'] },
  { value: 'go', label: 'Go', extensions: ['.go'] },
  { value: 'rust', label: 'Rust', extensions: ['.rs'] },
  { value: 'php', label: 'PHP', extensions: ['.php'] },
  { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { value: 'swift', label: 'Swift', extensions: ['.swift'] },
  { value: 'kotlin', label: 'Kotlin', extensions: ['.kt'] },
  { value: 'dart', label: 'Dart', extensions: ['.dart'] },
  { value: 'scala', label: 'Scala', extensions: ['.scala'] },
  { value: 'r', label: 'R', extensions: ['.r', '.R'] },
  { value: 'julia', label: 'Julia', extensions: ['.jl'] },
  { value: 'perl', label: 'Perl', extensions: ['.pl'] },
  { value: 'lua', label: 'Lua', extensions: ['.lua'] },
  { value: 'haskell', label: 'Haskell', extensions: ['.hs'] },
  { value: 'sql', label: 'SQL', extensions: ['.sql'] }
];

const CodeStudio: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt requis",
        description: "Veuillez décrire le code que vous souhaitez générer"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-generate-code', {
        body: {
          prompt,
          language: selectedLanguage,
          context: code || undefined
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.generated) {
        setGeneratedCode(data.generated);
        toast({
          title: "Code généré",
          description: `Code ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} généré avec succès`
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur de génération:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le code. Vérifiez votre connexion."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeCode = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez entrer du code à optimiser"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-optimize-code', {
        body: {
          code,
          language: selectedLanguage
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.optimized) {
        setGeneratedCode(data.optimized);
        toast({
          title: "Code optimisé",
          description: `Code ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} optimisé avec succès`
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur d\'optimisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser le code. Vérifiez votre connexion."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez entrer du code à analyser"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-analyze-code', {
        body: {
          code,
          language: selectedLanguage
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.analysis) {
        setCodeAnalysis(data.analysis);
        toast({
          title: "Code analysé",
          description: `Analyse du code ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} effectuée avec succès`
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: "Impossible d'analyser le code. Vérifiez votre connexion."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        const detectedLanguage = SUPPORTED_LANGUAGES.find(lang => 
          lang.extensions.includes(extension)
        );
        
        if (detectedLanguage) {
          setSelectedLanguage(detectedLanguage.value);
        }
        
        toast({
          title: "Fichier chargé",
          description: `${file.name} a été chargé avec succès${detectedLanguage ? ` (${detectedLanguage.label} détecté)` : ''}`
        });
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le code a été copié dans le presse-papiers"
    });
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement",
      description: `${filename} a été téléchargé`
    });
  };

  const getFileExtension = (language: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.value === language);
    return lang?.extensions[0] || '.txt';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LuvviX Code Studio
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Studio de développement IA révolutionnaire avec génération intelligente et optimisation de code multi-langages alimenté par Gemini AI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générateur
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimiseur
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Analyseur
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Langage" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                Alimenté par Gemini AI
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={SUPPORTED_LANGUAGES.flatMap(lang => lang.extensions).join(',')}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Charger fichier
              </Button>
            </div>
          </div>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Génération de Code IA
                  </CardTitle>
                  <CardDescription>
                    Décrivez ce que vous voulez créer et laissez Gemini AI générer du code dans le langage de votre choix
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Ex: Créez une fonction pour trier un tableau d'objets par date en ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label}...`}
                    className="min-h-32"
                  />
                  <Button 
                    onClick={generateCode}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Générer le Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedCode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Code Généré ({SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label})</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedCode.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCode(generatedCode.code, `generated${getFileExtension(selectedLanguage)}`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                        <code>{generatedCode.code}</code>
                      </pre>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Explication:</h4>
                      <p className="text-blue-800 text-sm">{generatedCode.explanation}</p>
                    </div>
                    
                    <Badge className="text-purple-700">
                      Complexité: {generatedCode.complexity}/10
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Optimisation de Code
                  </CardTitle>
                  <CardDescription>
                    Améliorez les performances, la lisibilité et l'efficacité de votre code {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} avec Gemini AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Code ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} à optimiser...`}
                    className="min-h-48 font-mono"
                  />
                  <Button 
                    onClick={optimizeCode}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Optimisation en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Optimiser le Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedCode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Code Optimisé ({SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label})</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedCode.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCode(generatedCode.code, `optimized${getFileExtension(selectedLanguage)}`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                        <code>{generatedCode.code}</code>
                      </pre>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Optimisations:</h4>
                      <p className="text-green-800 text-sm">{generatedCode.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-600" />
                    Analyse de Code
                  </CardTitle>
                  <CardDescription>
                    Analysez votre code {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} pour détecter les bugs, problèmes de sécurité et optimisations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Code ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} à analyser...`}
                    className="min-h-48 font-mono"
                  />
                  <Button 
                    onClick={analyzeCode}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Bug className="h-4 w-4 mr-2" />
                        Analyser le Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {codeAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Résultats d'Analyse ({SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{codeAnalysis.complexity}/10</div>
                        <div className="text-sm text-blue-800">Complexité</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{codeAnalysis.performance}%</div>
                        <div className="text-sm text-green-800">Performance</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{codeAnalysis.security}%</div>
                        <div className="text-sm text-yellow-800">Sécurité</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{codeAnalysis.maintainability}%</div>
                        <div className="text-sm text-purple-800">Maintenabilité</div>
                      </div>
                    </div>

                    {codeAnalysis.bugs && codeAnalysis.bugs.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Bugs détectés:</h4>
                        <div className="space-y-2">
                          {codeAnalysis.bugs.map((bug, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium text-red-700">Ligne {bug.line}:</span>
                              <span className="ml-2 text-red-600">{bug.message}</span>
                              <div className="text-red-500 text-xs mt-1">💡 {bug.suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {codeAnalysis.optimizations && codeAnalysis.optimizations.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900 mb-2">Optimisations suggérées:</h4>
                        <div className="space-y-2">
                          {codeAnalysis.optimizations.map((opt, index) => (
                            <div key={index} className="text-sm">
                              <Badge variant="outline" className="mr-2 text-xs">
                                {opt.type}
                              </Badge>
                              <span className="text-orange-700">{opt.description}</span>
                              <div className="text-orange-600 text-xs">Impact: {opt.impact}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodeStudio;
