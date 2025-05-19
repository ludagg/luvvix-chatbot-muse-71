
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Shield, 
  Lock, 
  Users, 
  FileText,
  Calendar,
  MessageSquare
} from "lucide-react";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import formsService from "@/services/forms-service";
import FormNav from "@/components/forms/FormNav";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  published: z.boolean().default(false),
  requiresAuth: z.boolean().default(false),
  collectEmail: z.boolean().default(true),
  limitResponses: z.boolean().default(false),
  maxResponses: z.number().optional(),
  closesAt: z.string().optional(),
  confirmationMessage: z.string().optional(),
});

type FormSettingsValues = z.infer<typeof formSchema>;

interface FormSettingsProps {
  formId?: string;
}

const FormSettings = ({ formId }: FormSettingsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  const { data: form, isLoading } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });
  
  const form1 = useForm<FormSettingsValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      published: false,
      requiresAuth: false,
      collectEmail: true,
      limitResponses: false,
      maxResponses: 100,
      closesAt: "",
      confirmationMessage: "Merci pour votre réponse !",
    },
  });
  
  useEffect(() => {
    if (form) {
      const settings = form.settings || {};
      form1.reset({
        title: form.title,
        description: form.description || "",
        published: form.published,
        requiresAuth: settings.requiresAuth || false,
        collectEmail: settings.collectEmail !== false, // default to true
        limitResponses: !!settings.maxResponses,
        maxResponses: settings.maxResponses || 100,
        closesAt: settings.closesAt || "",
        confirmationMessage: settings.confirmationMessage || "Merci pour votre réponse !",
      });
    }
  }, [form]);
  
  const updateFormMutation = useMutation({
    mutationFn: (data: FormSettingsValues) => {
      if (!formId) throw new Error("ID du formulaire manquant");
      
      const formattedSettings = {
        requiresAuth: data.requiresAuth,
        collectEmail: data.collectEmail,
        maxResponses: data.limitResponses ? data.maxResponses : null,
        closesAt: data.closesAt || null,
        confirmationMessage: data.confirmationMessage || "Merci pour votre réponse !",
      };
      
      return formsService.updateForm(formId, {
        title: data.title,
        description: data.description || null,
        published: data.published,
        settings: formattedSettings,
      });
    },
    onSuccess: () => {
      toast.success("Paramètres du formulaire mis à jour");
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour des paramètres");
      console.error("Erreur de mise à jour:", error);
    },
  });
  
  const deleteFormMutation = useMutation({
    mutationFn: () => {
      if (!formId) throw new Error("ID du formulaire manquant");
      return formsService.deleteForm(formId);
    },
    onSuccess: () => {
      toast.success("Formulaire supprimé avec succès");
      navigate("/forms");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du formulaire");
    },
  });
  
  const onSubmit = (data: FormSettingsValues) => {
    updateFormMutation.mutate(data);
  };
  
  const handleDeleteForm = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ? Cette action est irréversible.")) {
      deleteFormMutation.mutate();
    }
  };
  
  const handleDuplicate = async () => {
    if (!formId) return;
    try {
      const newForm = await formsService.duplicateForm(formId);
      if (newForm) {
        toast.success("Formulaire dupliqué avec succès");
        navigate(`/forms/edit/${newForm.id}`);
      }
    } catch (error) {
      toast.error("Erreur lors de la duplication du formulaire");
      console.error(error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Formulaire introuvable</h2>
          <p className="text-gray-500 mb-4">Le formulaire que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/forms")}>Retour aux formulaires</Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <FormNav formId={formId} activeTab="settings" />
      
      <div className="mt-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres du formulaire</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Réponses
            </TabsTrigger>
          </TabsList>
          
          <Form {...form1}>
            <form onSubmit={form1.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="general">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
                  
                  <FormField
                    control={form1.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Titre du formulaire</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Titre du formulaire" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form1.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Description (optionnelle)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Description du formulaire" />
                        </FormControl>
                        <FormDescription>
                          Cette description sera visible au début du formulaire.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form1.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Statut du formulaire</FormLabel>
                          <FormDescription>
                            {field.value ? "Ce formulaire est publié et peut être rempli" : "Ce formulaire n'est pas publié"}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6 flex space-x-4">
                    <Button onClick={handleDuplicate} variant="outline" type="button">
                      Dupliquer
                    </Button>
                    <Button
                      onClick={handleDeleteForm}
                      variant="destructive"
                      type="button"
                      className="ml-auto"
                    >
                      Supprimer le formulaire
                    </Button>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Paramètres de confidentialité</h2>
                  
                  <FormField
                    control={form1.control}
                    name="requiresAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Authentification requise</FormLabel>
                          <FormDescription>
                            Les utilisateurs devront se connecter pour répondre à ce formulaire
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form1.control}
                    name="collectEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Collecter les adresses e-mail</FormLabel>
                          <FormDescription>
                            Permettre aux utilisateurs de fournir leur adresse e-mail
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="responses">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Gestion des réponses</h2>
                  
                  <FormField
                    control={form1.control}
                    name="confirmationMessage"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Message de confirmation</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Merci pour votre réponse !" />
                        </FormControl>
                        <FormDescription>
                          Ce message sera affiché après la soumission du formulaire.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form1.control}
                    name="limitResponses"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Limiter le nombre de réponses</FormLabel>
                          <FormDescription>
                            Le formulaire sera automatiquement fermé une fois le nombre maximum atteint
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form1.watch("limitResponses") && (
                    <FormField
                      control={form1.control}
                      name="maxResponses"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Nombre maximum de réponses</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form1.control}
                    name="closesAt"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Date de fermeture (optionnelle)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Laissez vide pour garder le formulaire ouvert indéfiniment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </TabsContent>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={updateFormMutation.isPending}
                >
                  {updateFormMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
};

export default FormSettings;
