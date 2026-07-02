'use client';

import { X, Calendar, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
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

interface ArticleDetailModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleDetailModal({ article, isOpen, onClose }: ArticleDetailModalProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsScrolled(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract category helper
  const getCategoryData = () => {
    if (!article.categories) return { name: 'ทั่วไป', color: '#6366f1', icon: '📰' };
    if (Array.isArray(article.categories)) {
      const cat = article.categories[0];
      return {
        name: cat?.name || 'ทั่วไป',
        color: cat?.color || '#6366f1',
        icon: cat?.icon || '📰'
      };
    }
    return {
      name: article.categories.name || 'ทั่วไป',
      color: article.categories.color || '#6366f1',
      icon: article.categories.icon || '📰'
    };
  };

  const catData = getCategoryData();

  const formattedDate = new Date(article.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Extract bullet points from AI summary
  const parseSummaryPoints = (summaryText: string): string[] => {
    if (!summaryText) return [];
    return summaryText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Clean up common bullet prefixes like: -, *, •, 1., 2., 3., etc.
        return line.replace(/^([-\*•]|\d+\.)\s*/, '').trim();
      });
  };

  const points = parseSummaryPoints(article.summary);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Dynamic backdrop glow matching the category color */}
        <div 
          style={{
            background: `radial-gradient(circle at center, ${catData.color}15 0%, transparent 70%)`
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none -z-10 blur-2xl"
        />

        {/* Decorative Top Glow */}
        <div 
          style={{
            background: `linear-gradient(to right, ${catData.color}, ${catData.color}88)`
          }}
          className="absolute top-0 inset-x-0 h-1 z-30" 
        />

        {/* Sticky Mini Header (blurs/fades-in on scroll) */}
        <div className={`absolute top-0 inset-x-0 h-14 flex items-center justify-between px-6 border-b transition-all duration-300 ease-in-out z-20 ${
          isScrolled 
            ? 'bg-slate-900/90 backdrop-blur-md border-slate-800/80 shadow-md' 
            : 'bg-transparent border-transparent'
        }`}>
          {/* Mini Slide-in Title */}
          <span className={`text-sm font-bold text-slate-200 truncate pr-14 transition-all duration-300 transform ${
            isScrolled 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}>
            {article.title}
          </span>
          
          {/* Close Button - positioned inside sticky header area */}
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full border transition-all duration-200 backdrop-blur-sm absolute right-4 top-1/2 -translate-y-1/2 ${
              isScrolled
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white cursor-pointer'
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-850/80 text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div 
          onScroll={handleScroll}
          className="px-6 pb-6 pt-16 overflow-y-auto space-y-6 flex-1 custom-scrollbar"
        >
          {/* Main Title Header (Scrolls away) */}
          <div className="flex flex-col space-y-3 pb-4 border-b border-slate-900/60">
            <div className="flex items-center space-x-3">
              <span 
                style={{
                  backgroundColor: `${catData.color}12`,
                  borderColor: `${catData.color}30`,
                  color: catData.color,
                }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
              >
                <span className="mr-1">{catData.icon}</span>
                {catData.name}
              </span>
              {article.source && (
                <span className="text-xs font-medium text-slate-400">
                  แหล่งข่าว: <span className="text-slate-300 font-semibold">{article.source}</span>
                </span>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {article.title}
            </h2>

            <div className="flex items-center text-xs text-slate-500 space-x-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {/* Cover Image in Scrollable Body */}
          {article.image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-inner">
              <img 
                src={`/api/proxy-image?url=${encodeURIComponent(article.image_url)}`}
                alt={article.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
            </div>
          )}
          
          {/* AI Banner */}
          <div 
            style={{
              backgroundColor: `${catData.color}08`,
              borderColor: `${catData.color}15`,
              color: catData.color,
            }}
            className="flex items-center space-x-2 border p-3 rounded-lg text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            <span>สรุปเนื้อหาใจความสำคัญ 3 ข้อ ด้วยปัญญาประดิษฐ์ (AI-Generated Summary)</span>
          </div>

          {/* Points List */}
          <div className="space-y-4">
            {points.length > 0 ? (
              points.map((point, index) => (
                <div 
                  key={index} 
                  style={{
                    borderColor: `${catData.color}10`,
                  }}
                  className="group flex gap-4 p-4 rounded-xl bg-slate-900/35 border hover:border-slate-800 transition-all duration-200"
                >
                  {/* Number Badge */}
                  <div 
                    style={{
                      background: `linear-gradient(to bottom right, ${catData.color}15, ${catData.color}02)`,
                      borderColor: `${catData.color}35`,
                      color: catData.color,
                      boxShadow: `0 0 10px ${catData.color}10`
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-black shrink-0"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {/* Point Text */}
                  <div className="text-slate-200 text-sm sm:text-base leading-relaxed pt-0.5">
                    {point}
                  </div>
                </div>
              ))
            ) : (
              // Fallback if no formatted points could be parsed
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {article.summary}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/85 border-t border-slate-900 flex flex-col sm:flex-row items-center gap-4 justify-between z-10">
          <div className="flex items-center text-xs text-slate-500 space-x-1.5">
            <BookOpen className="w-4 h-4" />
            <span>อ่านเพื่อรับข้อมูลสรุปที่รวดเร็ว</span>
          </div>

          {article.original_url ? (
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: `linear-gradient(135deg, ${catData.color}, ${catData.color}dd)`,
                boxShadow: `0 4px 15px ${catData.color}25`
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 gap-1.5"
            >
              <span>อ่านข่าวต้นฉบับ</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-xs text-slate-500 italic">ข่าวนำเข้าด้วยระบบ Manual</span>
          )}
        </div>
      </div>
    </div>
  );
}
