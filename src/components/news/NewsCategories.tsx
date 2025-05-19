
import React from 'react';
import { Button } from "@/components/ui/button";

interface NewsCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'Tous' },
  { id: 'business', name: 'Business' },
  { id: 'entertainment', name: 'Divertissement' },
  { id: 'general', name: 'Général' },
  { id: 'health', name: 'Santé' },
  { id: 'science', name: 'Science' },
  { id: 'sports', name: 'Sport' },
  { id: 'technology', name: 'Technologie' }
];

const NewsCategories: React.FC<NewsCategoriesProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Catégories</h2>
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "luvvix" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className="mb-2"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NewsCategories;
