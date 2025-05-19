
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Share, Edit, Plus } from "lucide-react";

// Types de formulaires de démonstration en attendant l'intégration avec une base de données
interface Form {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  responses: number;
  lastEdited: string;
}

const FormsList = () => {
  const navigate = useNavigate();
  
  // Formulaires de démonstration
  const [forms] = useState<Form[]>([
    {
      id: "1",
      title: "Formulaire de satisfaction client",
      description: "Évaluation de la satisfaction des clients après un achat",
      createdAt: "2023-05-15",
      responses: 124,
      lastEdited: "2023-05-18",
    },
    {
      id: "2",
      title: "Inscription à l'événement",
      description: "Formulaire d'inscription pour la conférence annuelle",
      createdAt: "2023-04-20",
      responses: 89,
      lastEdited: "2023-05-10",
    },
    {
      id: "3",
      title: "Sondage de préférences",
      description: "Collecte des préférences utilisateurs pour notre prochain produit",
      createdAt: "2023-05-01",
      responses: 45,
      lastEdited: "2023-05-12",
    },
  ]);
  
  return (
    <div>
      {forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-700" />
                  </div>
                  <div className="text-sm text-gray-500">
                    {form.responses} réponses
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-1 line-clamp-2">{form.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{form.description}</p>
                <div className="text-xs text-gray-400">
                  Créé le {form.createdAt} • Modifié le {form.lastEdited}
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-gray-50 gap-2 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/forms/edit/${form.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Partager
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Dupliquer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Vous n'avez pas encore de formulaires</h3>
          <p className="text-gray-500 mb-6">Créez votre premier formulaire pour commencer à collecter des réponses</p>
          <Button 
            onClick={() => navigate("/forms/create")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau formulaire
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormsList;
