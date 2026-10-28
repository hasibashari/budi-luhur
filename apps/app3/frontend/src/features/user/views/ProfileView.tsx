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
  getCertificateVerificationAction,
  requestCertificateVerificationAction,
  getUserDashboardDataAction,
  getUserScheduleAction,
  updateUserProfileAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '../api/userRepository';
import { CertificateVerification, ImmunizationRecord } from '../types';

interface UserProfileState {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  streakCount: number;
  schoolOrOrg?: string | null;
  riskLevel?: string | null;
  partnerName?: string;
  weddingDate?: string;
  ttStatus?: string;
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
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
  });

  const [scheduleData, setScheduleData] = useState<UserScheduleData | null>(null);
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificate, setCertificate] = useState<CertificateVerification | null>(null);
  const [isRequestingCert, setIsRequestingCert] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit fields
  const [editName, setEditName] = useState(userProfile.name);
  const [editFaskes, setEditFaskes] = useState(userProfile.schoolOrOrg || '');
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editPartnerName, setEditPartnerName] = useState(userProfile.partnerName || '');
  const [editWeddingDate, setEditWeddingDate] = useState(userProfile.weddingDate || '');
  const [isSaving, setIsSaving] = useState(false);

  // Partner info
  const partnerName = userProfile.partnerName;
  const catinId = userProfile.id;
  const currentTTLevel = Number(userProfile.ttStatus?.slice(2) || 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRequestVerification = async () => {
    setIsRequestingCert(true);
    try {
      await requestCertificateVerificationAction();
      const updated = await getCertificateVerificationAction();
      setCertificate(updated);
      showToast('Pengajuan verifikasi berhasil dikirim ke faskes!');
    } catch {
      showToast('Gagal mengajukan verifikasi sertifikat.');
    } finally {
      setIsRequestingCert(false);
    }
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
              avatarUrl: data.user.avatarUrl || prev.avatarUrl,
              partnerName: data.user.partnerName,
              weddingDate: data.user.weddingDate,
              ttStatus: data.user.ttStatus,
            }));
            setEditName(data.user.name || userProfile.name);
            setEditFaskes(data.user.schoolOrOrg || userProfile.schoolOrOrg || '');
            setEditPartnerName(data.user.partnerName || '');
            setEditWeddingDate(data.user.weddingDate || '');
            setImmunizationRecords(data.immunizationRecords || []);
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

        try {
          const cert = await getCertificateVerificationAction();
          if (isMounted) setCertificate(cert);
        } catch (error) {
          console.error('Failed to load certificate status:', error);
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
    setEditFaskes(userProfile.schoolOrOrg || '');
    setEditPhone(userProfile.phone);
    setEditPartnerName(userProfile.partnerName || '');
    setEditWeddingDate(userProfile.weddingDate || '');
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
        partnerName: editPartnerName.trim(),
        weddingDate: editWeddingDate,
      });

      if (res.success && res.data) {
        setUserProfile(prev => ({
          ...prev,
          name: editName,
          schoolOrOrg: editFaskes,
          phone: editPhone,
          partnerName: editPartnerName.trim(),
          weddingDate: editWeddingDate || undefined,
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
      value: currentTTLevel > 0 ? `TT${currentTTLevel}` : 'Belum ada dosis',
      subtitle:
        currentTTLevel > 0
          ? 'Status berdasarkan data imunisasi yang tersimpan'
          : 'Belum ada perlindungan imunisasi yang tercatat',
      icon: ShieldCheck,
      iconBgColor: 'bg-[#ffd9de] border border-[#ffc2cc]',
      iconColor: 'text-[#aa294d]',
      badgeText: currentTTLevel > 0 ? 'Tercatat' : 'Belum ada data',
      badgeColor:
        currentTTLevel > 0
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200',
      onClick: () => setIsCertificateModalOpen(true),
    },
    {
      id: 'certificate',
      label: 'Sertifikat Tetanus Toksoid',
      value:
        certificate?.status === 'APPROVED'
          ? 'Sah & Terverifikasi'
          : certificate?.status === 'PENDING'
            ? 'Menunggu Verifikasi'
            : certificate?.status === 'REJECTED'
              ? 'Perlu Perbaikan'
              : 'Belum Diajukan',
      subtitle:
        certificate?.status === 'APPROVED'
          ? `Ditandatangani ${certificate.signerName || certificate.reviewedBy || 'petugas faskes'}`
          : 'Kartu Imunisasi Resmi',
      icon: ShieldCheck,
      iconBgColor: 'bg-[#ffd9de] border border-[#ffc2cc]',
      iconColor: 'text-[#aa294d]',
      badgeText:
        certificate?.status === 'APPROVED'
          ? 'Terverifikasi'
          : certificate?.status === 'PENDING'
            ? 'Menunggu'
            : certificate?.status === 'REJECTED'
              ? 'Ditolak'
              : 'Belum diajukan',
      badgeColor:
        certificate?.status === 'APPROVED'
          ? 'bg-[#aff1d0]/70 text-[#0a5139] border border-[#aff1d0]'
          : certificate?.status === 'REJECTED'
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200',
      onClick: () => setIsCertificateModalOpen(true),
    },
    {
      id: 'partner',
      label: 'Calon Pasangan',
      value: partnerName || 'Belum diisi',
      subtitle: partnerName
        ? `Rencana akad: ${
            userProfile.weddingDate
              ? new Date(userProfile.weddingDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'belum diisi'
          }`
        : 'Lengkapi nama pasangan melalui tombol ubah profil',
      icon: Heart,
      iconBgColor: 'bg-rose-50 border border-rose-100',
      iconColor: 'text-rose-600',
      badgeText: partnerName ? 'Terisi' : 'Belum diisi',
      badgeColor: partnerName
        ? 'bg-rose-50 text-rose-700 border border-rose-200'
        : 'bg-slate-100 text-slate-600 border border-slate-200',
    },
  ];

  const contactItems = [
    {
      icon: Mail,
      label: 'Alamat Email',
      value: userProfile.email || 'Belum tersedia',
    },
    {
      icon: Phone,
      label: 'Nomor WhatsApp / HP',
      value: userProfile.phone || 'Belum tersedia',
    },
    {
      icon: Building2,
      label: 'Fasilitas Kesehatan',
      value: userProfile.schoolOrOrg || 'Belum dipilih',
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
          Informasi identitas pranikah, status imunisasi TT, dan preferensi layanan TEMANI
        </p>
      </div>

      {/* 1. Header Profile Card with Avatar Uploader */}
      <ProfileHeaderCard
        name={userProfile.name}
        avatarUrl={userProfile.avatarUrl}
        roleBadgeText='Calon Pengantin Wanita (Catin)'
        roleBadgeColor='user'
        subtitle={`${userProfile.schoolOrOrg || 'Faskes belum dipilih'} • TEMANI 💍`}
        verified={true}
        verifiedText='Terverifikasi'
        onEditClick={handleOpenEdit}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. 3-Column Metrics Grid */}
      <ProfileMetricsGrid
        title='Status Imunisasi Tetanus Toksoid'
        subtitle='Berdasarkan catatan kohort imunisasi fasilitas kesehatan'
        metrics={userMetrics}
        columns={3}
      />

      {/* 3. Contact & Affiliation Card */}
      <ProfileContactCard
        title='Data Kontak & Fasilitas Kesehatan'
        subtitle='Informasi calon pengantin dan puskesmas rujukan yang terdaftar'
        items={contactItems}
      />

      {/* 4. Faskes Rujukan Terpilih */}
      <FaskesRujukanCard faskesName={userProfile.schoolOrOrg || undefined} />

      {/* 4b. Kartu Vaksin & Sertifikat Tetanus Toksoid */}
      <button
        type='button'
        onClick={() => setIsCertificateModalOpen(true)}
        className='w-full flex items-center gap-3 rounded-2xl border border-[#ffd9de]/80 bg-linear-to-r from-white via-white to-[#ffd9de]/20 p-4 text-left shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group'
      >
        <span className='w-10 h-10 rounded-xl bg-[#ffd9de] text-[#aa294d] border border-[#ffc2cc] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
          <ShieldCheck size={20} />
        </span>
        <span className='flex-1 min-w-0'>
          <span className='block text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors'>
            Lihat Sertifikat Tetanus Toksoid
          </span>
          <span className='block text-[11px] text-[#574144]'>
            {certificate?.status === 'APPROVED'
              ? `Terverifikasi resmi ${certificate.signerName ? `oleh ${certificate.signerName}` : 'oleh faskes'}`
              : certificate?.status === 'PENDING'
                ? 'Sedang dalam antrean verifikasi petugas faskes'
                : 'Kartu imunisasi resmi standar fasilitas kesehatan'}
          </span>
        </span>
        <span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#aa294d] text-white text-[11px] font-bold shrink-0 shadow-2xs group-hover:bg-[#8c0f39] transition-colors'>
          Buka Kartu
        </span>
      </button>

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
        lastLoginText='Hari ini via Web App TEMANI'
      />

      {/* Kartu Vaksin & E-Sertifikat Resmi (Satu Modal Terpadu) */}
      <VaccineCardModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        userName={userProfile.name}
        faskesName={userProfile.schoolOrOrg || 'Puskesmas Mitra TEMANI'}
        partnerName={partnerName}
        currentTTLevel={currentTTLevel}
        records={immunizationRecords}
        certificate={certificate}
        onRequestVerification={handleRequestVerification}
        isRequestingVerification={isRequestingCert}
      />

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
        title='Ubah Data Calon Pengantin'
        subtitle='Perbarui identitas, kontak, faskes, serta data calon pasangan'
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

          <div className='pt-2 mt-1 border-t border-slate-100'>
            <p className='text-[10px] font-extrabold uppercase tracking-wider text-[#8c0f39] mb-2.5'>
              Data Calon Pasangan
            </p>

            <div className='flex flex-col gap-3.5'>
              <div>
                <label className='text-xs font-bold text-slate-700 block mb-1'>
                  Nama Calon Pasangan
                </label>
                <input
                  type='text'
                  value={editPartnerName}
                  onChange={e => setEditPartnerName(e.target.value)}
                  placeholder='Contoh: Rian Pratama'
                  className='w-full bg-slate-50 border border-slate-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
                />
                <p className='text-[10px] text-slate-500 mt-1'>
                  Nama ini juga tampil pada kartu vaksin dan sertifikat imunisasi.
                </p>
              </div>

              <div>
                <label className='text-xs font-bold text-slate-700 block mb-1'>
                  Rencana Tanggal Akad Nikah
                </label>
                <input
                  type='date'
                  value={editWeddingDate}
                  onChange={e => setEditWeddingDate(e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none'
                />
                <p className='text-[10px] text-slate-500 mt-1'>
                  Dipakai untuk hitung mundur pernikahan dan pengingat TT2 minimal 30 hari sebelum
                  akad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProfileEditModal>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative z-10 bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center animate-scale-up'>
            <h3 className='text-base font-bold text-slate-900'>Keluar dari TEMANI?</h3>
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
