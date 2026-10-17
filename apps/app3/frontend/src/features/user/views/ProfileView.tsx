import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  Heart,
  Mail,
  Phone,
  Building2,
  Calendar,
  Check,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ProfileHeaderCard,
  ProfileContactCard,
  ProfileMetricsGrid,
  ProfileEditModal,
  ProfileSecuritySection,
} from '@/src/shared/components/profile';
import { DigitalImmunizationCertificateModal } from '@/src/shared/components/profile/DigitalImmunizationCertificateModal';
import { Button } from '@/src/shared/components/ui/Button';
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
  notes?: string | null;
}

export default function ProfileView() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, deleteAccount } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Calon Pengantin',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    avatarUrl: authUser?.avatarUrl || '',
    streakCount: authUser?.streakCount || 0,
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
    notes: null,
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editFaskes, setEditFaskes] = useState(userProfile.schoolOrOrg || '');
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
            email: authUser?.email || '',
            phone: authUser?.phone || '',
            avatarUrl: dashboard.user.avatarUrl || '',
            streakCount: dashboard.user.streakCount || 0,
            hbLevel: dashboard.user.hbLevel,
            schoolOrOrg: dashboard.user.schoolOrOrg,
            riskLevel: dashboard.user.riskLevel,
            notes: (dashboard.user as any).notes || null,
          });
          setEditName(dashboard.user.name);
          setEditFaskes(dashboard.user.schoolOrOrg || '');
          setEditPhone(authUser?.phone || '');
          setEditHb(dashboard.user.hbLevel ? String(dashboard.user.hbLevel) : '');
        }
      } catch (err) {
        console.error('Failed to load profile dashboard:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleSaveAvatar = async (newAvatarUrl: string | null) => {
    if (!newAvatarUrl) return;
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        avatarUrl: newAvatarUrl,
      });
      if (res.success) {
        setUserProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        updateUser({ avatarUrl: newAvatarUrl });
        showToast('Foto profil berhasil diperbarui');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfileAction(userProfile.id, {
        name: editName,
        schoolOrOrg: editFaskes,
        phone: editPhone,
        hbLevel: editHb ? Number(editHb) : undefined,
      });

      if (res.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editFaskes,
          phone: editPhone,
          hbLevel: editHb ? Number(editHb) : null,
        }));
        updateUser({
          name: editName,
          schoolOrOrg: editFaskes,
          phone: editPhone,
          hbLevel: editHb ? Number(editHb) : undefined,
        });
        setIsEditProfileModalOpen(false);
        showToast('Data calon pengantin berhasil disimpan');
      } else {
        showToast(res.error || 'Gagal menyimpan profil.');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Meta parsing from notes
  const notesStr = userProfile.notes || '';
  const partnerMatch = notesStr.match(/Pasangan:\s*([^|]+)/);
  const partnerName = partnerMatch ? partnerMatch[1].trim() : undefined;
  const weddingMatch = notesStr.match(/Rencana Akad:\s*([^|]+)/);
  const weddingDate = weddingMatch ? weddingMatch[1].trim() : undefined;
  const ttLevelMatch = notesStr.match(/Status TT Awal:\s*TT(\d)/);
  const ttLevel = ttLevelMatch ? parseInt(ttLevelMatch[1], 10) : 2;

  return (
    <div className='flex flex-col gap-6 w-full pb-10'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-amber-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Card */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='Catin Terdaftar'
        subtitle={`Fasilitas Kesehatan Rujukan: ${userProfile.schoolOrOrg || 'Puskesmas Kecamatan Domisili'}`}
        verified={true}
        verifiedText='Terverifikasi Kemenkes'
        canEdit={true}
        onEditClick={() => setIsEditProfileModalOpen(true)}
        onSaveAvatar={handleSaveAvatar}
        extraBadges={
          <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200'>
            Status TT{ttLevel} Aktif
          </span>
        }
      />

      {/* Certificate Callout Card */}
      <div className='rounded-3xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 shadow-xl shadow-emerald-950/10 border border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-inner'>
            <Award size={26} className='text-emerald-200' />
          </div>
          <div>
            <span className='text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-emerald-100'>
              Dokumen Resmi Catin
            </span>
            <h3 className='text-base sm:text-lg font-bold text-white mt-1'>
              Surat Keterangan Imunisasi TT Calon Pengantin
            </h3>
            <p className='text-xs text-emerald-100/90 mt-0.5'>
              Dapat diunduh dan dicetak untuk kelengkapan administrasi pernikahan di KUA / Catatan Sipil.
            </p>
          </div>
        </div>

        <Button
          variant='primary'
          size='md'
          shape='pill'
          className='bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer'
          onClick={() => setIsCertificateModalOpen(true)}
        >
          Lihat E-Sertifikat TT
        </Button>
      </div>

      {/* 2. Premarital Metrics Grid */}
      <ProfileMetricsGrid
        title='Status Parameter Kesehatan Pranikah'
        subtitle='Pemeriksaan biometrik, kadar Hb, dan tahapan imunisasi TT'
        columns={4}
        metrics={[
          {
            id: 'tt_status',
            label: 'Status Imunisasi TT',
            value: `TT${ttLevel}`,
            subtitle: ttLevel >= 5 ? 'Seumur Hidup' : '3 Tahun Proteksi',
            icon: ShieldCheck,
            iconBgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
            badgeText: 'Aktif',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          },
          {
            id: 'hb_level',
            label: 'Kadar Hemoglobin (Hb)',
            value: userProfile.hbLevel ? `${userProfile.hbLevel} g/dL` : 'Belum Ada',
            subtitle: userProfile.hbLevel && userProfile.hbLevel >= 12 ? 'Bebas Anemia' : 'Perlu Suplementasi',
            icon: Activity,
            iconBgColor: 'bg-teal-50',
            iconColor: 'text-teal-700',
            badgeText: userProfile.hbLevel ? (userProfile.hbLevel >= 12 ? 'Normal' : 'Rendah') : 'Skrining',
            badgeColor: userProfile.hbLevel && userProfile.hbLevel >= 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
          },
          {
            id: 'wedding_countdown',
            label: 'Rencana Hari Bahagia',
            value: weddingDate || 'Terjadwal',
            subtitle: partnerName ? `Bersama ${partnerName}` : 'Menuju Akad Nikah',
            icon: Heart,
            iconBgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
          {
            id: 'streak_adherence',
            label: 'Disiplin Kunjungan',
            value: `${userProfile.streakCount} Sesi`,
            subtitle: 'Kepatuhan Skrining',
            icon: Award,
            iconBgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
          },
        ]}
      />

      {/* 3. Contact & Faskes Information */}
      <ProfileContactCard
        title='Data Calon Pengantin & Faskes Rujukan'
        subtitle='Informasi resmi yang terdaftar pada sistem kesehatan pranikah'
        items={[
          {
            icon: Mail,
            label: 'Email Akun',
            value: userProfile.email,
            fallbackValue: 'Belum diisi',
            iconBgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
          },
          {
            icon: Phone,
            label: 'Nomor WhatsApp',
            value: userProfile.phone,
            fallbackValue: 'Belum diisi',
            iconBgColor: 'bg-teal-50',
            iconColor: 'text-teal-700',
          },
          {
            icon: Heart,
            label: 'Nama Calon Pasangan',
            value: partnerName,
            fallbackValue: 'Belum diatur',
            iconBgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
          {
            icon: Building2,
            label: 'Puskesmas / KUA Rujukan',
            value: userProfile.schoolOrOrg,
            fallbackValue: 'Puskesmas Domisili',
            iconBgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
          },
        ]}
      />

      {/* 4. Security & Account Section */}
      <ProfileSecuritySection
        onLogoutClick={() => {
          logout();
          navigate('/login');
        }}
        onDeleteAccountClick={handleOpenDeleteModal}
      />

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        isSaving={isSaving}
        title='Ubah Data Calon Pengantin'
        subtitle='Perbarui identitas, kontak, dan faskes rujukan Anda'
      >
        <div>
          <label className='block text-xs font-bold text-slate-800 mb-1.5'>
            Nama Lengkap Calon Pengantin
          </label>
          <input
            type='text'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            className='w-full bg-stone-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-stone-200 px-3.5 py-2.5 outline-none focus:border-emerald-600'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-800 mb-1.5'>
            Faskes Rujukan / Puskesmas / KUA
          </label>
          <input
            type='text'
            value={editFaskes}
            onChange={e => setEditFaskes(e.target.value)}
            className='w-full bg-stone-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-stone-200 px-3.5 py-2.5 outline-none focus:border-emerald-600'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-800 mb-1.5'>
            Nomor WhatsApp
          </label>
          <input
            type='tel'
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
            className='w-full bg-stone-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-stone-200 px-3.5 py-2.5 outline-none focus:border-emerald-600'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-slate-800 mb-1.5'>
            Kadar Hb Laboratorium (g/dL)
          </label>
          <input
            type='number'
            step='0.1'
            value={editHb}
            onChange={e => setEditHb(e.target.value)}
            placeholder='12.5'
            className='w-full bg-stone-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-stone-200 px-3.5 py-2.5 outline-none focus:border-emerald-600'
          />
        </div>
      </ProfileEditModal>

      {/* Digital Certificate Modal */}
      <DigitalImmunizationCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        catinName={userProfile.name}
        catinId={userProfile.id}
        partnerName={partnerName}
        faskesName={userProfile.schoolOrOrg || 'Puskesmas Kecamatan'}
        ttLevel={ttLevel}
      />

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='absolute inset-0' onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className='relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200'>
            <div className='w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4'>
              <AlertTriangle size={24} />
            </div>
            <h3 className='text-lg font-bold text-slate-900 text-center'>Konfirmasi Hapus Akun</h3>
            <p className='text-xs text-slate-600 text-center mt-2 leading-relaxed'>
              Tindakan ini akan menghapus akun calon pengantin dan semua data riwayat imunisasi TT secara permanen. Ketik <strong>HAPUS</strong> untuk melanjutkan.
            </p>

            {deleteError && (
              <div className='mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold'>
                {deleteError}
              </div>
            )}

            <input
              type='text'
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder='Ketik HAPUS'
              className='w-full mt-4 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-center text-sm font-bold outline-none focus:border-rose-600 uppercase tracking-widest'
            />

            <div className='mt-5 flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                shape='rounded'
                disabled={isDeleting}
                className='flex-1 border-stone-200 text-slate-700'
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant='danger'
                size='sm'
                shape='rounded'
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'HAPUS'}
                icon={isDeleting ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
                className='flex-1'
                onClick={handleConfirmDeleteAccount}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
