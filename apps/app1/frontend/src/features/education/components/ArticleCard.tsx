import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { Clock, Tag, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  hrefPrefix?: string;
}

export default function ArticleCard({ article, hrefPrefix = '/user/education' }: ArticleCardProps) {
  return (
    <Link
      to={`${hrefPrefix}/${article.id}`}
      className='group flex flex-col h-full bg-white rounded-2xl border border-[#F0DFE7] overflow-hidden shadow-[0_2px_12px_rgba(184,40,95,0.02)] hover:shadow-[0_8px_24px_rgba(184,40,95,0.06)] hover:border-[#F7CADF] hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    >
      {/* Top Image Banner */}
      <div className='relative h-[190px] sm:h-[210px] w-full overflow-hidden bg-[#FAF0F4]'>
        <span className='absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#B8285F] text-xs font-bold shadow-xs border border-[#F0DFE7]'>
          <Tag size={12} className='text-[#B8285F]' />
          {article.category}
        </span>
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-[#FAF0F4] text-[#EE9CBF]'>
            <Tag size={36} />
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className='p-5 flex flex-col flex-1'>
        <h3 className='font-bold text-base text-[#1E1F24] line-clamp-2 leading-snug mb-2 group-hover:text-[#B8285F] transition-colors'>
          {article.title}
        </h3>

        <p className='text-xs sm:text-sm text-[#525866] line-clamp-3 leading-relaxed mb-4 flex-1'>
          {article.summary}
        </p>

        <div className='h-px bg-[#F6EAF0] my-3 w-full' />

        {/* Footer info: Read time & Date */}
        <div className='flex items-center justify-between text-xs text-[#8E95A5] font-medium pt-0.5'>
          <div className='flex items-center gap-1.5 text-[#525866] font-semibold'>
            <Clock size={13} className='text-[#B8285F]' />
            <span>{article.readTime}</span>
          </div>
          <div className='flex items-center gap-1 text-[#525866]'>
            <span>{article.publishedAt}</span>
            <ArrowRight
              size={13}
              className='ml-1 text-[#8E95A5] group-hover:text-[#B8285F] group-hover:translate-x-1 transition-all duration-200'
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
