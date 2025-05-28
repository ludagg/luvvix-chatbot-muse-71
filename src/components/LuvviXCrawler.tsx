
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Globe, 
  Search, 
  Download, 
  Copy,
  Loader2,
  Eye,
  Code,
  FileText,
  Image,
  Link,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WebCrawlerService } from '@/services/web-crawler-service';

interface CrawlResult {
  id: string;
  url: string;
  title: string;
  content: string;
  isJsFramework: boolean;
  detectedFramework?: string;
  timestamp: string;
  wordCount: number;
  imageCount: number;
  linkCount: number;
}

const LuvviXCrawler: React.FC = () => {
  const [activeTab, setActiveTab] = useState('crawler');
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [useJavascript, setUseJavascript] = useState(false);
  const [waitTime, setWaitTime] = useState(2000);
  const [selector, setSelector] = useState('');
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CrawlResult | null>(null);

  const crawlWebsite = async () => {
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "URL requise",
        description: "Veuillez entrer une URL valide à analyser"
      });
      return;
    }

    // Validation URL basique
    try {
      new URL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "URL invalide",
        description: "Veuillez entrer une URL valide (ex: https://example.com)"
      });
      return;
    }

    setIsCrawling(true);
    try {
      const result = await WebCrawlerService.extractContentFromUrl(url, {
        useJavascript,
        waitTime,
        selector: selector || undefined
      });

      if (result.success && result.content) {
        const newResult: CrawlResult = {
          id: crypto.randomUUID(),
          url,
          title: extractTitleFromContent(result.content),
          content: result.content,
          isJsFramework: result.isJsFramework || false,
          detectedFramework: result.detectedFramework,
          timestamp: new Date().toISOString(),
          wordCount: result.content.split(' ').length,
          imageCount: (result.content.match(/<img/g) || []).length,
          linkCount: (result.content.match(/<a/g) || []).length
        };

        setCrawlResults(prev => [newResult, ...prev]);
        setSelectedResult(newResult);

        toast({
          title: "Extraction réussie",
          description: `Contenu extrait avec succès de ${url}`
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur d\'extraction:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'extraction",
        description: "Impossible d'extraire le contenu. Vérifiez l'URL et réessayez."
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const extractTitleFromContent = (content: string): string => {
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }
    
    return new URL(url).hostname;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le contenu a été copié dans le presse-papiers"
    });
  };

  const downloadContent = (result: CrawlResult) => {
    const blob = new Blob([result.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement",
      description: `${result.title} a été téléchargé`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              LuvviX Crawler
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Système intelligent d'extraction et d'analyse de contenu web. Analysez n'importe quel site avec l'IA
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Extraction Intelligente</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Support JavaScript</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Analyse Sécurisée</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="crawler" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Extracteur
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crawler" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-green-600" />
                    Configuration d'Extraction
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres pour extraire le contenu web
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL du site web</label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Support JavaScript</label>
                      <p className="text-xs text-gray-500">Active le rendu JavaScript pour les SPAs</p>
                    </div>
                    <Switch
                      checked={useJavascript}
                      onCheckedChange={setUseJavascript}
                    />
                  </div>

                  {useJavascript && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Temps d'attente (ms)
                      </label>
                      <Select value={waitTime.toString()} onValueChange={(value) => setWaitTime(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1 seconde</SelectItem>
                          <SelectItem value="2000">2 secondes</SelectItem>
                          <SelectItem value="3000">3 secondes</SelectItem>
                          <SelectItem value="5000">5 secondes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sélecteur CSS (optionnel)
                    </label>
                    <Input
                      value={selector}
                      onChange={(e) => setSelector(e.target.value)}
                      placeholder="ex: .content, #main, article"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Limite l'extraction à un élément spécifique
                    </p>
                  </div>

                  <Button 
                    onClick={crawlWebsite}
                    disabled={isCrawling}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isCrawling ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Extraction en cours...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Extraire le Contenu
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Fonctionnalités Avancées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Extraction intelligente :</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Détection automatique de framework JS</li>
                      <li>• Support React, Vue, Angular</li>
                      <li>• Analyse du contenu dynamique</li>
                      <li>• Extraction de métadonnées</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Analyses disponibles :</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Comptage de mots et liens</li>
                      <li>• Détection d'images</li>
                      <li>• Structure du document</li>
                      <li>• Performance de chargement</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Formats d'export :</h4>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• HTML complet</li>
                      <li>• Texte brut</li>
                      <li>• Markdown</li>
                      <li>• JSON structuré</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {selectedResult ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {selectedResult.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span>{selectedResult.url}</span>
                        {selectedResult.isJsFramework && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Code className="h-3 w-3 mr-1" />
                            {selectedResult.detectedFramework || 'JS Framework'}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedResult.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadContent(selectedResult)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <FileText className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{selectedResult.wordCount}</div>
                      <div className="text-sm text-gray-600">Mots</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Image className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{selectedResult.imageCount}</div>
                      <div className="text-sm text-gray-600">Images</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Link className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{selectedResult.linkCount}</div>
                      <div className="text-sm text-gray-600">Liens</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Globe className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">
                        {(selectedResult.content.length / 1024).toFixed(1)}kb
                      </div>
                      <div className="text-sm text-gray-600">Taille</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedResult.content}</pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Aucun résultat sélectionné
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Lancez une extraction pour voir les résultats
                    </p>
                    <Button onClick={() => setActiveTab('crawler')}>
                      Commencer l'extraction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {crawlResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedResult(result)}>
                  <CardHeader>
                    <CardTitle className="text-lg mb-2 truncate">{result.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Globe className="h-3 w-3 mr-1" />
                        Web
                      </Badge>
                      {result.isJsFramework && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Code className="h-3 w-3 mr-1" />
                          {result.detectedFramework || 'JS'}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="truncate">{result.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Extrait le {new Date(result.timestamp).toLocaleDateString('fr-FR')}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">{result.wordCount}</div>
                        <div className="text-gray-500">Mots</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.imageCount}</div>
                        <div className="text-gray-500">Images</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{result.linkCount}</div>
                        <div className="text-gray-500">Liens</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(result.content);
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
                          downloadContent(result);
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
              
              {crawlResults.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Aucune extraction effectuée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par extraire le contenu d'un site web
                  </p>
                  <Button onClick={() => setActiveTab('crawler')}>
                    Lancer une extraction
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

export default LuvviXCrawler;
