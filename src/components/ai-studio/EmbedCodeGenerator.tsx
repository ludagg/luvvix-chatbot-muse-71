
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, Eye, EyeOff } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  isPublic: boolean;
}

const EmbedCodeGenerator = ({ agentId, agentName, isPublic }: EmbedCodeGeneratorProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<"iframe" | "script" | "popup">("iframe");
  const [customOptions, setCustomOptions] = useState({
    theme: "light",
    accentColor: "#6366f1",
    hideCredit: false,
    startMessage: ""
  });

  // Define the embed code options
  const embedOptions = {
    iframe: `<iframe
  src="https://luvvix.it.com/ai-embed/${agentId}?theme=${customOptions.theme}&accentColor=${encodeURIComponent(customOptions.accentColor)}${customOptions.hideCredit ? '&hideCredit=true' : ''}${customOptions.startMessage ? `&startMessage=${encodeURIComponent(customOptions.startMessage)}` : ''}"
  width="100%"
  height="600px"
  style="border:1px solid #e5e7eb; border-radius: 0.5rem;"
  title="${agentName} - LuvviX AI"
></iframe>`,
    script: `<div id="luvvix-ai-${agentId}"></div>
<script src="https://luvvix.it.com/api/embed.js" data-agent-id="${agentId}" data-theme="${customOptions.theme}" data-accent-color="${customOptions.accentColor}" ${customOptions.hideCredit ? 'data-hide-credit="true"' : ''} ${customOptions.startMessage ? `data-start-message="${customOptions.startMessage}"` : ''}></script>`,
    popup: `<button id="luvvix-ai-button" data-agent-id="${agentId}" data-theme="${customOptions.theme}" data-accent-color="${customOptions.accentColor}" ${customOptions.hideCredit ? 'data-hide-credit="true"' : ''} ${customOptions.startMessage ? `data-start-message="${customOptions.startMessage}"` : ''}>
  Chat with ${agentName}
</button>
<script src="https://luvvix.it.com/api/embed-popup.js"></script>`
  };

  const handleCopy = (type: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleCustomOptionChange = (option: string, value: any) => {
    setCustomOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  if (!isPublic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intégration non disponible</CardTitle>
          <CardDescription>
            Cet agent n'est pas public. Vous devez le rendre public avant de pouvoir l'intégrer sur d'autres sites.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getPreviewUrl = (type: "iframe" | "script" | "popup") => {
    const baseUrl = `https://luvvix.it.com/api/preview-embed/${agentId}?embedType=${type}&theme=${customOptions.theme}&accentColor=${encodeURIComponent(customOptions.accentColor)}${customOptions.hideCredit ? '&hideCredit=true' : ''}${customOptions.startMessage ? `&startMessage=${encodeURIComponent(customOptions.startMessage)}` : ''}`;
    return baseUrl;
  };

  return (
    <TooltipProvider>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Intégrer cet agent sur votre site</CardTitle>
          <CardDescription>
            Choisissez comment intégrer cet agent d'IA sur votre site web ou application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="iframe" className="w-full" onValueChange={(value) => setPreviewType(value as "iframe" | "script" | "popup")}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="popup">Popup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="iframe">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-4 overflow-auto">
                <pre className="text-sm">{embedOptions.iframe}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                L'intégration iFrame est la méthode la plus simple. Elle affiche l'interface de chat complète dans un cadre sur votre site.
              </p>
            </TabsContent>
            
            <TabsContent value="script">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-4 overflow-auto">
                <pre className="text-sm">{embedOptions.script}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                L'intégration par script charge l'interface de chat directement dans votre page, offrant une expérience plus intégrée.
              </p>
            </TabsContent>
            
            <TabsContent value="popup">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-4 overflow-auto">
                <pre className="text-sm">{embedOptions.popup}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                L'intégration popup ajoute un bouton qui, lorsqu'il est cliqué, ouvre une fenêtre de chat flottante.
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Options de personnalisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={customOptions.theme === "light" ? "default" : "outline"} 
                    onClick={() => handleCustomOptionChange("theme", "light")}
                    size="sm"
                  >
                    Clair
                  </Button>
                  <Button 
                    variant={customOptions.theme === "dark" ? "default" : "outline"} 
                    onClick={() => handleCustomOptionChange("theme", "dark")}
                    size="sm"
                  >
                    Sombre
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Couleur d'accent</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={customOptions.accentColor}
                    onChange={(e) => handleCustomOptionChange("accentColor", e.target.value)}
                    className="h-8 w-10 rounded border"
                  />
                  <input
                    type="text"
                    value={customOptions.accentColor}
                    onChange={(e) => handleCustomOptionChange("accentColor", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-credit"
                    checked={customOptions.hideCredit}
                    onCheckedChange={(checked) => handleCustomOptionChange("hideCredit", checked)}
                  />
                  <Label htmlFor="hide-credit">Masquer le crédit "Propulsé par LuvviX"</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startMessage">Message initial</Label>
                <input
                  id="startMessage"
                  type="text"
                  value={customOptions.startMessage}
                  onChange={(e) => handleCustomOptionChange("startMessage", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  placeholder="Bonjour, comment puis-je vous aider?"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch space-y-4">
          <div className="flex justify-between w-full">
            <Button 
              onClick={togglePreview} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Masquer l'aperçu
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Voir l'aperçu
                </>
              )}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleCopy(previewType, embedOptions[previewType])}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied === previewType ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copié!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copier le code
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copier le code d'intégration</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {showPreview && (
            <div className="w-full bg-white border rounded-md mt-4">
              <div className="p-2 bg-slate-100 border-b">
                <h3 className="text-sm font-medium">Aperçu de l'intégration</h3>
              </div>
              <div className="p-0">
                <iframe
                  src={getPreviewUrl(previewType)}
                  width="100%"
                  height="500"
                  className="border-0"
                  title={`Aperçu de ${agentName}`}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default EmbedCodeGenerator;
