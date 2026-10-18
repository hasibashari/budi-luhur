import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Article } from '../types';
import {
  getArticleByIdAction,
  getRelatedArticlesAction,
  toggleArticleBookmarkAction,
  isArticleBookmarkedAction,
} from '../api/educationRepository';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { MarkdownRenderer } from '@/src/shared/components/markdown';
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Heart,
  Baby,
  ShieldCheck,
  CalendarClock,
  ArrowRight,
  Building2,
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
  const [readProgress, setReadProgress] = useState(35);

  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

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
        const [data, related] = await Promise.all([
          getArticleByIdAction(articleId),
          getRelatedArticlesAction(articleId),
        ]);

        if (isMounted) {
          setArticle(data);
          setRelatedArticles(related || []);
          if (data) {
            const bookmarkStatus = await isArticleBookmarkedAction(userId, data.id);
            if (isMounted) {
              setBookmarked(bookmarkStatus);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching article detail:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 35;
      setReadProgress(Math.min(Math.max(progress, 20), 100));
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [articleId, userId]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: article?.title || 'Edukasi Imunisasi TT - PRELUNA',
            text: article?.summary || 'Panduan kesehatan pranikah resmi Kemenkes RI.',
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
    await toggleArticleBookmarkAction(userId, article.id);
  };

  const title = article?.title || 'Mengenal Imunisasi TT untuk Catin Wanita';
  const readTime = article?.readTime || '4 Menit Baca';

  return (
    <div className='flex flex-col w-full max-w-3xl mx-auto pb-12 sm:pb-16'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-20 right-4 z-50 bg-[#121c2a] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0]' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className='flex items-center justify-between pb-3'>
        <button
          type='button'
          onClick={() => navigate(backHref)}
          aria-label='Kembali'
          className='w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] transition-colors cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center truncate px-2'>
          <h1 className='text-base font-bold text-[#121c2a] truncate'>Artikel Edukasi</h1>
          <p className='text-[11px] text-[#574144]'>Pedoman Resmi Kemenkes RI</p>
        </div>

        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={handleShare}
            aria-label='Bagikan'
            className='w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer'
          >
            <Share2 size={18} />
          </button>
          <button
            type='button'
            onClick={handleBookmarkToggle}
            aria-label='Simpan'
            className='w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer'
          >
            {bookmarked ? (
              <BookmarkCheck size={18} className='text-[#aa294d]' />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Reading Progress Indicator (Stitch Screen 4) */}
      <div className='w-full bg-[#eff4ff] rounded-full h-1 mb-4 overflow-hidden'>
        <div
          className='bg-[#aa294d] h-full transition-all duration-300 rounded-full'
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-24 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
        </div>
      ) : (
        <>
          {/* Hero Editorial Banner (Stitch Screen 4) */}
          <div className='relative w-full rounded-2xl overflow-hidden bg-linear-to-br from-[#ffd9de] via-[#eff4ff] to-[#aff1d0]/40 p-4 sm:p-5 shadow-xs mb-5 border border-[#ffd9de]/60'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex-1 pr-1'>
                <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-[#aa294d] text-[11px] font-bold backdrop-blur-xs mb-2 shadow-2xs'>
                  <CheckCircle2 size={13} className='text-[#2a6950]' />
                  {article?.category || 'Edukasi Resmi Catin'}
                </span>
                <h2 className='text-base sm:text-xl font-bold text-[#121c2a] leading-snug'>
                  {title}
                </h2>
              </div>

              {/* Illustrated Hero Avatar Badge (Stitch Screen 4) */}
              <div className='relative w-22 h-22 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-md bg-white border border-[#ffd9de]'>
                <img
                  src={
                    article?.imageUrl ||
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={title}
                  className='w-full h-full object-cover'
                />
                <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2a6950] text-white flex items-center justify-center shadow-xs'>
                  <ShieldCheck size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Author Metadata & Reading Tags (Stitch Screen 4) */}
          <div className='flex items-center justify-between py-2 px-1 mb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-full bg-[#aff1d0] text-[#0a5139] flex items-center justify-center shadow-2xs'>
                <Building2 size={18} />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-[#121c2a]'>
                  {article?.author?.name || 'dr. Sarah Jenkins, Sp.GK & Tim Medis'}
                </span>
                <span className='text-[11px] text-[#574144]'>
                  {article?.author?.role || 'Puskesmas Mitra Pranikah Kemenkes RI'}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#574144] text-[11px] font-semibold'>
              <Clock size={13} />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Lead Paragraph / Summary Card (Stitch Screen 4) */}
          <div className='bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff] mb-5'>
            <div className='flex items-center gap-2 mb-2 text-[#aa294d]'>
              <ShieldCheck size={18} />
              <span className='text-xs font-bold tracking-wider uppercase'>Panduan Klinis</span>
            </div>
            <p className='text-xs sm:text-sm text-[#121c2a] leading-relaxed'>
              {article?.leadParagraph ||
                article?.summary ||
                'Imunisasi Tetanus Toxoid (TT) adalah vaksinasi penting yang direkomendasikan bagi setiap calon pengantin wanita untuk mencegah infeksi tetanus yang berbahaya bagi ibu dan bayi, terutama pada saat proses persalinan dan pemotongan tali pusat.'}
            </p>
          </div>

          {/* Key Takeaways Highlight Box if present */}
          {article?.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className='bg-linear-to-br from-[#eff4ff] to-[#ffd9de]/30 rounded-2xl p-4 sm:p-5 border border-[#eff4ff] mb-5 shadow-xs'>
              <div className='flex items-center gap-2 mb-2.5 text-[#aa294d]'>
                <CheckCircle2 size={18} />
                <span className='text-xs font-bold uppercase tracking-wider'>
                  Poin Kunci Edukasi
                </span>
              </div>
              <ul className='space-y-2'>
                {article.keyTakeaways.map((point, kIdx) => (
                  <li
                    key={kIdx}
                    className='text-xs sm:text-sm text-[#121c2a] flex items-start gap-2.5'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-[#aa294d] mt-1.5 shrink-0' />
                    <span className='leading-relaxed'>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Content Sections from Backend */}
          {article?.sections && article.sections.length > 0 ? (
            <div className='flex flex-col gap-4 mb-5'>
              {article.sections.map((sec, idx) => (
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
          ) : (
            /* Fallback Authentic Benefits Section (Stitch Screen 4) */
            <div className='flex flex-col mb-5'>
              <div className='flex items-center justify-between mb-3 px-1'>
                <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                  Manfaat Utama Imunisasi TT
                </h3>
                <span className='text-[10px] font-bold text-[#0a5139] bg-[#aff1d0] px-2.5 py-0.5 rounded-full'>
                  3 Proteksi Inti
                </span>
              </div>

              <div className='flex flex-col gap-3'>
                {/* Benefit 1 */}
                <div className='flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs'>
                  <div className='w-11 h-11 shrink-0 rounded-xl bg-[#ffd9de] text-[#aa294d] flex items-center justify-center'>
                    <Heart size={20} className='fill-[#aa294d]' />
                  </div>
                  <div className='flex flex-col'>
                    <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] mb-0.5'>
                      Melindungi Ibu dari Infeksi Tetanus
                    </h4>
                    <p className='text-[11px] text-[#574144] leading-relaxed'>
                      Memberikan kekebalan aktif terhadap bakteri <i>Clostridium tetani</i> selama
                      fase reproduksi dan kehamilan yang sehat.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className='flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs'>
                  <div className='w-11 h-11 shrink-0 rounded-xl bg-[#aff1d0] text-[#2a6950] flex items-center justify-center'>
                    <Baby size={20} />
                  </div>
                  <div className='flex flex-col'>
                    <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] mb-0.5'>
                      Mencegah Tetanus Neonatorum
                    </h4>
                    <p className='text-[11px] text-[#574144] leading-relaxed'>
                      Antibodi ditransfer alami ke janin melalui plasenta, melindungi bayi baru
                      lahir dari komplikasi fatal saat persalinan.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className='flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs'>
                  <div className='w-11 h-11 shrink-0 rounded-xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center'>
                    <ShieldCheck size={20} />
                  </div>
                  <div className='flex flex-col'>
                    <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] mb-0.5'>
                      Kekebalan Jangka Panjang (25+ Tahun)
                    </h4>
                    <p className='text-[11px] text-[#574144] leading-relaxed'>
                      Rangkaian TT lengkap (TT1 hingga TT5) memberikan perlindungan kumulatif seumur
                      hidup untuk seluruh rencana kehamilan Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warm Clinical Infobox (Stitch Screen 4) */}
          <div className='rounded-2xl p-4 bg-[#aff1d0]/30 border border-[#aff1d0]/50 shadow-xs flex items-start gap-3 mb-5'>
            <div className='w-9 h-9 shrink-0 rounded-full bg-[#2a6950] text-white flex items-center justify-center mt-0.5 shadow-2xs'>
              <CalendarClock size={18} />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-[#0a5139] mb-1'>
                Kapan Sebaiknya Menerimanya?
              </span>
              <p className='text-xs text-[#121c2a] leading-relaxed'>
                Sebaiknya dilakukan <strong>minimal 1 bulan</strong> sebelum hari pernikahan atau
                disesuaikan dengan riwayat imunisasi dasar di buku KIA/Puskesmas.
              </p>
            </div>
          </div>

          {/* Full Markdown Content if present */}
          {article?.content &&
            article.content !== article.summary &&
            article.content !== article.leadParagraph && (
              <div className='bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-[#eff4ff] mb-5'>
                <MarkdownRenderer content={article.content} />
              </div>
            )}

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
                {relatedArticles.map(rel => (
                  <Link
                    key={rel.id}
                    to={`/user/education/${rel.id}`}
                    className='flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#eff4ff] hover:shadow-xs hover:border-[#ffd9de]/80 transition-all cursor-pointer group'
                  >
                    <div className='w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100'>
                      <img
                        src={
                          rel.imageUrl ||
                          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={rel.title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-0.5'>
                        <span className='text-[10px] font-bold text-[#aa294d] bg-[#ffd9de]/60 px-2 py-0.2 rounded-full'>
                          {rel.category}
                        </span>
                        <span className='text-[10px] text-[#8b7074]'>{rel.readTime}</span>
                      </div>
                      <h4 className='text-xs font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors line-clamp-1'>
                        {rel.title}
                      </h4>
                      <p className='text-[11px] text-[#574144] line-clamp-1 mt-0.5'>
                        {rel.summary}
                      </p>
                    </div>
                    <div className='text-[#8b7074] group-hover:text-[#aa294d] group-hover:translate-x-1 transition-all pr-1'>
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* In-Flow Bottom CTA Banner (Stitch Screen 4) */}
      <div className='mt-8 pt-6 border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-4 bg-linear-to-r from-[#ffd9de]/50 via-white to-[#aff1d0]/30 p-5 rounded-3xl border border-[#ffd9de]/70 shadow-xs'>
        <div className='flex flex-col text-center sm:text-left'>
          <span className='text-[11px] font-bold text-[#aa294d] uppercase tracking-wider mb-0.5'>
            Langkah Selanjutnya
          </span>
          <h4 className='text-sm sm:text-base font-bold text-[#121c2a]'>
            Sudah Siap Melengkapi Status Imunisasi?
          </h4>
          <p className='text-xs text-[#574144] mt-0.5'>
            Lihat jadwal penyuntikan TT dan faskes terdaftar Anda.
          </p>
        </div>
        <Link
          to='/user/schedule'
          className='w-full sm:w-auto px-6 h-12 rounded-full bg-[#aa294d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(170,41,77,0.32)] hover:bg-[#cb4364] active:scale-[0.98] transition-transform shrink-0'
        >
          <span>Lanjutkan ke Jadwal TT</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
