
import React from 'react';
import { Tag, Check } from 'lucide-react';
import { useNewsPreferences } from '@/hooks/use-news-preferences';

const NewsCategoriesSettings = () => {
  const { preferences, updatePreferences } = useNewsPreferences();

  const availableCategories = [
    { id: 'general', name: 'Général', icon: '📰' },
    { id: 'technology', name: 'Technologie', icon: '💻' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'health', name: 'Santé', icon: '🏥' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'entertainment', name: 'Divertissement', icon: '🎬' },
    { id: 'politics', name: 'Politique', icon: '🏛️' }
  ];

  const toggleCategory = (categoryId: string) => {
    const currentCategories = preferences.categories;
    let newCategories: string[];

    if (currentCategories.includes(categoryId)) {
      // Retirer la catégorie (minimum 1 catégorie)
      if (currentCategories.length > 1) {
        newCategories = currentCategories.filter(id => id !== categoryId);
      } else {
        return; // Ne pas permettre de tout désélectionner
      }
    } else {
      // Ajouter la catégorie (maximum 3 catégories)
      if (currentCategories.length < 3) {
        newCategories = [...currentCategories, categoryId];
      } else {
        return; // Ne pas permettre plus de 3 catégories
      }
    }

    updatePreferences({ categories: newCategories });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center space-x-2 mb-3">
        <Tag className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900">Catégories préférées</h3>
        <span className="text-xs text-gray-500 ml-auto">
          {preferences.categories.length}/3
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {availableCategories.map((category) => {
          const isSelected = preferences.categories.includes(category.id);
          const canSelect = !isSelected && preferences.categories.length < 3;
          const canDeselect = isSelected && preferences.categories.length > 1;
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              disabled={!canSelect && !canDeselect}
              className={`p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : canSelect
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {category.name}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Sélectionnez 1 à 3 catégories
      </p>
    </div>
  );
};

export default NewsCategoriesSettings;
