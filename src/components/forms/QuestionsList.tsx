
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, Plus, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FormQuestion } from "@/services/forms-service";

interface QuestionsListProps {
  questions: FormQuestion[];
  onDragEnd: (result: any) => void;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onUpdate: (questionId: string, field: string, value: any) => void;
  editingQuestion: string | null;
}

const QuestionsList = ({
  questions,
  onDragEnd,
  onEdit,
  onDelete,
  onUpdate,
  editingQuestion
}: QuestionsListProps) => {
  if (questions.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                      onEdit={() => onEdit(question.id)}
                      onDelete={() => onDelete(question.id)}
                      onUpdate={(field, value) => onUpdate(question.id, field, value)}
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
    { value: "email", label: "Email" },
    { value: "number", label: "Nombre" },
    { value: "date", label: "Date" },
    { value: "phone", label: "Téléphone" },
    { value: "url", label: "URL" },
  ];
  
  // Fonction pour ajouter une nouvelle option
  const addOption = () => {
    const currentChoices = question.options?.choices || [];
    onUpdate("options", { 
      ...question.options,
      choices: [...currentChoices, ""]
    });
  };

  // Fonction pour supprimer une option
  const removeOption = (indexToRemove: number) => {
    const newChoices = (question.options?.choices || []).filter((_, i) => i !== indexToRemove);
    onUpdate("options", { 
      ...question.options,
      choices: newChoices
    });
  };

  // Fonction pour mettre à jour une option spécifique
  const updateOption = (index: number, value: string) => {
    const newChoices = [...(question.options?.choices || [])];
    newChoices[index] = value;
    onUpdate("options", { 
      ...question.options,
      choices: newChoices
    });
  };

  // Fonction pour empêcher l'événement par défaut (soumission du formulaire) sur la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <Input 
                value={question.question_text} 
                onChange={(e) => onUpdate("question_text", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Texte de la question" 
                className="text-lg font-medium w-full"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                <Textarea
                  value={question.description || ''} 
                  onChange={(e) => onUpdate("description", e.target.value)}
                  placeholder="Description ou aide pour cette question"
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="w-1/2 min-w-[200px]">
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter une option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {(question.options?.choices || []).map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={choice}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="p-1"
                          title="Supprimer cette option"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}

                    {(question.options?.choices || []).length === 0 && (
                      <div className="text-sm text-gray-500 italic p-2 text-center border border-dashed rounded-md">
                        Aucune option ajoutée
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium">{question.question_text}</h3>
              {question.description && (
                <p className="text-sm text-gray-500 mt-1">{question.description}</p>
              )}
              <div className="flex mt-2 items-center text-sm text-gray-500">
                <span className="mr-3">Type: {questionTypes.find(t => t.value === question.question_type)?.label || question.question_type}</span>
                {question.required && <span className="text-red-500">• Obligatoire</span>}
              </div>
              
              {(question.question_type === "multipleChoice" || 
                question.question_type === "checkboxes" || 
                question.question_type === "dropdown") && 
                question.options?.choices?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Options:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                    {question.options.choices.slice(0, 3).map((choice, i) => (
                      <li key={i}>{choice}</li>
                    ))}
                    {question.options.choices.length > 3 && (
                      <li>+ {question.options.choices.length - 3} autres options</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit} title={isEditing ? "Fermer l'éditeur" : "Modifier la question"}>
            <Edit size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Supprimer la question">
            <Trash size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuestionsList;
