
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Copy, Link2, Mail, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShareDialogProps {
  file: {
    id: string;
    name: string;
    type: string;
    url?: string;
    is_public?: boolean;
    shared_with?: string[];
  };
  open: boolean;
  onClose: () => void;
}

const ShareDialog = ({ file, open, onClose }: ShareDialogProps) => {
  const [isPublic, setIsPublic] = useState<boolean>(file.is_public || false);
  const [shareLink, setShareLink] = useState<string>("");
  const [emailToShare, setEmailToShare] = useState<string>("");
  const [sharedWith, setSharedWith] = useState<string[]>(file.shared_with || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate share link when dialog opens
  useState(() => {
    if (open && isPublic && file.url) {
      // Create a shareable link from the file url
      setShareLink(file.url);
    }
  });

  const handleTogglePublic = async () => {
    setIsLoading(true);
    
    try {
      const newIsPublic = !isPublic;
      
      // Update the file's public status in the database
      const { error } = await supabase
        .from('files')
        .update({ is_public: newIsPublic })
        .eq('id', file.id);
      
      if (error) throw error;
      
      setIsPublic(newIsPublic);
      
      if (newIsPublic && file.url) {
        setShareLink(file.url);
      } else {
        setShareLink("");
      }
      
      toast.success(newIsPublic ? "Fichier rendu public" : "Fichier rendu privé");
    } catch (error) {
      console.error("Error updating file sharing:", error);
      toast.error("Erreur lors de la mise à jour du partage");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Lien copié dans le presse-papier");
  };

  const handleShareByEmail = async () => {
    if (!emailToShare.trim() || !emailToShare.includes('@')) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email already in shared_with array
      if (sharedWith.includes(emailToShare)) {
        toast.info("Ce fichier est déjà partagé avec cette adresse");
        setIsLoading(false);
        return;
      }
      
      // Update shared_with array in database
      const updatedSharedWith = [...sharedWith, emailToShare];
      
      const { error } = await supabase
        .from('files')
        .update({ shared_with: updatedSharedWith })
        .eq('id', file.id);
      
      if (error) throw error;
      
      // Update local state
      setSharedWith(updatedSharedWith);
      setEmailToShare("");
      
      // Simulate sending email (in a real app, you'd call an API endpoint here)
      toast.success(`Invitation de partage envoyée à ${emailToShare}`);
    } catch (error) {
      console.error("Error sharing file by email:", error);
      toast.error("Erreur lors du partage par email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSharing = async (email: string) => {
    setIsLoading(true);
    
    try {
      const updatedSharedWith = sharedWith.filter(e => e !== email);
      
      const { error } = await supabase
        .from('files')
        .update({ shared_with: updatedSharedWith })
        .eq('id', file.id);
      
      if (error) throw error;
      
      setSharedWith(updatedSharedWith);
      toast.success(`Partage avec ${email} révoqué`);
    } catch (error) {
      console.error("Error removing sharing:", error);
      toast.error("Erreur lors de la révocation du partage");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partager "{file.name}"
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link">
          <TabsList className="w-full">
            <TabsTrigger value="link" className="flex-1"><Link2 className="h-4 w-4 mr-2" /> Lien public</TabsTrigger>
            <TabsTrigger value="email" className="flex-1"><Mail className="h-4 w-4 mr-2" /> Partage par email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-mode"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={isLoading}
                />
                <Label htmlFor="public-mode">Rendre ce fichier accessible publiquement</Label>
              </div>
              
              {isPublic && (
                <div className="space-y-2">
                  <Label htmlFor="share-link">Lien de partage</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-link"
                      value={shareLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </div>
                </div>
              )}
              
              {!isPublic && (
                <p className="text-sm text-gray-500">
                  Activez l'option ci-dessus pour générer un lien de partage public.
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-share">Partager avec une adresse email</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email-share"
                    type="email"
                    placeholder="exemple@domaine.com"
                    value={emailToShare}
                    onChange={(e) => setEmailToShare(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleShareByEmail}
                    disabled={isLoading || !emailToShare.trim()}
                  >
                    Partager
                  </Button>
                </div>
              </div>
              
              {sharedWith.length > 0 && (
                <div>
                  <Label>Partagé avec</Label>
                  <div className="mt-2 space-y-2">
                    {sharedWith.map((email) => (
                      <div key={email} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <span className="text-sm">{email}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveSharing(email)}
                          disabled={isLoading}
                        >
                          Révoquer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sharedWith.length === 0 && (
                <p className="text-sm text-gray-500">
                  Ce fichier n'est pas encore partagé avec d'autres utilisateurs.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
