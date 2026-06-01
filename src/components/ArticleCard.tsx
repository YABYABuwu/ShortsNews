import { useState } from 'react';
import { ExternalLink, Calendar, BookOpen } from 'lucide-react';
import ArticleDetailModal from './ArticleDetailModal';

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

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract category helper
  const getCategoryName = () => {
    if (!article.categories) return 'General';
    if (Array.isArray(article.categories)) {
      return article.categories[0]?.name || 'General';
    }
    return article.categories.name || 'General';
  };

  const formattedDate = new Date(article.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <article 
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:border-slate-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      >
        {/* Cover Image */}
        {article.image_url ? (
          <div className="relative h-44 w-full overflow-hidden bg-slate-950 border-b border-slate-800/40">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
          </div>
        ) : (
          <div className="h-1.5 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 w-full shrink-0" />
        )}

        {/* Category Badge & Source */}
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {getCategoryName()}
          </span>
          {article.source && (
            <span className="text-xs font-medium text-slate-400">
              Source: <span className="text-slate-300 font-semibold">{article.source}</span>
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="px-5 py-2 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-3 text-sm text-slate-350 leading-relaxed text-slate-400 line-clamp-4">
            {article.summary}
          </p>
          <div className="mt-4 inline-flex items-center text-xs font-semibold text-cyan-400/80 group-hover:text-cyan-300 transition-colors gap-1">
            <span>อ่านบทสรุปเต็ม...</span>
          </div>
        </div>

        {/* Footer Info & External Link */}
        <div className="px-5 py-4 bg-slate-900/60 border-t border-slate-850 flex items-center justify-between mt-auto">
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
              className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 space-x-1 transition-colors duration-200"
            >
              <span>Read Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center text-xs text-slate-500 space-x-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Shorts Summary</span>
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

