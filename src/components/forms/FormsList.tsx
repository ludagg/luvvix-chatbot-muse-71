import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Copy, Share, Edit, Plus, Trash2, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import formsService, { Form } from "@/services/forms-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const FormsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["forms"],
    queryFn: () => formsService.getForms(),
    enabled: !!user,
  });
  
  const duplicateFormMutation = useMutation({
    mutationFn: (formId: string) => formsService.duplicateForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Formulaire dupliqué",
        description: "Une copie du formulaire a été créée avec succès."
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le formulaire.",
        variant: "destructive"
      });
    }
  });
  
  const deleteFormMutation = useMutation({
    mutationFn: (formId: string) => formsService.deleteForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Formulaire supprimé",
        description: "Le formulaire a été supprimé avec succès."
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le formulaire.",
        variant: "destructive"
      });
    }
  });

  const handleDuplicateForm = (formId: string) => {
    duplicateFormMutation.mutate(formId);
  };
  
  const handleDeleteForm = (formId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) {
      deleteFormMutation.mutate(formId);
    }
  };
  
  const handleShareForm = (formId: string, published: boolean) => {
    if (!published) {
      toast({
        title: "Formulaire non publié",
        description: "Veuillez publier votre formulaire avant de le partager.",
        variant: "destructive"
      });
      return;
    }
    
    const baseUrl = window.location.origin;
    setCurrentShareUrl(`${baseUrl}/forms/view/${formId}`);
    setShareDialogOpen(true);
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(currentShareUrl);
    toast({
      title: "Lien copié",
      description: "Le lien du formulaire a été copié dans le presse-papiers."
    });
  };
  
  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Connexion requise</h3>
        <p className="text-gray-500 mb-6">Connectez-vous pour créer et gérer vos formulaires</p>
        <Button 
          onClick={() => navigate("/auth")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Se connecter
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gray-200 h-10 w-10 rounded-lg"></div>
                <div className="bg-gray-200 h-4 w-16 rounded"></div>
              </div>
              <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded mb-4"></div>
              <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 gap-2">
              <div className="bg-gray-200 h-8 w-full rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partagez votre formulaire</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">Utilisez ce lien pour partager votre formulaire :</p>
            <div className="flex items-center gap-2">
              <Input value={currentShareUrl} readOnly />
              <Button variant="outline" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {forms.length > 0 ? (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher vos formulaires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-700" />
                    </div>
                    <div className="text-sm">
                      {form.published ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Publié
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Brouillon
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-1 line-clamp-2">{form.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{form.description || "Aucune description"}</p>
                  <div className="text-xs text-gray-400">
                    Créé le {format(new Date(form.created_at), "d MMM yyyy", { locale: fr })}
                    {" • "}
                    Modifié le {format(new Date(form.updated_at), "d MMM yyyy", { locale: fr })}
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-gray-50 gap-2 flex flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/forms/edit/${form.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleShareForm(form.id, form.published)}
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                  <div className="w-full flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDuplicateForm(form.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Dupliquer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Vous n'avez pas encore de formulaires</h3>
          <p className="text-gray-500 mb-6">Créez votre premier formulaire pour commencer à collecter des réponses</p>
          <Button 
            onClick={() => navigate("/forms/create")}
            className="bg-purple-600 hover:bg-purple-700 z-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau formulaire
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormsList;
