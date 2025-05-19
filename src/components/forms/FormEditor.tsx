import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import FormNav from "@/components/forms/FormNav";
import QuestionCreator from "@/components/forms/QuestionCreator";
import QuestionsList from "@/components/forms/QuestionsList";
import formsService, { FormQuestion } from "@/services/forms-service";
import { Helmet } from "react-helmet-async";

interface FormEditorProps {
  formId?: string;
}

const FormEditor = ({ formId }: FormEditorProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Formulaire sans titre");
  const [description, setDescription] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  
  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["formQuestions", formId],
    queryFn: () => formId ? formsService.getFormQuestions(formId) : [],
    enabled: !!formId,
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setFormChanged(false);
    }
  }, [form]);

  const updateFormMutation = useMutation({
    mutationFn: (updates: { title: string; description: string | null }) => {
      if (!formId) throw new Error("Form ID is required to update the form.");
      return formsService.updateForm(formId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      setFormChanged(false);
      toast.success("Formulaire enregistré avec succès");
    },
  });

  const saveQuestionMutation = useMutation({
    mutationFn: (question: Partial<FormQuestion>) => {
      return formsService.saveQuestion(question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
      setEditingQuestion(null);
      toast.success("Question enregistrée");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => {
      return formsService.deleteQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
      toast.success("Question supprimée");
    },
  });

  const updateQuestionsOrderMutation = useMutation({
    mutationFn: (orderedQuestions: Partial<FormQuestion>[]) => {
      if (!Array.isArray(orderedQuestions)) throw new Error("Questions must be an array");
      const updatesForOrder = orderedQuestions.map((q, index) => ({
        id: q.id!,
        position: index + 1,
        form_id: q.form_id!,
        question_text: q.question_text!,
        question_type: q.question_type!
      }));
      return formsService.updateQuestionOrder(updatesForOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
      toast.success("Ordre des questions mis à jour");
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setFormChanged(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setFormChanged(true);
  };

  // Fonction pour empêcher l'envoi du formulaire avec la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSave = async () => {
    if (!formId) {
      // Si pas de formId, créer un nouveau formulaire
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        toast.success("Nouveau formulaire créé");
        navigate(`/forms/edit/${newForm.id}`);
      }
    } else {
      // Si formId existe, mettre à jour le formulaire existant
      updateFormMutation.mutate({ title: title, description: description });
    }
  };

  // Fix: Make sure questionType is one of the allowed types in FormQuestion
  const handleAddQuestion = async (questionType: FormQuestion["question_type"] = "text") => {
    if (!formId) {
      // Si pas de formId, créer un nouveau formulaire
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        navigate(`/forms/edit/${newForm.id}`);
        // Après création du formulaire, ajouter une question par défaut
        await formsService.saveQuestion({
          form_id: newForm.id,
          question_text: "Nouvelle question",
          question_type: questionType,
          position: questions.length + 1,
          required: false,
        });
        queryClient.invalidateQueries({ queryKey: ["formQuestions", newForm.id] });
      }
    } else {
      // Si formId existe, ajouter une question par défaut
      await formsService.saveQuestion({
        form_id: formId,
        question_text: "Nouvelle question",
        question_type: questionType,
        position: questions.length + 1,
        required: false,
      });
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestion(editingQuestion === questionId ? null : questionId);
  };

  const handleQuestionChange = (questionId: string, field: string, value: any) => {
    const updatedQuestion = questions.find(q => q.id === questionId);
    if (!updatedQuestion) return;
    
    const update = { 
      ...updatedQuestion, 
      [field]: value 
    };
    
    saveQuestionMutation.mutate(update);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedQuestions = [...questions];
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);
    
    // Mettre à jour les positions
    const questionsWithNewPositions = reorderedQuestions.map((q, index) => ({
      ...q,
      position: index + 1
    }));
    
    updateQuestionsOrderMutation.mutate(questionsWithNewPositions);
  };

  const isLoading = formLoading || questionsLoading;
  
  // Ajout du titre dynamique en fonction du titre du formulaire
  const pageTitle = formId 
    ? title ? `Modifier: ${title}` : "Modifier le formulaire"
    : "Créer un formulaire";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Helmet>
        <title>{pageTitle} | LuvviX Forms</title>
      </Helmet>
      
      {formId && <FormNav formId={formId} activeTab="editor" />}
      
      <div className="mt-6">
        <Card className="p-6">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Titre du formulaire"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleKeyDown}
              className="text-2xl font-bold mb-2"
            />
            <Textarea
              placeholder="Description du formulaire"
              value={description}
              onChange={handleDescriptionChange}
              className="text-gray-600"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button 
              onClick={handleSave} 
              variant="default" 
              disabled={!formChanged && !!formId}
            >
              Enregistrer
            </Button>
          </div>
        </Card>
        
        {/* Interface d'ajout de questions améliorée */}
        <QuestionCreator formId={formId} onAddQuestion={handleAddQuestion} />

        {/* Liste des questions existantes */}
        <div className="space-y-4 mt-6">
          {questions.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-gray-500 mb-4">Aucune question dans ce formulaire</p>
              <Button onClick={() => handleAddQuestion("text")} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre première question
              </Button>
            </Card>
          ) : (
            <QuestionsList
              questions={questions}
              onDragEnd={handleDragEnd}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onUpdate={handleQuestionChange}
              editingQuestion={editingQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
