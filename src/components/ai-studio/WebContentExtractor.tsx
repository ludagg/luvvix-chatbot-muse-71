
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WebCrawlerService } from "@/services/web-crawler-service";
import { Loader2, Globe, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebContentExtractorProps {
  onContentExtracted: (content: string) => void;
}

export const WebContentExtractor = ({ onContentExtracted }: WebContentExtractorProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [useJavascript, setUseJavascript] = useState(true);
  const [waitTime, setWaitTime] = useState(5000);
  const [cssSelector, setCssSelector] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [detectedFramework, setDetectedFramework] = useState<string | null>(null);

  const handleExtractContent = async () => {
    if (!url) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer une URL valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractedContent("");
    setDetectedFramework(null);

    try {
      const result = await WebCrawlerService.extractContentFromUrl(url, {
        useJavascript,
        waitTime,
        selector: cssSelector || undefined,
      });

      if (result.success && result.content) {
        setExtractedContent(result.content);
        onContentExtracted(result.content);
        
        if (result.isJsFramework) {
          setDetectedFramework(result.detectedFramework || "JavaScript framework");
          toast({
            title: "Site basé sur framework JS détecté",
            description: `Le site utilise ${result.detectedFramework || "un framework JavaScript"}. Mode JavaScript activé pour une meilleure extraction.`,
          });
        }
      } else {
        toast({
          title: "Erreur d'extraction",
          description: result.error || "Impossible d'extraire le contenu de cette URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-indigo-100 dark:border-indigo-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Extraction de contenu web
        </CardTitle>
        <CardDescription>
          Importez des connaissances depuis un site web pour enrichir votre agent IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="https://example.com/page" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handleExtractContent}
              disabled={isLoading || !url}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extraction...
                </>
              ) : "Extraire le contenu"}
            </Button>
          </div>

          {detectedFramework && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-md">
              <Sparkles className="h-4 w-4" />
              <span>Framework détecté: <strong>{detectedFramework}</strong> - Mode JavaScript automatiquement activé</span>
            </div>
          )}

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <div className="flex items-center justify-between">
              <Label htmlFor="js-toggle" className="text-sm font-medium flex items-center gap-2">
                <Switch 
                  id="js-toggle"
                  checked={useJavascript}
                  onCheckedChange={setUseJavascript}
                />
                Mode JavaScript {useJavascript ? "activé" : "désactivé"}
              </Label>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                  {isAdvancedOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temps d'attente: {waitTime / 1000}s</Label>
                  <span className="text-xs text-muted-foreground">(Pour le contenu dynamique)</span>
                </div>
                <Slider
                  min={1000}
                  max={15000}
                  step={1000}
                  value={[waitTime]}
                  onValueChange={([value]) => setWaitTime(value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="css-selector">Sélecteur CSS (optionnel)</Label>
                <Input
                  id="css-selector"
                  placeholder="Ex: #content, .article, main"
                  value={cssSelector}
                  onChange={(e) => setCssSelector(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Spécifiez un sélecteur CSS pour cibler une section spécifique de la page
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {extractedContent && (
            <div className="space-y-2 mt-4">
              <Label>Contenu extrait:</Label>
              <Textarea
                value={extractedContent}
                onChange={(e) => {
                  setExtractedContent(e.target.value);
                  onContentExtracted(e.target.value);
                }}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Supporte les sites basés sur React, Next.js et autres frameworks JavaScript</span>
        {useJavascript && (
          <span>L'extraction peut prendre plus de temps avec le mode JavaScript actif</span>
        )}
      </CardFooter>
    </Card>
  );
};
