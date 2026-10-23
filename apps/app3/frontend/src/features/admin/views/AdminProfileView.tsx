import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Shield, Building, CheckCircle2, Check } from 'lucide-react';
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
    name: user?.name || 'SUPER ADMIN',
    email: user?.email || 'superAdmin@gmail.com',
    phone: user?.phone || '+62 811-2233-4455',
    title: user?.schoolOrOrg || 'Bidan Koordinator / Petugas KUA Pranikah',
    department: 'Pelayanan Kesehatan Reproduksi & Imunisasi TT Catin',
    clinicName: 'Puskesmas Gambir - KUA Gambir',
    roleLabel: 'Administrator Petugas',
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
      subtitle: 'Data Catin, Jadwal TT, Edukasi, Laporan',
      icon: Shield,
      iconBgColor: 'bg-[#ffd9de]',
      iconColor: 'text-[#aa294d]',
      badgeText: 'Petugas Admin',
      badgeColor: 'bg-[#ffd9de] text-[#8c0f39]',
    },
    {
      id: 'system',
      label: 'Sistem Pengelola',
      value: 'Puskesmas / KUA',
      subtitle: 'Portal Terpadu Imunisasi TT Catin',
      icon: Building,
      iconBgColor: 'bg-[#eff4ff]',
      iconColor: 'text-[#1d4ed8]',
      badgeText: 'Aktif Terpadu',
      badgeColor: 'bg-[#eff4ff] text-[#1d4ed8]',
    },
    {
      id: 'status',
      label: 'Status Kredensial',
      value: 'Valid & Aman',
      subtitle: 'Autentikasi faskes terverifikasi',
      icon: CheckCircle2,
      iconBgColor: 'bg-[#aff1d0]',
      iconColor: 'text-[#0a5139]',
      badgeText: 'Terverifikasi',
      badgeColor: 'bg-[#aff1d0] text-[#0a5139]',
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
      fallbackValue: 'Pelayanan Imunisasi TT & KUA',
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
        roleBadgeText='PETUGAS FASKES / KUA'
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
        subtitle='Saluran komunikasi resmi petugas faskes & KUA TEMANI'
        items={contactItems}
      />

      {/* 4. Security & Logout */}
      <ProfileSecuritySection
        onLogoutClick={handleConfirmLogout}
        onChangePasswordClick={() =>
          showToast('Ubah password admin dapat dilakukan via pengaturan master.')
        }
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
          <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
            Nama Lengkap & Gelar
          </label>
          <input
            type='text'
            value={editForm.name}
            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>Email Dinas</label>
          <input
            type='email'
            value={editForm.email}
            onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
            Nomor Telepon Dinas
          </label>
          <input
            type='tel'
            value={editForm.phone}
            onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
            required
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs font-semibold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all'
          />
        </div>
      </ProfileEditModal>
    </div>
  );
}
