import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Shield,
  Building,
  CheckCircle2,
  Check,
} from 'lucide-react';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
} from '@/src/shared/components/profile';
import { useAuth } from '@/src/features/auth';
import { updateAdminProfileAction } from '../api/userManagementRepository';

export default function AdminProfileView() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const adminId = user?.id || 'usr_admin_1';

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'dr. Sarah Jenkins, Sp.GK',
    email: user?.email || 'admin@femory.id',
    phone: user?.phone || '+62 811-2233-4455',
    title: user?.schoolOrOrg || 'Fasilitator Kesehatan UKS',
    department: 'Manajemen Program TTD & Anemia Remaja',
    clinicName: 'FEMORY Puskesmas / UKS Sekolah',
    roleLabel: 'Administrator',
    avatarUrl: user?.avatarUrl || '',
  });

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenEdit = () => {
    setEditForm(profileData);
    setEditOpen(true);
  };

  const handleSaveAvatar = async (newAvatarUrl: string | null) => {
    try {
      const res = await updateAdminProfileAction(adminId, {
        avatarUrl: newAvatarUrl || '',
      });
      if (res.success) {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: newAvatarUrl || '',
        }));
        updateUser({ avatarUrl: newAvatarUrl || '' });
        showToast(
          newAvatarUrl
            ? 'Foto profil admin berhasil diperbarui! ✨'
            : 'Foto profil dihapus, menggunakan inisial nama.',
        );
      } else {
        showToast(res.error || 'Gagal memperbarui foto profil admin.');
      }
    } catch (err) {
      console.error('Error saving admin avatar:', err);
      showToast('Gagal menyimpan foto profil.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateAdminProfileAction(adminId, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      });

      if (res.success) {
        setProfileData(editForm);
        updateUser({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        });
        setEditOpen(false);
        showToast('Profil admin berhasil diperbarui! ✨');
      } else {
        showToast(res.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      console.error('Error saving admin profile:', err);
      showToast('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const adminMetrics = [
    {
      id: 'access',
      label: 'Level Hak Akses',
      value: 'Full Control',
      subtitle: 'Pengguna, Jadwal, Edukasi, Laporan',
      icon: Shield,
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      badgeText: 'Root Admin',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'system',
      label: 'Sistem Pengelola',
      value: 'UKS / Puskesmas',
      subtitle: 'Portal Terpadu TTD Remaja',
      icon: Building,
      iconBgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      badgeText: 'Aktif',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'status',
      label: 'Status Kredensial',
      value: 'Valid & Aman',
      subtitle: 'Autentikasi tingkat lanjut aktif',
      icon: CheckCircle2,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeText: 'Terverifikasi',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Email Dinas',
      value: profileData.email,
    },
    {
      icon: Phone,
      label: 'Nomor Kontak',
      value: profileData.phone,
    },
    {
      icon: Building,
      label: 'Unit Kerja / Fasilitas',
      value: profileData.department,
      fallbackValue: 'Manajemen Program TTD & UKS',
    },
  ];

  return (
    <div className='flex flex-col gap-6 w-full max-w-5xl mx-auto'>
      {/* Toast Notification */}
      {toastMsg && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fade-in'>
          <Check size={14} className='text-emerald-400' />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen Title */}
      <div>
        <h1 className='text-xl sm:text-2xl font-black text-slate-800 tracking-tight'>
          Profil Administrator
        </h1>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Informasi identitas, kontak dinas, serta kredensial akun administrator sistem.
        </p>
      </div>

      {/* 1. Header Card */}
      <ProfileHeaderCard
        name={profileData.name}
        avatarUrl={profileData.avatarUrl}
        roleBadgeText='ADMINISTRATOR'
        roleBadgeColor='admin'
        subtitle={`${profileData.title} • ${profileData.clinicName}`}
        verified={true}
        verifiedText='Terverifikasi Dinas'
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. Admin Operational Metrics */}
      <ProfileMetricsGrid
        title='Kredensial & Otoritas Sistem'
        subtitle='Parameter hak akses dan modul operasional administrator'
        metrics={adminMetrics}
        columns={3}
      />

      {/* 3. Contact Card */}
      <ProfileContactCard
        title='Informasi Kontak Dinas'
        subtitle='Saluran komunikasi resmi koordinator program FEMORY'
        items={contactItems}
      />

      {/* 4. Security & Logout */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onChangePasswordClick={() => showToast('Ubah password admin dapat dilakukan via pengaturan master.')}
      />

      {/* 5. Edit Modal */}
      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
        title='Edit Profil Admin'
        subtitle='Perbarui informasi identitas dan kontak dinas'
        isSaving={isSaving}
      >
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nama Lengkap & Gelar</label>
          <input
            type='text'
            value={editForm.name}
            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Email Dinas</label>
          <input
            type='email'
            value={editForm.email}
            onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1.5'>Nomor Telepon Dinas</label>
          <input
            type='tel'
            value={editForm.phone}
            onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
          />
        </div>
      </ProfileEditModal>
    </div>
  );
}
