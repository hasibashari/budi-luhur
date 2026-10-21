import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  Ribbon,
  Mail,
  Phone,
  Building2,
  Check,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
  ProfileNotificationCard,
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getUserDashboardDataAction,
  updateUserProfileAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '../api/userRepository';

interface UserProfileState {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  streakCount: number;
  schoolOrOrg?: string | null;
  riskLevel?: string | null;
}

export default function ProfileView() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, deleteAccount } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Akseptor Pilluna',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: authUser?.streakCount || 0,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editFaskes, setEditFaskes] = useState(userProfile.schoolOrOrg || '');
  const [editPhone, setEditPhone] = useState(userProfile.phone);

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenDeleteModal = () => {
    setDeleteConfirmationText('');
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'HAPUS') {
      setDeleteError('Harap ketik kata HAPUS untuk mengonfirmasi.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteAccount();
      if (!res.success) {
        setDeleteError(res.error || 'Gagal memproses penghapusan akun.');
        setIsDeleting(false);
      }
    } catch {
      setDeleteError('Terjadi kesalahan koneksi server.');
      setIsDeleting(false);
    }
  };

  const [scheduleData, setScheduleData] = useState<UserScheduleData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const dashboard = await getUserDashboardDataAction(authUser?.id);
        if (isMounted && dashboard.user) {
          setUserProfile({
            id: dashboard.user.id,
            name: dashboard.user.name,
            email: dashboard.user.email,
            phone: dashboard.user.phone || '',
            avatarUrl: dashboard.user.avatarUrl || '',
            streakCount: dashboard.user.streakCount || 0,
            schoolOrOrg: dashboard.user.schoolOrOrg,
            riskLevel: dashboard.user.riskLevel,
          });
          setEditName(dashboard.user.name);
          setEditFaskes(dashboard.user.schoolOrOrg || '');
          setEditPhone(dashboard.user.phone || '');
          if (dashboard.activeSchedule) {
            setScheduleData(dashboard.activeSchedule);
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const handleToggleScheduleEnabled = async (enabled: boolean) => {
    if (!scheduleData) {
      showToast('Jadwal belum dikonfigurasi. Atur jadwal terlebih dahulu.');
      return;
    }
    setScheduleData(prev => (prev ? { ...prev, isEnabled: enabled } : null));
    const res = await updateUserScheduleSettingsAction(scheduleData.id, { isEnabled: enabled });
    if (res.success) {
      showToast(enabled ? 'Pengingat Pil KB diaktifkan! 🔔' : 'Pengingat Pil KB dinonaktifkan.');
    } else {
      showToast(res.error || 'Gagal memperbarui status pengingat.');
    }
  };

  const handleToggleRemind15 = async (remind15: boolean) => {
    if (!scheduleData) return;
    setScheduleData(prev => (prev ? { ...prev, remind15MinBefore: remind15 } : null));
    const res = await updateUserScheduleSettingsAction(scheduleData.id, {
      remind15MinBefore: remind15,
    });
    if (res.success) {
      showToast(
        remind15 ? 'Peringatan 15 menit sebelum aktif.' : 'Peringatan 15 menit dinonaktifkan.',
      );
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAvatar = async (newAvatarUrl: string | null) => {
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        avatarUrl: newAvatarUrl || '',
      });
      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          avatarUrl: newAvatarUrl || '',
        }));
        updateUser({ avatarUrl: newAvatarUrl || '' });
        showToast(
          newAvatarUrl
            ? 'Foto profil berhasil diperbarui!'
            : 'Foto profil dihapus, menggunakan inisial nama.',
        );
      } else {
        showToast(res.error || 'Gagal memperbarui foto profil.');
      }
    } catch (err) {
      console.error('Save avatar error:', err);
      showToast('Gagal menyimpan foto profil.');
    }
  };

  const handleOpenEdit = () => {
    setEditName(userProfile.name);
    setEditFaskes(userProfile.schoolOrOrg || '');
    setEditPhone(userProfile.phone);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        phone: editPhone,
        schoolOrOrg: editFaskes,
      });

      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editFaskes || null,
          phone: editPhone,
        }));
        updateUser({ name: editName, phone: editPhone, schoolOrOrg: editFaskes });
        setIsEditProfileModalOpen(false);
        showToast('Profil berhasil diperbarui!');
      } else {
        showToast(res.error || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      showToast('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const userMetrics = [
    {
      id: 'streak',
      label: 'Streak Rutin Pil KB',
      value: `${userProfile.streakCount} Hari`,
      subtitle: 'Konsumsi rutin jam yang sama',
      icon: Flame,
      iconBgColor: 'bg-orange-50 border border-orange-100',
      iconColor: 'text-orange-600',
      badgeText: userProfile.streakCount >= 7 ? 'Optimal' : 'Tahap Adaptasi',
      badgeColor: 'bg-teal-50 text-teal-800 border border-teal-200',
    },
    {
      id: 'protection',
      label: 'Efektivitas Kontrasepsi',
      value: userProfile.streakCount >= 7 ? '99% Optimal' : 'Membangun Proteksi',
      subtitle: 'Kadar hormon stabil dalam darah',
      icon: ShieldCheck,
      iconBgColor: 'bg-teal-50 border border-teal-100',
      iconColor: 'text-teal-700',
      badgeText: 'Terlindungi',
      badgeColor: 'bg-teal-50 text-teal-800 border border-teal-200',
    },
    {
      id: 'sadari',
      label: 'Pemeriksaan SADARI',
      value: 'Rutin Bulanan',
      subtitle: 'Skrining payudara mandiri hari 7-10',
      icon: Ribbon,
      iconBgColor: 'bg-slate-100 border border-slate-200',
      iconColor: 'text-slate-700',
      badgeText: 'Disiplin',
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-200',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Alamat Email',
      value: userProfile.email,
    },
    {
      icon: Phone,
      label: 'Nomor WhatsApp / HP',
      value: userProfile.phone || 'Belum ditambahkan',
    },
    {
      icon: Building2,
      label: 'Faskes / Bidan Pendamping',
      value: userProfile.schoolOrOrg || 'Puskesmas / Praktik Mandiri Bidan',
    },
  ];

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in pb-10'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-teal-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight'>
          Profil Akseptor
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Informasi akun pengguna, kepatuhan kontrasepsi, dan preferensi layanan Pilluna
        </p>
      </div>

      {/* Header Profile Card */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='Akseptor Pil KB'
        roleBadgeColor='user'
        subtitle='Akseptor Program Kontrasepsi Mandiri & Deteksi Dini SADARI'
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 3-Column Metrics Grid */}
      <ProfileMetricsGrid
        title='Status Kepatuhan Kontrasepsi'
        subtitle='Berdasarkan konsumsi teratur dan pemeriksaan berkala'
        metrics={userMetrics}
        columns={3}
      />

      {/* Contact & Affiliation Card */}
      <ProfileContactCard
        title='Data Kontak & Fasilitas Kesehatan'
        subtitle='Informasi akun dan klinik pendamping yang terdaftar'
        items={contactItems}
      />

      {/* 4. Notification & Reminder Settings Card */}
      <ProfileNotificationCard
        theme='teal'
        title='Pengingat Harian Pil KB'
        subtitle={
          scheduleData?.isEnabled
            ? `Pengingat aktif (Setiap Hari, ${scheduleData?.time || '21:00'} WIB)`
            : 'Pengingat otomatis dinonaktifkan'
        }
        isEnabled={scheduleData?.isEnabled ?? true}
        onToggleEnabled={handleToggleScheduleEnabled}
        onPermissionError={showToast}
      />

      {/* Security & Account Management */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onDeleteAccountClick={handleOpenDeleteModal}
        lastLoginText='Hari ini via Web App Pilluna'
      />

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        title='Ubah Informasi Profil'
        subtitle='Perbarui data identitas akseptor dan fasilitas kesehatan'
        isSaving={isSaving}
      >
        <div>
          <label className='text-xs font-bold text-slate-700 block mb-1'>Nama Lengkap</label>
          <input
            type='text'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className='w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
            required
          />
        </div>

        <div>
          <label className='text-xs font-bold text-slate-700 block mb-1'>Nomor WhatsApp / HP</label>
          <input
            type='tel'
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
            placeholder='Contoh: 08123456789'
            className='w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
          />
        </div>

        <div>
          <label className='text-xs font-bold text-slate-700 block mb-1'>
            Fasilitas Kesehatan / Bidan Pendamping
          </label>
          <input
            type='text'
            value={editFaskes}
            onChange={e => setEditFaskes(e.target.value)}
            placeholder='Contoh: Puskesmas Budi Luhur / PMB Bidan Siti'
            className='w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
          />
        </div>
      </ProfileEditModal>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative z-10 bg-white rounded-3xl shadow-2xl border border-red-200 max-w-md w-full p-6 text-center animate-scale-up'>
            <div className='w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200'>
              <AlertTriangle size={28} />
            </div>

            <h3 className='text-lg font-bold text-slate-900 mb-2'>Konfirmasi Hapus Akun</h3>
            <p className='text-xs text-slate-600 leading-relaxed mb-4'>
              Tindakan ini akan menghapus akun akseptor Anda beserta seluruh riwayat kepatuhan 28
              butir dan jadwal pengingat secara permanen.
            </p>

            <div className='mb-4 text-left'>
              <label className='text-[11px] font-bold text-slate-700 block mb-1'>
                Ketik kata <strong className='text-red-600'>HAPUS</strong> untuk melanjutkan:
              </label>
              <input
                type='text'
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder='HAPUS'
                className='w-full bg-slate-50 border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none text-center tracking-wider'
              />
              {deleteError && (
                <p className='text-[11px] font-semibold text-red-600 mt-1.5'>{deleteError}</p>
              )}
            </div>

            <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
              <button
                type='button'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className='flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'HAPUS'}
                className='flex-1 px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5'
              >
                {isDeleting ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
