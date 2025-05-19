import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Settings } from "lucide-react";
import FormNav from "@/components/forms/FormNav";
import formsService from "@/services/forms-service";

interface FormEditorProps {
  formId?: string;
}

const FormEditor = ({ formId }: FormEditorProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Formulaire sans titre");
  const [description, setDescription] = useState("");
  
  const { data: form, isLoading, error } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
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
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSave = async () => {
    if (!formId) {
      // If no formId, create a new form
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        navigate(`/forms/edit/${newForm.id}`);
      }
    } else {
      // If formId exists, update the existing form
      updateFormMutation.mutate({ title: title, description: description });
    }
  };

  const handleAddQuestion = async () => {
    if (!formId) {
      // If no formId, create a new form
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        navigate(`/forms/edit/${newForm.id}`);
        // After creating the form, add a default question
        await formsService.saveQuestion({
          form_id: newForm.id,
          question_text: "Nouvelle question",
          question_type: "text",
          position: 1,
          required: false,
        });
        queryClient.invalidateQueries({ queryKey: ["formQuestions", newForm.id] });
      }
    } else {
      // If formId exists, add a default question
      await formsService.saveQuestion({
        form_id: formId,
        question_text: "Nouvelle question",
        question_type: "text",
        position: 1,
        required: false,
      });
      queryClient.invalidateQueries({ queryKey: ["formQuestions", formId] });
    }
  };

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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-500 mb-4">Impossible de charger le formulaire.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {formId && <FormNav formId={formId} activeTab="editor" />}
      
      <div className="mt-6">
        <Card className="p-6">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Titre du formulaire"
              value={title}
              onChange={handleTitleChange}
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
            <Button onClick={handleSave} variant="primary">
              Enregistrer
            </Button>
            <Button onClick={handleAddQuestion} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FormEditor;
