'use client';

import { Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NewsFilterProps {
  categories: Category[];
  onFilterChange: (search: string, categoryId: string) => void;
}

export default function NewsFilter({ categories, onFilterChange }: NewsFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(search, selectedCategory);
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, [search, selectedCategory, onFilterChange]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาหัวข้อข่าว หรือเนื้อหา..."
          className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
        />
      </div>

      {/* Category Dropdown */}
      <div className="w-full md:w-64">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
        >
          <option value="">ทุกหมวดหมู่ (All Categories)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {(search || selectedCategory) && (
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-1.5 w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ล้างค่า</span>
        </button>
      )}
    </div>
  );
}
