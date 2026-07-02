import { useState } from 'react';
import { ExternalLink, Calendar, BookOpen } from 'lucide-react';
import ArticleDetailModal from './ArticleDetailModal';

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

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <article 
        onClick={() => setIsModalOpen(true)}
        style={{
          '--cat-color': catData.color,
          '--cat-bg-glow': `${catData.color}15`,
          '--cat-border-glow': `${catData.color}45`,
        } as React.CSSProperties}
        className="flex flex-col bg-slate-950/20 backdrop-blur-md border border-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_25px_var(--cat-bg-glow)] hover:border-[var(--cat-border-glow)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group"
      >
        {/* Cover Image */}
        {article.image_url ? (
          <div className="relative h-44 w-full overflow-hidden bg-slate-950 border-b border-slate-900">
            <img 
              src={`/api/proxy-image?url=${encodeURIComponent(article.image_url)}`}
              alt={article.title} 
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        ) : (
          <div 
            style={{
              background: `linear-gradient(to right, ${catData.color}20, ${catData.color}05)`
            }}
            className="h-1.5 w-full shrink-0" 
          />
        )}

        {/* Category Badge & Source */}
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
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
              Source: <span className="text-slate-300 font-semibold">{article.source}</span>
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="px-5 py-2 flex-1">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-100 group-hover:text-[var(--cat-color)] transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-4">
            {article.summary}
          </p>
          <div className="mt-4 inline-flex items-center text-xs font-bold text-slate-400 group-hover:text-[var(--cat-color)] transition-colors gap-1">
            <span>อ่านบทสรุปเต็ม...</span>
          </div>
        </div>

        {/* Footer Info & External Link */}
        <div className="px-5 py-3.5 bg-slate-950/30 border-t border-slate-900 flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-slate-500 space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          {article.original_url ? (
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Stop triggering the card modal click
              className="inline-flex items-center text-xs font-bold transition-colors duration-200 gap-1"
              style={{
                color: catData.color
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = '';
              }}
            >
              <span>อ่านต้นฉบับ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center text-xs text-slate-500 space-x-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>สรุปข่าวสั้น</span>
            </span>
          )}
        </div>
      </article>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={article}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

