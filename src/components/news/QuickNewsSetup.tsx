
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveSimplifiedPreferences } from '@/services/news-service';

interface QuickNewsSetupProps {
  onComplete: (categories: string[]) => void;
  onDismiss: () => void;
}

const QuickNewsSetup: React.FC<QuickNewsSetupProps> = ({ onComplete, onDismiss }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: 'technology', name: '🔬 Tech', color: 'bg-blue-100 text-blue-800' },
    { id: 'business', name: '💼 Business', color: 'bg-green-100 text-green-800' },
    { id: 'sports', name: '⚽ Sport', color: 'bg-orange-100 text-orange-800' },
    { id: 'entertainment', name: '🎬 Divertissement', color: 'bg-purple-100 text-purple-800' },
    { id: 'health', name: '🏥 Santé', color: 'bg-red-100 text-red-800' },
    { id: 'science', name: '🧪 Sciences', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'world', name: '🌍 International', color: 'bg-gray-100 text-gray-800' },
    { id: 'politics', name: '🏛️ Politique', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner au moins une catégorie',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await saveSimplifiedPreferences(selectedCategories);
      if (success) {
        toast({
          title: 'Préférences sauvegardées',
          description: 'Votre fil d\'actualités est maintenant personnalisé'
        });
        onComplete(selectedCategories);
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-4 my-3 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-sm text-gray-900">
              Personnalisez votre fil
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">
          Choisissez vos centres d'intérêt pour des actualités personnalisées
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategories.includes(category.id) ? "default" : "secondary"}
              className={`cursor-pointer text-xs px-2 py-1 ${
                selectedCategories.includes(category.id)
                  ? 'bg-purple-500 text-white'
                  : category.color
              }`}
              onClick={() => handleCategoryToggle(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={loading || selectedCategories.length === 0}
            className="flex-1 h-8 text-xs bg-purple-500 hover:bg-purple-600"
          >
            {loading ? 'Sauvegarde...' : 'Valider'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickNewsSetup;
