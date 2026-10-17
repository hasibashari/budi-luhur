import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Clock, ArrowRight, X, BookOpen, ShieldCheck } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Chip } from '@/src/shared/components/ui/Chip';
import { getArticlesAction } from '../api/educationRepository';
import { Article } from '../types';
import { ARTICLE_CATEGORIES } from '../constants/education.constants';
import ArticleCard from '../components/ArticleCard';

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
        art.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(art.category.toLowerCase());
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [articles, searchQuery, selectedCategory]);

  const featuredArticle = articles[0];

  return (
    <div className='flex flex-col gap-6 w-full pb-8'>
      {/* Screen Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight'>
          Pustaka Edukasi Kesehatan Pranikah & Imunisasi TT
        </h2>
        <p className='text-xs sm:text-sm text-slate-600 mt-0.5'>
          Panduan komprehensif persiapan kesehatan reproduksi, jadwal imunisasi TT, dan nutrisi calon pengantin
        </p>
      </div>

      {/* Search Bar & Category Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
        {/* Search Input */}
        <div className='relative flex-1 flex items-center'>
          <Search size={16} className='absolute left-3.5 text-slate-400 pointer-events-none' />
          <input
            type='text'
            placeholder='Cari materi imunisasi TT, skrining pranikah, pencegahan tetanus...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-2xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 pl-10 pr-4 py-3 outline-none shadow-2xs'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-3.5 text-slate-400 hover:text-slate-600'
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
              className={selectedCategory === cat ? 'bg-emerald-600 text-white font-bold' : ''}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600' />
        </div>
      ) : (
        <div className='flex flex-col gap-6'>
          {/* Featured Article Banner (Only on "Semua" and when not searching) */}
          {selectedCategory === 'Semua' && !searchQuery && featuredArticle && (
            <section aria-label='Artikel Unggulan'>
              <Card padding='none' className='overflow-hidden border-stone-200 shadow-sm'>
                <div className='relative h-56 sm:h-72 w-full'>
                  <img
                    src={
                      featuredArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={featuredArticle.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-7'>
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold w-fit mb-2 shadow-xs'>
                      <Sparkles size={13} />
                      <span>Materi Pilihan • {featuredArticle.category}</span>
                    </span>
                    <h3 className='text-lg sm:text-2xl font-bold text-white leading-snug line-clamp-2'>
                      {featuredArticle.title}
                    </h3>
                    <p className='text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1.5 max-w-2xl'>
                      {featuredArticle.summary}
                    </p>
                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-xs text-slate-300 font-medium'>
                        <Clock size={13} className='text-emerald-400' />
                        <span>{featuredArticle.readTime}</span>
                        <span>•</span>
                        <span>{featuredArticle.publishedAt}</span>
                      </div>
                      <Link
                        to={`/user/education/${featuredArticle.id}`}
                        className='inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-emerald-950/20'
                      >
                        <span>Baca Lengkap</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Grid of Articles */}
          <section aria-label='Daftar Artikel'>
            {filteredArticles.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {filteredArticles.map(art => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            ) : (
              <div className='text-center py-16 bg-white rounded-3xl border border-stone-200 p-8'>
                <div className='w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3'>
                  <BookOpen size={24} />
                </div>
                <h4 className='text-base font-bold text-slate-900'>Tidak Ditemukan Artikel</h4>
                <p className='text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto'>
                  Tidak ada materi yang sesuai dengan kata kunci atau kategori yang dipilih.
                </p>
                <button
                  type='button'
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className='mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer'
                >
                  Reset Filter & Pencarian
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
