
import { useState } from 'react';
import { Share2, Copy, Mail, Download, Link, Loader2, Check, FileText, Code, Twitter, Facebook, Linkedin, QrCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

interface ShareOptionsProps {
  title?: string;
  content: string;
  url?: string;
}

export const ShareOptions = ({ title = "Conversation LuvviX", content, url }: ShareOptionsProps) => {
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  const shareableUrl = url || window.location.href;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsLinkCopied(true);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier"
      });
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };
  
  const handleEmailShare = () => {
    setIsEmailLoading(true);
    
    // Simuler l'envoi d'e-mail
    setTimeout(() => {
      setIsEmailLoading(false);
      toast({
        title: "Email prêt",
        description: "Un nouvel email a été préparé avec le contenu"
      });
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(content + '\n\n' + shareableUrl)}`;
      window.open(mailtoLink);
    }, 1000);
  };
  
  const handleSocialShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareableUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };
  
  const handleDownloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Téléchargement réussi",
      description: "Le fichier texte a été téléchargé"
    });
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Partager</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Options de partage</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyLink} className="flex cursor-pointer items-center">
            {isLinkCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            <span>Copier le lien</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEmailShare} className="flex cursor-pointer items-center">
            {isEmailLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            <span>Partager par e-mail</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Réseaux sociaux</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleSocialShare('twitter')} className="flex cursor-pointer items-center">
            <Twitter className="mr-2 h-4 w-4" />
            <span>Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('facebook')} className="flex cursor-pointer items-center">
            <Facebook className="mr-2 h-4 w-4" />
            <span>Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('linkedin')} className="flex cursor-pointer items-center">
            <Linkedin className="mr-2 h-4 w-4" />
            <span>LinkedIn</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Exporter</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleDownloadText} className="flex cursor-pointer items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Télécharger en .txt</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCodeDialogOpen(true)} className="flex cursor-pointer items-center">
            <Code className="mr-2 h-4 w-4" />
            <span>Exporter le code</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsQrDialogOpen(true)} className="flex cursor-pointer items-center">
            <QrCode className="mr-2 h-4 w-4" />
            <span>Code QR</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Dialogue d'exportation du code */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter le code</DialogTitle>
            <DialogDescription>
              Extrait du code détecté dans la conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <pre className="rounded-md bg-muted p-4 overflow-auto text-sm">
              <code>
                {content.includes('```') ? content.split('```')[1] : "// Aucun bloc de code détecté dans le contenu"}
              </code>
            </pre>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                try {
                  const codeContent = content.includes('```') 
                    ? content.split('```')[1] 
                    : "// Aucun bloc de code détecté dans le contenu";
                  
                  navigator.clipboard.writeText(codeContent);
                  toast({
                    title: "Code copié",
                    description: "Le code a été copié dans le presse-papier"
                  });
                } catch (error) {
                  console.error("Erreur lors de la copie:", error);
                  toast({
                    title: "Erreur",
                    description: "Impossible de copier le code",
                    variant: "destructive"
                  });
                }
              }}
            >
              Copier le code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue du Code QR */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Code QR</DialogTitle>
            <DialogDescription>
              Scannez ce code pour partager cette conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {/* Simulation d'un code QR (en production, on utiliserait une bibliothèque comme qrcode.react) */}
            <div className="bg-white p-4 rounded-md">
              <div className="w-48 h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzAgMjMwIj48cGF0aCBkPSJNMCAwaDUwdjUwaC01MHYtNTB6bTEwIDEwaDMwdjMwaC0zMHYtMzB6bTYwLTEwaDIwdjEwaC0yMHYtMTB6bTQwIDB2MTBoMTB2MTBoMTB2LTIwaC0yMHptMzAgMGgxMHYzMGgtMTB2MjBoMTB2MTBoLTEwdjEwaC0xMHYtNDB2LTEwdjIwaC0xMHYtMTBoLTEwdi0yMGgyMHYtMTB6bS0xMjAgNTBoMTB2MTBoLTEwdi0xMHptMjAgMGgxMHYyMGgtMTBoLTEwdjIwaC0xMHYtMjBoLTEwdi0yMGgzMHptMTAgMGgyMHYyMGgtMTB2LTEwaC0xMHYtMTB6bTMwIDB2MTBoLTEwdjEwaDEwdjEwaDEwdi0zMGgtMTB6bTQwIDF2OWgtMTB2MTBoLTEwdi0xMGgxMHYtOWgxMHptLTkwIDl2MTBoMTB2LTEwaC0xMHptMTIwIDB2MTBoLTEwdi0xMGgxMHptLTE3MCAxMGgxMHYxMGgtMTB2LTEwem0yMCAwaDMwdjMwaC0zMHYtMzB6bTYwIDBoMTB2MTBoLTEwdi0xMHptMzAgMGgxMHYxMGgtMTB2LTEwem00MCAwdjEwaDIwdi0xMGgtMjB6bS0xNDAgMTBoMTB2MTBoLTEwdi0xMHptMTAwIDBoMTB2MTBoLTEwdi0xMHptNDAgMGg0MHYyMGgtMTB2MTBoMTB2MTBoLTEwdjIwaC0xMHYtMTBoLTEwdjEwaC0xMHYtNjB6bTYwIDBo-YXRoLz48L3N2Zz4=')] bg-center bg-contain"></div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Cette URL pointe vers la conversation partagée
            </p>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                toast({
                  title: "Code QR enregistré",
                  description: "L'image du code QR a été téléchargée"
                });
                setIsQrDialogOpen(false);
              }}
            >
              Télécharger le QR code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
