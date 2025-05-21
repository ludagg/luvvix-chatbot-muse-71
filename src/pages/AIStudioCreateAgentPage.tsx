import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Bot, Sparkles } from "lucide-react";
import ContentImportForm from "@/components/ai-studio/ContentImportForm";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  objective: z.string().min(10, "L'objectif doit contenir au moins 10 caractères"),
  personality: z.string(),
  avatarStyle: z.string(),
  isPublic: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  price: z.number().min(0).optional(),
  contextText: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const avatarStyles = [
  { value: "bot", label: "Robot", icon: <Bot className="h-6 w-6" /> },
  { value: "sparkles", label: "Étoiles", icon: <Sparkles className="h-6 w-6" /> },
  { value: "human-female-1", label: "Femme 1", icon: "👩" },
  { value: "human-female-2", label: "Femme 2", icon: "👱‍♀️" },
  { value: "human-male-1", label: "Homme 1", icon: "👨" },
  { value: "human-male-2", label: "Homme 2", icon: "👨‍🦰" },
];

const personalityTypes = [
  { value: "expert", label: "Expert" },
  { value: "friendly", label: "Amical" },
  { value: "concise", label: "Concis" },
  { value: "empathetic", label: "Empathique" },
];

const AIStudioCreateAgentPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      objective: "",
      personality: "expert",
      avatarStyle: "bot",
      isPublic: false,
      isPaid: false,
      price: 0,
      contextText: "",
    },
  });
  
  const isPaid = form.watch("isPaid");
  
  const handleContentImported = (content: string, source: string) => {
    const currentContent = form.getValues("contextText");
    const sourceInfo = `Source: ${source}\n\n`;
    const newContent = currentContent 
      ? `${currentContent}\n\n--- Contenu importé ---\n${sourceInfo}${content}`
      : `--- Contenu importé ---\n${sourceInfo}${content}`;
      
    form.setValue("contextText", newContent);
    toast({
      title: "Contenu importé",
      description: `Le contenu de '${source}' a été ajouté au contexte de l'agent.`,
    });
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un agent IA.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the agent
      const { data: agent, error: agentError } = await supabase
        .from("ai_agents")
        .insert({
          user_id: user.id,
          name: values.name,
          objective: values.objective,
          personality: values.personality,
          avatar_style: values.avatarStyle,
          is_public: values.isPublic,
          is_paid: values.isPaid,
          price: values.isPaid ? values.price : 0,
          parameters: {
            language: "fr",
          },
        })
        .select()
        .single();
        
      if (agentError) throw agentError;
      
      // Add context if provided
      if (values.contextText && values.contextText.trim().length > 0) {
        const { error: contextError } = await supabase
          .from("ai_agent_context")
          .insert({
            agent_id: agent.id,
            content_type: "text",
            content: values.contextText,
          });
          
        if (contextError) throw contextError;
      }
      
      toast({
        title: "Agent créé avec succès",
        description: "Votre agent IA a été créé et est maintenant disponible.",
      });
      
      navigate("/ai-studio/dashboard");
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'agent.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Créer un nouvel agent IA
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Personnalisez votre agent IA en quelques étapes simples
              </p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="basic">Configuration</TabsTrigger>
                  <TabsTrigger value="context">Contexte</TabsTrigger>
                  <TabsTrigger value="publish">Publication</TabsTrigger>
                </TabsList>
                
                {/* Basic Configuration Tab */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration de base</CardTitle>
                      <CardDescription>
                        Définissez les caractéristiques fondamentales de votre agent IA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'agent</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Assistant Marketing"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Le nom qui s'affichera pour les utilisateurs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="objective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objectif fonctionnel</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ex: Aider les utilisateurs à créer des stratégies marketing adaptées à leur entreprise..."
                                className="min-h-32 resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Décrivez précisément ce que votre agent doit accomplir
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="personality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personnalité</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une personnalité" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {personalityTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Le style d'interaction de votre agent
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="avatarStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Style d'avatar</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un avatar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {avatarStyles.map((style) => (
                                    <SelectItem key={style.value} value={style.value}>
                                      <div className="flex items-center">
                                        <span className="mr-2">{style.icon}</span>
                                        {style.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                L'apparence visuelle de votre agent
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("context")}
                    >
                      Continuer
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Context Tab */}
                <TabsContent value="context" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Données contextuelles</CardTitle>
                      <CardDescription>
                        Ajoutez des connaissances spécifiques à votre agent IA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium mb-3">Importer du contenu</h3>
                        <ContentImportForm onContentImported={handleContentImported} />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="contextText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texte contextuel</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Entrez du texte que votre agent IA devrait connaître..."
                                className="min-h-64 resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ajoutez des informations, des définitions ou des instructions spécifiques
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-full">
                            <Upload className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Importer des documents</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          Prochainement: importez des PDF, des fichiers texte ou des URL pour enrichir les connaissances de votre agent
                        </p>
                        <Button variant="outline" disabled>
                          Importer des fichiers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("publish")}
                    >
                      Continuer
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Publish Tab */}
                <TabsContent value="publish" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres de publication</CardTitle>
                      <CardDescription>
                        Configurez la disponibilité et la visibilité de votre agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Agent public</FormLabel>
                              <FormDescription>
                                Rendre cet agent visible et accessible par tous
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
                        control={form.control}
                        name="isPaid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Agent payant</FormLabel>
                              <FormDescription>
                                Monétiser votre agent en fixant un prix d'accès
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
                      
                      {isPaid && (
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Prix en euros pour accéder à cet agent
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full">
                            <Globe className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                            <h3 className="text-md font-medium mb-1">Widget d'intégration</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                              Prochainement: intégrez votre agent sur n'importe quel site web avec un simple bout de code
                            </p>
                            <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded text-xs font-mono opacity-50">
                              &lt;script src="https://luvvix.ai/widget/your-agent-id"&gt;&lt;/script&gt;
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("context")}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer l'agent IA
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioCreateAgentPage;
