import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { List, ListCheck, Layout, LayoutGrid, FileText, Share, Edit, Copy, Trash2 } from "lucide-react";
import formsService, { Form as FormType, FormQuestion } from "@/services/forms-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

interface FormEditorProps {
  formId?: string;
}

// Define the form types for react-hook-form
interface FormValues {
  formTitle: string;
  formDescription: string;
  collectEmails: boolean;
  limitResponses: boolean;
  confirmation: string;
}

const FormEditor = ({ formId }: FormEditorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
  // Initialize the form properly
  const form = useForm<FormValues>({
    defaultValues: {
      formTitle: "",
      formDescription: "",
      collectEmails: false,
      limitResponses: false,
      confirmation: "Merci d'avoir répondu à ce formulaire."
    }
  });

  const { data: formData, isLoading: isLoadingForm } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });

  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["formQuestions", formId],
    queryFn: () => formId ? formsService.getFormQuestions(formId) : [],
    enabled: !!formId,
  });

  // Update form with data when loaded
  useEffect(() => {
    if (formData) {
      setTitle(formData.title);
      setDescription(formData.description || "");
      form.setValue("formTitle", formData.title);
      form.setValue("formDescription", formData.description || "");
    }
  }, [formData, form]);

  const updateFormMutation = useMutation({
    mutationFn: ({ formId, updates }: { formId: string, updates: Partial<FormType> }) => 
      formsService.updateForm(formId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success("Formulaire mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du formulaire");
    }
  });

  const createFormMutation = useMutation({
    mutationFn: ({ title, description }: { title: string, description?: string }) => 
      formsService.createForm(title, description),
    onSuccess: (data) => {
      if (data) {
        navigate(`/forms/edit/${data.id}`);
        toast.success("Nouveau formulaire créé");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la création du formulaire");
    }
  });

  const saveQuestionMutation = useMutation({
    mutationFn: (question: Partial<FormQuestion>) => formsService.saveQuestion(question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de la question");
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => formsService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
      toast.success("Question supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la question");
    }
  });

  const publishFormMutation = useMutation({
    mutationFn: ({ formId, publish }: { formId: string, publish: boolean }) => 
      formsService.publishForm(formId, publish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success(formData?.published 
        ? "Formulaire dépublié" 
        : "Formulaire publié ! Il est maintenant accessible au public");
    }
  });
  
  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData);
    }
  }, [questionsData]);

  useEffect(() => {
    if (formData?.published) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/forms/view/${formId}`);
    }
  }, [formData, formId]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    form.setValue("formTitle", value);
    if (formId) {
      updateFormMutation.mutate({
        formId,
        updates: { title: value }
      });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    form.setValue("formDescription", value);
    if (formId) {
      updateFormMutation.mutate({
        formId,
        updates: { description: value }
      });
    }
  };

  const handleCreateForm = () => {
    if (!user) {
      toast.error("Vous devez être connecté pour créer un formulaire");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Veuillez saisir un titre pour le formulaire");
      return;
    }

    if (!formId) {
      createFormMutation.mutate({ title, description });
    }
  };
  
  const addQuestion = (type: string) => {
    if (!formId) {
      toast.error("Veuillez d'abord créer un formulaire");
      return;
    }

    const newQuestion: Partial<FormQuestion> = {
      form_id: formId,
      question_text: "Nouvelle question",
      question_type: type as any,
      description: "",
      required: false,
      position: questions.length,
      options: type === "multipleChoice" || type === "checkboxes" || type === "dropdown" 
        ? { choices: ["Option 1", "Option 2", "Option 3"] }
        : null
    };
    
    saveQuestionMutation.mutate(newQuestion);
  };

  const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    if (!formId) return;
    
    const updatedQuestion = {
      ...questions[index],
      ...updates
    };
    
    saveQuestionMutation.mutate(updatedQuestion);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handlePublishToggle = () => {
    if (!formId) return;
    
    publishFormMutation.mutate({
      formId,
      publish: !formData?.published
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour créer ou modifier des formulaires.</p>
          <Button onClick={() => navigate("/auth")}>Se connecter</Button>
        </Card>
      </div>
    );
  }

  if (isLoadingForm && formId) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse flex flex-col w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-bold border-none focus:ring-0 p-0 mb-2"
            placeholder="Titre du formulaire"
          />
          <Input
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="text-gray-500 border-none focus:ring-0 p-0"
            placeholder="Description (optionnelle)"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={!formId || !formData?.published}
                onClick={() => formId && formData?.published && setShareDialogOpen(true)}
              >
                <Share className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Partagez votre formulaire</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm mb-4">Utilisez ce lien pour partager votre formulaire :</p>
                <div className="flex items-center gap-2">
                  <Input value={shareUrl} readOnly />
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
          
          <Button 
            className={formData?.published ? "bg-amber-600 hover:bg-amber-700" : "bg-purple-600 hover:bg-purple-700"}
            onClick={formId ? handlePublishToggle : handleCreateForm}
          >
            {formId 
              ? (formData?.published ? "Dépublier" : "Publier")
              : "Créer le formulaire"
            }
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <Tabs defaultValue="design">
              <TabsList className="w-full">
                <TabsTrigger value="design" className="flex-1">Conception</TabsTrigger>
                <TabsTrigger 
                  value="responses" 
                  className="flex-1"
                  disabled={!formId}
                >
                  Réponses
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">Paramètres</TabsTrigger>
              </TabsList>
              
              <TabsContent value="design" className="p-6">
                <div className="bg-white rounded-md mb-6">
                  <h3 className="text-lg font-medium mb-4">Titre & Description</h3>
                  <div className="space-y-4">
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="formTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre du formulaire</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Saisissez un titre" 
                                {...field}
                                value={title} 
                                onChange={(e) => handleTitleChange(e.target.value)} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="formDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ajoutez une description" 
                                {...field}
                                value={description} 
                                onChange={(e) => handleDescriptionChange(e.target.value)} 
                              />
                            </FormControl>
                            <FormDescription>
                              Une description aide les répondants à comprendre l'objectif de votre formulaire.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </Form>
                  </div>
                </div>
                
                {isLoadingQuestions ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question.id} className={`mb-4 p-6 shadow-sm ${selectedQuestionId === question.id ? 'ring-2 ring-purple-500' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <Input 
                            value={question.question_text}
                            onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                            className="text-lg font-medium border-none focus:ring-0 p-0 mb-2"
                            placeholder="Question sans titre"
                            onFocus={() => setSelectedQuestionId(question.id)}
                          />
                          <Input 
                            value={question.description || ""}
                            onChange={(e) => updateQuestion(index, { description: e.target.value })}
                            className="text-sm text-gray-500 border-none focus:ring-0 p-0"
                            placeholder="Description (optionnelle)"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            if (!formId) return;
                            saveQuestionMutation.mutate({
                              form_id: formId,
                              question_text: question.question_text,
                              question_type: question.question_type,
                              description: question.description,
                              required: question.required,
                              options: question.options,
                              position: questions.length
                            });
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {question.question_type === "text" && (
                        <Input disabled placeholder="Texte court" className="bg-gray-50 mt-4" />
                      )}
                      
                      {question.question_type === "multipleChoice" && (
                        <div className="space-y-2 mt-4">
                          {question.options?.choices?.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                              <Input 
                                value={option}
                                onChange={(e) => {
                                  const newChoices = [...question.options.choices];
                                  newChoices[optionIndex] = e.target.value;
                                  updateQuestion(index, { 
                                    options: { ...question.options, choices: newChoices }
                                  });
                                }}
                                className="border-none focus:ring-0"
                              />
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600"
                            onClick={() => {
                              const newChoices = [...(question.options?.choices || []), "Nouvelle option"];
                              updateQuestion(index, { 
                                options: { ...question.options, choices: newChoices } 
                              });
                            }}
                          >
                            + Ajouter une option
                          </Button>
                        </div>
                      )}
                      
                      {question.question_type === "checkboxes" && (
                        <div className="space-y-2 mt-4">
                          {question.options?.choices?.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded border border-gray-300"></div>
                              <Input 
                                value={option}
                                onChange={(e) => {
                                  const newChoices = [...question.options.choices];
                                  newChoices[optionIndex] = e.target.value;
                                  updateQuestion(index, { 
                                    options: { ...question.options, choices: newChoices }
                                  });
                                }}
                                className="border-none focus:ring-0"
                              />
                            </div>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600"
                            onClick={() => {
                              const newChoices = [...(question.options?.choices || []), "Nouvelle option"];
                              updateQuestion(index, { 
                                options: { ...question.options, choices: newChoices } 
                              });
                            }}
                          >
                            + Ajouter une option
                          </Button>
                        </div>
                      )}
                      
                      {question.question_type === "dropdown" && (
                        <div className="space-y-2 mt-4">
                          <select disabled className="w-full p-2 border border-gray-300 rounded bg-gray-50">
                            <option>Sélectionnez une option</option>
                            {question.options?.choices?.map((option: string, optionIndex: number) => (
                              <option key={optionIndex}>{option}</option>
                            ))}
                          </select>
                          
                          <div className="mt-2 space-y-2">
                            {question.options?.choices?.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input 
                                  value={option}
                                  onChange={(e) => {
                                    const newChoices = [...question.options.choices];
                                    newChoices[optionIndex] = e.target.value;
                                    updateQuestion(index, { 
                                      options: { ...question.options, choices: newChoices }
                                    });
                                  }}
                                  className="border-gray-300"
                                />
                              </div>
                            ))}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600"
                              onClick={() => {
                                const newChoices = [...(question.options?.choices || []), "Nouvelle option"];
                                updateQuestion(index, { 
                                  options: { ...question.options, choices: newChoices } 
                                });
                              }}
                            >
                              + Ajouter une option
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={question.required}
                              onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                              id={`required-${question.id}`}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor={`required-${question.id}`} className="text-sm">Obligatoire</label>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {question.question_type === "text" && "Texte court"}
                          {question.question_type === "multipleChoice" && "Choix multiple"}
                          {question.question_type === "checkboxes" && "Cases à cocher"}
                          {question.question_type === "dropdown" && "Liste déroulante"}
                          {question.question_type === "grid" && "Grille"}
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
                
                <div className="mt-6">
                  <Card className="border-dashed border-2 p-6 text-center">
                    <h3 className="font-medium mb-4">Ajouter une question</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" onClick={() => addQuestion("text")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Texte
                      </Button>
                      <Button variant="outline" onClick={() => addQuestion("multipleChoice")}>
                        <List className="h-4 w-4 mr-2" />
                        Choix multiple
                      </Button>
                      <Button variant="outline" onClick={() => addQuestion("checkboxes")}>
                        <ListCheck className="h-4 w-4 mr-2" />
                        Cases à cocher
                      </Button>
                      <Button variant="outline" onClick={() => addQuestion("dropdown")}>
                        <Layout className="h-4 w-4 mr-2" />
                        Liste déroulante
                      </Button>
                      <Button variant="outline" onClick={() => addQuestion("grid")}>
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Grille
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="responses" className="p-6">
                {!formId ? (
                  <div className="text-center py-8">
                    <p>Veuillez créer le formulaire pour accéder aux réponses.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Réponses</h3>
                    <p className="text-gray-500">Cette fonctionnalité sera disponible prochainement.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="p-6">
                <h3 className="text-lg font-medium mb-4">Paramètres du formulaire</h3>
                <div className="space-y-6">
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="collectEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Collecter les adresses email</FormLabel>
                            <FormDescription>
                              Demander aux répondants de fournir leur adresse email.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="limitResponses"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Limiter le nombre de réponses</FormLabel>
                            <FormDescription>
                              Définir un nombre maximum de réponses à collecter.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message de confirmation</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Merci d'avoir répondu à ce formulaire."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ce message s'affichera après qu'un utilisateur ait soumis le formulaire.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div>
          <div className="bg-white rounded-md shadow-sm border p-6 sticky top-6">
            <h3 className="text-lg font-medium mb-4">Aperçu</h3>
            <div className="bg-gray-50 rounded-md p-4 border mb-4">
              <h4 className="font-medium">{title || "Sans titre"}</h4>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            
            {questions.map((question) => (
              <div key={question.id} className="bg-gray-50 rounded-md p-4 border mb-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{question.question_text}</p>
                    {question.description && (
                      <p className="text-xs text-gray-500">{question.description}</p>
                    )}
                    {question.required && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
                
                {question.question_type === "text" && (
                  <div className="h-8 bg-white rounded border mt-2"></div>
                )}
                
                {question.question_type === "multipleChoice" && (
                  <div className="mt-2 space-y-1">
                    {question.options?.choices?.map((option: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border"></div>
                        <span className="text-xs">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === "checkboxes" && (
                  <div className="mt-2 space-y-1">
                    {question.options?.choices?.map((option: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border"></div>
                        <span className="text-xs">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === "dropdown" && (
                  <div className="mt-2">
                    <select disabled className="w-full text-xs p-1 border rounded text-gray-400">
                      <option>Sélectionnez une option</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-4">
              <Button disabled className="w-full">Soumettre</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
