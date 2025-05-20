
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, QrCode, ExternalLink } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import QRCode from "qrcode.react";

interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  isPublic: boolean;
}

const EmbedCodeGenerator = ({ agentId, agentName, isPublic }: EmbedCodeGeneratorProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("iframe");
  
  // Get base URL dynamically
  const baseUrl = window.location.origin;
  const publicUrl = `${baseUrl}/ai-studio/agents/${agentId}`;

  // Define the embed code options
  const embedOptions = {
    iframe: `<iframe
  src="${baseUrl}/ai-embed/${agentId}"
  width="100%"
  height="600px"
  style="border:1px solid #e5e7eb; border-radius: 0.5rem;"
  title="${agentName} - LuvviX AI"
></iframe>`,
    script: `<div id="luvvix-ai-${agentId}"></div>
<script src="${baseUrl}/api/embed.js" data-agent-id="${agentId}"></script>`,
    popup: `<button id="luvvix-ai-button" data-agent-id="${agentId}">
  Chat with ${agentName}
</button>
<script src="${baseUrl}/api/embed-popup.js"></script>`,
    floatingWidget: `<script>
  window.luvvixSettings = {
    agentId: "${agentId}",
    position: "bottom-right", // Options: bottom-right, bottom-left, top-right, top-left
    theme: "dark" // Options: dark, light
  };
</script>
<script src="${baseUrl}/api/embed-floating.js" async></script>`
  };

  const handleCopy = (type: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isPublic) {
    return (
      <Card className="shadow-md bg-slate-800/50 backdrop-blur-md border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200">Intégration non disponible</CardTitle>
          <CardDescription className="text-slate-400">
            Cet agent n'est pas public. Vous devez le rendre public avant de pouvoir l'intégrer sur d'autres sites.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-md bg-slate-800/50 backdrop-blur-md border border-slate-700/50 overflow-hidden">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-slate-200">Intégrer cet agent sur votre site</CardTitle>
          <CardDescription className="text-slate-400">
            Choisissez comment partager ou intégrer cet agent d'IA sur votre site web ou application.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Public Link Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-violet-400" />
              Lien public
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              Partagez ce lien pour permettre à n'importe qui d'accéder à votre agent IA sans avoir de compte.
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={publicUrl}
                readOnly
                className="bg-slate-900/50 border-slate-700 text-slate-300"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="min-w-[42px] border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 text-slate-200"
                  >
                    {copied === 'link' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copier le lien public</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* QR Code Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-violet-400" />
              QR Code
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              Scannez ce QR code pour accéder à l'agent IA depuis un appareil mobile.
            </p>
            <div className="bg-white inline-flex p-4 rounded-md">
              <QRCode value={publicUrl} size={160} level="H" />
            </div>
          </div>
          
          {/* Integration Options */}
          <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center">
            <Code className="h-5 w-5 mr-2 text-violet-400" />
            Options d'intégration
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Choisissez comment intégrer cet agent d'IA sur votre site web ou application.
          </p>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-4 bg-slate-800/70 border border-slate-700/50">
              <TabsTrigger 
                value="iframe" 
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                iFrame
              </TabsTrigger>
              <TabsTrigger 
                value="script" 
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                Script
              </TabsTrigger>
              <TabsTrigger 
                value="popup" 
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                Popup
              </TabsTrigger>
              <TabsTrigger 
                value="floatingWidget" 
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                Widget flottant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="iframe">
              <div className="bg-slate-900 rounded-md p-4 overflow-auto max-h-60 border border-slate-700/50">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{embedOptions.iframe}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                L'intégration iFrame est la méthode la plus simple. Elle affiche l'interface de chat complète dans un cadre sur votre site.
              </p>
              <div className="mt-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleCopy('iframe', embedOptions.iframe)}
                      variant="outline"
                      className="flex items-center gap-2 border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 text-slate-200"
                    >
                      {copied === 'iframe' ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
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
                    <p>Copier le code d'intégration iFrame</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TabsContent>
            
            <TabsContent value="script">
              <div className="bg-slate-900 rounded-md p-4 overflow-auto max-h-60 border border-slate-700/50">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{embedOptions.script}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                L'intégration par script charge l'interface de chat directement dans votre page, offrant une expérience plus intégrée.
              </p>
              <div className="mt-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleCopy('script', embedOptions.script)}
                      variant="outline"
                      className="flex items-center gap-2 border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 text-slate-200"
                    >
                      {copied === 'script' ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
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
                    <p>Copier le code d'intégration par script</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TabsContent>
            
            <TabsContent value="popup">
              <div className="bg-slate-900 rounded-md p-4 overflow-auto max-h-60 border border-slate-700/50">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{embedOptions.popup}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                L'intégration popup ajoute un bouton qui, lorsqu'il est cliqué, ouvre une fenêtre de chat flottante.
              </p>
              <div className="mt-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleCopy('popup', embedOptions.popup)}
                      variant="outline"
                      className="flex items-center gap-2 border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 text-slate-200"
                    >
                      {copied === 'popup' ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
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
                    <p>Copier le code d'intégration popup</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TabsContent>
            
            <TabsContent value="floatingWidget">
              <div className="bg-slate-900 rounded-md p-4 overflow-auto max-h-60 border border-slate-700/50">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{embedOptions.floatingWidget}</pre>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Le widget flottant affiche un bouton de chat dans un coin de votre site, similaire aux outils comme Intercom ou Crisp.
              </p>
              <div className="mt-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleCopy('floatingWidget', embedOptions.floatingWidget)}
                      variant="outline"
                      className="flex items-center gap-2 border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 text-slate-200"
                    >
                      {copied === 'floatingWidget' ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
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
                    <p>Copier le code du widget flottant</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t border-slate-700/50 bg-slate-900/30 p-4 flex justify-between">
          <p className="text-xs text-slate-400">
            Note: Les intégrations fonctionnent uniquement pour les agents publics.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(publicUrl, '_blank')}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir l'agent
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default EmbedCodeGenerator;
