import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  Heart,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  PenSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  getArticlesAction,
  getUserArticlesAction,
  createUserArticleAction,
  updateUserArticleAction,
  deleteUserArticleAction,
} from '../api/educationRepository';
import { Article } from '../types';
import { normalizeArticleCategory } from '../constants/education.constants';
import { useReadArticles } from '../utils/readArticles';
import { resolveImageUrl } from '@/src/shared/utils/imageUrl';
import { useAuth } from '@/src/features/auth';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import ArticleFormModal, {
  ArticleFormData,
} from '@/src/features/admin/components/ArticleFormModal';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [loadingUserArticles, setLoadingUserArticles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isRead, markAsRead } = useReadArticles();

  // CRUD Modal & Delete Hooks
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
    requestDelete: handleDeleteRequest,
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
    setLoadError(null);
    try {
      const data = await getArticlesAction();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setArticles([]);
      setLoadError('Artikel gagal dimuat. Periksa koneksi lalu coba lagi.');
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
    } catch (err) {
      console.error('Failed to load user articles:', err);
      setUserArticles([]);
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

  const articleList = articles;
  const categories = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          articleList.map(article => normalizeArticleCategory(article.category)).filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'id')),
    ],
    [articleList],
  );

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

  const filteredUserArticles = useMemo(() => {
    if (!searchQuery.trim()) return userArticles;
    const q = searchQuery.toLowerCase();
    return userArticles.filter(
      art =>
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q),
    );
  }, [userArticles, searchQuery]);

  const handleOpenCreateModal = () => {
    handleOpenAdd();
    updateFormData({
      author: user?.name || 'Calon Pengantin',
      status: 'Draf',
      imageUrl: '',
    });
  };

  const handleOpenEditUserArticle = (art: Article) => {
    handleOpenEdit(art.id, {
      title: art.title,
      category: art.category,
      author: art.author?.name || user?.name || 'Calon Pengantin',
      summary: art.summary || '',
      content: art.content || art.summary || '',
      readTime: art.readTime || '3 min read',
      status: 'Draf',
      imageUrl: art.imageUrl || '',
    });
  };

  const handleSaveArticle = async (overrideImageUrl?: string) => {
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

    const finalImageUrl = overrideImageUrl !== undefined ? overrideImageUrl : formData.imageUrl;
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateUserArticleAction(editingId, {
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          imageUrl: finalImageUrl,
          authorName: formData.author,
        });

        if (res.success) {
          await loadUserArticles();
          handleCloseModal();
          showToast('Draf artikel berhasil diperbarui!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui draf artikel', 'error');
        }
      } else {
        const res = await createUserArticleAction({
          title: formData.title,
          category: formData.category,
          summary: formData.summary,
          content: formData.content,
          imageUrl: finalImageUrl,
          authorName: formData.author || user?.name || 'Calon Pengantin',
        });

        if (res.success) {
          await loadUserArticles();
          handleCloseModal();
          showToast('Draf artikel berhasil dibuat dan menunggu persetujuan admin!', 'success');
        } else {
          showToast(res.error || 'Gagal membuat artikel', 'error');
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
        showToast('Draf artikel berhasil dihapus.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus artikel', 'error');
      }
    }
    handleCloseDelete();
  };

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12'>
      {/* 1. Top Screen Title & Intro */}
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

      {/* Tab Navigation (Jelajahi Edukasi vs Artikel Saya) */}
      {isAuthenticated && (
        <div className='flex items-center p-1 rounded-2xl bg-[#eff4ff] border border-[#dee9fc]'>
          <button
            type='button'
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-white text-[#aa294d] shadow-xs'
                : 'text-[#574144] hover:text-[#121c2a]'
            }`}
          >
            <BookOpen size={16} />
            <span>Jelajahi Edukasi</span>
            <span className='text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffd9de] text-[#8c0f39]'>
              {articles.length}
            </span>
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('my-articles')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my-articles'
                ? 'bg-white text-[#aa294d] shadow-xs'
                : 'text-[#574144] hover:text-[#121c2a]'
            }`}
          >
            <PenSquare size={16} />
            <span>Artikel Saya</span>
            {userArticles.length > 0 && (
              <span className='text-[10px] px-1.5 py-0.2 rounded-full bg-[#aff1d0] text-[#0a5139]'>
                {userArticles.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: JELAJAHI EDUKASI (PUBLIK TERBIT)                   */}
      {/* ======================================================== */}
      {activeTab === 'explore' && (
        <>
          {/* Search Bar */}
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

          {/* Category Pills Bar */}
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
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-[#eff4ff]'
                      }`}
                    >
                      {articles.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Banner Program Wajib Pranikah */}
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

          {/* Article Cards List */}
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
            <div className='text-center py-16 bg-white rounded-3xl border border-[#eff4ff] p-8'>
              <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
                <BookOpen size={28} />
              </div>
              <h3 className='text-base font-bold text-[#121c2a]'>Belum Ada Artikel Edukasi</h3>
              <p className='text-xs text-[#574144] mt-1 max-w-sm mx-auto leading-relaxed'>
                Artikel edukasi kesehatan pranikah belum diterbitkan oleh petugas faskes. Materi
                akan muncul otomatis di sini setelah admin menerbitkannya.
              </p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className='flex flex-col gap-3.5'>
              {filteredArticles.map(art => {
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
                          className={`w-full h-full flex items-center justify-center ${
                            read ? 'text-stone-400' : 'text-[#aa294d]'
                          }`}
                        >
                          <BookOpen size={26} />
                        </div>
                      )}
                      <div className='absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-1 mb-1'>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            read ? 'bg-stone-200/70 text-stone-600' : 'bg-[#ffd9de] text-[#8c0f39]'
                          }`}
                        >
                          {art.category}
                        </span>
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
            <div className='text-center py-16 bg-white rounded-3xl border border-[#eff4ff] p-8'>
              <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
                <BookOpen size={28} />
              </div>
              <h3 className='text-base font-bold text-[#121c2a]'>Topik Belum Ditemukan</h3>
              <p className='text-xs text-[#574144] mt-1 max-w-xs mx-auto'>
                Coba kata kunci lain atau pilih kategori di atas untuk menemukan materi yang dicari.
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
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ARTIKEL SAYA (PENGELOLAAN DRAF OLEH PENGGUNA)       */}
      {/* ======================================================== */}
      {activeTab === 'my-articles' && (
        <div className='flex flex-col gap-4'>
          {/* Info Banner Alur Publikasi */}
          <div className='p-4 rounded-2xl bg-[#ffd9de]/50 border border-[#ffd9de] flex items-start gap-3.5'>
            <div className='w-9 h-9 rounded-xl bg-white text-[#aa294d] flex items-center justify-center shrink-0 shadow-2xs mt-0.5'>
              <AlertCircle size={20} />
            </div>
            <div className='flex-1 min-w-0 text-xs text-[#574144] leading-relaxed'>
              <span className='font-bold text-[#121c2a] block text-sm mb-0.5'>
                Alur Publikasi Terkendali Admin
              </span>
              Setiap artikel yang Anda buat otomatis tersimpan sebagai <strong>Draf</strong>.
              Pengguna lain belum dapat melihatnya sampai Admin Faskes meninjau dan menerbitkannya
              secara resmi. Anda bebas mengedit dan memperbarui materi selama masih berstatus draf.
            </div>
          </div>

          {/* Quick Action & Counter Bar */}
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-base font-bold text-[#121c2a]'>Draf & Kontribusi Saya</h2>
              <p className='text-xs text-[#8b7074]'>
                Total {userArticles.length} artikel terdata di akun Anda
              </p>
            </div>
            <button
              type='button'
              onClick={handleOpenCreateModal}
              className='inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#aa294d] text-white text-xs font-bold shadow-xs hover:bg-[#cb4364] active:scale-95 transition-all cursor-pointer'
            >
              <Plus size={16} />
              <span>Tulis Artikel Baru</span>
            </button>
          </div>

          {/* User Articles List */}
          {loadingUserArticles ? (
            <div className='flex items-center justify-center py-16 w-full'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
            </div>
          ) : userArticles.length === 0 ? (
            <div className='text-center py-16 bg-white rounded-3xl border border-[#eff4ff] p-8'>
              <div className='w-14 h-14 rounded-2xl bg-[#ffd9de] text-[#aa294d] flex items-center justify-center mx-auto mb-3 shadow-2xs'>
                <PenSquare size={28} />
              </div>
              <h3 className='text-base font-bold text-[#121c2a]'>Belum Ada Draf Artikel</h3>
              <p className='text-xs text-[#574144] mt-1 max-w-sm mx-auto leading-relaxed'>
                Bagikan pengalaman, tips persiapan pranikah, atau informasi seputar imunisasi TT
                untuk membantu calon pengantin lainnya.
              </p>
              <button
                type='button'
                onClick={handleOpenCreateModal}
                className='mt-4 px-5 py-2.5 rounded-full bg-[#aa294d] text-white text-xs font-bold shadow-xs hover:bg-[#cb4364] transition-all cursor-pointer inline-flex items-center gap-2'
              >
                <Plus size={16} />
                Mulai Tulis Artikel Sekarang
              </button>
            </div>
          ) : (
            <div className='flex flex-col gap-3.5'>
              {filteredUserArticles.map(art => {
                const isDraft = art.status === 'Draf';
                return (
                  <div
                    key={art.id}
                    className='rounded-2xl p-4 bg-white border border-[#eff4ff] shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:border-[#dee9fc]'
                  >
                    <div className='flex items-start gap-3.5 min-w-0 flex-1'>
                      <div className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#eff4ff] border border-[#dee9fc]'>
                        {art.imageUrl ? (
                          <img
                            src={resolveImageUrl(art.imageUrl)}
                            alt={art.title}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-[#aa294d]'>
                            <FileText size={24} />
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              isDraft
                                ? 'bg-[#ffd9de] text-[#8c0f39] border-[#fca5a5]'
                                : 'bg-[#aff1d0] text-[#0a5139] border-[#6ee7b7]'
                            }`}
                          >
                            {isDraft ? '⏳ Draf (Menunggu Admin)' : '✓ Sudah Terbit'}
                          </span>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#1d4ed8] border border-[#dee9fc]'>
                            {art.category}
                          </span>
                          <span className='text-[11px] text-[#8b7074] flex items-center gap-1'>
                            <Clock size={11} /> {art.readTime}
                          </span>
                        </div>

                        <h3 className='text-sm sm:text-base font-bold text-[#121c2a] leading-snug line-clamp-1'>
                          {art.title}
                        </h3>

                        <p className='text-xs text-[#574144] line-clamp-1 mt-0.5'>{art.summary}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-1.5 self-end sm:self-center shrink-0'>
                      <Link
                        to={`/user/education/${art.id}`}
                        title='Lihat Pratinjau'
                        className='p-2 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-all cursor-pointer'
                      >
                        <Eye size={16} />
                      </Link>

                      <button
                        type='button'
                        onClick={() => handleOpenEditUserArticle(art)}
                        title='Edit Artikel'
                        className='p-2 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-all cursor-pointer'
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type='button'
                        onClick={() => handleDeleteRequest(art.id)}
                        title='Hapus Artikel'
                        className='p-2 rounded-xl border border-[#ffd9de] bg-white text-[#aa294d] hover:bg-[#ffd9de] transition-all cursor-pointer'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shared Article Form Modal in User Mode */}
      <ArticleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSubmit={handleSaveArticle}
        updateFormData={updateFormData}
        showToast={showToast}
        isUserMode={true}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Hapus Draf Artikel'
        message='Apakah Anda yakin ingin menghapus draf artikel ini? Tindakan ini tidak dapat dibatalkan.'
        confirmText='Hapus Draf'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </div>
  );
}
