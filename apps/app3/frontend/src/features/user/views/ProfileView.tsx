import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Heart,
  Award,
  Building2,
  Mail,
  Phone,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
  ProfileNotificationCard,
} from '@/src/shared/components/profile';
import { FaskesRujukanCard } from '@/src/shared/components/domain/FaskesRujukanCard';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import {
  getUserDashboardDataAction,
  getUserScheduleAction,
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
  hbLevel?: number | null;
  schoolOrOrg?: string | null;
  riskLevel?: string | null;
}

export default function ProfileView() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, deleteAccount } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Shofa Zulfia Zahra',
    email: authUser?.email || '',
    phone: authUser?.phone || '081234567890',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: authUser?.streakCount || 0,
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
  });

  const [scheduleData, setScheduleData] = useState<UserScheduleData | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState(userProfile.name);
  const [editFaskes, setEditFaskes] = useState(userProfile.schoolOrOrg || 'Puskesmas Kebayoran');
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [isSaving, setIsSaving] = useState(false);

  // Partner info
  const partnerName = 'Farhan Ramadhan';
  const catinId = 'CT-884920';
  const currentTTLevel = 3;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (authUser?.id) {
        try {
          const data = await getUserDashboardDataAction(authUser.id);
          if (isMounted && data) {
            setUserProfile(prev => ({
              ...prev,
              name: data.user.name || prev.name,
              schoolOrOrg: data.user.schoolOrOrg || prev.schoolOrOrg,
              hbLevel: data.user.hbLevel || prev.hbLevel,
              avatarUrl: data.user.avatarUrl || prev.avatarUrl,
            }));
            setEditName(data.user.name || userProfile.name);
            setEditFaskes(data.user.schoolOrOrg || userProfile.schoolOrOrg || '');
          }
        } catch (e) {
          console.error('Failed to load profile dashboard:', e);
        }

        try {
          const schedule = await getUserScheduleAction(authUser.id);
          if (isMounted && schedule) {
            setScheduleData(schedule);
          }
        } catch (error) {
          console.error('Failed to load schedule:', error);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

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
            ? 'Foto profil calon pengantin berhasil diperbarui! 💍'
            : 'Foto profil dihapus, menggunakan inisial nama.',
        );
        return true;
      } else {
        showToast(res.error || 'Gagal memperbarui foto profil.');
        return false;
      }
    } catch (err) {
      console.error('Save avatar error:', err);
      showToast('Gagal menyimpan foto profil.');
      return false;
    }
  };

  const handleToggleScheduleEnabled = async (enabled: boolean) => {
    if (!scheduleData) {
      showToast('Jadwal pengingat imunisasi belum dikonfigurasi.');
      return;
    }
    setScheduleData(prev => (prev ? { ...prev, isEnabled: enabled } : null));
    const res = await updateUserScheduleSettingsAction(scheduleData.id, {
      isEnabled: enabled,
    });
    if (res.success) {
      showToast(
        enabled
          ? 'Pengingat imunisasi & jadwal faskes aktif.'
          : 'Pengingat otomatis dinonaktifkan.',
      );
    } else {
      setScheduleData(prev => (prev ? { ...prev, isEnabled: !enabled } : null));
      showToast(res.error || 'Gagal mengubah status pengingat.');
    }
  };

  const handleToggleRemind15 = async (remind15: boolean) => {
    if (!scheduleData) {
      showToast('Jadwal pengingat imunisasi belum dikonfigurasi.');
      return;
    }
    setScheduleData(prev => (prev ? { ...prev, remind15MinBefore: remind15 } : null));
    const res = await updateUserScheduleSettingsAction(scheduleData.id, {
      remind15MinBefore: remind15,
    });
    if (res.success) {
      showToast(
        remind15
          ? 'Peringatan awal 15 menit sebelum waktu jadwal aktif.'
          : 'Peringatan awal 15 menit dinonaktifkan.',
      );
    }
  };

  const handleOpenEdit = () => {
    setEditName(userProfile.name);
    setEditFaskes(userProfile.schoolOrOrg || 'Puskesmas Kebayoran');
    setEditPhone(userProfile.phone);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        schoolOrOrg: editFaskes,
        phone: editPhone,
      });

      if (res.success && res.data) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editFaskes,
          phone: editPhone,
        }));
        updateUser({
          name: editName,
          schoolOrOrg: editFaskes,
          phone: editPhone,
        });
        showToast('Profil calon pengantin berhasil disimpan! ✨');
        setIsEditProfileModalOpen(false);
      } else {
        showToast(res.error || 'Gagal menyimpan profil.');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handleOpenDeleteModal = () => {
    setDeleteConfirmationText('');
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText !== 'HAPUS') {
      setDeleteError('Ketik "HAPUS" untuk konfirmasi penghapusan akun.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res?.success) {
        navigate('/auth/register');
      } else {
        setDeleteError(res?.error || 'Gagal menghapus akun.');
      }
    } catch {
      setDeleteError('Terjadi kesalahan saat menghapus akun.');
    } finally {
      setIsDeleting(false);
    }
  };

  const userMetrics = [
    {
      id: 'tt_status',
      label: 'Status Imunisasi TT',
      value: `TT${currentTTLevel} (Aktif)`,
      subtitle: 'Masa perlindungan s/d 12 Jul 2028',
      icon: ShieldCheck,
      iconBgColor: 'bg-[#ffd9de] border border-[#ffc2cc]',
      iconColor: 'text-[#aa294d]',
      badgeText: '95% Efektif',
      badgeColor: 'bg-[#ffd9de] text-[#8c0f39] border border-[#ffc2cc]',
    },
    {
      id: 'certificate',
      label: 'Sertifikat Vaksin Catin',
      value: 'Siap Unduh',
      subtitle: 'Surat Keterangan Imunisasi Kemenkes RI',
      icon: Award,
      iconBgColor: 'bg-emerald-50 border border-emerald-100',
      iconColor: 'text-emerald-700',
      badgeText: 'Terverifikasi',
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'partner',
      label: 'Sinkronisasi Pasangan',
      value: partnerName,
      subtitle: `ID Catin: ${catinId} • Terhubung KUA`,
      icon: Heart,
      iconBgColor: 'bg-rose-50 border border-rose-100',
      iconColor: 'text-rose-600',
      badgeText: 'Terhubung',
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Alamat Email',
      value: userProfile.email || 'catin.preluna@kemenkes.go.id',
    },
    {
      icon: Phone,
      label: 'Nomor WhatsApp / HP',
      value: userProfile.phone || '081234567890',
    },
    {
      icon: Building2,
      label: 'Fasilitas Kesehatan / KUA',
      value: userProfile.schoolOrOrg || 'Puskesmas Kebayoran / KUA Setempat',
    },
  ];

  return (
    <div className='flex flex-col gap-6 w-full max-w-5xl mx-auto animate-fade-in pb-12'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-emerald-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>
          Profil Calon Pengantin
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Informasi identitas pranikah, status imunisasi TT Kemenkes, dan preferensi layanan PRELUNA
        </p>
      </div>

      {/* 1. Header Profile Card with Avatar Uploader */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='Calon Pengantin Wanita (Catin)'
        roleBadgeColor='user'
        subtitle={`${userProfile.schoolOrOrg || 'Puskesmas Kebayoran'} • PRELUNA 💍`}
        verified={true}
        verifiedText='Terverifikasi'
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. 3-Column Metrics Grid */}
      <ProfileMetricsGrid
        title='Status Imunisasi & Skrining Pranikah'
        subtitle='Berdasarkan catatan kohort imunisasi Kemenkes RI dan pemeriksaan pranikah'
        metrics={userMetrics}
        columns={3}
      />

      {/* 3. Contact & Affiliation Card */}
      <ProfileContactCard
        title='Data Kontak & Fasilitas Kesehatan'
        subtitle='Informasi calon pengantin dan puskesmas rujukan KUA yang terdaftar'
        items={contactItems}
      />

      {/* 4. Faskes Rujukan Terpilih */}
      <FaskesRujukanCard faskesName={userProfile.schoolOrOrg || 'Puskesmas Kebayoran Baru'} />

      {/* 5. Notification & Reminder Settings Card (Burgundy Theme) */}
      <ProfileNotificationCard
        theme='burgundy'
        title='Pengingat Imunisasi TT'
        subtitle={
          scheduleData?.isEnabled
            ? `Pengingat aktif (${scheduleData?.dayOfWeek || 'Senin'}, ${scheduleData?.time || '09:00'} WIB)`
            : 'Pengingat otomatis dinonaktifkan'
        }
        isEnabled={scheduleData?.isEnabled ?? true}
        onToggleEnabled={handleToggleScheduleEnabled}
        onPermissionError={showToast}
      />

      {/* 5. Security & Account Management */}
      <ProfileSecuritySection
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        onDeleteAccountClick={handleOpenDeleteModal}
        lastLoginText='Hari ini via Web App PRELUNA'
      />

      {/* Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        userName={userProfile.name}
        faskesName={userProfile.schoolOrOrg || 'Puskesmas Kebayoran'}
        partnerName={partnerName}
        currentTTLevel={currentTTLevel}
      />

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        title='Ubah Data Calon Pengantin'
        subtitle='Perbarui informasi identitas diri, nomor WhatsApp, dan fasilitas kesehatan'
        isSaving={isSaving}
      >
        <div className='flex flex-col gap-3.5'>
          <div>
            <label className='text-xs font-bold text-slate-700 block mb-1'>Nama Lengkap</label>
            <input
              type='text'
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className='w-full bg-slate-50 border border-slate-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
              required
            />
          </div>

          <div>
            <label className='text-xs font-bold text-slate-700 block mb-1'>
              Fasilitas Kesehatan / Puskesmas
            </label>
            <input
              type='text'
              value={editFaskes}
              onChange={e => setEditFaskes(e.target.value)}
              placeholder='Contoh: Puskesmas Kebayoran'
              className='w-full bg-slate-50 border border-slate-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
              required
            />
          </div>

          <div>
            <label className='text-xs font-bold text-slate-700 block mb-1'>
              Nomor WhatsApp / HP
            </label>
            <input
              type='tel'
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              placeholder='Contoh: 081234567890'
              className='w-full bg-slate-50 border border-slate-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
              required
            />
          </div>
        </div>
      </ProfileEditModal>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative z-10 bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center animate-scale-up'>
            <h3 className='text-base font-bold text-slate-900'>Keluar dari PRELUNA?</h3>
            <p className='text-xs text-slate-600 mt-1 mb-5'>
              Anda perlu masuk kembali untuk mengakses kartu vaksin digital dan jadwal kunjungan
              faskes.
            </p>
            <div className='flex items-center gap-2.5'>
              <Button
                variant='outline'
                size='md'
                shape='pill'
                className='flex-1 min-h-[44px] text-xs font-semibold active:scale-95 cursor-pointer'
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant='primary'
                size='md'
                shape='pill'
                className='flex-1 min-h-[44px] bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold text-xs active:scale-95 cursor-pointer'
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative z-10 bg-white rounded-3xl shadow-2xl border border-red-200 max-w-md w-full p-6 text-center animate-scale-up'>
            <div className='w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200'>
              <AlertTriangle size={28} />
            </div>

            <h3 className='text-lg font-bold text-slate-900 mb-2'>Konfirmasi Hapus Akun Catin</h3>
            <p className='text-xs text-slate-600 leading-relaxed mb-4'>
              Tindakan ini akan menghapus akun calon pengantin Anda beserta riwayat imunisasi TT dan
              jadwal faskes secara permanen.
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
                className='flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting || deleteConfirmationText !== 'HAPUS'}
                className='flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5'
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className='animate-spin' />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  'Hapus Akun'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
