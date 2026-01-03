'use client';

import { CustomerCategory } from '@/services/customerMenuService';

interface CategoryTabsProps {
  categories: CustomerCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="overflow-x-auto">
        <div className="flex space-x-2 px-4 py-3 min-w-max">
          <button
            onClick={() => onSelectCategory(null)}
            className={`
              px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors
              ${selectedCategory === null
                ? 'bg-[#22C55E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`
                px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors
                ${selectedCategory === category._id
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;


