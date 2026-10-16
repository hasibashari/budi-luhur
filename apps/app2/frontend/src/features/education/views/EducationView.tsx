import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Sparkles, Clock, ArrowRight, X, Ribbon } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Chip } from '@/src/shared/components/ui/Chip';
import { getArticlesAction } from '../api/educationRepository';
import { Article } from '../types';
import { ARTICLE_CATEGORIES } from '../constants/education.constants';

export default function EducationView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      try {
        const data = await getArticlesAction();
        if (isMounted) {
          setArticles(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchCategory =
        selectedCategory === 'Semua' ||
        art.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [articles, searchQuery, selectedCategory]);

  const featuredArticle = articles[0];

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Screen Title & Top Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight'>
            Pustaka Edukasi Kontrasepsi & Pil KB
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Informasi klinis penggunaan pil KB, tips penanganan efek samping, dan kesehatan reproduksi
          </p>
        </div>

        {/* Shortcut to Standalone SADARI Page */}
        <div className='shrink-0'>
          <Link
            to='/user/sadari'
            className='inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-100/80 transition-colors shadow-2xs'
          >
            <Ribbon size={15} className='text-teal-600' />
            <span>Panduan Mandiri SADARI</span>
            <ArrowRight size={13} className='text-teal-600' />
          </Link>
        </div>
      </div>

      {/* Search Bar & Category Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
        {/* Search Input */}
        <div className='relative flex-1 flex items-center'>
          <Search size={16} className='absolute left-3.5 text-slate-400 pointer-events-none' />
          <input
            type='text'
            placeholder='Cari materi pil KB, efek samping, lupa minum...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 pl-10 pr-4 py-3 outline-none shadow-2xs'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-3.5 text-slate-400 hover:text-teal-700'
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Chips Scroll/Wrap */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar'>
          {ARTICLE_CATEGORIES.map(cat => (
            <Chip
              key={cat}
              size='sm'
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className='shrink-0'
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Featured Article Banner */}
      {!searchQuery && selectedCategory === 'Semua' && featuredArticle && (
        <Link to={`/user/education/${featuredArticle.id}`} className='block group'>
          <Card
            padding='none'
            className='overflow-hidden border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow bg-white'
          >
            <div className='relative h-44 sm:h-60 w-full overflow-hidden'>
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                className='w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6'>
                <span className='text-[10px] sm:text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1'>
                  <Sparkles size={13} />
                  <span>Artikel Pilihan • {featuredArticle.readTime}</span>
                </span>
                <h3 className='text-base sm:text-2xl font-bold text-white leading-snug mt-1 max-w-2xl'>
                  {featuredArticle.title}
                </h3>
              </div>
            </div>
            <div className='p-4 sm:p-5 bg-white'>
              <p className='text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed'>
                {featuredArticle.summary}
              </p>
              <div className='flex items-center justify-between mt-3 pt-3 border-t border-slate-100'>
                <span className='text-xs text-slate-400'>
                  Oleh <strong>{featuredArticle.author?.name || 'Bidan Konselor Pilluna'}</strong> •{' '}
                  {featuredArticle.publishedAt}
                </span>
                <span className='text-xs sm:text-sm font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform'>
                  <span>Baca Panduan</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Responsive Articles Grid */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm sm:text-base font-bold text-slate-800'>
            {searchQuery
              ? `Hasil Pencarian (${filteredArticles.length})`
              : 'Materi Edukasi Populer'}
          </h4>
          <span className='text-xs text-slate-400'>
            {filteredArticles.length} artikel tersedia
          </span>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600' />
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card padding='lg' className='text-center py-12 border-slate-200 bg-white shadow-2xs'>
            <div className='w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3'>
              <BookOpen size={28} />
            </div>
            <p className='text-base font-bold text-slate-800'>Materi Tidak Ditemukan</p>
            <p className='text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto'>
              Coba gunakan kata kunci lain seperti &quot;Pil KB&quot;, &quot;Efek Samping&quot;,
              atau &quot;Jadwal Minum&quot;.
            </p>
          </Card>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                to={`/user/education/${article.id}`}
                className='block h-full group'
              >
                <Card
                  padding='none'
                  hoverable
                  className='overflow-hidden h-full flex flex-col justify-between border-slate-200/90 shadow-2xs bg-white'
                >
                  {/* Thumbnail */}
                  <div className='relative h-40 w-full shrink-0 overflow-hidden'>
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                    <span className='absolute top-3 left-3 text-[10px] font-bold text-white bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full'>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className='p-4 flex-1 flex flex-col justify-between'>
                    <div>
                      <span className='text-[10px] text-slate-400 flex items-center gap-1 mb-1'>
                        <Clock size={11} />
                        {article.readTime}
                      </span>
                      <h4 className='text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug'>
                        {article.title}
                      </h4>
                      <p className='text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed'>
                        {article.summary}
                      </p>
                    </div>

                    <div className='mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400'>
                      <span>{article.publishedAt}</span>
                      <span className='text-teal-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform'>
                        <span>Baca</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
