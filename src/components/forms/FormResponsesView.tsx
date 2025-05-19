
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import formsService, { FormSubmission, FormQuestion } from "@/services/forms-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import FormNav from "@/components/forms/FormNav";
import FormResponsesStats from "@/components/forms/FormResponsesStats";
import FormResponsesTable from "@/components/forms/FormResponsesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormResponsesViewProps {
  formId?: string;
}

const FormResponsesView = ({ formId }: FormResponsesViewProps) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"stats" | "table">("stats");
  
  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });
  
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ["formResponses", formId],
    queryFn: () => formId ? formsService.getFormResponses(formId) : [],
    enabled: !!formId,
  });
  
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["formQuestions", formId],
    queryFn: () => formId ? formsService.getFormQuestions(formId) : [],
    enabled: !!formId,
  });
  
  if (isLoadingForm || isLoadingResponses || isLoadingQuestions) {
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
      <FormNav formId={formId} activeTab="responses" />
      
      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{form.title}</h1>
            <p className="text-gray-500 text-sm">{responses.length} {responses.length === 1 ? 'réponse' : 'réponses'}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/forms/view/${formId}`, '_blank')}
              className="text-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Voir le formulaire
            </Button>
          </div>
        </div>
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "stats" | "table")}>
          <div className="flex justify-between items-center border-b mb-6">
            <TabsList>
              <TabsTrigger value="stats">Analyse</TabsTrigger>
              <TabsTrigger value="table">Tableau des réponses</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="stats">
            <FormResponsesStats formId={formId!} />
          </TabsContent>
          
          <TabsContent value="table">
            <FormResponsesTable 
              responses={responses} 
              questions={questions} 
              formId={formId!} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FormResponsesView;
