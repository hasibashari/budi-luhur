import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Article } from '../types';
import { getArticleDetailAction, toggleArticleBookmarkAction } from '../api/educationRepository';
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
  const userId = user?.id || '';

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
      const detail = await getArticleDetailAction(articleId, userId);
      if (isMounted) {
        if (detail) {
          setArticle(detail.article);
          setRelatedArticles(detail.relatedArticles);
          setBookmarked(detail.isBookmarked ?? false);
        } else {
          setArticle(null);
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
    const res = await toggleArticleBookmarkAction(userId, article.id);
    if (res.success) {
      setBookmarked(res.isBookmarked);
      showToast(
        res.isBookmarked ? 'Artikel disimpan ke bookmark kamu' : 'Artikel dihapus dari bookmark',
      );
    }
  };

  const handleLikeToggle = () => {
    setLiked(prev => {
      const next = !prev;
      setLikeCount(c => (next ? c + 1 : c - 1));
      return next;
    });
  };

  if (loading) {
    return (
      <div className='pb-12 max-w-[840px] mx-auto px-4 sm:px-6 animate-pulse'>
        <div className='py-4 flex justify-between items-center'>
          <div className='h-9 w-40 bg-slate-200 rounded-full' />
          <div className='h-9 w-20 bg-slate-200 rounded-full' />
        </div>
        <div className='my-6 space-y-3'>
          <div className='h-7 w-28 bg-slate-200 rounded-full' />
          <div className='h-10 w-4/5 bg-slate-200 rounded-xl' />
          <div className='h-6 w-3/5 bg-slate-200 rounded-lg' />
        </div>
        <div className='h-[360px] w-full bg-slate-200 rounded-2xl mb-8' />
        <div className='space-y-3'>
          <div className='h-4 w-full bg-slate-200 rounded' />
          <div className='h-4 w-11/12 bg-slate-200 rounded' />
          <div className='h-4 w-4/5 bg-slate-200 rounded' />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className='py-20 text-center max-w-[540px] mx-auto px-4'>
        <div className='p-8 rounded-3xl border border-pink-100 bg-white shadow-xl'>
          <div className='w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-500'>
            <BookOpen size={32} />
          </div>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>Artikel Tidak Ditemukan</h2>
          <p className='text-sm text-slate-500 mb-6'>
            Artikel edukasi yang kamu cari mungkin telah dipindahkan atau belum tersedia.
          </p>
          <button
            onClick={() => navigate(backHref)}
            className='inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-md shadow-rose-200 transition-all cursor-pointer'
          >
            <ArrowLeft size={18} />
            <span>
              {backHref.includes('admin') ? 'Kembali ke Manajemen Artikel' : 'Kembali ke Edukasi'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-16 max-w-[840px] mx-auto px-4 sm:px-6'>
      {/* Top Bar Navigation & Actions */}
      <div className='py-3 mb-6 flex items-center justify-between border-b border-pink-100'>
        <Link
          to={backHref}
          className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm'
        >
          <ArrowLeft size={18} />
          <span>
            {backHref.includes('admin') ? 'Kembali ke Manajemen Artikel' : 'Kembali ke Edukasi'}
          </span>
        </Link>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleShare}
            title='Bagikan Artikel'
            className='p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer shadow-sm'
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Hapus Bookmark' : 'Simpan Artikel'}
            className={`p-2 rounded-full border transition-colors cursor-pointer shadow-sm ${
              bookmarked
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Article Header */}
      <div className='mb-6'>
        <span className='inline-block px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs mb-3'>
          {article.category}
        </span>

        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3'>
          {article.title}
        </h1>

        <p className='text-base text-slate-600 leading-relaxed mb-6'>{article.summary}</p>

        {/* Metadata Bar */}
        <div className='flex flex-wrap items-center justify-between gap-3 p-4 bg-[#fff5f7] rounded-2xl border border-pink-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center font-bold text-rose-700 text-sm overflow-hidden border border-pink-200'>
              {article.author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span>{article.author?.name?.charAt(0) || 'M'}</span>
              )}
            </div>
            <div>
              <div className='text-sm font-bold text-slate-900'>
                {article.author?.name || 'Tim Medis FEMORY'}
              </div>
              <div className='text-xs text-slate-500'>
                {article.author?.role || 'UKS & Fasilitator Kesehatan Remaja'}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4 text-xs font-semibold text-slate-500'>
            <div className='flex items-center gap-1.5'>
              <Calendar size={15} className='text-rose-500' />
              <span>{article.publishedAt}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Clock size={15} className='text-rose-500' />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      {article.imageUrl && (
        <div className='relative w-full h-[240px] sm:h-[400px] rounded-3xl overflow-hidden mb-8 shadow-md'>
          <img src={article.imageUrl} alt={article.title} className='w-full h-full object-cover' />
        </div>
      )}

      {/* Key Takeaways Box if available */}
      {article.keyTakeaways && article.keyTakeaways.length > 0 && (
        <div className='p-5 mb-8 bg-rose-50/70 rounded-2xl border border-rose-200/80'>
          <div className='text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-3 flex items-center gap-1.5'>
            <span>Poin Penting (Key Takeaways)</span>
            <span>💡</span>
          </div>
          <div className='space-y-2'>
            {article.keyTakeaways.map((point, idx) => (
              <div key={idx} className='flex items-start gap-2.5'>
                <CheckCircle2 size={16} className='text-rose-600 shrink-0 mt-0.5' />
                <span className='text-sm font-medium text-slate-700 leading-snug'>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Markdown Content Body */}
      <div className='mb-10'>
        <MarkdownRenderer
          content={
            article.content ||
            article.leadParagraph ||
            article.summary ||
            'Konten artikel belum tersedia.'
          }
        />
      </div>

      {/* Like / Feedback Bar */}
      <div className='h-px bg-slate-100 my-8 w-full' />
      <div className='flex items-center justify-between flex-wrap gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/70'>
        <div className='text-sm font-semibold text-slate-700'>
          Apakah artikel ini bermanfaat untukmu?
        </div>
        <button
          onClick={handleLikeToggle}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer shadow-sm ${
            liked
              ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>Bermanfaat ({likeCount})</span>
        </button>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className='mt-12'>
          <h2 className='text-xl font-extrabold text-slate-900 mb-6'>Artikel Terkait Lainnya</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            {relatedArticles.map(rel => (
              <ArticleCard
                key={rel.id}
                article={rel}
                hrefPrefix={backHref.includes('admin') ? '/admin/articles' : '/user/education'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2 animate-bounce'>
          <CheckCircle2 size={16} className='text-emerald-400' />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
