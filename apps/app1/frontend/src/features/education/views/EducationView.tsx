import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  Calendar,
  ArrowRight,
  X,
  PenSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Chip } from '@/src/shared/components/ui/Chip';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import ArticleFormModal, {
  ArticleFormData,
} from '@/src/features/admin/components/ArticleFormModal';
import {
  getArticlesAction,
  getUserArticlesAction,
  createUserArticleAction,
  updateUserArticleAction,
  deleteUserArticleAction,
} from '../api/educationRepository';
import { Article } from '../types';

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: '',
  author: '',
  summary: '',
  content: '',
  readTime: '3 min read',
  status: 'Draf',
  imageUrl: '',
};

export default function EducationView() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'my-articles'>('explore');
  const [articles, setArticles] = useState<Article[]>([]);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [loadingUserArticles, setLoadingUserArticles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // CRUD modal, delete confirmation & toast hooks
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ArticleFormData>(initialArticleFormData);

  const {
    open: deleteConfirmOpen,
    itemToDelete: articleToDelete,
    requestDelete: requestDeleteArticle,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  const loadArticles = useCallback(async () => {
    try {
      const data = await getArticlesAction();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserArticles = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingUserArticles(true);
    try {
      const data = await getUserArticlesAction();
      setUserArticles(Array.isArray(data) ? data : []);
    } finally {
      setLoadingUserArticles(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadArticles();
    if (isAuthenticated) {
      void loadUserArticles();
    }
  }, [loadArticles, loadUserArticles, isAuthenticated]);

  const handleOpenCreate = () => {
    handleOpenAdd({
      author: user?.name || 'Pengguna',
      status: 'Draf',
      imageUrl: '',
    });
  };

  const handleOpenEditUserArticle = (art: Article) => {
    handleOpenEdit(art.id, {
      title: art.title,
      category: art.category,
      author: art.author?.name || user?.name || 'Pengguna',
      summary: art.summary || '',
      content: art.content || art.summary || '',
      readTime: art.readTime || '3 min read',
      status: 'Draf',
      imageUrl: art.imageUrl || '',
    });
  };

  const handleSaveArticle = async () => {
    if (!formData.title.trim()) {
      showToast('Judul artikel wajib diisi', 'error');
      return;
    }
    if (!formData.category.trim()) {
      showToast('Kategori artikel wajib diisi', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('Isi materi artikel wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateUserArticleAction(editingId, {
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          imageUrl: formData.imageUrl,
          authorName: formData.author || user?.name || 'Pengguna',
        });

        if (res.success) {
          await loadUserArticles();
          handleCloseModal();
          showToast('Draf materi berhasil diperbarui!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui draf materi', 'error');
        }
      } else {
        const res = await createUserArticleAction({
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          imageUrl: formData.imageUrl,
          authorName: formData.author || user?.name || 'Pengguna',
        });

        if (res.success) {
          await loadUserArticles();
          handleCloseModal();
          showToast('Draf materi berhasil dibuat dan menunggu persetujuan admin!', 'success');
        } else {
          showToast(res.error || 'Gagal membuat materi', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      const res = await deleteUserArticleAction(articleToDelete);
      if (res.success) {
        await loadUserArticles();
        showToast('Materi berhasil dihapus.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus materi', 'error');
      }
    }
    handleCloseDelete();
  };

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
  const categories = useMemo(
    () =>
      Array.from(new Set(articles.map(article => article.category.trim()).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, 'id'),
      ),
    [articles],
  );
  const categoryOptions = ['Semua', ...categories];

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

      {/* Tab Navigation: Explore vs My Materials */}
      {isAuthenticated && (
        <div className='flex items-center p-1 rounded-2xl bg-[#fdf2f8] border border-[#fce7f3]'>
          <button
            type='button'
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-white text-[#e11d48] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <BookOpen size={16} />
            <span>Jelajahi Edukasi</span>
            <span className='text-[10px] px-1.5 rounded-full bg-rose-100 text-rose-700'>
              {articles.length}
            </span>
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('my-articles')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my-articles'
                ? 'bg-white text-[#e11d48] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <PenSquare size={16} />
            <span>Materi Saya</span>
            {userArticles.length > 0 && (
              <span className='text-[10px] px-1.5 rounded-full bg-emerald-100 text-emerald-700'>
                {userArticles.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: MATERI SAYA (user-authored drafts & published materials)   */}
      {/* ============================================================== */}
      {isAuthenticated && activeTab === 'my-articles' && (
        <div className='flex flex-col gap-4'>
          {/* Publication flow banner */}
          <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3'>
            <div className='w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0'>
              <Sparkles size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-amber-900'>
                Alur Publikasi Terkendali Admin
              </p>
              <p className='text-[11px] sm:text-xs text-amber-800 mt-0.5 leading-relaxed'>
                Materi yang Anda tulis disimpan sebagai draf. Tim admin akan meninjau sebelum
                diterbitkan ke halaman edukasi publik.
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between gap-3'>
            <div>
              <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>Materi Saya</h4>
              <p className='text-[11px] sm:text-xs text-[#64748b] mt-0.5'>
                {userArticles.length} materi •{' '}
                {userArticles.filter(a => a.status === 'Terbit').length} sudah terbit
              </p>
            </div>
            <button
              type='button'
              onClick={handleOpenCreate}
              className='inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e11d48] text-white text-xs font-bold hover:bg-[#be123c] shadow-sm transition-all cursor-pointer shrink-0'
            >
              <Plus size={15} />
              <span>Tulis Materi</span>
            </button>
          </div>

          {loadingUserArticles ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
            </div>
          ) : userArticles.length === 0 ? (
            <Card padding='lg' className='text-center py-12'>
              <div className='w-14 h-14 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-3'>
                <PenSquare size={26} />
              </div>
              <p className='text-base font-bold text-[#1e293b]'>Belum Ada Materi</p>
              <p className='text-xs sm:text-sm text-[#64748b] mt-1 max-w-sm mx-auto leading-relaxed'>
                Bagikan pengalaman, tips konsumsi TTD, atau informasi kesehatan yang bermanfaat
                untuk pengguna lain.
              </p>
              <button
                type='button'
                onClick={handleOpenCreate}
                className='mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e11d48] text-white text-xs font-bold hover:bg-[#be123c] shadow-sm transition-all cursor-pointer'
              >
                <Plus size={15} />
                Tulis Materi Pertama Anda
              </button>
            </Card>
          ) : (
            <div className='flex flex-col gap-3'>
              {userArticles.map(art => {
                const isDraft = art.status !== 'Terbit';
                return (
                  <Card key={art.id} padding='none' className='p-4'>
                    <div className='flex flex-col sm:flex-row gap-3 sm:items-center justify-between'>
                      <div className='flex items-start gap-3 min-w-0 flex-1'>
                        <div className='w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-[#fce7f3]'>
                          {art.imageUrl ? (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-[#e11d48]'>
                              <FileText size={22} />
                            </div>
                          )}
                        </div>

                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-1.5 flex-wrap mb-1'>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isDraft
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isDraft ? '⏳ Draf (Menunggu Admin)' : '✓ Sudah Terbit'}
                            </span>
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100'>
                              {art.category}
                            </span>
                            <span className='text-[10px] text-slate-400 flex items-center gap-1'>
                              <Clock size={11} /> {art.readTime}
                            </span>
                          </div>

                          <h3 className='text-sm font-bold text-[#1e293b] leading-snug line-clamp-1'>
                            {art.title}
                          </h3>
                          <p className='text-xs text-[#64748b] line-clamp-1 mt-0.5'>
                            {art.summary}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-1.5 self-end sm:self-center shrink-0'>
                        <Link
                          to={`/user/education/${art.id}`}
                          title='Lihat Pratinjau'
                          className='p-2 rounded-xl border border-[#fce7f3] bg-white text-[#64748b] hover:text-[#e11d48] hover:bg-rose-50 transition-all cursor-pointer'
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type='button'
                          onClick={() => handleOpenEditUserArticle(art)}
                          title='Edit Materi'
                          className='p-2 rounded-xl border border-[#fce7f3] bg-white text-[#64748b] hover:text-[#e11d48] hover:bg-rose-50 transition-all cursor-pointer'
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type='button'
                          onClick={() => requestDeleteArticle(art.id)}
                          title='Hapus Materi'
                          className='p-2 rounded-xl border border-rose-200 bg-white text-[#e11d48] hover:bg-rose-50 transition-all cursor-pointer'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: JELAJAHI EDUKASI (published materials only)                */}
      {/* ============================================================== */}
      {activeTab === 'explore' && (
        <>
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
              {categoryOptions.map(cat => (
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
                    <span className='text-xs text-[#94a3b8] flex items-center gap-1.5'>
                      <Calendar size={13} className='text-rose-500' />
                      <span>{featuredArticle.publishedAt}</span>
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
        </>
      )}

      {/* Shared article form modal (user mode = drafts only) */}
      <ArticleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSubmit={handleSaveArticle}
        updateFormData={updateFormData}
        showToast={showToast}
        isUserMode
      />

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Hapus Materi'
        message='Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.'
        confirmText='Hapus Materi'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </div>
  );
}
