
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  isPublic: boolean;
}

const EmbedCodeGenerator = ({ agentId, agentName, isPublic }: EmbedCodeGeneratorProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Define the embed code options
  const embedOptions = {
    iframe: `<iframe
  src="https://luvvix.com/ai-embed/${agentId}"
  width="100%"
  height="600px"
  style="border:1px solid #e5e7eb; border-radius: 0.5rem;"
  title="${agentName} - LuvviX AI"
></iframe>`,
    script: `<div id="luvvix-ai-${agentId}"></div>
<script src="https://luvvix.com/api/embed.js" data-agent-id="${agentId}"></script>`,
    popup: `<button id="luvvix-ai-button" data-agent-id="${agentId}">
  Chat with ${agentName}
</button>
<script src="https://luvvix.com/api/embed-popup.js"></script>`
  };

  const handleCopy = (type: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
          <Tabs defaultValue="iframe" className="w-full">
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
        </CardContent>
        <CardFooter className="justify-end">
          <Tabs defaultValue="iframe" className="w-full">
            <TabsContent value="iframe">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleCopy('iframe', embedOptions.iframe)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copied === 'iframe' ? (
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
                  <p>Copier le code d'intégration iFrame</p>
                </TooltipContent>
              </Tooltip>
            </TabsContent>
            
            <TabsContent value="script">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleCopy('script', embedOptions.script)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copied === 'script' ? (
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
                  <p>Copier le code d'intégration par script</p>
                </TooltipContent>
              </Tooltip>
            </TabsContent>
            
            <TabsContent value="popup">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleCopy('popup', embedOptions.popup)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copied === 'popup' ? (
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
                  <p>Copier le code d'intégration popup</p>
                </TooltipContent>
              </Tooltip>
            </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default EmbedCodeGenerator;
