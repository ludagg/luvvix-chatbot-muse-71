
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText } from "lucide-react";

const FormsHeader = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementer la recherche
  };
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">LuvviX Forms</h1>
          </div>
          <Button 
            onClick={() => navigate("/forms/create")}
            className="bg-purple-600 hover:bg-purple-700 z-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau formulaire
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher vos formulaires..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 rounded-full border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            />
          </div>
        </form>
        
        <div className="flex gap-4 justify-center mt-6">
          <Button variant="outline" className="bg-white">Mes formulaires</Button>
          <Button variant="outline" className="bg-white">Partagés avec moi</Button>
          <Button variant="outline" className="bg-white">Favoris</Button>
        </div>
      </div>
    </div>
  );
};

export default FormsHeader;
