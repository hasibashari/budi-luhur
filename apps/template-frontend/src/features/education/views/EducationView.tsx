import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Sparkles, Clock, ArrowRight, X } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Chip } from '@/src/shared/components/ui/Chip';
import { getArticlesAction } from '../api/educationRepository';
import { Article } from '../types';

const CATEGORIES = [
  'Semua',
  'Anemia & TTD',
  'Nutrisi & Gizi',
  'Kesehatan Remaja',
  'Tips Menstruasi',
  'Mitos & Fakta',
  'Gaya Hidup',
];

export default function EducationView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
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
    <div className='flex flex-col gap-6 w-full'>
      {/* Screen Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
          Edukasi & Literasi Anemia
        </h2>
        <p className='text-xs sm:text-sm text-[#64748b] mt-0.5'>
          Informasi medis, tips konsumsi TTD, dan panduan gizi seimbang
        </p>
      </div>

      {/* Search Bar & Category Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
        {/* Search Input */}
        <div className='relative flex-1 flex items-center'>
          <Search size={16} className='absolute left-3.5 text-[#94a3b8] pointer-events-none' />
          <input
            type='text'
            placeholder='Cari materi, tips mual, makanan zat besi...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-white text-[#1e293b] placeholder-[#94a3b8] text-xs sm:text-sm rounded-2xl border border-[#fce7f3] focus:border-[#e11d48] pl-10 pr-4 py-3 outline-none shadow-xs'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-3.5 text-[#94a3b8] hover:text-[#e11d48]'
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Chips Scroll/Wrap */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar'>
          {CATEGORIES.map(cat => (
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
          <Card padding='none' className='overflow-hidden hover:shadow-md transition-shadow'>
            <div className='relative h-44 sm:h-60 w-full overflow-hidden'>
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                className='w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6'>
                <span className='text-[10px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1'>
                  <Sparkles size={13} />
                  <span>Featured Article • {featuredArticle.readTime}</span>
                </span>
                <h3 className='text-base sm:text-2xl font-bold text-white leading-snug mt-1 max-w-2xl'>
                  {featuredArticle.title}
                </h3>
              </div>
            </div>
            <div className='p-4 sm:p-5 bg-white'>
              <p className='text-xs sm:text-sm text-[#475569] line-clamp-2 leading-relaxed'>
                {featuredArticle.summary}
              </p>
              <div className='flex items-center justify-between mt-3 pt-3 border-t border-[#fce7f3]'>
                <span className='text-xs text-[#94a3b8]'>
                  Oleh <strong>{featuredArticle.author?.name || 'Tim Medis FEMORY'}</strong> •{' '}
                  {featuredArticle.publishedAt}
                </span>
                <span className='text-xs sm:text-sm font-bold text-[#e11d48] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform'>
                  <span>Baca</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Responsive Articles Grid: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */}
      <div>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b] mb-3'>
          {searchQuery ? `Hasil Pencarian (${filteredArticles.length})` : 'Materi Populer'}
        </h4>

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card padding='lg' className='text-center py-12'>
            <div className='w-14 h-14 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-3'>
              <BookOpen size={28} />
            </div>
            <p className='text-base font-bold text-[#1e293b]'>Materi Tidak Ditemukan</p>
            <p className='text-xs sm:text-sm text-[#64748b] mt-1 max-w-sm mx-auto'>
              Coba gunakan kata kunci lain seperti &quot;Zat Besi&quot;, &quot;Mual&quot;, atau
              &quot;Jeruk&quot;.
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
                  className='overflow-hidden h-full flex flex-col justify-between'
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
                      <span className='text-[10px] text-[#94a3b8] flex items-center gap-1 mb-1'>
                        <Clock size={11} />
                        {article.readTime}
                      </span>
                      <h4 className='text-xs sm:text-sm font-bold text-[#1e293b] group-hover:text-[#e11d48] transition-colors line-clamp-2 leading-snug'>
                        {article.title}
                      </h4>
                      <p className='text-xs text-[#64748b] line-clamp-2 mt-1.5 leading-relaxed'>
                        {article.summary}
                      </p>
                    </div>

                    <div className='mt-4 pt-2.5 border-t border-[#fce7f3] flex items-center justify-between text-[11px] text-[#94a3b8]'>
                      <span>{article.publishedAt}</span>
                      <span className='text-[#e11d48] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform'>
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
