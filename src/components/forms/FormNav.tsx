
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Settings, 
  BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormNavProps {
  formId?: string;
  activeTab: "editor" | "responses" | "settings";
}

const FormNav = ({ formId, activeTab }: FormNavProps) => {
  if (!formId) return null;
  
  const tabs = [
    {
      id: "editor",
      label: "Modifier",
      icon: <FileText className="h-5 w-5" />,
      href: `/forms/edit/${formId}`
    },
    {
      id: "responses",
      label: "Réponses",
      icon: <BarChart2 className="h-5 w-5" />,
      href: `/forms/responses/${formId}`
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: <Settings className="h-5 w-5" />,
      href: `/forms/settings/${formId}`
    }
  ];
  
  return (
    <Card className="p-1">
      <div className="flex">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md flex-1 justify-center transition-colors",
              activeTab === tab.id
                ? "bg-purple-100 text-purple-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default FormNav;
