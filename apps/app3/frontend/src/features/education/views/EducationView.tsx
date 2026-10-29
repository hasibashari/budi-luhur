import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { getArticlesAction } from '../api/educationRepository';
import { Article } from '../types';
import { normalizeArticleCategory } from '../constants/education.constants';
import { useReadArticles } from '../utils/readArticles';
import { resolveImageUrl } from '@/src/shared/utils/imageUrl';

export default function EducationView() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isRead, markAsRead } = useReadArticles();

  // Seluruh artikel berasal dari backend (dikelola admin). Tidak ada data contoh.

  useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      setLoadError(null);
      try {
        const data = await getArticlesAction();
        if (isMounted) {
          setArticles(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
        if (isMounted) {
          setArticles([]);
          setLoadError('Artikel gagal dimuat. Periksa koneksi lalu coba lagi.');
          setLoading(false);
        }
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const articleList = articles;
  const categories = [
    'Semua',
    ...Array.from(
      new Set(
        articleList.map(article => normalizeArticleCategory(article.category)).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, 'id')),
  ];

  const filteredArticles = useMemo(() => {
    return articleList.filter(art => {
      const category = normalizeArticleCategory(art.category);
      const matchCategory = selectedCategory === 'Semua' || category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [articleList, searchQuery, selectedCategory]);

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12'>
      {/* 1. Top Screen Title & Intro (Stitch Screen 3) */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#aff1d0] text-[#0a5139] text-xs font-semibold'>
              <CheckCircle2 size={13} />
              Panduan Resmi Catin
            </span>
            <h1 className='text-xl sm:text-2xl font-bold text-[#121c2a] mt-1 tracking-tight'>
              Edukasi Kesehatan
            </h1>
          </div>
          <div className='w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-2xs'>
            <Heart size={20} className='fill-[#aa294d]' />
          </div>
        </div>
        <p className='text-xs sm:text-sm text-[#574144] leading-relaxed'>
          Bekal esensial calon pengantin menuju pernikahan bahagia, sehat, dan terlindungi.
        </p>
      </div>

      {/* 2. Search Bar (Stitch Screen 3) */}
      <div className='relative w-full'>
        <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b7074]'>
          <Search size={18} />
        </div>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Cari topik kesehatan pranikah...'
          className='w-full pl-10 pr-10 min-h-[48px] py-3 rounded-2xl bg-white border border-[#eff4ff] text-[#121c2a] placeholder-[#8b7074] text-base sm:text-sm shadow-xs focus:outline-none focus:border-[#aa294d] transition-all'
        />
        {searchQuery && (
          <button
            type='button'
            onClick={() => setSearchQuery('')}
            className='w-11 h-11 absolute inset-y-0 right-0 flex items-center justify-center text-[#8b7074] hover:text-[#aa294d] transition-colors cursor-pointer active:scale-90'
            aria-label='Hapus pencarian'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 3. Category Pills Bar (Horizontal Scroll Rail Full-Bleed) (Stitch Screen 3) */}
      <div className='-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type='button'
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 min-h-[40px] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#aa294d] text-white shadow-[0_4px_14px_0_rgba(170,41,77,0.28)]'
                  : 'bg-white border border-[#eff4ff] text-[#574144] hover:bg-[#eff4ff]'
              }`}
            >
              <span>{cat}</span>
              {cat === 'Semua' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-[#eff4ff]'}`}
                >
                  {articles.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Banner Program Wajib Pranikah (Stitch Screen 3) */}
      <Link
        to='/user/imunisasi'
        className='bg-linear-to-r from-[#ffd9de]/60 via-[#eff4ff] to-[#aff1d0]/50 rounded-2xl p-4 flex items-center justify-between shadow-xs border border-[#ffd9de]/60 transition-all hover:shadow-md group cursor-pointer'
      >
        <div className='flex items-center gap-3.5 min-w-0'>
          <div className='w-11 h-11 rounded-full bg-white shrink-0 flex items-center justify-center text-[#aa294d] shadow-2xs group-hover:scale-105 transition-transform'>
            <Award size={24} />
          </div>
          <div className='flex-1 min-w-0'>
            <span className='text-[10px] sm:text-[11px] text-[#aa294d] uppercase tracking-wider font-bold block'>
              Program Wajib Pranikah
            </span>
            <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] truncate'>
              Sertifikat Tetanus Toksoid
            </h4>
            <p className='text-[11px] text-[#574144] line-clamp-1 mt-0.5'>
              Syarat wajib pendaftaran nikah di Dukcapil.
            </p>
          </div>
        </div>
        <div className='w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#aa294d] shrink-0 ml-2 group-hover:translate-x-1 transition-all'>
          <ArrowRight size={16} />
        </div>
      </Link>

      {/* 5. Article Cards List (Stitch Screen 3) */}
      {loading ? (
        <div className='flex items-center justify-center py-16 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
        </div>
      ) : loadError ? (
        <div className='text-center py-16 bg-white rounded-3xl border border-[#ffc9d4] p-8'>
          <div className='w-14 h-14 rounded-2xl bg-[#ffe1e6] text-[#a4163a] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
            <BookOpen size={28} />
          </div>
          <h3 className='text-base font-bold text-[#121c2a]'>Artikel Tidak Dapat Dimuat</h3>
          <p className='text-xs text-[#574144] mt-1 max-w-xs mx-auto'>{loadError}</p>
        </div>
      ) : articleList.length === 0 ? (
        /* Kondisi kosong: belum ada artikel yang diterbitkan admin */
        <div className='text-center py-16 bg-white rounded-3xl border border-[#eff4ff] p-8'>
          <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
            <BookOpen size={28} />
          </div>
          <h3 className='text-base font-bold text-[#121c2a]'>Belum Ada Artikel Edukasi</h3>
          <p className='text-xs text-[#574144] mt-1 max-w-sm mx-auto leading-relaxed'>
            Artikel edukasi kesehatan pranikah belum diterbitkan oleh petugas faskes. Materi akan
            muncul otomatis di sini setelah admin menerbitkannya melalui portal faskes.
          </p>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className='flex flex-col gap-3.5'>
          {filteredArticles.map((art: any) => {
            const read = isRead(art.id);
            return (
              <Link
                key={art.id}
                to={`/user/education/${art.id}`}
                onClick={() => markAsRead(art.id)}
                className={`group rounded-2xl p-3.5 sm:p-4 border transition-all flex gap-3.5 items-start cursor-pointer active:scale-[0.98] ${
                  read
                    ? 'bg-stone-50/80 border-stone-200/80 opacity-90 hover:opacity-100 hover:border-stone-300'
                    : 'bg-white border-[#eff4ff] shadow-[0_2px_10px_-2px_rgba(31,41,55,0.04),0_4px_16px_-2px_rgba(217,78,111,0.03)] hover:shadow-md'
                }`}
              >
                <div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#eff4ff]'>
                  {art.imageUrl ? (
                    <img
                      src={resolveImageUrl(art.imageUrl)}
                      alt={art.title}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        read ? 'grayscale-[35%] group-hover:grayscale-0' : ''
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${read ? 'text-stone-400' : 'text-[#aa294d]'}`}
                    >
                      <BookOpen size={26} />
                    </div>
                  )}
                  <div className='absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent' />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-1 mb-1'>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          read
                            ? 'bg-stone-200/70 text-stone-600'
                            : art.badgeColor || 'bg-[#ffd9de] text-[#8c0f39]'
                        }`}
                      >
                        {art.badge || art.category}
                      </span>
                      {read && (
                        <span className='inline-flex items-center gap-1 text-[10px] text-stone-500 font-medium bg-stone-200/60 px-1.5 py-0.5 rounded-md'>
                          <Check size={11} className='text-emerald-600' />
                          Sudah dibaca
                        </span>
                      )}
                    </div>
                    <span className='text-[11px] text-[#8b7074] flex items-center gap-1 shrink-0'>
                      <Clock size={12} /> {art.readTime || '4 mnt'}
                    </span>
                  </div>

                  <h3
                    className={`text-xs sm:text-sm leading-snug line-clamp-1 transition-colors ${
                      read
                        ? 'font-medium text-stone-500 group-hover:text-stone-700'
                        : 'font-bold text-[#121c2a] group-hover:text-[#aa294d]'
                    }`}
                  >
                    {art.title}
                  </h3>

                  <p
                    className={`text-[11px] line-clamp-2 mt-1 leading-snug ${
                      read ? 'text-stone-400' : 'text-[#574144]'
                    }`}
                  >
                    {art.summary}
                  </p>
                </div>

                <div
                  className={`self-center pl-1 shrink-0 group-hover:translate-x-1 transition-all ${
                    read
                      ? 'text-stone-400 group-hover:text-stone-600'
                      : 'text-[#8b7074] group-hover:text-[#aa294d]'
                  }`}
                >
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className='text-center py-16 bg-white rounded-3xl border border-[#eff4ff] p-8'>
          <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
            <BookOpen size={28} />
          </div>
          <h3 className='text-base font-bold text-[#121c2a]'>Topik Belum Ditemukan</h3>
          <p className='text-xs text-[#574144] mt-1 max-w-xs mx-auto'>
            Coba kata kunci lain atau pilih kategori di atas untuk menemukan artikel seputar
            kesehatan calon pengantin.
          </p>
          <button
            type='button'
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className='mt-4 px-5 py-2 rounded-full bg-[#aa294d] text-white text-xs font-bold shadow-xs hover:bg-[#cb4364] transition-all cursor-pointer'
          >
            Tampilkan Semua Topik
          </button>
        </div>
      )}
    </div>
  );
}
