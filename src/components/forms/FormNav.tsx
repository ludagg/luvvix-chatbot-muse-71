
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, Settings } from "lucide-react";

interface FormNavProps {
  formId?: string;
  activeTab: "editor" | "responses" | "settings";
}

const FormNav = ({ formId, activeTab }: FormNavProps) => {
  const navigate = useNavigate();
  
  if (!formId) return null;
  
  return (
    <div className="border-b mb-4">
      <div className="flex space-x-1 overflow-x-auto">
        <Button
          variant={activeTab === "editor" ? "default" : "ghost"}
          onClick={() => navigate(`/forms/edit/${formId}`)}
          className="flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Créer
        </Button>
        <Button
          variant={activeTab === "responses" ? "default" : "ghost"}
          onClick={() => navigate(`/forms/responses/${formId}`)}
          className="flex items-center"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Réponses
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          onClick={() => navigate(`/forms/settings/${formId}`)}
          className="flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
      </div>
    </div>
  );
};

export default FormNav;
