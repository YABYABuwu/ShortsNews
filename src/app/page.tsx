'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchArticles, fetchCategories } from '@/lib/supabase/actions';
import NewsFilter from '@/components/NewsFilter';
import ArticleCard from '@/components/ArticleCard';
import { Newspaper, Loader2, Sparkles, Inbox } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  original_url?: string;
  source?: string;
  image_url?: string;
  created_at: string;
  category_id?: string;
  categories?: Category | Category[] | null;
}

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Fetch initial categories
  useEffect(() => {
    fetchCategories()
      .then((data: any) => {
        setCategories(data);
      })
      .catch(() => {
        console.error('Failed to load categories');
      });
  }, []);

  // Fetch articles based on filters
  const loadArticles = useCallback(async (searchQuery?: string, catId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await fetchArticles(searchQuery, catId);
      setArticles(data);
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการโหลดบทสรุปข่าว กรุณาลองใหม่อีกครั้ง');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes (called by NewsFilter child component)
  const handleFilterChange = useCallback((newSearch: string, newCategoryId: string) => {
    setSearch(newSearch);
    setCategoryId(newCategoryId);
    loadArticles(newSearch, newCategoryId);
  }, [loadArticles]);

  // Initial fetch
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered News Summarizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          สรุปข่าวสั้น ทันทุกเหตุการณ์
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-450 text-slate-400">
          ประหยัดเวลาอ่านข่าวด้วยบทสรุปใจความสำคัญที่กระชับ แม่นยำ และเข้าใจง่าย อัปเดตแบบเรียลไทม์
        </p>
      </div>

      {/* Filter Component */}
      <NewsFilter categories={categories} onFilterChange={handleFilterChange} />

      {/* Content Section */}
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-5 rounded-xl text-center font-medium max-w-lg mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-450 text-sm font-semibold text-slate-400">กำลังโหลดข่าวสารล่าสุด...</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 bg-slate-900/50 rounded-full border border-slate-800">
            <Inbox className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-350 text-slate-200">ไม่พบข้อมูลสรุปข่าว</h3>
          <p className="text-sm text-slate-500">
            {search || categoryId
              ? 'ไม่พบบทความสรุปข่าวตามเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'
              : 'ขณะนี้ยังไม่มีบทความข่าวสารในระบบ กดที่ "Create Post" เพื่อเพิ่มข่าวด้วยตัวเอง'}
          </p>
        </div>
      )}
    </div>
  );
}
