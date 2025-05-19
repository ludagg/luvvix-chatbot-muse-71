
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { List, ListCheck, Layout, LayoutGrid, FileText, Share, Edit, Copy } from "lucide-react";

interface FormEditorProps {
  formId?: string;
}

const FormEditor = ({ formId }: FormEditorProps) => {
  const [title, setTitle] = useState(formId ? "Mon formulaire" : "Nouveau formulaire");
  const [description, setDescription] = useState(formId ? "Description du formulaire" : "");
  const [questions, setQuestions] = useState([
    { 
      id: "1", 
      type: "text", 
      required: true,
      title: "Votre nom complet",
      description: "Veuillez saisir vos nom et prénom"
    },
    { 
      id: "2", 
      type: "multipleChoice", 
      required: false,
      title: "Comment avez-vous découvert notre service ?",
      description: "Sélectionnez une option",
      options: ["Réseaux sociaux", "Moteur de recherche", "Recommandation", "Autre"]
    }
  ]);
  
  const form = useForm();
  
  const addQuestion = (type: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      required: false,
      title: "Nouvelle question",
      description: ""
    };
    setQuestions([...questions, newQuestion]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none focus:ring-0 p-0 mb-2"
            placeholder="Titre du formulaire"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-gray-500 border-none focus:ring-0 p-0"
            placeholder="Description (optionnelle)"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Publier
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Titre & Description</h3>
            <div className="space-y-4">
              <Form {...form}>
                <FormField
                  name="formTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du formulaire</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Saisissez un titre" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  name="formDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ajoutez une description" 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
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
          
          {questions.map((question, index) => (
            <Card key={question.id} className="mb-4 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Input 
                    value={question.title}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[index].title = e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                    className="text-lg font-medium border-none focus:ring-0 p-0 mb-2"
                    placeholder="Question sans titre"
                  />
                  <Input 
                    value={question.description}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[index].description = e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                    className="text-sm text-gray-500 border-none focus:ring-0 p-0"
                    placeholder="Description (optionnelle)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    Supprimer
                  </Button>
                </div>
              </div>
              
              {question.type === "text" && (
                <Input disabled placeholder="Texte court" className="bg-gray-50 mt-4" />
              )}
              
              {question.type === "multipleChoice" && (
                <div className="space-y-2 mt-4">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                      <Input 
                        value={option}
                        onChange={(e) => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[index].options![optionIndex] = e.target.value;
                          setQuestions(updatedQuestions);
                        }}
                        className="border-none focus:ring-0"
                      />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    + Ajouter une option
                  </Button>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={question.required}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index].required = e.target.checked;
                        setQuestions(updatedQuestions);
                      }}
                      id={`required-${question.id}`}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`required-${question.id}`} className="text-sm">Obligatoire</label>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Type de question
                </Button>
              </div>
            </Card>
          ))}
          
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
                    <p className="font-medium">{question.title}</p>
                    {question.description && (
                      <p className="text-xs text-gray-500">{question.description}</p>
                    )}
                    {question.required && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
                
                {question.type === "text" && (
                  <div className="h-8 bg-white rounded border mt-2"></div>
                )}
                
                {question.type === "multipleChoice" && (
                  <div className="mt-2 space-y-1">
                    {question.options?.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border"></div>
                        <span className="text-xs">{option}</span>
                      </div>
                    ))}
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
