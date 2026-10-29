import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Article } from '../types';
import { getArticleDetailAction, toggleArticleBookmarkAction } from '../api/educationRepository';
import {
  DEFAULT_CATEGORY_IMAGES,
  normalizeArticleCategory,
} from '../constants/education.constants';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { MarkdownRenderer } from '@/src/shared/components/markdown';
import { useReadArticles, markArticleAsRead } from '../utils/readArticles';
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ShieldCheck,
  CalendarClock,
  ArrowRight,
  Building2,
  BookOpen,
} from 'lucide-react';

interface ArticleDetailViewProps {
  articleId?: string;
  backHref?: string;
}

export default function ArticleDetailView({
  articleId: propArticleId,
  backHref = '/user/education',
}: ArticleDetailViewProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const articleId = propArticleId || params.id || 'art_tt_1';
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState(0);

  const { user } = useAuth();
  const userId = user?.id || '';
  const { isRead, markAsRead } = useReadArticles();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchData = async () => {
      setLoading(true);
      try {
        const detail = await getArticleDetailAction(articleId, userId);
        if (isMounted) {
          if (detail?.article) {
            setArticle(detail.article);
            setRelatedArticles(detail.relatedArticles || []);
            setBookmarked(Boolean(detail.isBookmarked));
            // Tandai artikel ini sebagai sudah dibaca
            markArticleAsRead(detail.article.id || articleId);
          } else {
            setArticle(null);
            setRelatedArticles([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching article detail:', err);
        if (isMounted) {
          setArticle(null);
          setLoading(false);
        }
      }
    };
    fetchData();

    const handleScroll = () => {
      const mainEl = document.querySelector('main');
      let progress = 0;
      if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
        const scrollable = mainEl.scrollHeight - mainEl.clientHeight;
        progress = scrollable > 0 ? (mainEl.scrollTop / scrollable) * 100 : 0;
      } else {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      }
      setReadProgress(Math.min(Math.max(progress, 0), 100));
    };

    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      isMounted = false;
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [articleId, userId]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: article?.title || 'Edukasi Imunisasi TT - TEMANI',
            text: article?.summary || 'Panduan kesehatan pranikah untuk calon pengantin.',
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Tautan artikel berhasil disalin!');
        }
      } catch {
        // user cancelled
      }
    }
  };

  const handleBookmarkToggle = async () => {
    if (!article) return;
    const newStatus = !bookmarked;
    setBookmarked(newStatus);
    showToast(newStatus ? 'Artikel disimpan ke daftar bacaan!' : 'Artikel dihapus dari simpanan');
    const res = await toggleArticleBookmarkAction(userId, article.id);
    if (res.success) {
      setBookmarked(res.isBookmarked);
    }
  };

  const title = article?.title || 'Mengenal Imunisasi TT untuk Catin Wanita';
  const readTime = article?.readTime || '4 Menit Baca';
  const category = normalizeArticleCategory(article?.category || 'Imunisasi TT');

  // Fallback featured image
  const featuredImage =
    article?.imageUrl && article.imageUrl.trim() !== ''
      ? article.imageUrl
      : DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES.default;

  // Determine Markdown Content vs Sections:
  const rawBodyContent = article?.content || article?.summary || '';
  const isMarkdownArticle =
    rawBodyContent.includes('#') ||
    rawBodyContent.includes('**') ||
    rawBodyContent.includes('\n\n') ||
    rawBodyContent.length > 80;

  // Clean Summary: ensure it doesn't leak raw markdown titles
  const summaryText =
    article?.summary && !article.summary.startsWith('#')
      ? article.summary
      : 'Panduan kesehatan pranikah resmi untuk calon pengantin.';

  // Check if sections are custom structured (not just the automated split duplicate)
  const hasCustomSections =
    Boolean(article?.sections && article.sections.length > 0) &&
    !(
      article?.sections?.length === 1 &&
      article.sections[0].heading === 'Pembahasan Edukasi' &&
      isMarkdownArticle
    );

  return (
    <div className='flex flex-col w-full max-w-3xl mx-auto pb-12 sm:pb-16 text-[#121c2a]'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toastMessage && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-[70] max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className='flex items-center justify-between pb-3'>
        <button
          type='button'
          onClick={() => navigate(backHref)}
          aria-label='Kembali'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] active:scale-90 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center truncate px-2'>
          <h1 className='text-base font-bold text-[#121c2a] truncate'>Artikel Edukasi</h1>
          <p className='text-[11px] text-[#574144]'>Pedoman Edukasi Kesehatan</p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleShare}
            aria-label='Bagikan'
            className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
          >
            <Share2 size={18} />
          </button>
          <button
            type='button'
            onClick={handleBookmarkToggle}
            aria-label='Simpan'
            className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
          >
            {bookmarked ? (
              <BookmarkCheck size={18} className='text-[#aa294d]' />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Reading Progress Indicator */}
      <div className='w-full bg-[#eff4ff] rounded-full h-1 mb-4 overflow-hidden'>
        <div
          className='bg-[#aa294d] h-full transition-all duration-300 rounded-full'
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {loading ? (
        <div className='flex flex-col items-center justify-center py-24 w-full gap-3'>
          <div className='animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#aa294d]' />
          <p className='text-xs text-[#8b7074]'>Memuat materi edukasi...</p>
        </div>
      ) : !article ? (
        <div className='flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-[#eff4ff] shadow-xs'>
          <div className='w-14 h-14 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] mb-4'>
            <BookOpen size={24} />
          </div>
          <h2 className='text-lg font-bold text-[#121c2a]'>Artikel Tidak Ditemukan</h2>
          <p className='text-xs text-[#574144] mt-1.5 max-w-sm leading-relaxed'>
            Artikel yang kamu cari mungkin telah dipindahkan atau belum dipublikasikan oleh faskes.
          </p>
          <button
            type='button'
            onClick={() => navigate(backHref)}
            className='mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#aa294d] text-white text-xs font-bold shadow-xs hover:bg-[#8c0f39] active:scale-95 transition-all cursor-pointer'
          >
            <ArrowLeft size={16} />
            Kembali ke Halaman Edukasi
          </button>
        </div>
      ) : (
        <>
          {/* Editorial Article Header Card */}
          <div className='relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-br from-[#ffd9de]/80 via-[#eff4ff] to-[#aff1d0]/30 p-5 sm:p-6 shadow-xs mb-5 border border-[#ffd9de]/60'>
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[#aa294d] text-xs font-bold backdrop-blur-xs shadow-2xs'>
                  <CheckCircle2 size={13} className='text-[#2a6950]' />
                  {category}
                </span>
                <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 text-[#574144] text-[11px] font-semibold'>
                  <Clock size={12} />
                  {readTime}
                </span>
              </div>

              <h2 className='text-lg sm:text-2xl font-black text-[#121c2a] leading-snug tracking-tight'>
                {title}
              </h2>

              {/* Author & Publishing Metadata */}
              <div className='flex items-center gap-3 pt-2 mt-1 border-t border-black/5'>
                <div className='w-9 h-9 rounded-full bg-[#aff1d0] text-[#0a5139] flex items-center justify-center shadow-2xs shrink-0'>
                  <Building2 size={18} />
                </div>
                <div className='flex flex-col min-w-0'>
                  <span className='text-xs font-bold text-[#121c2a] truncate'>
                    {article?.author?.name || 'Tim Medis Faskes'}
                  </span>
                  <span className='text-[11px] text-[#574144] truncate'>
                    {article?.author?.role || 'Puskesmas Mitra Pranikah'}
                    {article?.publishedAt ? ` • ${article.publishedAt}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Hero Banner Image */}
          <div className='relative w-full h-48 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#ffd9de]/50 mb-5 bg-stone-100'>
            <img src={featuredImage} alt={title} className='w-full h-full object-cover' />
          </div>

          {/* Clinical Summary / Intisari Artikel */}
          {summaryText && (
            <div className='bg-linear-to-br from-[#eff4ff] to-[#ffd9de]/30 rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff] mb-5'>
              <div className='flex items-center gap-2 mb-2 text-[#aa294d]'>
                <ShieldCheck size={18} />
                <span className='text-xs font-bold tracking-wider uppercase'>
                  Intisari Panduan Klinis
                </span>
              </div>
              <p className='text-xs sm:text-sm text-[#121c2a] leading-relaxed font-medium'>
                {summaryText}
              </p>
            </div>
          )}

          {/* Main Article Content - Rendered with Rich Markdown */}
          {isMarkdownArticle ? (
            <div className='bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs border border-[#eff4ff] mb-5 leading-relaxed'>
              <MarkdownRenderer content={rawBodyContent} />
            </div>
          ) : hasCustomSections ? (
            /* Structured Custom Sections if provided */
            <div className='flex flex-col gap-4 mb-5'>
              {article.sections!.map((sec, idx) => (
                <div
                  key={idx}
                  className='bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff] flex flex-col gap-2.5'
                >
                  {sec.heading && (
                    <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>{sec.heading}</h3>
                  )}
                  {sec.subheading && (
                    <h4 className='text-xs font-semibold text-[#8b7074]'>{sec.subheading}</h4>
                  )}
                  {sec.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className='text-xs sm:text-sm text-[#121c2a] leading-relaxed'>
                      {p}
                    </p>
                  ))}

                  {sec.callout && (
                    <div
                      className={`rounded-2xl p-3.5 my-1 border ${
                        sec.callout.type === 'warning'
                          ? 'bg-[#ffd9de]/30 border-[#ffd9de]'
                          : 'bg-[#aff1d0]/30 border-[#aff1d0]/50'
                      }`}
                    >
                      {sec.callout.title && (
                        <strong className='block text-xs text-[#0a5139] mb-1'>
                          {sec.callout.title}
                        </strong>
                      )}
                      <p className='text-xs text-[#121c2a] leading-relaxed'>{sec.callout.text}</p>
                    </div>
                  )}

                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <div className='mt-1 pt-2 border-t border-[#eff4ff]'>
                      <ul className='space-y-1.5'>
                        {sec.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className='text-xs text-[#574144] flex items-start gap-2'>
                            <span className='text-[#2a6950] font-bold'>✓</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Warm Clinical Infobox */}
          <div className='rounded-2xl p-4 bg-[#aff1d0]/30 border border-[#aff1d0]/50 shadow-xs flex items-start gap-3 mb-5'>
            <div className='w-9 h-9 shrink-0 rounded-full bg-[#2a6950] text-white flex items-center justify-center mt-0.5 shadow-2xs'>
              <CalendarClock size={18} />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-[#0a5139] mb-1'>
                Selangkah Lebih Siap, Selangkah Lebih Sehat
              </span>
              <p className='text-xs text-[#121c2a] leading-relaxed'>
                Setiap informasi yang kamu pelajari adalah langkah kecil menuju masa depan yang
                lebih baik. Terus tingkatkan pengetahuanmu untuk menjaga kesehatan diri dan
                merencanakan keluarga yang sehat.
              </p>
            </div>
          </div>

          {/* Related Articles List */}
          {relatedArticles.length > 0 && (
            <div className='mt-2 mb-6'>
              <div className='flex items-center justify-between mb-3 px-1'>
                <h3 className='text-sm font-bold text-[#121c2a]'>Artikel Edukasi Terkait</h3>
                <Link
                  to='/user/education'
                  className='text-xs font-semibold text-[#aa294d] hover:underline'
                >
                  Lihat Semua
                </Link>
              </div>

              <div className='flex flex-col gap-2.5'>
                {relatedArticles.map(rel => {
                  const read = isRead(rel.id);
                  return (
                    <Link
                      key={rel.id}
                      to={`/user/education/${rel.id}`}
                      onClick={() => markAsRead(rel.id)}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer group ${
                        read
                          ? 'bg-stone-50/80 border-stone-200/70 opacity-85 hover:opacity-100 hover:border-stone-300'
                          : 'bg-white border-[#eff4ff] hover:shadow-xs hover:border-[#ffd9de]/80'
                      }`}
                    >
                      <div className='w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100'>
                        <img
                          src={
                            rel.imageUrl && rel.imageUrl.trim() !== ''
                              ? rel.imageUrl
                              : DEFAULT_CATEGORY_IMAGES[rel.category] ||
                                DEFAULT_CATEGORY_IMAGES.default
                          }
                          alt={rel.title}
                          className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                            read ? 'grayscale-[30%] group-hover:grayscale-0' : ''
                          }`}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              read
                                ? 'bg-stone-200/70 text-stone-600'
                                : 'bg-[#ffd9de]/60 text-[#aa294d]'
                            }`}
                          >
                            {rel.category}
                          </span>
                          <span className='text-[10px] text-[#8b7074]'>{rel.readTime}</span>
                          {read && (
                            <span className='inline-flex items-center gap-1 text-[10px] text-stone-500 font-medium bg-stone-200/50 px-1.5 py-0.2 rounded-md'>
                              <Check size={10} className='text-emerald-600' />
                              Sudah dibaca
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-xs transition-colors line-clamp-1 ${
                            read
                              ? 'font-medium text-stone-500 group-hover:text-stone-700'
                              : 'font-bold text-[#121c2a] group-hover:text-[#aa294d]'
                          }`}
                        >
                          {rel.title}
                        </h4>
                        <p
                          className={`text-[11px] line-clamp-1 mt-0.5 ${read ? 'text-stone-400' : 'text-[#574144]'}`}
                        >
                          {rel.summary}
                        </p>
                      </div>
                      <div className='text-[#8b7074] group-hover:text-[#aa294d] group-hover:translate-x-1 transition-all pr-1'>
                        <ArrowRight size={16} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
