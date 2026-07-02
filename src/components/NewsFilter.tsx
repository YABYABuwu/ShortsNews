'use client';

import { Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
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
    <div className="space-y-5">
      {/* Search and Reset Row */}
      <div className="bg-slate-950/20 backdrop-blur-md border border-slate-900 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาหัวข้อข่าว หรือเนื้อหา..."
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/30 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm transition-all duration-250"
          />
        </div>

        {/* Reset Button */}
        {(search || selectedCategory) && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 w-full md:w-auto px-5 py-2.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {/* Category Pills Container */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 select-none">
        <div className="flex space-x-2.5 min-w-max px-1">
          {/* "All" button */}
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
              selectedCategory === ''
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-slate-200 hover:border-slate-800 cursor-pointer'
            }`}
          >
            📰 ทั้งหมด
          </button>

          {/* Map categories */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const color = category.color || '#6366f1';
            const icon = category.icon || '📁';
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  borderColor: isSelected ? `${color}40` : undefined,
                  color: isSelected ? color : undefined,
                  backgroundColor: isSelected ? `${color}10` : undefined,
                  boxShadow: isSelected ? `0 0 15px ${color}15` : undefined
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer ${
                  isSelected
                    ? ''
                    : 'bg-slate-900/40 text-slate-400 border-slate-900 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <span className="mr-1.5">{icon}</span>
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
