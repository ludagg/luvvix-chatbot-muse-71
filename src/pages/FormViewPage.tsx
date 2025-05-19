
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import formsService from "@/services/forms-service";
import { toast } from "sonner";

const FormViewPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [responderEmail, setResponderEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ["viewForm", formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["viewFormQuestions", formId],
    queryFn: () => formId ? formsService.getFormQuestions(formId) : [],
    enabled: !!formId,
  });

  const submitFormMutation = useMutation({
    mutationFn: () => {
      if (!formId) throw new Error("ID du formulaire manquant");
      return formsService.submitFormResponse(formId, answers, responderEmail);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Merci ! Votre réponse a été enregistrée.");
    },
    onError: () => {
      toast.error("Une erreur s'est produite lors de la soumission du formulaire.");
    },
  });

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    const requiredQuestions = questions?.filter(q => q.required) || [];
    const unansweredRequired = requiredQuestions.filter(q => !answers[q.id]);
    
    if (unansweredRequired.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions obligatoires (${unansweredRequired.length} non répondue${unansweredRequired.length > 1 ? 's' : ''})`);
      return;
    }
    
    submitFormMutation.mutate();
  };

  if (isLoadingForm || isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulaire introuvable</h2>
            <p className="text-gray-600 mb-6">Ce formulaire n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => navigate("/forms")}>Retour aux formulaires</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!form.published) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulaire non publié</h2>
            <p className="text-gray-600 mb-6">Ce formulaire n'est pas encore disponible au public.</p>
            <Button onClick={() => navigate("/forms")}>Retour aux formulaires</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre réponse !</h2>
            <p className="text-gray-600 mb-6">Votre réponse a été enregistrée avec succès.</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => window.location.reload()}>Soumettre une autre réponse</Button>
              <Button onClick={() => navigate("/forms")}>Retour aux formulaires</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{form.title}</h1>
            </div>
            {form.description && (
              <p className="text-gray-600 mb-4">{form.description}</p>
            )}
          </Card>
          
          {questions?.map((question) => (
            <Card key={question.id} className="p-6 mb-4">
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-800">
                  {question.question_text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {question.description && (
                  <p className="text-gray-500 text-sm mt-1">{question.description}</p>
                )}
              </div>
              
              {question.question_type === "text" && (
                <div className="mt-4">
                  {question.description?.toLowerCase().includes("long") ? (
                    <Textarea 
                      value={answers[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder="Votre réponse"
                      className="w-full"
                      rows={4}
                    />
                  ) : (
                    <Input 
                      value={answers[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder="Votre réponse"
                      className="w-full"
                    />
                  )}
                </div>
              )}
              
              {question.question_type === "multipleChoice" && (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleInputChange(question.id, value)}
                  className="mt-4 space-y-2"
                >
                  {question.options?.choices?.map((option: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem id={`${question.id}-option-${i}`} value={option} />
                      <label
                        htmlFor={`${question.id}-option-${i}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {question.question_type === "checkboxes" && (
                <div className="mt-4 space-y-2">
                  {question.options?.choices?.map((option: string, i: number) => {
                    const checkboxId = `${question.id}-checkbox-${i}`;
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <Checkbox 
                          id={checkboxId} 
                          checked={(answers[question.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentValues = answers[question.id] || [];
                            let newValues;
                            if (checked) {
                              newValues = [...currentValues, option];
                            } else {
                              newValues = currentValues.filter((val: string) => val !== option);
                            }
                            handleInputChange(question.id, newValues);
                          }} 
                        />
                        <label
                          htmlFor={checkboxId}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {question.question_type === "dropdown" && (
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-4"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                >
                  <option value="">Sélectionnez une option</option>
                  {question.options?.choices?.map((option: string, i: number) => (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </Card>
          ))}
          
          <Card className="p-6 mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Votre adresse e-mail (optionnel)
            </label>
            <Input
              type="email"
              value={responderEmail}
              onChange={(e) => setResponderEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full mb-4"
            />
            <p className="text-gray-500 text-sm">
              Cette adresse e-mail ne sera utilisée que pour vous contacter au sujet de vos réponses au formulaire.
            </p>
          </Card>
          
          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={submitFormMutation.isPending}
            >
              {submitFormMutation.isPending ? "Envoi en cours..." : "Soumettre"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default FormViewPage;
