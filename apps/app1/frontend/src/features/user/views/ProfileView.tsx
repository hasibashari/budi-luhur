import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Mail, Phone, School } from 'lucide-react';
import {
  ProfileHeaderCard,
  ProfileHealthStrip,
  getHbStatusInfo,
  ProfileContactCard,
  ProfileSettingsGroup,
  ProfileSecuritySection,
  ProfileEditModal,
  DeleteAccountModal,
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getUserDashboardDataAction,
  updateUserProfileAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '../api/userRepository';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/src/shared/utils/notifications';

// Re-export getHbStatusInfo to guarantee backward-compatibility with tests & imports
export { getHbStatusInfo };

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
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
            hbLevel: dashboard.user.hbLevel,
            schoolOrOrg: dashboard.user.schoolOrOrg,
            riskLevel: dashboard.user.riskLevel,
          });
          setEditName(dashboard.user.name);
          setEditSchool(dashboard.user.schoolOrOrg || '');
          setEditPhone(dashboard.user.phone || '');
          setEditHb(dashboard.user.hbLevel ? String(dashboard.user.hbLevel) : '');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleScheduleEnabled = async (enabled: boolean) => {
    if (!scheduleData) {
      showToast('Jadwal belum dikonfigurasi. Atur jadwal terlebih dahulu.');
      return;
    }

    if (enabled) {
      if (!isNotificationSupported()) {
        showToast('Browser tidak mendukung notifikasi.');
        return;
      }
      const currentPerm = getNotificationPermission();
      if (currentPerm === 'denied') {
        showToast('Izin notifikasi diblokir di browser.');
        return;
      }
      if (currentPerm === 'default') {
        try {
          const resPerm = await requestNotificationPermission();
          if (resPerm !== 'granted') {
            showToast('Izin notifikasi belum diberikan.');
            return;
          }
        } catch {
          return;
        }
      }
    }

    setScheduleData(prev => (prev ? { ...prev, isEnabled: enabled } : null));
    const res = await updateUserScheduleSettingsAction(scheduleData.id, { isEnabled: enabled });
    if (res.success) {
      showToast(
        enabled ? 'Pengingat otomatis diaktifkan! 🔔' : 'Pengingat otomatis dinonaktifkan.',
      );
    } else {
      showToast(res.error || 'Gagal memperbarui status pengingat.');
    }
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

  const handleConfirmDeleteAccount = async () => {
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

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Akun',
      value: userProfile.email || '-',
      iconBgColor: 'bg-rose-50 border-rose-100/60',
      iconColor: 'text-rose-600',
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: userProfile.phone || 'Belum diisi',
      iconBgColor: 'bg-pink-50 border-pink-100/60',
      iconColor: 'text-pink-600',
    },
    {
      icon: School,
      label: 'Sekolah / Instansi',
      value: userProfile.schoolOrOrg || 'Belum diatur',
      fallbackValue: 'Belum diatur',
      iconBgColor: 'bg-amber-50 border-amber-100/60',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className='flex flex-col gap-4 sm:gap-5 w-full max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto pb-12 px-1 sm:px-0'>
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-emerald-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Mobile Hero Profile Section */}
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

      {/* 2. Compact Health Snapshot Strip */}
      <ProfileHealthStrip
        streakCount={userProfile.streakCount}
        hbLevel={userProfile.hbLevel}
        riskLevel={userProfile.riskLevel}
      />

      {/* 3. Inset Group 1: Data Diri & Pendidikan */}
      <ProfileContactCard title='Data Diri & Pendidikan' items={contactItems} />

      {/* 4. Inset Group 2: Daftar Pengaturan */}
      <ProfileSettingsGroup
        scheduleData={scheduleData}
        onToggleScheduleEnabled={handleToggleScheduleEnabled}
        onChangePassword={() =>
          showToast('Fitur ubah kata sandi dapat dilakukan melalui admin UKS.')
        }
      />

      {/* 5. Inset Group 3: Aksi Akun & Keamanan */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onDeleteAccountClick={() => {
          setDeleteError(null);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Footer Info */}
      <div className='text-center pt-2'>
        <p className='text-[10px] sm:text-[11px] font-medium text-slate-400'>
          FEMORY v1.0 • Sahabat Remaja Sehat Bebas Anemia
        </p>
      </div>

      {/* Edit Profile Modal */}
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

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
