import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Clock, Image as ImageIcon } from 'lucide-react';
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

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: '',
  author: 'Tim Ahli Gizi & UKS',
  summary: '',
  content: '',
  readTime: '3 min read',
  status: 'Terbit',
  imageUrl: '',
};

const getAutomaticReadTime = (content: string, summary: string) => {
  const characterCount = (content.trim() || summary.trim()).length;
  return `${Math.max(1, Math.ceil(characterCount / 1000))} min read`;
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
    void loadData();
  }, [loadData]);

  const filteredArticles = articles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const categories = Array.from(
    new Set(articles.map(article => article.category.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'id'));
  const categoryOptions = ['Semua', ...categories];

  const onOpenEdit = (article: HealthArticle) => {
    handleOpenEdit(article.id, {
      title: article.title,
    category: (article.category as ArticleCategory) || '',
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
    if (!formData.category.trim()) {
      showToast('Kategori artikel wajib diisi', 'error');
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
          readTime: getAutomaticReadTime(formData.content, formData.summary),
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui artikel', 'error');
        }
      } else {
        const res = await createAdminArticleAction({
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary || 'Ringkasan materi edukasi kesehatan remaja putri.',
          content: formData.content,
          readTime: getAutomaticReadTime(formData.content, formData.summary),
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel baru berhasil disimpan ke database!', 'success');
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
      renderCell: (_, index) => <span className='text-slate-400 text-sm'>{index + 1}</span>,
    },
    {
      id: 'judul',
      label: 'Judul Artikel',
      width: '35%',
      renderCell: article => (
        <div>
          <div className='font-bold text-slate-900 text-sm leading-snug'>{article.title}</div>
          <div className='flex items-center gap-2 mt-1 text-xs text-slate-400'>
            <span>ID: {article.id}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'kategori',
      label: 'Kategori',
      width: '18%',
      renderCell: article => (
        <span className='inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-pink-200 text-xs font-bold'>
          {article.category}
        </span>
      ),
    },
    {
      id: 'penulis',
      label: 'Penulis',
      width: '18%',
      renderCell: article => (
        <span className='font-semibold text-slate-800 text-sm'>{article.author}</span>
      ),
    },
    {
      id: 'publikasi_waktu',
      label: 'Publikasi & Waktu',
      width: '14%',
      renderCell: article => (
        <div>
          <div className='text-slate-800 text-xs sm:text-sm font-medium'>{article.publishDate}</div>
          <div className='flex items-center gap-1 text-xs text-slate-400 mt-0.5'>
            <Clock size={12} />
            <span>{article.readTime}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: article => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Lihat Detail Artikel'
            onClick={() => handlePreviewArticle(article.id)}
            className='p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer'
          >
            <Eye size={16} />
          </button>
          <button
            type='button'
            title='Edit Artikel'
            onClick={() => onOpenEdit(article)}
            className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Artikel'
            onClick={() => handleDeleteRequest(article.id)}
            className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (article: HealthArticle) => (
    <div
      key={article.id}
      className='p-4 rounded-2xl border border-pink-100 bg-white shadow-xs flex flex-col gap-3.5'
    >
      <div className='flex gap-3'>
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-16 h-16 rounded-xl object-cover shrink-0'
          />
        ) : (
          <div className='w-16 h-16 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0'>
            <ImageIcon size={28} />
          </div>
        )}

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1.5 mb-1 flex-wrap'>
            <span className='px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-pink-100 font-extrabold text-[10px] uppercase tracking-wider'>
              {article.category}
            </span>
          </div>
          <h4 className='font-bold text-slate-900 text-sm leading-snug line-clamp-2'>
            {article.title}
          </h4>
        </div>
      </div>

      <div className='flex items-center justify-between bg-slate-50 rounded-xl p-2.5 text-xs'>
        <span className='font-bold text-slate-700 truncate max-w-[60%]'>✍️ {article.author}</span>
        <span className='flex items-center gap-1 text-slate-400 font-medium shrink-0'>
          <Clock size={12} /> {article.readTime}
        </span>
      </div>

      <div className='flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2'>
        <button
          type='button'
          onClick={() => handlePreviewArticle(article.id)}
          className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer min-h-[44px]'
        >
          <Eye size={16} />
          <span>Lihat Artikel</span>
        </button>

        <div className='flex gap-1.5'>
          <button
            type='button'
            title='Edit Artikel'
            onClick={() => onOpenEdit(article)}
            className='w-11 h-11 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Artikel'
            onClick={() => handleDeleteRequest(article.id)}
            className='w-11 h-11 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <AdminHeader
        title='Manajemen Artikel Edukasi'
        subtitle='Publikasikan konten medis interaktif untuk meningkatkan kepatuhan dan pemahaman siswi.'
      />

      {/* Filter Bar with MobileFilterChips */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari judul artikel atau nama penulis...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[180px]'>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                {categoryOptions.map(cat => (
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
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-md shadow-rose-200 transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <Plus size={18} />
            <span>Tulis Artikel Baru</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-slate-100 pt-2.5'>
          <p className='text-[11px] font-bold text-slate-400 mb-1.5'>Filter Kategori:</p>
          <MobileFilterChips
            selectedValue={categoryFilter}
            onSelect={setCategoryFilter}
            options={categoryOptions.map(cat => ({
              label: cat === 'Semua' ? 'Semua Kategori' : cat,
              value: cat,
            }))}
          />
        </div>
      </div>

      {/* Articles Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        renderMobileCard={renderMobileCard}
        emptyMessage='Tidak ada artikel yang ditemukan.'
      />

      {/* Add/Edit Article Modal Component */}
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
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus artikel ini? Data tidak dapat dikembalikan.'
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
