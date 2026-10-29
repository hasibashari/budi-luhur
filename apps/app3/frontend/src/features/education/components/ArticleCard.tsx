import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Article } from '../types';
import { useReadArticles } from '../utils/readArticles';
import { resolveImageUrl } from '@/src/shared/utils/imageUrl';

export interface ArticleCardProps {
  article: Article;
  onRead?: (id: string) => void;
}

export default function ArticleCard({ article, onRead }: ArticleCardProps) {
  const { isRead, markAsRead } = useReadArticles();
  const read = isRead(article.id);

  const handleClick = () => {
    markAsRead(article.id);
    onRead?.(article.id);
  };

  return (
    <Link
      to={`/user/education/${article.id}`}
      onClick={handleClick}
      className={`group rounded-2xl p-3.5 sm:p-4 border transition-all flex gap-3.5 items-start cursor-pointer active:scale-[0.98] ${
        read
          ? 'bg-stone-50/80 border-stone-200/80 opacity-90 hover:opacity-100 hover:border-stone-300'
          : 'bg-white border-[#eff4ff] shadow-[0_2px_10px_-2px_rgba(31,41,55,0.04),0_4px_16px_-2px_rgba(217,78,111,0.03)] hover:shadow-md'
      }`}
    >
      {/* Featured Thumbnail */}
      <div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#eff4ff]'>
        {article.imageUrl ? (
          <img
            src={resolveImageUrl(article.imageUrl)}
            alt={article.title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              read ? 'grayscale-[35%] group-hover:grayscale-0' : ''
            }`}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-xl bg-[#eff4ff]'>
            📚
          </div>
        )}
      </div>

      {/* Article Meta & Summary */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffd9de] text-[#8c0f39]'>
            {article.category}
          </span>
          <span className='text-[11px] text-[#8b7074]'>{article.readTime}</span>
        </div>

        <h3
          className={`text-sm sm:text-base transition-colors leading-snug line-clamp-2 ${
            read
              ? 'font-medium text-stone-500 group-hover:text-stone-700'
              : 'font-bold text-[#121c2a] group-hover:text-[#aa294d]'
          }`}
        >
          {article.title}
        </h3>

        <p className={`text-xs line-clamp-2 mt-1 ${read ? 'text-stone-400' : 'text-[#574144]'}`}>
          {article.summary}
        </p>
      </div>

      {/* Right Action Chevron */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-center transition-all ${
          read
            ? 'text-stone-400 group-hover:text-stone-600'
            : 'text-[#8b7074] group-hover:text-[#aa294d] group-hover:translate-x-0.5'
        }`}
      >
        <ChevronRight size={20} />
      </div>
    </Link>
  );
}

export { ArticleCard };
