import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  BellRing,
  Edit,
  Trash2,
  Phone,
  Calendar,
  Heart,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
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
  RISK_LEVEL_COLORS,
  UserGender,
  RiskLevel,
  TT_STATUS_COLORS,
  KUA_STATUS_COLORS,
  KUA_STATUS_OPTIONS,
  TT_STATUS_OPTIONS,
  TTStatus,
  KUAStatus,
} from '../constants/user.constants';

export default function UserManagementView() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [kuaFilter, setKuaFilter] = useState<string>('Semua');
  const [ttFilter, setTtFilter] = useState<string>('Semua');
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
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.partnerName && u.partnerName.toLowerCase().includes(q)) ||
      (u.schoolOrOrg && u.schoolOrOrg.toLowerCase().includes(q));

    const currentKua = u.kuaStatus || 'Menunggu Skrining';
    const matchesKua = kuaFilter === 'Semua' || currentKua === kuaFilter;

    const currentTt = u.ttStatus || 'TT1';
    const matchesTt = ttFilter === 'Semua' || currentTt === ttFilter;

    return matchesSearch && matchesKua && matchesTt;
  });

  const onOpenAdd = () => {
    handleOpenAdd();
  };

  const onOpenEdit = (user: ManagedUser) => {
    handleOpenEdit(user.id, {
      name: user.name,
      age: user.age ? String(user.age) : '',
      gender: (user.gender as UserGender) || 'Perempuan',
      phone: user.phone || '',
      email: user.email || '',
      riskLevel: (user.riskLevel as RiskLevel) || 'Rendah',
      schoolOrOrg: user.schoolOrOrg || '',
      assignedDoctor: user.schoolOrOrg || '',
      medicalNotes: user.medicalNotes || '',
      weddingDate: user.weddingDate || '',
      ttStatus: (user.ttStatus as TTStatus) || 'TT1',
      kuaStatus: (user.kuaStatus as KUAStatus) || 'Menunggu Skrining',
      partnerName: user.partnerName || '',
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
          age: parseInt(formData.age, 10) || 24,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.schoolOrOrg || formData.assignedDoctor,
          medicalNotes: formData.medicalNotes,
          weddingDate: formData.weddingDate,
          ttStatus: formData.ttStatus,
          kuaStatus: formData.kuaStatus,
        });

        if (res.success) {
          await loadUsers();
          handleCloseModal();
          showToast('Data calon pengantin berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui data', 'error');
        }
      } else {
        const res = await createUserAction({
          name: formData.name,
          age: parseInt(formData.age, 10) || 24,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@catin.id`,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.schoolOrOrg || formData.assignedDoctor || '',
          medicalNotes: formData.medicalNotes,
          weddingDate: formData.weddingDate,
          ttStatus: formData.ttStatus,
          kuaStatus: formData.kuaStatus,
        });

        if (res.success) {
          await loadUsers();
          handleCloseModal();
          showToast('Calon pengantin baru berhasil ditambahkan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan calon pengantin', 'error');
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
        showToast('Data calon pengantin berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus data calon pengantin', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (user: ManagedUser) => {
    setReminderData({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone || undefined,
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
      label: 'Calon Pengantin & Pasangan',
      width: '28%',
      renderCell: user => (
        <div className='flex items-center gap-3'>
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size='md'
            ringClassName='ring-1 ring-[#ffd9de] shadow-2xs'
          />
          <div className='min-w-0'>
            <div className='font-bold text-[#121c2a] text-sm truncate'>{user.name}</div>
            <div className='text-xs text-[#574144] truncate'>
              {user.age ? `${user.age} th` : 'Umur belum diisi'} • {user.gender || '—'}
            </div>
            {user.partnerName && (
              <div className='text-[11px] text-[#aa294d] font-semibold flex items-center gap-1 mt-0.5 truncate'>
                <Heart size={10} className='fill-[#ffd9de] shrink-0' />
                <span className='truncate'>Pasangan: {user.partnerName}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'wedding',
      label: 'Rencana Akad & Kontak',
      width: '24%',
      renderCell: user => {
        const weddingDateStr = user.weddingDate
          ? new Date(user.weddingDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Belum diisi';

        return (
          <div>
            <div className='font-bold text-[#121c2a] text-xs sm:text-sm flex items-center gap-1.5'>
              <Calendar size={13} className='text-[#aa294d] shrink-0' />
              <span>{weddingDateStr}</span>
            </div>
            <div className='text-xs text-[#574144] truncate mt-0.5'>
              {user.schoolOrOrg || 'Faskes belum diisi'}
            </div>
            <div className='text-[11px] text-[#8b7074] flex items-center gap-1 mt-0.5'>
              <Phone size={10} className='text-[#aa294d] shrink-0' />
              <span>{user.phone || 'Belum diisi'}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'ttStatus',
      label: 'Status Dosis TT',
      width: '20%',
      renderCell: user => {
        const tt = user.ttStatus || 'TT0';
        const ttStyle = TT_STATUS_COLORS[tt] || TT_STATUS_COLORS.TT1;
        const rate = user.adherenceRate;

        const ttLabels: Record<string, string> = {
          TT0: 'Belum Vaksin',
          TT1: 'Dosis 1',
          TT2: 'Dosis 2 • Siap Nikah',
          TT3: 'Dosis 3 • Proteksi 5 Th',
          TT4: 'Dosis 4 • Proteksi 10 Th',
          TT5: 'Dosis 5 • Proteksi 25 Th',
        };

        return (
          <div>
            <div className='flex items-center gap-1.5'>
              <span
                className='inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold border'
                style={{
                  backgroundColor: ttStyle.bg,
                  color: ttStyle.text,
                  borderColor: ttStyle.border,
                }}
              >
                {tt}
              </span>
              <span className='text-xs font-semibold text-[#121c2a] truncate'>
                {ttLabels[tt] || tt}
              </span>
            </div>
            <div className='flex items-center gap-2 mt-1.5'>
              <div className='w-20 bg-[#dee9fc] rounded-full h-1.5 overflow-hidden'>
                <div
                  className={`h-full rounded-full ${
                    (rate ?? 0) >= 90
                      ? 'bg-[#2a6950]'
                      : (rate ?? 0) >= 80
                        ? 'bg-amber-500'
                        : 'bg-[#aa294d]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, rate ?? 0))}%` }}
                />
              </div>
              <span className='text-[10px] font-bold text-[#574144]'>
                {rate === null ? 'Belum ada data' : `${rate}%`}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'kuaStatus',
      label: 'Sertifikat KUA',
      width: '16%',
      renderCell: user => {
        const kua = user.kuaStatus || 'Menunggu Skrining';
        const kuaStyle = KUA_STATUS_COLORS[kua] || KUA_STATUS_COLORS['Menunggu Skrining'];

        const Icon =
          kua === 'Terverifikasi'
            ? CheckCircle2
            : kua === 'Menunggu Skrining'
              ? Clock
              : AlertCircle;

        return (
          <span
            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border shadow-2xs'
            style={{
              backgroundColor: kuaStyle.bg,
              color: kuaStyle.text,
              borderColor: kuaStyle.border,
            }}
          >
            <Icon size={12} className='shrink-0' />
            <span>{kua}</span>
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
            title='Kirim Pengingat TT'
            onClick={() => handleOpenReminder(user)}
            className='p-1.5 rounded-lg text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit Data Catin'
            onClick={() => onOpenEdit(user)}
            className='p-1.5 rounded-lg text-[#574144] hover:bg-[#eff4ff] hover:text-[#121c2a] transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Catin'
            onClick={() => handleDeleteRequest(user.id)}
            className='p-1.5 rounded-lg text-[#cb4364] hover:bg-[#ffd9de]/40 hover:text-[#8c0f39] transition-colors cursor-pointer'
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
        title='Manajemen Calon Pengantin (Catin)'
        subtitle='Pantau dosis imunisasi TT1–TT5, kesiapan sertifikat pranikah KUA, dan koordinasi skrining faskes.'
      />

      {/* Filter Bar */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8b7074]'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari catin, pasangan, no WA, atau faskes/KUA...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[190px]'>
              <select
                value={kuaFilter}
                onChange={e => setKuaFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm font-medium text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Status KUA</option>
                {KUA_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='hidden sm:block sm:min-w-[170px]'>
              <select
                value={ttFilter}
                onChange={e => setTtFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm font-medium text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Dosis TT</option>
                {TT_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={onOpenAdd}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#aa294d] text-white font-bold text-xs sm:text-sm hover:bg-[#cb4364] shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <UserPlus size={18} />
            <span>Tambah Catin</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-[#eff4ff] pt-2.5'>
          <p className='text-[11px] font-bold text-[#8b7074] mb-1.5'>Filter Sertifikat KUA:</p>
          <MobileFilterChips
            selectedValue={kuaFilter}
            onSelect={setKuaFilter}
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: 'Terverifikasi', value: 'Terverifikasi' },
              { label: 'Menunggu', value: 'Menunggu Skrining' },
              { label: 'Belum Lengkap', value: 'Belum Lengkap' },
            ]}
          />
        </div>
      </div>

      {/* Users Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage='Tidak ada calon pengantin yang sesuai dengan filter pencarian.'
        renderMobileCard={user => {
          const tt = user.ttStatus || 'TT0';
          const ttStyle = TT_STATUS_COLORS[tt] || TT_STATUS_COLORS.TT1;
          const kua = user.kuaStatus || 'Menunggu Skrining';
          const kuaStyle = KUA_STATUS_COLORS[kua] || KUA_STATUS_COLORS['Menunggu Skrining'];

          const weddingDateStr = user.weddingDate
            ? new Date(user.weddingDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Belum diisi';

          const Icon =
            kua === 'Terverifikasi'
              ? CheckCircle2
              : kua === 'Menunggu Skrining'
                ? Clock
                : AlertCircle;

          return (
            <div className='p-4 rounded-2xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'>
              {/* Header: Avatar + Name + Partner + KUA Badge */}
              <div className='flex items-start justify-between gap-2.5'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size='lg'
                    ringClassName='ring-2 ring-[#ffd9de] shadow-2xs'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-bold text-[#121c2a] text-sm sm:text-base leading-tight truncate'>
                      {user.name}
                    </h4>
                    <p className='text-xs text-[#574144] mt-0.5 truncate'>
                      {user.age ? `${user.age} th` : 'Umur belum diisi'} • {user.gender || '—'}
                    </p>
                    {user.partnerName && (
                      <p className='text-[11px] text-[#aa294d] font-semibold flex items-center gap-1 mt-0.5 truncate'>
                        <Heart size={10} className='fill-[#ffd9de] shrink-0' />
                        <span className='truncate'>Pasangan: {user.partnerName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 border'
                  style={{
                    backgroundColor: kuaStyle.bg,
                    color: kuaStyle.text,
                    borderColor: kuaStyle.border,
                  }}
                >
                  <Icon size={11} />
                  <span>{kua}</span>
                </span>
              </div>

              {/* Info Grid */}
              <div className='grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8f9ff] border border-[#ffd9de]/60 text-xs'>
                <div>
                  <span className='text-[#8b7074] block text-[11px] font-medium'>
                    Rencana Akad Nikah
                  </span>
                  <span className='font-bold text-[#121c2a] flex items-center gap-1 mt-0.5'>
                    <Calendar size={11} className='text-[#aa294d]' />
                    <span>{weddingDateStr}</span>
                  </span>
                </div>

                <div>
                  <span className='text-[#8b7074] block text-[11px] font-medium'>
                    Dosis Imunisasi TT
                  </span>
                  <span
                    className='inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold border mt-0.5'
                    style={{
                      backgroundColor: ttStyle.bg,
                      color: ttStyle.text,
                      borderColor: ttStyle.border,
                    }}
                  >
                    {tt}
                  </span>
                </div>

                <div className='col-span-2 pt-1 border-t border-[#eff4ff]'>
                  <span className='text-[#8b7074] block text-[11px] font-medium'>
                    Faskes / KUA Rujukan
                  </span>
                  <span className='font-bold text-[#121c2a] truncate block mt-0.5'>
                    {user.schoolOrOrg || 'Faskes belum diisi'}
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1 border-t border-[#eff4ff]'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(user)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] shadow-xs transition-all cursor-pointer min-h-[44px]'
                >
                  <BellRing size={16} />
                  <span>Kirim Pengingat</span>
                </button>

                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Edit Data Catin'
                    onClick={() => onOpenEdit(user)}
                    className='w-11 h-11 rounded-xl bg-[#eff4ff] text-[#574144] hover:bg-[#dee9fc] hover:text-[#aa294d] flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type='button'
                    title='Hapus Catin'
                    onClick={() => handleDeleteRequest(user.id)}
                    className='w-11 h-11 rounded-xl bg-[#ffd9de]/50 text-[#8c0f39] hover:bg-[#ffd9de] flex items-center justify-center transition-colors cursor-pointer'
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
        title='Konfirmasi Hapus Catin'
        message='Apakah Anda yakin ingin menghapus data calon pengantin ini? Riwayat imunisasi dan kesiapan sertifikat KUA akan ikut terhapus.'
        confirmText='Hapus Data Catin'
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
