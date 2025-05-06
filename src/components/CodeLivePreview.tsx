
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Code, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeLivePreviewProps {
  code: string;
  language: string;
  showPreview?: boolean;
  title?: string;
  height?: string;
}

export function CodeLivePreview({ 
  code, 
  language, 
  showPreview = true, 
  title = "Aperçu du code",
  height = "300px"
}: CodeLivePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>(showPreview ? "preview" : "code");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState<number>(0); // Used to force iframe refresh

  const isHtml = language === "html" || code.includes("<!DOCTYPE html>") || code.includes("<html");
  const isCss = language === "css";
  const isJavaScript = language === "javascript" || language === "js";
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const refreshPreview = () => {
    setKey(prev => prev + 1);
  };

  // Function to prepare HTML content for preview
  const prepareHtml = () => {
    if (isHtml) {
      return code;
    } else if (isCss) {
      return `<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="preview-container" style="padding: 20px;">
    <h1>Aperçu CSS</h1>
    <p>Cet aperçu montre vos styles CSS appliqués à des éléments HTML basiques.</p>
    <div class="sample-element">Élément d'exemple avec vos styles</div>
    <button>Un bouton</button>
    <a href="#">Un lien</a>
    <div class="box">Une boîte</div>
  </div>
</body>
</html>`;
    } else if (isJavaScript) {
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    #output { border: 1px solid #ddd; padding: 15px; margin-top: 15px; min-height: 100px; }
  </style>
</head>
<body>
  <h2>Sortie JavaScript</h2>
  <div id="output"></div>
  <script>
    // Rediriger console.log vers notre élément de sortie
    const output = document.getElementById('output');
    const originalConsoleLog = console.log;
    console.log = function() {
      const args = Array.from(arguments);
      originalConsoleLog.apply(console, args);
      const text = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      output.innerHTML += '<div class="log-line">' + text + '</div>';
    };
    
    // Exécuter le code utilisateur
    try {
      ${code}
    } catch(e) {
      console.log('Erreur: ' + e.message);
    }
  </script>
</body>
</html>`;
    } else {
      // Fallback for other languages
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    pre { background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
  </style>
</head>
<body>
  <h2>Aperçu de code ${language}</h2>
  <p>Le langage "${language}" ne peut pas être directement prévisualisé dans le navigateur.</p>
  <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
</body>
</html>`;
    }
  };

  // Load the HTML content into the iframe
  useEffect(() => {
    if (iframeRef.current && activeTab === "preview") {
      const htmlContent = prepareHtml();
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [code, activeTab, key]);

  return (
    <Card className="overflow-hidden border-muted shadow-md">
      <div className="flex items-center justify-between border-b border-border p-2 bg-muted/50">
        <div className="text-sm font-medium">{title}</div>
        <div className="flex items-center gap-1">
          {showPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={refreshPreview}
              title="Rafraîchir l'aperçu"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full"
            onClick={handleCopyCode}
            title={isCopied ? "Copié!" : "Copier le code"}
          >
            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      
      {showPreview ? (
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-border">
            <TabsList className="h-9 bg-transparent w-full justify-start px-3 pt-1 pb-0 rounded-none">
              <TabsTrigger
                value="preview"
                className={cn(
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2",
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                )}
              >
                <Eye className="h-4 w-4 mr-1" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className={cn(
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2",
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                )}
              >
                <Code className="h-4 w-4 mr-1" />
                Code
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="mt-0 p-0">
            <div className="relative" style={{ height }}>
              <iframe
                key={key}
                ref={iframeRef}
                title="Code Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-0 p-0">
            <pre className="w-full overflow-auto p-4 text-sm bg-background" style={{ height }}>
              <code>{code}</code>
            </pre>
          </TabsContent>
        </Tabs>
      ) : (
        <pre className="w-full overflow-auto p-4 text-sm bg-background" style={{ height }}>
          <code>{code}</code>
        </pre>
      )}
    </Card>
  );
}
