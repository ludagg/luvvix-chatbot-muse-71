
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link as LinkIcon, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import WebCrawlerService from '@/services/web-crawler-service';
import FileUploadForm from './FileUploadForm';

interface ContentImportFormProps {
  onContentImported?: (content: string, source: string) => void;
}

const ContentImportForm: React.FC<ContentImportFormProps> = ({ onContentImported }) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('url');

  const handleUrlExtract = async () => {
    if (!url || !url.trim().startsWith('http')) {
      toast.error('Veuillez entrer une URL valide commençant par http:// ou https://');
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      setProgress(30);
      const result = await WebCrawlerService.crawlWebsite(url, {
        maxPages: 5,
        depth: 2,
        timeout: 30000
      });

      setProgress(80);

      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'extraction du contenu');
      }

      setProgress(100);
      toast.success('Contenu du site web extrait avec succès');
      
      if (onContentImported && result.content) {
        onContentImported(result.content, url);
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

  return (
    <Card className="p-4 mb-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="url" className="flex items-center">
            <LinkIcon className="mr-2 h-4 w-4" />
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
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleUrlExtract}
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
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Extraire
                  </>
                )}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center mt-1 text-gray-500">
                Extraction en cours...
              </p>
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
