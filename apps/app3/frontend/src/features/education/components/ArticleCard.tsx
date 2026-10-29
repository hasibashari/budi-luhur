import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Clock, Tag, ArrowRight, Check } from 'lucide-react';
import { useReadArticles } from '../utils/readArticles';
import { resolveImageUrl } from '@/src/shared/utils/imageUrl';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { isRead, markAsRead } = useReadArticles();
  const read = isRead(article.id);

  return (
    <Link
      to={`/user/education/${article.id}`}
      onClick={() => markAsRead(article.id)}
      className={`group flex flex-col h-full rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer ${
        read
          ? 'bg-stone-50/80 border-stone-200/80 opacity-90 hover:opacity-100 hover:border-stone-300 hover:shadow-md'
          : 'bg-white border-stone-200 shadow-2xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1.5'
      }`}
    >
      {/* Top Image Banner */}
      <div className='relative h-[210px] w-full overflow-hidden bg-stone-100'>
        <div className='absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 flex-wrap'>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs border ${
              read
                ? 'bg-white/95 text-stone-600 border-stone-200'
                : 'bg-white/95 text-emerald-800 border-emerald-100'
            }`}
          >
            <Tag size={12} className={read ? 'text-stone-400' : 'text-emerald-600'} />
            {article.category}
          </span>
          {read && (
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-200/90 text-stone-600 shadow-2xs backdrop-blur-xs'>
              <Check size={12} className='text-emerald-600' />
              Sudah dibaca
            </span>
          )}
        </div>
        {article.imageUrl ? (
          <img
            src={resolveImageUrl(article.imageUrl)}
            alt={article.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              read ? 'grayscale-[35%] group-hover:grayscale-0' : ''
            }`}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-stone-100 text-stone-300'>
            <Tag size={36} />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className='p-5 flex flex-col flex-1'>
        <h3
          className={`text-base md:text-lg line-clamp-2 leading-snug mb-2 transition-colors ${
            read
              ? 'font-medium text-stone-500 group-hover:text-stone-700'
              : 'font-bold text-slate-900 group-hover:text-emerald-700'
          }`}
        >
          {article.title}
        </h3>

        <p
          className={`text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 flex-1 ${
            read ? 'text-stone-400' : 'text-slate-600'
          }`}
        >
          {article.summary}
        </p>

        <div className='h-px bg-stone-100 my-3 w-full' />

        {/* Footer info: Read time & Date */}
        <div className='flex items-center justify-between text-xs text-slate-400 font-medium pt-0.5'>
          <div className='flex items-center gap-1.5 text-slate-600 font-semibold'>
            <Clock size={14} className={read ? 'text-stone-400' : 'text-emerald-600'} />
            <span className={read ? 'text-stone-500' : 'text-slate-600'}>{article.readTime}</span>
          </div>
          <div className='flex items-center gap-1 text-slate-500'>
            <span>{article.publishedAt}</span>
            <ArrowRight
              size={14}
              className={`ml-1 transition-all duration-200 group-hover:translate-x-1 ${
                read ? 'text-stone-400 group-hover:text-stone-600' : 'text-slate-400 group-hover:text-emerald-700'
              }`}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
