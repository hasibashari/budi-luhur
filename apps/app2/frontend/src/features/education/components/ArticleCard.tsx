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
      className='group flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer'
    >
      {/* Top Image Banner */}
      <div className='relative h-[190px] w-full overflow-hidden bg-slate-100'>
        <span className='absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-teal-800 text-xs font-bold border border-teal-100 shadow-2xs'>
          <Tag size={12} className='text-teal-600' />
          {article.category}
        </span>
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-teal-50 text-teal-300'>
            <Tag size={36} />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className='p-4 sm:p-5 flex flex-col flex-1'>
        <h3 className='font-bold text-sm sm:text-base text-slate-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-teal-700 transition-colors'>
          {article.title}
        </h3>

        <p className='text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3 flex-1'>
          {article.summary}
        </p>

        <div className='h-px bg-slate-100 my-2.5 w-full' />

        {/* Footer info: Read time & Date */}
        <div className='flex items-center justify-between text-xs text-slate-400 font-medium pt-0.5'>
          <div className='flex items-center gap-1.5 text-slate-600 font-medium text-[11px]'>
            <Clock size={13} className='text-teal-600' />
            <span>{article.readTime}</span>
          </div>
          <div className='flex items-center gap-1 text-slate-400 text-[11px]'>
            <span>{article.publishedAt}</span>
            <ArrowRight
              size={13}
              className='ml-0.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all duration-200'
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
