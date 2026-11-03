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
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  sendUserReminderAction,
} from '../api/adminRepository';
import { ManagedUser } from '../types/admin.types';
import {
  INITIAL_USER_FORM_DATA,
  UserFormData,
  RiskLevel,
  UserGender,
  DEFAULT_SCHOOL_ORG,
} from '../constants/user.constants';

export default function UserManagementView() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
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
      try {
        const data = await getUsersAction();
        if (isMounted) setUsers(data);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUsers();

    // Sinkronisasi realtime saat ada event minum obat, pembaruan jadwal, atau nudge
    const unsubscribe = subscribeRealtimeEvent(
      event => {
        if (
          event.type === 'MEDICATION_TAKEN' ||
          event.type === 'SCHEDULE_UPDATED' ||
          event.type === 'NUDGE_SENT' ||
          event.type === 'NUDGE_DISMISSED'
        ) {
          fetchUsers();
        }
      },
      { ignoreSelf: true },
    );

    const handleFocus = () => {
      fetchUsers();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Sudah Minum' && u.todayStatus === 'COMPLETED') ||
      (statusFilter === 'Belum Minum' && u.todayStatus !== 'COMPLETED');
    return matchesSearch && matchesStatus;
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
      schoolOrOrg: user.schoolOrOrg || DEFAULT_SCHOOL_ORG,
      assignedDoctor: user.schoolOrOrg || DEFAULT_SCHOOL_ORG,
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
          showToast('Data user berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui data', 'error');
        }
      } else {
        const res = await createUserAction({
          name: formData.name,
          age: parseInt(formData.age, 10) || 24,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.schoolOrOrg || formData.assignedDoctor || 'Puskesmas / Faskes Terdaftar',
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadUsers();
          handleCloseModal();
          showToast('User baru berhasil ditambahkan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan user', 'error');
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
        showToast('Data user berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus data user', 'error');
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
      label: 'User',
      width: '28%',
      renderCell: user => (
        <div className='flex items-center gap-3'>
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size='sm'
            ringClassName='ring-1 ring-teal-100 shadow-2xs'
          />
          <div className='min-w-0'>
            <div className='font-bold text-[#24354D] text-sm truncate'>{user.name}</div>
            <div className='text-xs text-[#4A5E78] truncate'>
              {user.id} • {user.age} th
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'school',
      label: 'Domisili & Kontak',
      width: '24%',
      renderCell: user => (
        <div>
          <div className='font-semibold text-[#24354D] text-xs sm:text-sm truncate'>
            {user.schoolOrOrg || 'Puskesmas / Faskes Terdaftar'}
          </div>
          <div className='text-xs text-[#4A5E78] flex items-center gap-1 mt-0.5'>
            <Phone size={11} className='text-teal-600 shrink-0' />
            <span>{user.phone}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'scheduleTime',
      label: 'Waktu Minum Pil',
      width: '20%',
      renderCell: user => (
        <div>
          <div className='font-semibold text-[#24354D] text-xs sm:text-sm'>
            {user.frequency || 'Setiap Hari'}
          </div>
          <div className='flex gap-1 flex-wrap mt-0.5'>
            <span className='px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[11px] font-bold text-teal-700'>
              {user.timeSlot || '20:00'} WIB
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'todayStatus',
      label: 'Status Minum Hari Ini',
      width: '18%',
      renderCell: user => {
        if (user.todayStatus === 'COMPLETED') {
          return (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold'>
              <span className='w-1.5 h-1.5 rounded-full bg-teal-600'></span>
              Sudah Minum
            </span>
          );
        }
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold'>
            <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
            Belum Minum
          </span>
        );
      },
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: user => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Kirim Pengingat'
            onClick={() => handleOpenReminder(user)}
            className='p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit User'
            onClick={() => onOpenEdit(user)}
            className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus User'
            onClick={() => handleDeleteRequest(user.id)}
            className='p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='animate-fade-in'>
      <AdminHeader
        title='Manajemen User'
        subtitle='Pantau data user, jadwal minum pil harian, status konsumsi hari ini, dan kirim pengingat langsung.'
      />

      {/* Mobile & Desktop Filter Bar */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari nama, ID user, atau no hp...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[180px]'>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Status</option>
                <option value='Sudah Minum'>Sudah Minum</option>
                <option value='Belum Minum'>Belum Minum</option>
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={onOpenAdd}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs sm:text-sm hover:bg-teal-700 shadow-xs transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <UserPlus size={18} />
            <span>Tambah User</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-slate-100 pt-2.5'>
          <p className='text-[11px] font-bold text-slate-400 mb-1.5'>Filter Status Hari Ini:</p>
          <MobileFilterChips
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: 'Sudah Minum', value: 'Sudah Minum' },
              { label: 'Belum Minum', value: 'Belum Minum' },
            ]}
          />
        </div>
      </div>

      {/* Users Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={isLoading}
        loadingMessage='Memuat data akseptor & jadwal pil...'
        emptyMessage='Tidak ada user yang ditemukan.'
        renderMobileCard={user => {
          return (
            <div className='p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3.5'>
              {/* Header: Avatar + Name + Status */}
              <div className='flex items-center justify-between gap-2.5'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size='lg'
                    ringClassName='ring-2 ring-teal-100 shadow-xs'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-bold text-slate-900 text-sm sm:text-base leading-tight truncate'>
                      {user.name}
                    </h4>
                    <p className='text-xs text-slate-500 mt-0.5 truncate'>
                      {user.id} • {user.age} th ({user.schoolOrOrg || 'Puskesmas / Faskes Terdaftar'})
                    </p>
                  </div>
                </div>

                {user.todayStatus === 'COMPLETED' ? (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold shrink-0'>
                    <span className='w-1.5 h-1.5 rounded-full bg-teal-600'></span>
                    Sudah Minum
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0'>
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                    Belum Minum
                  </span>
                )}
              </div>

              {/* Info Row: Phone + Waktu Minum Pil */}
              <div className='grid grid-cols-2 gap-2 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs'>
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
                    Waktu Minum Pil
                  </span>
                  <span className='font-bold text-teal-800 block mt-0.5'>
                    {user.timeSlot || '20:00'} WIB ({user.frequency || 'Setiap Hari'})
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(user)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-xs transition-all cursor-pointer min-h-[44px]'
                >
                  <BellRing size={16} />
                  <span>Kirim Pengingat</span>
                </button>

                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Edit User'
                    onClick={() => onOpenEdit(user)}
                    className='w-11 h-11 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type='button'
                    title='Hapus User'
                    onClick={() => handleDeleteRequest(user.id)}
                    className='w-11 h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer'
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
        message='Apakah Anda yakin ingin menghapus data pengguna ini? Data tidak dapat dikembalikan.'
        confirmText='Hapus Pengguna'
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
