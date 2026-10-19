import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Activity,
  HeartPulse,
  Mail,
  Phone,
  School,
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
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { getUserDashboardDataAction, updateUserProfileAction } from '../api/userRepository';

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

export function getHbStatusInfo(hb?: number | null) {
  if (hb === undefined || hb === null || Number.isNaN(hb) || hb <= 0) {
    return {
      text: 'Belum Tes',
      color: 'bg-slate-100 text-slate-600',
      iconBgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
      subtitle: 'Isi hasil tes lab di profil',
    };
  }

  if (hb < 8.0) {
    return {
      text: 'Anemia Berat',
      color: 'bg-rose-100 text-rose-700',
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      subtitle: 'Kadar Hb sangat rendah (< 8.0 g/dL)',
    };
  }

  if (hb < 11.0) {
    return {
      text: 'Anemia Sedang',
      color: 'bg-rose-100 text-rose-700',
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      subtitle: 'Kadar Hb rendah (8.0 – 10.9 g/dL)',
    };
  }

  if (hb < 12.0) {
    return {
      text: 'Anemia Ringan',
      color: 'bg-amber-100 text-amber-700',
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      subtitle: 'Mendekati normal (11.0 – 11.9 g/dL)',
    };
  }

  if (hb > 15.5) {
    return {
      text: 'Tinggi',
      color: 'bg-orange-100 text-orange-700',
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      subtitle: 'Di atas batas normal (> 15.5 g/dL)',
    };
  }

  return {
    text: 'Normal',
    color: 'bg-emerald-100 text-emerald-700',
    iconBgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    subtitle: 'Standar normal optimal (12.0 – 15.5 g/dL)',
  };
}

export default function ProfileView() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, deleteAccount } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Siswi FEMORY',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: authUser?.streakCount || 0,
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editSchool, setEditSchool] = useState(userProfile.schoolOrOrg || '');
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editHb, setEditHb] = useState(userProfile.hbLevel ? String(userProfile.hbLevel) : '');

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
            hbLevel: dashboard.user.hbLevel,
            schoolOrOrg: dashboard.user.schoolOrOrg,
            riskLevel: dashboard.user.riskLevel,
          });
          setEditName(dashboard.user.name);
          setEditSchool(dashboard.user.schoolOrOrg || '');
          setEditPhone(dashboard.user.phone || '');
          setEditHb(dashboard.user.hbLevel ? String(dashboard.user.hbLevel) : '');
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
            ? 'Foto profil berhasil diperbarui! ✨'
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
    setEditSchool(userProfile.schoolOrOrg || '');
    setEditPhone(userProfile.phone);
    setEditHb(userProfile.hbLevel ? String(userProfile.hbLevel) : '');
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedHb = editHb.trim() ? Number(editHb) : undefined;
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        phone: editPhone,
        schoolOrOrg: editSchool,
        hbLevel: parsedHb,
      });

      if (res.success) {
        let calculatedRisk = userProfile.riskLevel;
        if (parsedHb !== undefined) {
          if (parsedHb < 11.0) calculatedRisk = 'Tinggi';
          else if (parsedHb < 12.0 || parsedHb > 15.5) calculatedRisk = 'Sedang';
          else calculatedRisk = 'Rendah';
        }

        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editSchool || null,
          phone: editPhone,
          hbLevel: parsedHb || null,
          riskLevel: calculatedRisk || prev.riskLevel,
        }));
        updateUser({ name: editName, phone: editPhone, schoolOrOrg: editSchool });
        setIsEditProfileModalOpen(false);
        showToast('Profil berhasil diperbarui! ✨');
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
      label: 'Streak Konsumsi TTD',
      value: `${userProfile.streakCount} Pekan`,
      subtitle: 'Konsumsi rutin mingguan',
      icon: Flame,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeText: userProfile.streakCount > 0 ? 'Konsisten' : 'Mulai Sekarang',
      badgeColor:
        userProfile.streakCount > 0
          ? 'bg-orange-100 text-orange-700'
          : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'hb',
      label: 'Kadar Hemoglobin (Hb)',
      value: userProfile.hbLevel ? `${userProfile.hbLevel} g/dL` : 'Belum Diisi',
      subtitle: getHbStatusInfo(userProfile.hbLevel).subtitle,
      icon: Activity,
      iconBgColor: getHbStatusInfo(userProfile.hbLevel).iconBgColor,
      iconColor: getHbStatusInfo(userProfile.hbLevel).iconColor,
      badgeText: getHbStatusInfo(userProfile.hbLevel).text,
      badgeColor: getHbStatusInfo(userProfile.hbLevel).color,
    },
    {
      id: 'risk',
      label: 'Status Risiko Anemia',
      value: userProfile.riskLevel || 'Rendah',
      subtitle: 'Berdasarkan evaluasi UKS',
      icon: HeartPulse,
      iconBgColor:
        userProfile.riskLevel === 'Tinggi'
          ? 'bg-rose-100'
          : userProfile.riskLevel === 'Sedang'
            ? 'bg-amber-100'
            : 'bg-emerald-100',
      iconColor:
        userProfile.riskLevel === 'Tinggi'
          ? 'text-rose-600'
          : userProfile.riskLevel === 'Sedang'
            ? 'text-amber-600'
            : 'text-emerald-600',
      badgeText:
        userProfile.riskLevel === 'Tinggi'
          ? 'Perhatian'
          : userProfile.riskLevel === 'Sedang'
            ? 'Waspada'
            : 'Aman',
      badgeColor:
        userProfile.riskLevel === 'Tinggi'
          ? 'bg-rose-100 text-rose-700'
          : userProfile.riskLevel === 'Sedang'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Akun',
      value: userProfile.email || '-',
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: userProfile.phone || 'Belum diisi',
    },
    {
      icon: School,
      label: 'Sekolah / Instansi',
      value: userProfile.schoolOrOrg || 'Belum diatur',
      fallbackValue: 'Belum diatur',
    },
  ];

  return (
    <div className='flex flex-col gap-6 w-full max-w-5xl mx-auto'>
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-emerald-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h1 className='text-xl sm:text-2xl font-black text-slate-800 tracking-tight'>
          Profil Siswi & Pengaturan
        </h1>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Kelola identitas diri, pantau metrik kesehatan TTD, dan preferensi akun.
        </p>
      </div>

      {/* 1. Profile Header Card */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='SISWI TERDAFTAR'
        roleBadgeColor='user'
        subtitle={`${userProfile.schoolOrOrg || 'Program Pencegahan Anemia'} • FEMORY 🌸`}
        verified={true}
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. Health & Habit Metrics Grid */}
      <ProfileMetricsGrid
        title='Metrik Kesehatan & Rutinitas TTD'
        subtitle='Catatan kepatuhan dan kondisi hemoglobin terkini'
        metrics={userMetrics}
        columns={3}
      />

      {/* 3. Contact & Institution Card */}
      <ProfileContactCard
        title='Informasi Kontak & Pendidikan'
        subtitle='Data akun yang tercatat pada sistem pembinaan UKS/Puskesmas'
        items={contactItems}
      />

      {/* 4. Security & Session Section */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onChangePasswordClick={() =>
          showToast('Fitur ubah kata sandi dapat dilakukan melalui admin UKS.')
        }
        onDeleteAccountClick={handleOpenDeleteModal}
      />

      {/* 5. Edit Profile Dynamic Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        title='Ubah Data Siswi'
        subtitle='Perbarui data profil dan catatan kesehatan Anda'
        isSaving={isSaving}
      >
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nama Lengkap</label>
          <input
            type='text'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>
            Sekolah / Instansi
          </label>
          <input
            type='text'
            value={editSchool}
            onChange={e => setEditSchool(e.target.value)}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nomor Telepon</label>
            <input
              type='tel'
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1.5'>
              Kadar Hb Terakhir (g/dL)
            </label>
            <input
              type='number'
              step='0.1'
              min='0'
              max='25'
              value={editHb}
              onChange={e => setEditHb(e.target.value)}
              placeholder='Contoh: 12.4'
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
            <p className='mt-1 text-[11px] text-slate-500'>
              Standar normal remaja putri: 12.0 – 15.5 g/dL
            </p>
          </div>
        </div>
      </ProfileEditModal>

      {/* 6. Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div
            className='fixed inset-0 bg-transparent'
            onClick={() => {
              if (!isDeleting) setIsDeleteModalOpen(false);
            }}
            aria-hidden='true'
          />

          <div
            className='relative z-10 bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-md w-full max-h-[90dvh] flex flex-col overflow-hidden animate-scale-up'
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50/50'>
              <div className='flex items-center gap-2.5 min-w-0 pr-2'>
                <div className='w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0'>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className='text-sm sm:text-base font-black text-rose-900 leading-tight'>
                    Hapus Akun Pengguna
                  </h3>
                  <p className='text-[11px] text-rose-600/80'>
                    Tindakan permanen & tak dapat dibatalkan
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                aria-label='Tutup Modal'
                className='w-8 h-8 rounded-full bg-rose-100/60 hover:bg-rose-200/60 text-rose-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50'
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-700'>
              <div className='p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2'>
                <p className='font-bold flex items-center gap-1.5'>
                  <AlertTriangle size={14} className='text-rose-600 shrink-0' />
                  Data yang akan dihapus permanen:
                </p>
                <ul className='list-disc pl-5 space-y-1 text-[11px] text-rose-700'>
                  <li>Data identitas & profil siswi FEMORY</li>
                  <li>Seluruh riwayat konsumsi Tablet Tambah Darah (TTD)</li>
                  <li>Catatan streak & level kepatuhan konsumsi</li>
                  <li>Jadwal pengingat notifikasi TTD</li>
                  <li>Koneksi & aktivitas sesama teman (Buddy System)</li>
                </ul>
              </div>

              {deleteError && (
                <div className='p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-semibold'>
                  {deleteError}
                </div>
              )}

              <div className='space-y-2'>
                <label className='block text-xs font-bold text-slate-700'>
                  Ketik kata{' '}
                  <span className='text-rose-600 font-extrabold tracking-wider'>HAPUS</span> di
                  bawah ini untuk konfirmasi:
                </label>
                <input
                  type='text'
                  value={deleteConfirmationText}
                  onChange={e => {
                    setDeleteConfirmationText(e.target.value);
                    if (deleteError) setDeleteError(null);
                  }}
                  placeholder='Ketik HAPUS'
                  disabled={isDeleting}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-bold text-rose-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              className='px-5 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0'
              style={{
                paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
              }}
            >
              <button
                type='button'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className='flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer min-h-[40px] disabled:opacity-50'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'HAPUS'}
                className='flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-200 cursor-pointer min-h-[40px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className='animate-spin' />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Hapus Akun Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
