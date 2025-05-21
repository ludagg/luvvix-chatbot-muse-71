
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Link as LinkIcon, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import WebCrawlerService from '@/services/web-crawler-service';

interface ContentImportFormProps {
  onContentImported?: (content: string, source: string) => void;
}

const ContentImportForm: React.FC<ContentImportFormProps> = ({ onContentImported }) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');

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

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsLoading(true);
    setProgress(20);

    try {
      // Simple text file reading for now
      if (file.type === 'text/plain') {
        const text = await file.text();
        setProgress(90);
        
        if (onContentImported) {
          onContentImported(text, file.name);
        }
        
        toast.success('Fichier importé avec succès');
      } else {
        // For non-text files, just acknowledge them for now
        // In a real implementation, you'd use a proper parser for PDFs, etc.
        setProgress(90);
        toast.info('Support pour les fichiers ' + file.type + ' sera disponible prochainement');
      }
      
      // Reset the file input
      setFile(null);
      
    } catch (err) {
      toast.error('Erreur lors de l\'importation: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between mb-4">
        <Button
          type="button"
          variant={uploadType === 'url' ? 'secondary' : 'outline'}
          onClick={() => setUploadType('url')}
          className="flex-1 mr-2"
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          URL
        </Button>
        <Button
          type="button"
          variant={uploadType === 'file' ? 'secondary' : 'outline'}
          onClick={() => setUploadType('file')}
          className="flex-1 ml-2"
        >
          <FileText className="mr-2 h-4 w-4" />
          Fichier
        </Button>
      </div>

      {uploadType === 'url' ? (
        <div className="space-y-4">
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
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Fichier (PDF, TXT)</Label>
            <div className="grid gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && <p className="text-sm text-gray-500">Fichier sélectionné: {file.name}</p>}
              <Button
                onClick={handleFileUpload}
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center mt-1 text-gray-500">
            {uploadType === 'url' ? 'Extraction en cours...' : 'Importation en cours...'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ContentImportForm;
