
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Settings, ArrowDown, ArrowUp, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import FormNav from "@/components/forms/FormNav";
import formsService, { FormQuestion } from "@/services/forms-service";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface FormEditorProps {
  formId?: string;
}

const FormEditor = ({ formId }: FormEditorProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("Formulaire sans titre");
  const [description, setDescription] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  
  // Scroll to top safely with offset to account for navbar
  useEffect(() => {
    // Add padding to the top of the editor to account for the navbar
    if (editorRef.current) {
      const navbarHeight = 70; // Approximate height of navbar
      editorRef.current.style.paddingTop = `${navbarHeight}px`;
    }
  }, []);
  
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
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSave = async () => {
    if (!formId) {
      // If no formId, create a new form
      const newForm = await formsService.createForm(title, description);
      if (newForm) {
        toast.success("Nouveau formulaire créé");
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
          position: questions.length + 1,
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
    
    // Update positions
    const questionsWithNewPositions = reorderedQuestions.map((q, index) => ({
      ...q,
      position: index + 1
    }));
    
    updateQuestionsOrderMutation.mutate(questionsWithNewPositions);
  };

  const isLoading = formLoading || questionsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="animate-pulse space-y-6 pt-16">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl" ref={editorRef}>
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
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
            <Button onClick={handleAddQuestion} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        </Card>

        <div className="space-y-4 mt-6">
          {questions.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-gray-500 mb-4">Aucune question dans ce formulaire</p>
              <Button onClick={handleAddQuestion} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre première question
              </Button>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {questions.map((question, index) => (
                      <Draggable 
                        key={question.id} 
                        draggableId={question.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative"
                          >
                            <QuestionCard
                              question={question}
                              isEditing={editingQuestion === question.id}
                              onEdit={() => handleEditQuestion(question.id)}
                              onDelete={() => handleDeleteQuestion(question.id)}
                              onUpdate={(field, value) => handleQuestionChange(question.id, field, value)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuestionCardProps {
  question: FormQuestion;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: any) => void;
}

const QuestionCard = ({ question, isEditing, onEdit, onDelete, onUpdate }: QuestionCardProps) => {
  const questionTypes = [
    { value: "text", label: "Texte court" },
    { value: "textarea", label: "Texte long" },
    { value: "multipleChoice", label: "Choix multiple" },
    { value: "checkboxes", label: "Cases à cocher" },
    { value: "dropdown", label: "Liste déroulante" },
  ];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <Input 
                value={question.question_text} 
                onChange={(e) => onUpdate("question_text", e.target.value)}
                placeholder="Texte de la question" 
                className="text-lg font-medium w-full"
              />
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
                  <select 
                    value={question.question_type} 
                    onChange={(e) => onUpdate("question_type", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`required-${question.id}`}
                    checked={question.required}
                    onChange={(e) => onUpdate("required", e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor={`required-${question.id}`}>Obligatoire</label>
                </div>
              </div>
              
              {(question.question_type === "multipleChoice" || 
                question.question_type === "checkboxes" || 
                question.question_type === "dropdown") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (une par ligne)</label>
                  <Textarea
                    value={question.options?.choices?.join('\n') || ''}
                    onChange={(e) => onUpdate("options", { 
                      ...question.options,
                      choices: e.target.value.split('\n').filter(line => line.trim() !== '')
                    })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    className="h-24"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium">{question.question_text}</h3>
              <div className="flex mt-2 items-center text-sm text-gray-500">
                <span className="mr-3">Type: {questionTypes.find(t => t.value === question.question_type)?.label || question.question_type}</span>
                {question.required && <span className="text-red-500">• Obligatoire</span>}
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormEditor;
