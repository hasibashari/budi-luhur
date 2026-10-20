import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Clock, Image as ImageIcon, BookOpen } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import ArticleFormModal, { ArticleFormData } from '../components/ArticleFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { MobileFilterChips } from '@/src/shared/components/ui/MobileFilterChips';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getAdminArticlesAction,
  createAdminArticleAction,
  updateAdminArticleAction,
  deleteAdminArticleAction,
} from '../api/articleRepository';
import { HealthArticle, ArticleCategory } from '../types/admin.types';
import { ARTICLE_CATEGORIES } from '@/src/features/education/constants/education.constants';

const ARTICLE_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Imunisasi TT': { bg: '#ffd9de', text: '#8c0f39', border: '#ffd9de' },
  Catin: { bg: '#eff4ff', text: '#1d4ed8', border: '#dee9fc' },
  default: { bg: '#f8f9ff', text: '#574144', border: '#dee9fc' },
};

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: 'Imunisasi TT',
  author: 'Tim Promkes Puskesmas & KUA',
  summary: '',
  content: '',
  readTime: '3 min read',
  status: 'Terbit',
  imageUrl: '',
};

export default function ArticleManagementView() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);

  // Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ArticleFormData>(initialArticleFormData);

  // Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: articleToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  const loadData = useCallback(async () => {
    const data = await getAdminArticlesAction();
    setArticles(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminArticlesAction().then(data => {
      if (isMounted) setArticles(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles = articles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onOpenEdit = (article: HealthArticle) => {
    handleOpenEdit(article.id, {
      title: article.title,
      category: (article.category as ArticleCategory) || 'Imunisasi TT',
      author: article.author,
      summary: article.summary || '',
      content: article.content || article.summary || '',
      readTime: article.readTime,
      status: article.status,
      imageUrl: article.imageUrl || '',
    });
  };

  const handlePreviewArticle = (articleId: string) => {
    navigate(`/admin/articles/${articleId}`);
  };

  const handleSaveArticle = async () => {
    if (!formData.title.trim()) {
      showToast('Judul artikel wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateAdminArticleAction(editingId, {
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary,
          content: formData.content,
          readTime: formData.readTime,
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel edukasi berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui artikel', 'error');
        }
      } else {
        const res = await createAdminArticleAction({
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary:
            formData.summary ||
            'Ringkasan materi edukasi kesehatan pranikah dan imunisasi TT calon pengantin.',
          content: formData.content,
          readTime: formData.readTime,
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel edukasi baru berhasil diterbitkan!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan artikel', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      const res = await deleteAdminArticleAction(articleToDelete);
      if (res.success) {
        await loadData();
        showToast('Artikel berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus artikel', 'error');
      }
    }
    handleCloseDelete();
  };

  const columns: Column<HealthArticle>[] = [
    {
      id: 'no',
      label: 'No.',
      width: '5%',
      renderCell: (_, index) => <span className='text-[#8b7074] text-xs font-semibold'>{index + 1}</span>,
    },
    {
      id: 'judul',
      label: 'Artikel Edukasi',
      width: '38%',
      renderCell: article => (
        <div className='flex items-center gap-3'>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className='w-12 h-12 rounded-xl object-cover shrink-0 border border-[#eff4ff] shadow-2xs'
            />
          ) : (
            <div className='w-12 h-12 rounded-xl bg-[#ffd9de]/50 border border-[#ffd9de] text-[#aa294d] flex items-center justify-center shrink-0 shadow-2xs'>
              <BookOpen size={20} />
            </div>
          )}
          <div className='min-w-0'>
            <div className='font-bold text-[#121c2a] text-sm leading-snug line-clamp-2'>
              {article.title}
            </div>
            <div className='flex items-center gap-2 mt-0.5 text-[11px] text-[#8b7074]'>
              <span>ID: {article.id}</span>
              <span>•</span>
              <span className='truncate max-w-[180px]'>✍️ {article.author}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'kategori',
      label: 'Kategori',
      width: '18%',
      renderCell: article => {
        const cat = article.category || 'Imunisasi TT';
        const style = ARTICLE_CATEGORY_COLORS[cat] || ARTICLE_CATEGORY_COLORS.default;
        return (
          <span
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border'
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
            }}
          >
            {cat}
          </span>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      width: '12%',
      renderCell: article => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
            article.status === 'Terbit'
              ? 'bg-[#aff1d0] text-[#0a5139] border-[#6ee7b7]'
              : 'bg-[#ffd9de] text-[#8c0f39] border-[#fca5a5]'
          }`}
        >
          {article.status}
        </span>
      ),
    },
    {
      id: 'publikasi_waktu',
      label: 'Publikasi & Waktu',
      width: '15%',
      renderCell: article => (
        <div>
          <div className='text-[#121c2a] text-xs font-semibold'>{article.publishDate}</div>
          <div className='flex items-center gap-1 text-[11px] text-[#8b7074] mt-0.5'>
            <Clock size={11} className='text-[#aa294d]' />
            <span>{article.readTime}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '12%',
      renderCell: article => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Pratinjau Artikel'
            onClick={() => handlePreviewArticle(article.id)}
            className='p-1.5 rounded-lg text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer'
          >
            <Eye size={16} />
          </button>
          <button
            type='button'
            title='Edit Artikel'
            onClick={() => onOpenEdit(article)}
            className='p-1.5 rounded-lg text-[#574144] hover:bg-[#eff4ff] hover:text-[#121c2a] transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Artikel'
            onClick={() => handleDeleteRequest(article.id)}
            className='p-1.5 rounded-lg text-[#cb4364] hover:bg-[#ffd9de]/40 hover:text-[#8c0f39] transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (article: HealthArticle) => {
    const cat = article.category || 'Imunisasi TT';
    const style = ARTICLE_CATEGORY_COLORS[cat] || ARTICLE_CATEGORY_COLORS.default;

    return (
      <div
        key={article.id}
        className='p-4 rounded-2xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'
      >
        <div className='flex gap-3'>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className='w-16 h-16 rounded-xl object-cover shrink-0 border border-[#eff4ff]'
            />
          ) : (
            <div className='w-16 h-16 rounded-xl bg-[#ffd9de]/50 text-[#aa294d] border border-[#ffd9de] flex items-center justify-center shrink-0'>
              <ImageIcon size={26} />
            </div>
          )}

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1.5 mb-1 flex-wrap'>
              <span
                className='px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider border'
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  borderColor: style.border,
                }}
              >
                {cat}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  article.status === 'Terbit'
                    ? 'bg-[#aff1d0] text-[#0a5139] border-[#6ee7b7]'
                    : 'bg-[#ffd9de] text-[#8c0f39] border-[#fca5a5]'
                }`}
              >
                {article.status}
              </span>
            </div>
            <h4 className='font-bold text-[#121c2a] text-sm leading-snug line-clamp-2'>
              {article.title}
            </h4>
          </div>
        </div>

        <div className='flex items-center justify-between bg-[#f8f9ff] rounded-xl p-2.5 text-xs border border-[#ffd9de]/60'>
          <span className='font-bold text-[#121c2a] truncate max-w-[60%]'>✍️ {article.author}</span>
          <span className='flex items-center gap-1 text-[#8b7074] font-medium shrink-0'>
            <Clock size={12} className='text-[#aa294d]' /> {article.readTime}
          </span>
        </div>

        <div className='flex items-center justify-between pt-2.5 border-t border-[#eff4ff] gap-2'>
          <button
            type='button'
            onClick={() => handlePreviewArticle(article.id)}
            className='flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] shadow-2xs transition-all cursor-pointer min-h-[40px]'
          >
            <Eye size={15} />
            <span>Baca Pratinjau</span>
          </button>

          <div className='flex gap-1.5'>
            <button
              type='button'
              title='Edit Artikel'
              onClick={() => onOpenEdit(article)}
              className='w-10 h-10 rounded-xl bg-[#eff4ff] text-[#574144] hover:bg-[#dee9fc] hover:text-[#aa294d] flex items-center justify-center transition-colors cursor-pointer'
            >
              <Edit size={16} />
            </button>
            <button
              type='button'
              title='Hapus Artikel'
              onClick={() => handleDeleteRequest(article.id)}
              className='w-10 h-10 rounded-xl bg-[#ffd9de]/50 text-[#8c0f39] hover:bg-[#ffd9de] flex items-center justify-center transition-colors cursor-pointer'
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AdminHeader
        title='Manajemen Artikel Edukasi Pranikah'
        subtitle='Kelola materi edukasi imunisasi TT, kesehatan reproduksi catin, dan panduan pernikahan sehat KUA.'
      />

      {/* Filter Bar with MobileFilterChips */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8b7074]'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari judul, kata kunci, atau penulis artikel...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[210px]'>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm font-medium text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                {ARTICLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Semua' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={() => handleOpenAdd()}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#aa294d] text-white font-bold text-xs sm:text-sm hover:bg-[#cb4364] shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <Plus size={18} />
            <span>Tulis Artikel Baru</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-[#eff4ff] pt-2.5'>
          <p className='text-[11px] font-bold text-[#8b7074] mb-1.5'>Kategori Edukasi:</p>
          <MobileFilterChips
            selectedValue={categoryFilter}
            onSelect={setCategoryFilter}
            options={ARTICLE_CATEGORIES.map(cat => ({
              label: cat,
              value: cat,
            }))}
          />
        </div>
      </div>

      {/* Articles Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        emptyMessage='Tidak ada artikel edukasi yang sesuai dengan pencarian.'
        renderMobileCard={renderMobileCard}
      />

      {/* Add/Edit Modal */}
      <ArticleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSubmit={handleSaveArticle}
        updateFormData={updateFormData}
        showToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Hapus Artikel Edukasi'
        message='Apakah Anda yakin ingin menghapus artikel edukasi ini? Artikel yang dihapus tidak akan dapat diakses oleh calon pengantin.'
        confirmText='Hapus Artikel'
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
