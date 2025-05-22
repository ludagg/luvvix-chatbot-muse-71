
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle, GripVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  choices?: string[];
}

interface QuestionItemProps {
  question: Question;
  index: number;
  onQuestionChange: (index: number, updatedQuestion: Question) => void;
  onQuestionDelete: (index: number) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, onQuestionChange, onQuestionDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onQuestionChange(index, { ...question, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    onQuestionChange(index, { ...question, type: value });
  };

  const handleRequiredChange = (checked: boolean) => {
    onQuestionChange(index, { ...question, required: checked });
  };

  const handleChoiceChange = (choiceIndex: number, value: string) => {
    if (!question.choices) return;
    const updatedChoices = [...question.choices];
    updatedChoices[choiceIndex] = value;
    onQuestionChange(index, { ...question, choices: updatedChoices });
  };

  const addChoice = () => {
    const updatedChoices = question.choices ? [...question.choices, ""] : [""];
    onQuestionChange(index, { ...question, choices: updatedChoices });
  };

  const deleteChoice = (choiceIndex: number) => {
    if (!question.choices) return;
    const updatedChoices = question.choices.filter((choice: string, i: number) => i !== choiceIndex);
    onQuestionChange(index, { ...question, choices: updatedChoices });
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          Question #{index + 1} <Badge variant="secondary">{question.type}</Badge>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch id={`required-${question.id}`} checked={question.required} onCheckedChange={handleRequiredChange} />
          <Label htmlFor={`required-${question.id}`} className="text-nowrap">Required</Label>
          <Button variant="ghost" size="icon" onClick={() => onQuestionDelete(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`label-${question.id}`}>Label</Label>
          <Input id={`label-${question.id}`} name="label" value={question.label} onChange={handleInputChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`description-${question.id}`}>Description</Label>
          <Textarea
            id={`description-${question.id}`}
            name="description"
            value={question.description || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`type-${question.id}`}>Type</Label>
          <Select value={question.type} onValueChange={handleSelectChange}>
            <SelectTrigger id={`type-${question.id}`}>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {["select", "radio", "checkbox"].includes(question.type) && (
          <div className="grid gap-2">
            <Label>Choices</Label>
            {question.choices?.map((choice: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => deleteChoice(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addChoice}>
              Add Choice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface QuestionsListProps {
  questions: Question[];
  onQuestionsChange: (updatedQuestions: Question[]) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions, onQuestionsChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      onQuestionsChange(newQuestions);
    }
  };

  const handleQuestionChange = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    onQuestionsChange(updatedQuestions);
  };

  const handleQuestionDelete = (index: number) => {
    const updatedQuestions = questions.filter((_: Question, i: number) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={questions.map(q => q.id)}>
        <div>
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              onQuestionChange={handleQuestionChange}
              onQuestionDelete={handleQuestionDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuestionsList;
