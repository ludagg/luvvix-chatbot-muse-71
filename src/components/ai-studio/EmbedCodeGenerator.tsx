
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Copy, Code, CheckCircle, Laptop, Smartphone, Globe, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  isPublic: boolean;
}

const EmbedCodeGenerator = ({ agentId, agentName, isPublic }: EmbedCodeGeneratorProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    theme: "light",
    accentColor: "#6366f1",
    width: "380",
    height: "550",
    hideCredit: false,
    startMessage: "",
  });
  
  const embedUrl = `https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-embed?agentId=${agentId}&theme=${options.theme}&accentColor=${encodeURIComponent(options.accentColor)}${options.hideCredit ? '&hideCredit=true' : ''}${options.startMessage ? `&startMessage=${encodeURIComponent(options.startMessage)}` : ''}`;
  
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="${options.width}" 
  height="${options.height}" 
  frameborder="0"
  allow="microphone"
  style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
></iframe>`;

  const scriptCode = `<script>
  (function(w, d, s, o) {
    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    j.async = true;
    j.src = '${window.location.origin}/widgets/luvvix-chat.js';
    j.onload = function() {
      w.LuvviXAI = w.LuvviXAI || {};
      w.LuvviXAI.init({
        agentId: '${agentId}',
        theme: '${options.theme}',
        accentColor: '${options.accentColor}',
        hideCredit: ${options.hideCredit},
        startMessage: '${options.startMessage.replace(/'/g, "\\'")}'
      });
    };
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script');
</script>
<div id="luvvix-chat-widget"></div>`;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copié !",
      description: "Le code d'intégration a été copié dans le presse-papier.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleOptionChange = (name: string, value: string | boolean | number) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {!isPublic && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-4 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-400">Agent non public</h3>
              <p className="text-amber-700 dark:text-amber-500 text-sm">
                Cet agent n'est pas public. Pour permettre son intégration, activez l'option "Agent public" dans l'onglet "Paramètres généraux".
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Intégrer votre agent IA</CardTitle>
          <CardDescription>
            Ajoutez votre assistant IA "{agentName}" à votre site web ou application
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isPublic ? (
            <Tabs defaultValue="iframe">
              <TabsList className="mb-6">
                <TabsTrigger value="iframe">
                  <Code size={16} className="mr-2" />
                  Iframe
                </TabsTrigger>
                <TabsTrigger value="widget">
                  <Globe size={16} className="mr-2" />
                  Widget
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="iframe">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Configuration</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="theme">Thème</Label>
                            <Select 
                              value={options.theme} 
                              onValueChange={(value) => handleOptionChange("theme", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un thème" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Clair</SelectItem>
                                <SelectItem value="dark">Sombre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="accentColor">Couleur d'accent</Label>
                            <div className="flex gap-2">
                              <div 
                                className="w-10 h-9 rounded border" 
                                style={{ backgroundColor: options.accentColor }}
                              />
                              <Input
                                id="accentColor"
                                type="text"
                                value={options.accentColor}
                                onChange={(e) => handleOptionChange("accentColor", e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="width">Largeur (px)</Label>
                            <Input
                              id="width"
                              type="number"
                              value={options.width}
                              onChange={(e) => handleOptionChange("width", e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="height">Hauteur (px)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={options.height}
                              onChange={(e) => handleOptionChange("height", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="startMessage">Message initial (optionnel)</Label>
                          <Input
                            id="startMessage"
                            placeholder="Ex: Bonjour, j'aurais une question sur..."
                            value={options.startMessage}
                            onChange={(e) => handleOptionChange("startMessage", e.target.value)}
                          />
                          <p className="text-xs text-slate-500">
                            Ce message sera automatiquement envoyé au chargement du chat
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Label htmlFor="hideCredit" className="cursor-pointer">
                            Masquer le crédit "Propulsé par LuvviX AI Studio"
                          </Label>
                          <Switch
                            id="hideCredit"
                            checked={options.hideCredit}
                            onCheckedChange={(checked) => handleOptionChange("hideCredit", checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Code d'intégration</Label>
                      <div className="relative">
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs overflow-auto max-h-48">
                          {iframeCode}
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopyCode(iframeCode)}
                        >
                          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Copiez ce code et collez-le à l'endroit où vous souhaitez afficher le chat sur votre site
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Aperçu</h3>
                    <div className="w-full flex flex-col items-center space-y-2">
                      <div className="flex gap-4 mb-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleOptionChange("width", "380");
                            handleOptionChange("height", "550");
                          }}
                        >
                          <Smartphone size={14} className="mr-2" />
                          Mobile
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleOptionChange("width", "400");
                            handleOptionChange("height", "600");
                          }}
                        >
                          <Laptop size={14} className="mr-2" />
                          Desktop
                        </Button>
                      </div>
                      
                      <div className={`border rounded-xl ${options.theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} p-4 overflow-hidden flex justify-center`}>
                        <iframe 
                          src={embedUrl} 
                          width={options.width} 
                          height={options.height} 
                          frameBorder="0"
                          style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                        />
                      </div>
                      
                      <div className="text-sm text-slate-500 text-center mt-4">
                        Dimensions: {options.width}px × {options.height}px
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="widget">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Configuration du widget</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="widgetTheme">Thème</Label>
                              <Select 
                                value={options.theme} 
                                onValueChange={(value) => handleOptionChange("theme", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir un thème" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">Clair</SelectItem>
                                  <SelectItem value="dark">Sombre</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="widgetColor">Couleur d'accent</Label>
                              <div className="flex gap-2">
                                <div 
                                  className="w-10 h-9 rounded border" 
                                  style={{ backgroundColor: options.accentColor }}
                                />
                                <Input
                                  id="widgetColor"
                                  type="text"
                                  value={options.accentColor}
                                  onChange={(e) => handleOptionChange("accentColor", e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="widgetStartMessage">Message initial (optionnel)</Label>
                            <Input
                              id="widgetStartMessage"
                              placeholder="Ex: Bonjour, j'aurais une question sur..."
                              value={options.startMessage}
                              onChange={(e) => handleOptionChange("startMessage", e.target.value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Label htmlFor="widgetHideCredit" className="cursor-pointer">
                              Masquer le crédit "Propulsé par LuvviX AI Studio"
                            </Label>
                            <Switch
                              id="widgetHideCredit"
                              checked={options.hideCredit}
                              onCheckedChange={(checked) => handleOptionChange("hideCredit", checked)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Code du widget</Label>
                        <div className="relative">
                          <pre className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs overflow-auto max-h-48">
                            {scriptCode}
                          </pre>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyCode(scriptCode)}
                          >
                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                          Copiez ce code et collez-le juste avant la balise de fermeture &lt;/body&gt; de votre site
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-6 flex flex-col items-center justify-center text-center">
                      <div className="mb-4">
                        <img 
                          src="/placeholder.svg" 
                          alt="Widget Preview" 
                          className="w-56 h-56 mx-auto opacity-30"
                        />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Aperçu du widget</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Le widget apparaîtra en bas à droite de votre site web sous forme de bouton flottant.
                      </p>
                      <p className="text-sm text-slate-500">
                        Note: Le script du widget n'est pas encore disponible pour prévisualisation en direct.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-md p-4">
                    <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Comment fonctionne le widget ?</h3>
                    <p className="text-blue-700 dark:text-blue-500 text-sm">
                      Le widget ajoute un bouton flottant dans le coin inférieur droit de votre site. Lorsque vos visiteurs cliquent dessus, 
                      une fenêtre de chat s'ouvre où ils peuvent interagir avec votre assistant IA sans quitter votre site.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <Code className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-medium mb-2">
                Agent non disponible pour l'intégration
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Pour permettre l'intégration de cet agent sur d'autres sites web, 
                activez l'option "Agent public" dans les paramètres généraux.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isPublic && (
        <Card>
          <CardHeader>
            <CardTitle>URL directe</CardTitle>
            <CardDescription>
              Partagez un lien direct vers votre agent IA
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/ai-studio/chat/${agentId}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  variant="secondary"
                  onClick={() => {
                    handleCopyCode(`${window.location.origin}/ai-studio/chat/${agentId}`);
                  }}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                Ce lien permet à n'importe qui d'accéder directement à une page de chat avec votre agent IA.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmbedCodeGenerator;
