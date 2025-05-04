
import { useState } from "react";
import { FileText, Download, Copy, Share2, FileJson, Archive, QrCode, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ShareOptions } from "@/components/ShareOptions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EnhancedExportProps {
  content: string;
  title: string;
}

export function EnhancedExport({ content, title }: EnhancedExportProps) {
  const [exportFormat, setExportFormat] = useState("txt");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Vérification de l'état de la connexion
  useState(() => {
    const handleConnectionChange = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);
    
    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  });

  const handleExport = (format: string) => {
    let exportContent = content;
    let fileExtension = '';
    let mimeType = '';
    
    // Ajouter les métadonnées si nécessaire
    if (includeMetadata) {
      const metadata = `--- 
Titre: ${title}
Date: ${new Date().toISOString()}
Tags: LuvviX, Export, ${format.toUpperCase()}
---\n\n`;
      
      exportContent = metadata + exportContent;
    }
    
    switch (format) {
      case 'txt':
        fileExtension = 'txt';
        mimeType = 'text/plain';
        break;
      case 'md':
        fileExtension = 'md';
        mimeType = 'text/markdown';
        break;
      case 'html':
        exportContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    code { font-family: monospace; }
    h1, h2, h3 { color: #333; }
    .metadata { color: #666; font-size: 0.8em; margin-bottom: 20px; }
  </style>
</head>
<body>
  ${includeMetadata ? `<div class="metadata">
    <p>Exporté le ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
    <p>Titre: ${title}</p>
  </div>` : ''}
  ${content.replace(/\n/g, '<br>')}
</body>
</html>`;
        fileExtension = 'html';
        mimeType = 'text/html';
        break;
      case 'json':
        const jsonData = {
          title,
          content,
          exportDate: new Date().toISOString(),
          metadata: includeMetadata ? {
            tags: includeTags ? ["LuvviX", "Export"] : undefined,
            timestamps: includeTimestamps ? {
              created: new Date().toISOString(),
            } : undefined,
          } : undefined,
        };
        exportContent = JSON.stringify(jsonData, null, 2);
        fileExtension = 'json';
        mimeType = 'application/json';
        break;
      case 'pdf':
        // Dans une implémentation réelle, utiliser jsPDF ou une autre bibliothèque pour créer des PDF
        toast({
          title: "Export PDF",
          description: "La fonctionnalité d'export PDF est en cours d'implémentation."
        });
        return;
    }
    
    // Créer un Blob et télécharger le fichier
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportation réussie",
      description: `Le fichier a été téléchargé au format ${format.toUpperCase()}`,
      duration: 3000,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
          <span className="sr-only">Exporter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter la conversation</DialogTitle>
          <DialogDescription>
            Choisissez le format d'exportation et les options
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="basic">Options basiques</TabsTrigger>
            <TabsTrigger value="advanced">Options avancées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>Format d'exportation</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Texte brut (.txt)</SelectItem>
                  <SelectItem value="md">Markdown (.md)</SelectItem>
                  <SelectItem value="html">HTML (.html)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeMetadata" 
                checked={includeMetadata} 
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="includeMetadata">Inclure les métadonnées</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Options avancées</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeMeta" 
                    checked={includeMeta}
                    onCheckedChange={(checked) => setIncludeMeta(checked as boolean)} 
                  />
                  <Label htmlFor="includeMeta">Inclure en-têtes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTags" 
                    checked={includeTags}
                    onCheckedChange={(checked) => setIncludeTags(checked as boolean)} 
                  />
                  <Label htmlFor="includeTags">Inclure tags</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTimestamps" 
                    checked={includeTimestamps}
                    onCheckedChange={(checked) => setIncludeTimestamps(checked as boolean)} 
                  />
                  <Label htmlFor="includeTimestamps">Horodatage</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Options de disponibilité</h4>
              <div className="text-sm rounded-md p-3 bg-muted">
                <p>{isOffline ? 
                  "Vous êtes actuellement hors ligne. L'export local est disponible, mais le partage est limité." : 
                  "Vous êtes en ligne. Toutes les options d'exportation sont disponibles."
                }</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast({
                  title: "Texte copié",
                  description: "Le contenu a été copié dans le presse-papier",
                });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              disabled={isOffline}
              onClick={() => {
                if (window.print) {
                  const printContent = `
                    <html>
                      <head><title>${title}</title></head>
                      <body>
                        <h1>${title}</h1>
                        <div>${content.replace(/\n/g, '<br>')}</div>
                      </body>
                    </html>
                  `;
                  const printWin = window.open('', '_blank');
                  if (printWin) {
                    printWin.document.open();
                    printWin.document.write(printContent);
                    printWin.document.close();
                    printWin.print();
                    printWin.close();
                  }
                }
              }}
            >
              <Printer className="h-4 w-4" />
            </Button>
            
            <ShareOptions title={title} content={content} />
          </div>
          
          <Button onClick={() => handleExport(exportFormat)}>
            Exporter au format {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
