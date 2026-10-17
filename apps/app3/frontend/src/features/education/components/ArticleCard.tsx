import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Clock, Tag, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to={`/user/education/${article.id}`}
      className='group flex flex-col h-full bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer'
    >
      {/* Top Image Banner */}
      <div className='relative h-[210px] w-full overflow-hidden bg-stone-100'>
        <span className='absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-bold shadow-xs border border-emerald-100'>
          <Tag size={12} className='text-emerald-600' />
          {article.category}
        </span>
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-300'>
            <Tag size={36} />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className='p-5 flex flex-col flex-1'>
        <h3 className='font-bold text-base md:text-lg text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700 transition-colors'>
          {article.title}
        </h3>

        <p className='text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-1'>
          {article.summary}
        </p>

        <div className='h-px bg-stone-100 my-3 w-full' />

        {/* Footer info: Read time & Date */}
        <div className='flex items-center justify-between text-xs text-slate-400 font-medium pt-0.5'>
          <div className='flex items-center gap-1.5 text-slate-600 font-semibold'>
            <Clock size={14} className='text-emerald-600' />
            <span>{article.readTime}</span>
          </div>
          <div className='flex items-center gap-1 text-slate-500'>
            <span>{article.publishedAt}</span>
            <ArrowRight
              size={14}
              className='ml-1 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all duration-200'
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
