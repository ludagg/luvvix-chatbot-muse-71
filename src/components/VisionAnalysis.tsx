
import { useState } from 'react';
import { Upload, Image as ImageIcon, BarChart3, FileSpreadsheet, Database, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

interface VisionAnalysisProps {
  onAnalysisComplete?: (result: string) => void;
}

export const VisionAnalysis = ({ onAnalysisComplete }: VisionAnalysisProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileType, setFileType] = useState<'image' | 'chart' | 'spreadsheet' | 'database' | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Déterminer le type de fichier
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let type: 'image' | 'chart' | 'spreadsheet' | 'database' | null = null;
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      type = 'image';
    } else if (['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      type = 'spreadsheet';
    } else if (['json', 'xml'].includes(fileExtension || '')) {
      type = 'database';
    }
    
    setFileType(type);
    setUploadedFile(file);
    
    // Créer une URL pour la prévisualisation si c'est une image
    if (type === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simuler un temps de traitement
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const analysisResults: Record<string, string> = {
        image: "Je vois une photographie qui semble montrer un paysage urbain moderne. Plusieurs bâtiments et gratte-ciels sont visibles, avec une architecture contemporaine. Le ciel est partiellement nuageux, suggérant une journée ensoleillée. Il semble s'agir d'une vue panoramique d'un quartier d'affaires ou du centre-ville d'une métropole.",
        chart: "J'ai analysé le graphique et je constate une tendance croissante sur les 6 derniers mois. Les valeurs ont augmenté de 23% entre janvier et juin, avec une accélération notable en avril (+8,4%). La courbe présente une corrélation positive avec les indicateurs économiques standards pour cette période.",
        spreadsheet: "J'ai analysé les données du tableur et j'ai identifié plusieurs tendances clés: 1) Les ventes ont augmenté de 15% au second trimestre, 2) Le produit A représente 45% du chiffre d'affaires total, 3) La région Nord-Est montre les meilleures performances avec une croissance de 22% d'une année sur l'autre.",
        database: "L'analyse de la base de données montre une structure relationnelle avec 5 tables principales. J'ai identifié des champs clés pour l'identification des utilisateurs et leurs préférences. Les relations entre les tables sont bien normalisées, mais je note une opportunité d'optimisation pour la requête principale."
      };
      
      const result = fileType ? analysisResults[fileType] : "J'ai analysé le document que vous avez fourni.";
      
      toast({
        title: "Analyse terminée",
        description: "L'analyse du document a été complétée avec succès"
      });
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      setIsDialogOpen(false);
      setUploadedFile(null);
      setPreviewUrl(null);
      setFileType(null);
    }, 3000);
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setFileType(null);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsDialogOpen(true)}
      >
        <Upload className="h-4 w-4" />
        <span className="sr-only">Analyser un document</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) clearFile();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Analyser un document ou une image</DialogTitle>
            <DialogDescription>
              Téléchargez un document, une image ou un graphique pour analyse par l'IA
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              {uploadedFile ? (
                <div className="relative flex flex-col items-center space-y-2 w-full">
                  {previewUrl ? (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-muted">
                      <img 
                        src={previewUrl} 
                        alt="Prévisualisation" 
                        className="h-auto w-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80"
                        onClick={clearFile}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-32 rounded-lg border border-dashed border-muted p-4">
                      {fileType === 'spreadsheet' && <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />}
                      {fileType === 'chart' && <BarChart3 className="h-10 w-10 text-muted-foreground" />}
                      {fileType === 'database' && <Database className="h-10 w-10 text-muted-foreground" />}
                      <div className="ml-4">
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8"
                        onClick={clearFile}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-1">
                    <p className="text-sm font-medium">
                      Déposez votre fichier ici ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, CSV, XLSX jusqu'à 10MB
                    </p>
                  </div>
                  <input 
                    type="file" 
                    id="fileUpload" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".png,.jpg,.jpeg,.gif,.webp,.csv,.xlsx,.xls,.json,.xml"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    Sélectionner un fichier
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              disabled={isAnalyzing}
            >
              Annuler
            </Button>
            <Button 
              onClick={simulateAnalysis}
              disabled={!uploadedFile || isAnalyzing}
              className={cn("relative", isAnalyzing && "cursor-not-allowed")}
            >
              {isAnalyzing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAnalyzing ? "Analyse en cours..." : "Analyser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
