
import React from 'react';
import { Category } from './types';

interface CategoryTabsProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onTabChange(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
            activeTab === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category.icon}
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
