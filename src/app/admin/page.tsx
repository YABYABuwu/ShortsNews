'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { fetchCategories, addArticle } from '@/lib/supabase/actions';
import { PlusCircle, Link as LinkIcon, Newspaper, Heading, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [source, setSource] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Authenticate user session
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        // Redirect if not logged in
        router.push('/login');
      } else {
        // 2. Fetch categories for selector
        fetchCategories()
          .then((data: any) => {
            setCategories(data);
            if (data.length > 0) setCategoryId(data[0].id);
            setLoading(false);
          })
          .catch((err) => {
            setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
            setLoading(false);
          });
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim() || !summary.trim()) {
      setError('กรุณากรอกหัวข้อข่าวและบทสรุป');
      return;
    }

    setSubmitting(true);

    try {
      await addArticle({
        title,
        summary,
        original_url: originalUrl || undefined,
        source: source || undefined,
        category_id: categoryId || undefined,
      });

      setSuccess(true);
      // Reset form fields
      setTitle('');
      setSummary('');
      setOriginalUrl('');
      setSource('');
      
      // Redirect back to dashboard after a delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลข่าว');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <p className="text-slate-400 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <PlusCircle className="text-cyan-400 w-7 h-7" />
            <span>เพิ่มข่าวใหม่เข้าระบบ (Manual Post)</span>
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            กรอกข้อมูลสรุปข่าวที่ได้ทำการสรุปแล้ว เพื่อบันทึกลงสู่ระบบฐานข้อมูล ShortsNews
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-lg flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-950/40 border border-green-800 text-green-400 p-4 rounded-lg flex items-start space-x-2.5 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400 animate-pulse" />
            <span>บันทึกข่าวลงฐานข้อมูลสำเร็จ! กำลังนำทางคุณกลับไปยังหน้า Dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Heading className="w-4 h-4 text-slate-450" />
              <span>หัวข้อข่าว (News Title) *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
              placeholder="เช่น Bitcoin พุ่งทะลุ 100,000 ดอลลาร์เป็นครั้งแรกในประวัติศาสตร์"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              หมวดหมู่ข่าว (Category) *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-450" />
              <span>เนื้อหาสรุปย่อ (Short Summary) *</span>
            </label>
            <textarea
              required
              rows={6}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
              placeholder="กรอกเนื้อหาใจความสำคัญของข่าวที่ผ่านการย่อยและสรุปสั้นเป็นข้อๆ หรือย่อหน้าสั้น..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Original URL */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                <LinkIcon className="w-4 h-4 text-slate-450" />
                <span>ลิงก์ต้นฉบับ (Original URL)</span>
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                placeholder="https://example.com/news-article"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Newspaper className="w-4 h-4 text-slate-450" />
                <span>แหล่งข่าวอ้างอิง (Source / Publisher)</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-200"
                placeholder="เช่น TechCrunch, Reuters, Bloomberg"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-bold transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-sm font-extrabold shadow-lg shadow-indigo-950/50 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกบทสรุปข่าว'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
