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
import ArticleCard from '../components/ArticleCard';
import { MarkdownRenderer } from '@/src/shared/components/markdown';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  ThumbsUp,
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
  const articleId = propArticleId || params.id || '';
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    const fetchData = async () => {
      setLoading(true);
      const data = await getArticleByIdAction(articleId);
      if (isMounted) {
        setArticle(data);
        if (data) {
          const [related, bookmarkStatus] = await Promise.all([
            getRelatedArticlesAction(data.id, 3),
            isArticleBookmarkedAction(userId, data.id),
          ]);
          if (isMounted) {
            setRelatedArticles(related);
            setBookmarked(bookmarkStatus);
          }
        }
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [articleId, userId]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: article?.title,
            text: article?.summary,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Tautan artikel berhasil disalin!');
        }
      } catch {
        // user cancelled share
      }
    }
  };

  const handleBookmarkToggle = async () => {
    if (!article) return;
    const nextState = !bookmarked;
    setBookmarked(nextState);
    await toggleArticleBookmarkAction(userId, article.id);
    showToast(nextState ? 'Artikel disimpan ke bookmark' : 'Bookmark dihapus');
  };

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      showToast('Terima kasih atas apresiasimu!');
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] gap-3'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600' />
        <span className='text-xs font-semibold text-slate-500'>Memuat materi edukasi...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className='max-w-2xl mx-auto py-12 px-4 text-center'>
        <div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500'>
          <BookOpen size={28} />
        </div>
        <h2 className='text-xl font-bold text-slate-800 mb-2'>Artikel Tidak Ditemukan</h2>
        <p className='text-slate-500 text-sm mb-6'>
          Materi edukasi yang Anda cari mungkin telah diperbarui atau dipindahkan.
        </p>
        <Link
          to={backHref}
          className='inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm transition-all cursor-pointer'
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Edukasi</span>
        </Link>
      </div>
    );
  }

  return (
    <article className='max-w-3xl mx-auto pb-16 animate-fade-in'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 size={14} className='text-teal-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className='flex items-center justify-between gap-4 mb-6'>
        <button
          type='button'
          onClick={() => navigate(backHref)}
          className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors text-sm cursor-pointer'
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleShare}
            className='p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors cursor-pointer shadow-2xs'
            title='Bagikan Artikel'
          >
            <Share2 size={16} />
          </button>
          <button
            type='button'
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-full border transition-colors cursor-pointer shadow-2xs ${
              bookmarked
                ? 'border-teal-200 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
            title={bookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
          >
            <Bookmark size={16} className={bookmarked ? 'fill-teal-600' : ''} />
          </button>
        </div>
      </div>

      {/* Category Badge & Title */}
      <div className='mb-4'>
        <span className='inline-block px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs mb-3 border border-teal-100'>
          {article.category}
        </span>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4'>
          {article.title}
        </h1>

        {/* Author & Meta Data */}
        <div className='flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 text-xs text-slate-500'>
          <div className='flex items-center gap-3'>
            {article.author?.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className='w-10 h-10 rounded-full object-cover border border-slate-200'
              />
            ) : (
              <div className='w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800 text-sm overflow-hidden border border-teal-200'>
                {article.author?.name ? article.author.name.charAt(0) : 'P'}
              </div>
            )}
            <div>
              <p className='font-bold text-slate-800 text-sm'>
                {article.author?.name || 'Bidan Konselor Pilluna'}
              </p>
              <p className='text-slate-400 text-xs'>
                {article.author?.role || 'Fasilitator Kontrasepsi Medis'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-4 text-xs font-medium'>
            <span className='flex items-center gap-1.5'>
              <Calendar size={14} className='text-teal-600' />
              {article.publishedAt}
            </span>
            <span className='flex items-center gap-1.5'>
              <Clock size={14} className='text-teal-600' />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Feature Image */}
      {article.imageUrl && (
        <div className='w-full rounded-2xl overflow-hidden mb-8 shadow-xs border border-slate-200 max-h-[380px]'>
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-full object-cover max-h-[380px]'
          />
        </div>
      )}

      {/* Key Takeaways Box (If any) */}
      {article.keyTakeaways && article.keyTakeaways.length > 0 && (
        <div className='p-5 mb-8 bg-teal-50/70 rounded-2xl border border-teal-200/80 shadow-2xs'>
          <div className='text-xs font-extrabold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5'>
            <span>Poin Kunci & Ringkasan Klinis:</span>
          </div>
          <ul className='space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed'>
            {article.keyTakeaways.map((point, i) => (
              <li key={i} className='flex items-start gap-2.5'>
                <CheckCircle2 size={16} className='text-teal-600 shrink-0 mt-0.5' />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Markdown Formatted Article Content */}
      <div className='prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base'>
        <MarkdownRenderer content={article.content || ''} />
      </div>

      {/* Bottom Appreciation / Like Box */}
      <div className='mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-slate-800'>
            Apakah materi ini bermanfaat bagi Anda?
          </h4>
          <p className='text-xs text-slate-500 mt-0.5'>
            Dukungan Anda membantu tim klinis kami menyusun edukasi kontrasepsi berkualitas.
          </p>
        </div>

        <button
          type='button'
          onClick={handleLikeToggle}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            liked
              ? 'bg-teal-600 text-white shadow-teal-600/20 hover:bg-teal-700'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
          }`}
        >
          <ThumbsUp size={16} className={liked ? 'fill-white' : ''} />
          <span>
            {liked ? 'Bermanfaat' : 'Bermanfaat'} ({likeCount})
          </span>
        </button>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className='mt-12'>
          <h3 className='text-lg sm:text-xl font-bold text-slate-900 mb-4'>
            Materi Edukasi Terkait
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {relatedArticles.map(rel => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
