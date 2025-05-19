
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Clipboard, Check, RefreshCw } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  agentSlug: string;
}

const EmbedCodeGenerator = ({ agentId, agentName, agentSlug }: EmbedCodeGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const [domain, setDomain] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('light');
  
  // Base URL for embedding
  const baseEmbedUrl = `https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-embed?agent_id=${agentId}`;
  
  // Get the full URL with parameters
  const getFullEmbedUrl = () => {
    let url = baseEmbedUrl;
    if (domain) {
      url += `&parent=${encodeURIComponent(domain)}`;
    }
    url += `&theme=${selectedTheme}`;
    return url;
  };
  
  // Generate embed code for iframe
  const getIframeCode = () => {
    return `<iframe
  src="${getFullEmbedUrl()}"
  width="100%" 
  height="600px"
  frameborder="0"
  allow="microphone"
  title="LuvviX AI - ${agentName}"
></iframe>`;
  };
  
  // Generate embed code for script
  const getScriptCode = () => {
    return `<div id="luvvix-ai-${agentSlug}"></div>
<script>
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://luvvix.it.com/embed/agent.js';
    s.setAttribute('data-agent-id', '${agentId}');
    s.setAttribute('data-target', 'luvvix-ai-${agentSlug}');
    s.setAttribute('data-theme', '${selectedTheme}');
    (d.head || d.body).appendChild(s);
  })();
</script>`;
  };
  
  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copié !",
      description: "Le code d'intégration a été copié dans votre presse-papiers.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intégrer cet agent sur votre site</CardTitle>
        <CardDescription>
          Utilisez le code ci-dessous pour ajouter cet agent AI à votre site web.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Domaine parent (optionnel, pour la sécurité)
          </label>
          <Input
            type="text"
            placeholder="https://votresite.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Laissez vide pour autoriser tous les domaines.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Thème</label>
          <div className="flex space-x-2">
            <Button
              variant={selectedTheme === 'light' ? 'default' : 'outline'}
              onClick={() => setSelectedTheme('light')}
              className="w-24"
            >
              Clair
            </Button>
            <Button
              variant={selectedTheme === 'dark' ? 'default' : 'outline'}
              onClick={() => setSelectedTheme('dark')}
              className="w-24"
            >
              Sombre
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="iframe">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
          </TabsList>
          <TabsContent value="iframe" className="mt-4">
            <div className="bg-muted rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Code iFrame</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getIframeCode())}>
                  {copied ? <Check size={16} className="mr-2" /> : <Clipboard size={16} className="mr-2" />}
                  Copier
                </Button>
              </div>
              <pre className="text-xs overflow-auto p-2 bg-black text-white rounded">
                {getIframeCode()}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="script" className="mt-4">
            <div className="bg-muted rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Code Script</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(getScriptCode())}>
                  {copied ? <Check size={16} className="mr-2" /> : <Clipboard size={16} className="mr-2" />}
                  Copier
                </Button>
              </div>
              <pre className="text-xs overflow-auto p-2 bg-black text-white rounded">
                {getScriptCode()}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Les visiteurs de votre site pourront interagir avec cet agent AI.
        </p>
        <Button variant="outline" size="sm" onClick={() => window.open(getFullEmbedUrl(), '_blank')}>
          <RefreshCw size={16} className="mr-2" /> 
          Prévisualiser
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmbedCodeGenerator;
