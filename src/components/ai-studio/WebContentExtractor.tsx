
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Link, Check, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import WebCrawlerService from '@/services/web-crawler-service';

interface WebContentExtractorProps {
  agentId: string;
  onContentExtracted?: (success: boolean) => void;
}

const WebContentExtractor: React.FC<WebContentExtractorProps> = ({ agentId, onContentExtracted }) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(10);
  const [autoAddToContext, setAutoAddToContext] = useState<boolean>(true);
  const [crawlResults, setCrawlResults] = useState<{ content?: string, urls?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url || !url.trim().startsWith('http')) {
      toast.error('Veuillez entrer une URL valide commençant par http:// ou https://');
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setError(null);
    setCrawlResults(null);

    try {
      // Start the extraction process
      setProgress(20);
      const result = await WebCrawlerService.crawlWebsite(url, {
        maxPages,
        depth: 2,
        timeout: 60000
      });

      setProgress(70);

      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'extraction du contenu');
      }

      setCrawlResults({
        content: result.content,
        urls: result.urls
      });

      // Automatically add to agent context if enabled
      if (autoAddToContext && result.content) {
        setProgress(80);
        const added = await WebCrawlerService.addCrawledContentToAgentContext(agentId, url, result.content);
        
        if (!added) {
          throw new Error('Impossible d\'ajouter le contenu au contexte de l\'agent');
        }
        
        setProgress(100);
        toast.success('Contenu du site web extrait et ajouté au contexte de l\'agent');
        
        if (onContentExtracted) {
          onContentExtracted(true);
        }
      } else {
        setProgress(100);
        toast.success('Contenu du site web extrait avec succès');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite');
      toast.error('Erreur d\'extraction: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
      
      if (onContentExtracted) {
        onContentExtracted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToContext = async () => {
    if (!crawlResults?.content) return;
    
    setIsLoading(true);
    try {
      const added = await WebCrawlerService.addCrawledContentToAgentContext(agentId, url, crawlResults.content);
      
      if (!added) {
        throw new Error('Impossible d\'ajouter le contenu au contexte de l\'agent');
      }
      
      toast.success('Contenu ajouté au contexte de l\'agent');
      
      if (onContentExtracted) {
        onContentExtracted(true);
      }
    } catch (err) {
      toast.error('Erreur lors de l\'ajout au contexte: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Extraction de contenu web</CardTitle>
        <CardDescription>
          Extraire le contenu d'un site web pour enrichir le contexte de l'IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="website-url">URL du site web</Label>
          <div className="flex gap-2">
            <Input
              id="website-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleExtract}
              disabled={isLoading || !url}
              className="whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extraction...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Extraire
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Pages max: {maxPages}</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-add" className="text-sm">Ajouter automatiquement</Label>
              <Switch
                id="auto-add"
                checked={autoAddToContext}
                onCheckedChange={setAutoAddToContext}
                disabled={isLoading}
              />
            </div>
          </div>
          <Slider
            value={[maxPages]}
            min={1}
            max={30}
            step={1}
            onValueChange={(values) => setMaxPages(values[0])}
            disabled={isLoading}
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Label>Progression</Label>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {crawlResults && (
          <div className="space-y-2 mt-4">
            <Label>Résultat de l'extraction</Label>
            <div className="border rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-1">{crawlResults.urls?.length || 0} URLs extraites</p>
              <p className="text-sm mb-2">{Math.round((crawlResults.content?.length || 0) / 1000)} KB de contenu textuel</p>
              <div className="text-xs text-gray-500 whitespace-pre-line">
                {crawlResults.content?.substring(0, 500)}
                {(crawlResults.content?.length || 0) > 500 ? '...' : ''}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {crawlResults && !autoAddToContext && (
        <CardFooter>
          <Button 
            onClick={handleAddToContext} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Ajouter au contexte de l'agent
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WebContentExtractor;
