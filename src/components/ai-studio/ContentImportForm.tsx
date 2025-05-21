
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link as LinkIcon, Upload, FileText, AlertCircle, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import WebCrawlerService from '@/services/web-crawler-service';
import FileUploadForm from './FileUploadForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        timeout: 60000
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
    <Card className="p-4 mb-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="url" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Fichier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">URL du site web</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={handleUrlChange}
                  onBlur={handleUrlBlur}
                  disabled={isLoading}
                  className={`flex-1 pr-8 ${urlTestResult ? (urlTestResult.success ? 'border-green-500' : 'border-red-500') : ''}`}
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
                Extraction en cours...
              </p>
            </div>
          )}
          
          {urlTestResult && !urlTestResult.success && !isLoading && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium">Attention</p>
                <p>{urlTestResult.message || "Ce site pourrait être difficile à explorer correctement."}</p>
                <p className="mt-1">Essayez avec une URL différente ou utilisez l'importation de fichier.</p>
              </div>
            </div>
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
