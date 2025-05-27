
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
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GeneratedCode {
  code: string;
  explanation: string;
  language: string;
  complexity: number;
}

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'scala'
];

const CodeStudio: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
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
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/groq-generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          language: selectedLanguage,
          context: code || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du code');
      }

      const result = await response.json();
      if (result.success && result.generated) {
        setGeneratedCode(result.generated);
        toast({
          title: "Code généré",
          description: "Le code a été généré avec succès par Groq AI"
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
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
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/groq-optimize-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'optimisation du code');
      }

      const result = await response.json();
      if (result.success && result.optimized) {
        setGeneratedCode(result.optimized);
        toast({
          title: "Code optimisé",
          description: "Le code a été optimisé avec succès par Groq AI"
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'cs': 'csharp',
          'go': 'go',
          'rs': 'rust',
          'php': 'php',
          'rb': 'ruby',
          'swift': 'swift',
          'kt': 'kotlin',
          'dart': 'dart',
          'scala': 'scala'
        };
        
        if (extension && languageMap[extension]) {
          setSelectedLanguage(languageMap[extension]);
        }
        
        toast({
          title: "Fichier chargé",
          description: `${file.name} a été chargé avec succès`
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
            Studio de développement IA révolutionnaire avec génération intelligente et optimisation de code alimenté par Groq AI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générateur
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimiseur
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
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                Alimenté par Groq AI
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".js,.ts,.py,.java,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.dart,.scala"
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
                    Décrivez ce que vous voulez créer et laissez Groq AI générer du code production-ready ultra-rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Créez une fonction pour trier un tableau d'objets par date en JavaScript..."
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
                      <span>Code Généré</span>
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
                          onClick={() => downloadCode(generatedCode.code, `generated.${selectedLanguage}`)}
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
                    Améliorez les performances, la lisibilité et l'efficacité de votre code avec Groq AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Code ${selectedLanguage} à optimiser...`}
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
                      <span>Code Optimisé</span>
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
                          onClick={() => downloadCode(generatedCode.code, `optimized.${selectedLanguage}`)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default CodeStudio;
