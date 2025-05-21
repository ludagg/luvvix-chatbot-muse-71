
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link as LinkIcon, Upload, FileText, AlertCircle, Globe, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import WebCrawlerService from '@/services/web-crawler-service';
import FileUploadForm from './FileUploadForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContentImportFormProps {
  onContentImported?: (content: string, source: string) => void;
}

const ContentImportForm: React.FC<ContentImportFormProps> = ({ onContentImported }) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('url');
  const [urlTestResult, setUrlTestResult] = useState<{ success: boolean, message?: string } | null>(null);
  const [useJsRender, setUseJsRender] = useState<boolean>(true);

  // Function to test URL before extraction
  const testUrl = async () => {
    if (!url || !url.trim()) {
      return;
    }
    
    setIsTesting(true);
    setUrlTestResult(null);
    
    try {
      const result = await WebCrawlerService.testUrl(url);
      setUrlTestResult(result);
      
      if (!result.success) {
        toast.warning(result.message);
      }
    } catch (err) {
      setUrlTestResult({
        success: false,
        message: `Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUrlExtract = async () => {
    if (!url || !url.trim().startsWith('http')) {
      toast.error('Veuillez entrer une URL valide commençant par http:// ou https://');
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setUrlTestResult(null);

    try {
      setProgress(30);
      const result = await WebCrawlerService.crawlWebsite(url, {
        maxPages: 5,
        depth: 2,
        timeout: 90000,
        jsRender: useJsRender,
        waitTime: 5000
      });

      setProgress(80);

      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'extraction du contenu');
      }

      setProgress(100);
      toast.success('Contenu du site web extrait avec succès');
      
      if (onContentImported && result.content) {
        // Add metadata about the extraction to the content
        const pageCount = result.urls?.length || 1;
        const metadataHeader = `
----- Métadonnées d'extraction -----
Source: ${url}
Pages explorées: ${pageCount}
Date d'extraction: ${new Date().toLocaleString()}
----- Contenu extrait -----

`;
        onContentImported(metadataHeader + result.content, url);
      }
      
      // Reset form
      setUrl('');
      
    } catch (err) {
      toast.error('Erreur d\'extraction: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFileUploaded = (content: string, source: string) => {
    if (onContentImported) {
      onContentImported(content, source);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setUrlTestResult(null); // Reset test results when URL changes
  };

  const handleUrlBlur = () => {
    if (url && url.trim()) {
      testUrl();
    }
  };

  return (
    <Card className="p-4 mb-4 border-slate-200 dark:border-slate-800 shadow-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Globe className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <FileText className="h-4 w-4" />
            Fichier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="website-url" className="font-medium">URL du site web</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={useJsRender ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onClick={() => setUseJsRender(!useJsRender)}
                >
                  Mode JS {useJsRender ? "Activé" : "Désactivé"}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>Le mode JS permet d'extraire du contenu des sites utilisant React, Next.js et autres frameworks JavaScript. Désactivez-le uniquement si l'extraction échoue.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={handleUrlChange}
                  onBlur={handleUrlBlur}
                  disabled={isLoading}
                  className={`flex-1 pr-8 ${urlTestResult ? (urlTestResult.success ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : ''}`}
                />
                {isTesting && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {urlTestResult && !isTesting && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {urlTestResult.success ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{urlTestResult.message}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              <Button
                onClick={handleUrlExtract}
                disabled={isLoading || !url || (urlTestResult && !urlTestResult.success)}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extraction...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Extraire
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Entrez l'URL d'un site web pour en extraire le contenu textuel
            </p>
          </div>

          {isLoading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center mt-1 text-gray-500">
                {progress < 50 ? "Extraction en cours..." : "Traitement du contenu..."}
              </p>
            </div>
          )}
          
          {urlTestResult && !urlTestResult.success && !isLoading && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription className="text-sm">
                <p>{urlTestResult.message || "Ce site pourrait être difficile à explorer correctement."}</p>
                <p className="mt-1">Essayez avec une URL différente, activez le mode JS, ou utilisez l'importation de fichier.</p>
              </AlertDescription>
            </Alert>
          )}
          
          {useJsRender && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Le mode JS est activé pour une meilleure compatibilité avec les sites React, Next.js et autres frameworks modernes. L'extraction peut prendre plus de temps.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="file">
          <FileUploadForm onFileUploaded={handleFileUploaded} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ContentImportForm;
