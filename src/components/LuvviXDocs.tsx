
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Upload, 
  Download, 
  Sparkles,
  Copy,
  Loader2,
  Book,
  Code,
  Layers,
  Zap,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Documentation {
  id: string;
  title: string;
  content: string;
  format: string;
  sections: DocumentSection[];
  createdAt: string;
  projectName: string;
}

interface DocumentSection {
  title: string;
  content: string;
  type: 'introduction' | 'installation' | 'usage' | 'api' | 'examples' | 'troubleshooting';
}

const DOC_FORMATS = [
  { value: 'markdown', label: 'Markdown (.md)', icon: FileText },
  { value: 'html', label: 'HTML', icon: Code },
  { value: 'pdf', label: 'PDF', icon: Book },
  { value: 'confluence', label: 'Confluence', icon: Layers }
];

const DOC_TYPES = [
  'API Documentation',
  'User Guide',
  'Developer Guide',
  'Installation Guide',
  'Troubleshooting Guide',
  'Architecture Documentation',
  'Component Library',
  'Configuration Guide'
];

const LuvviXDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('markdown');
  const [selectedType, setSelectedType] = useState('API Documentation');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [codeBase, setCodeBase] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState<Documentation[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateDocumentation = async () => {
    if (!projectName.trim() || !projectDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Informations manquantes",
        description: "Veuillez remplir le nom et la description du projet"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/functions/v1/ai-docs-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          projectDescription,
          codeBase: codeBase || undefined,
          documentationType: selectedType,
          format: selectedFormat
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la documentation');
      }

      const result = await response.json();
      if (result.success && result.documentation) {
        const newDoc: Documentation = {
          id: crypto.randomUUID(),
          title: result.documentation.title,
          content: result.documentation.content,
          format: selectedFormat,
          sections: result.documentation.sections || [],
          createdAt: new Date().toISOString(),
          projectName
        };
        
        setGeneratedDocs(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
        toast({
          title: "Documentation générée",
          description: "La documentation a été créée avec succès par l'IA"
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur de génération:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer la documentation. Réessayez plus tard."
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
        setCodeBase(content);
        toast({
          title: "Fichier chargé",
          description: `${file.name} a été analysé pour la génération`
        });
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le contenu a été copié dans le presse-papiers"
    });
  };

  const downloadDocumentation = (doc: Documentation) => {
    const extension = doc.format === 'markdown' ? 'md' : doc.format;
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.projectName.toLowerCase().replace(/\s+/g, '-')}-docs.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement",
      description: `Documentation téléchargée au format ${doc.format.toUpperCase()}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Docs
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générateur de documentation automatique alimenté par l'IA. Créez une documentation professionnelle en quelques secondes
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">Génération IA Instantanée</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Multi-Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium">Analyse de Code</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générateur
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Bibliothèque
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Configuration du Projet
                  </CardTitle>
                  <CardDescription>
                    Décrivez votre projet et l'IA générera une documentation complète
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nom du projet</label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Mon Super Projet"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de documentation</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Format de sortie</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex items-center gap-2">
                              <format.icon className="h-4 w-4" />
                              {format.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description du projet</label>
                    <Textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Décrivez les fonctionnalités, l'architecture et l'utilisation de votre projet..."
                      className="min-h-32"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Code source (optionnel)</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".js,.ts,.py,.java,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.dart,.scala,.json,.yaml,.yml"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Charger un fichier de code
                      </Button>
                      <Textarea
                        value={codeBase}
                        onChange={(e) => setCodeBase(e.target.value)}
                        placeholder="Ou collez votre code ici pour une analyse plus précise..."
                        className="min-h-24 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={generateDocumentation}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Générer la Documentation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Fonctionnalités Avancées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">L'IA va automatiquement créer :</h4>
                    <ul className="text-indigo-800 text-sm space-y-1">
                      <li>• Table des matières interactive</li>
                      <li>• Guide d'installation détaillé</li>
                      <li>• Documentation API complète</li>
                      <li>• Exemples de code pratiques</li>
                      <li>• Guide de déploiement</li>
                      <li>• Section troubleshooting</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Formats supportés :</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DOC_FORMATS.map((format) => (
                        <div key={format.value} className="flex items-center gap-2 text-purple-800 text-sm">
                          <format.icon className="h-4 w-4" />
                          {format.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-pink-50 rounded-lg p-4">
                    <h4 className="font-medium text-pink-900 mb-2">Analyse intelligente :</h4>
                    <ul className="text-pink-800 text-sm space-y-1">
                      <li>• Détection automatique du langage</li>
                      <li>• Analyse de l'architecture du code</li>
                      <li>• Génération d'exemples pertinents</li>
                      <li>• Documentation des dépendances</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {selectedDoc ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedDoc.title}</CardTitle>
                      <CardDescription>
                        {selectedDoc.projectName} • Généré le {new Date(selectedDoc.createdAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedDoc.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocumentation(selectedDoc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedDoc.content}</pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Aucune documentation sélectionnée
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Générez votre première documentation pour voir l'aperçu
                    </p>
                    <Button onClick={() => setActiveTab('generator')}>
                      Générer une documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {generatedDocs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{doc.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                            {doc.format.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{doc.projectName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(doc.content);
                        }}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDocumentation(doc);
                        }}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {generatedDocs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Aucune documentation générée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Créez votre première documentation avec l'IA
                  </p>
                  <Button onClick={() => setActiveTab('generator')}>
                    Commencer
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXDocs;
