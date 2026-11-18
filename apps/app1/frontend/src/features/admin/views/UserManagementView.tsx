import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, BellRing, Edit, Trash2, Phone } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import UserFormModal from '../components/UserFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { MobileFilterChips } from '@/src/shared/components/ui/MobileFilterChips';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  sendUserReminderAction,
} from '../api/userManagementRepository';
import { ManagedUser } from '../types/admin.types';
import {
  INITIAL_USER_FORM_DATA,
  UserFormData,
  RISK_LEVEL_OPTIONS,
  RISK_LEVEL_COLORS,
  RiskLevel,
  UserGender,
} from '../constants/user.constants';

export default function UserManagementView() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('Semua');
  const [submitting, setSubmitting] = useState(false);

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<UserFormData>(INITIAL_USER_FORM_DATA);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: userToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    userId?: string;
    userName: string;
    userPhone?: string;
  }>({
    userName: '',
  });

  const loadUsers = useCallback(async () => {
    const data = await getUsersAction();
    setUsers(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      const data = await getUsersAction();
      if (isMounted) setUsers(data);
    };
    fetchUsers();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchUsers();
      }
    }, 8000);

    const handleFocus = () => {
      fetchUsers();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRisk = riskFilter === 'Semua' || u.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const onOpenAdd = () => {
    handleOpenAdd();
  };

  const onOpenEdit = (user: ManagedUser) => {
    handleOpenEdit(user.id, {
      name: user.name,
      age: String(user.age),
      gender: user.gender as UserGender,
      phone: user.phone,
      email: user.email || '',
      riskLevel: (user.riskLevel as RiskLevel) || 'Rendah',
      schoolOrOrg: user.schoolOrOrg || 'SMA Negeri 1 Sehat',
      assignedDoctor: user.schoolOrOrg || 'SMA Negeri 1 Sehat',
      medicalNotes: user.medicalNotes || '',
    });
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.phone) {
      showToast('Nama dan nomor telepon wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateUserAction(editingId, {
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.schoolOrOrg || formData.assignedDoctor,
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadUsers();
          handleCloseModal();
          showToast('Data siswi berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui data', 'error');
        }
      } else {
        const res = await createUserAction({
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.schoolOrOrg || formData.assignedDoctor || 'SMA Negeri 1 Sehat',
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadUsers();
          handleCloseModal();
          showToast('Siswi baru berhasil ditambahkan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan siswi', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      const res = await deleteUserAction(userToDelete);
      if (res.success) {
        await loadUsers();
        showToast('Data siswi berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus data siswi', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (user: ManagedUser) => {
    setReminderData({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
    });
    setReminderModalOpen(true);
  };

  const handleSendReminderSuccess = async (_channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.userId) {
      await sendUserReminderAction(reminderData.userId, messageSent, _channel);
      publishRealtimeEvent('NUDGE_SENT', {
        userId: reminderData.userId,
        patientId: reminderData.userId,
      });
      await loadUsers();
    }
  };

  const columns: Column<ManagedUser>[] = [
    {
      id: 'user',
      label: 'Siswi (Pengguna)',
      width: '28%',
      renderCell: user => (
        <div className='flex items-center gap-3'>
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size='sm'
            ringClassName='ring-1 ring-pink-100 shadow-2xs'
          />
          <div className='min-w-0'>
            <div className='font-bold text-slate-800 text-sm truncate'>{user.name}</div>
            <div className='text-xs text-slate-400 truncate'>
              {user.id} • {user.age} th
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'school',
      label: 'Sekolah & Kontak',
      width: '24%',
      renderCell: user => (
        <div>
          <div className='font-semibold text-slate-800 text-xs sm:text-sm truncate'>
            {user.schoolOrOrg || 'SMA Negeri 1 Sehat'}
          </div>
          <div className='text-xs text-slate-500 flex items-center gap-1 mt-0.5'>
            <Phone size={11} className='text-rose-500 shrink-0' />
            <span>{user.phone}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'adherence',
      label: 'Kepatuhan TTD',
      width: '18%',
      renderCell: user => {
        const rate = user.adherenceRate ?? 100;
        const color =
          rate >= 90 ? 'text-emerald-600' : rate >= 80 ? 'text-amber-600' : 'text-rose-600';
        return (
          <div>
            <div className='flex items-center gap-1.5'>
              <span className={`font-bold text-sm ${color}`}>{rate}%</span>
              <span className='text-[11px] text-slate-400'>
                ({user.activeSchedulesCount || 0} Jadwal)
              </span>
            </div>
            <div className='w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden'>
              <div
                className={`h-full rounded-full ${
                  rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'riskLevel',
      label: 'Tingkat Risiko',
      width: '18%',
      renderCell: user => {
        const style = RISK_LEVEL_COLORS[user.riskLevel] || RISK_LEVEL_COLORS.default;
        return (
          <span
            className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold'
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {user.riskLevel}
          </span>
        );
      },
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '12%',
      renderCell: user => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Kirim Pengingat'
            onClick={() => handleOpenReminder(user)}
            className='p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit Siswi'
            onClick={() => onOpenEdit(user)}
            className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Siswi'
            onClick={() => handleDeleteRequest(user.id)}
            className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title='Manajemen Siswi (Pengguna)'
        subtitle='Pantau data kesehatan siswi, riwayat kepatuhan TTD, dan kirim pengingat langsung.'
      />

      {/* Mobile & Desktop Filter Bar */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-pink-100 bg-white shadow-sm flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari nama, ID siswi, atau no hp...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[180px]'>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Risiko</option>
                {RISK_LEVEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={onOpenAdd}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-sm transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <UserPlus size={18} />
            <span>Tambah Siswi</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-slate-100 pt-2.5'>
          <p className='text-[11px] font-bold text-slate-400 mb-1.5'>Filter Tingkat Risiko:</p>
          <MobileFilterChips
            selectedValue={riskFilter}
            onSelect={setRiskFilter}
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: 'Rendah', value: 'Rendah' },
              { label: 'Sedang', value: 'Sedang' },
              { label: 'Tinggi', value: 'Tinggi' },
            ]}
          />
        </div>
      </div>

      {/* Users Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage='Tidak ada siswi yang ditemukan.'
        renderMobileCard={user => {
          const style = RISK_LEVEL_COLORS[user.riskLevel] || RISK_LEVEL_COLORS.default;
          return (
            <div className='p-4 rounded-2xl border border-pink-100 bg-white shadow-xs flex flex-col gap-3.5'>
              {/* Header: Avatar + Name + Risk */}
              <div className='flex items-center justify-between gap-2.5'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size='lg'
                    ringClassName='ring-2 ring-pink-100 shadow-xs'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-bold text-slate-900 text-sm sm:text-base leading-tight truncate'>
                      {user.name}
                    </h4>
                    <p className='text-xs text-slate-500 mt-0.5 truncate'>
                      {user.id} • {user.age} th ({user.schoolOrOrg || 'UKS Sekolah'})
                    </p>
                  </div>
                </div>

                <span
                  className='px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0'
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {user.riskLevel}
                </span>
              </div>

              {/* Info Row: Phone + Schedules + Adherence */}
              <div className='grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#fff5f7] border border-pink-100 text-xs'>
                <div>
                  <span className='text-slate-500 block text-[11px] font-medium'>
                    Kontak Telepon
                  </span>
                  <span className='font-bold text-slate-800 truncate block mt-0.5'>
                    {user.phone}
                  </span>
                </div>

                <div>
                  <span className='text-slate-500 block text-[11px] font-medium'>
                    Kepatuhan TTD
                  </span>
                  <span
                    className={`font-bold block mt-0.5 ${
                      user.adherenceRate >= 90
                        ? 'text-emerald-600'
                        : user.adherenceRate >= 80
                          ? 'text-amber-600'
                          : 'text-rose-600'
                    }`}
                  >
                    {user.adherenceRate}% ({user.activeSchedulesCount || 0} Jadwal)
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(user)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs transition-all cursor-pointer min-h-[44px]'
                >
                  <BellRing size={16} />
                  <span>Kirim Pengingat</span>
                </button>

                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Edit Data Siswi'
                    onClick={() => onOpenEdit(user)}
                    className='w-11 h-11 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type='button'
                    title='Hapus Siswi'
                    onClick={() => handleDeleteRequest(user.id)}
                    className='w-11 h-11 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Add/Edit User Modal Component */}
      <UserFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        onUpdateFormData={updateFormData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus data siswi ini? Data tidak dapat dikembalikan.'
        confirmText='Hapus Siswi'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        userName={reminderData.userName}
        userPhone={reminderData.userPhone}
        userId={reminderData.userId}
        onSendSuccess={handleSendReminderSuccess}
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
