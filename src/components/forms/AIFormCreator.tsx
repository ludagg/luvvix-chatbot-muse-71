
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AIFormCreator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerateForm = async () => {
    if (!description.trim()) {
      toast.error("Veuillez décrire votre formulaire");
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté pour créer un formulaire");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-create-form', {
        body: {
          description: description.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Formulaire créé avec succès par l'IA !");
        setIsOpen(false);
        setDescription("");
        navigate(`/forms/edit/${data.formId}`);
      } else {
        throw new Error(data.error || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Erreur génération IA:", error);
      toast.error("Impossible de générer le formulaire. Vérifiez que l'API Gemini est configurée.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
          size="icon"
        >
          <Wand2 className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Créer avec l'IA LuvviX
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Décrivez votre formulaire
            </label>
            <Textarea
              placeholder="Ex: Un formulaire de contact pour mon site web avec nom, email, sujet et message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Astuce:</strong> Plus votre description est détaillée, 
              plus l'IA pourra créer un formulaire précis et adapté à vos besoins.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenerateForm}
              disabled={isGenerating || !description.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer le formulaire
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIFormCreator;
