import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Heart,
  ArrowLeft,
  Edit3,
  Award,
  Download,
  Building2,
  Calendar,
  Settings,
  Info,
  RefreshCw,
  LogOut,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import { ReminderSettingsModal, ReminderSettingsData } from '../components/ReminderSettingsModal';
import {
  getUserDashboardDataAction,
  getUserScheduleAction,
  updateUserProfileAction,
  updateUserScheduleSettingsAction,
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
  notes?: string | null;
}

export default function ProfileView() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, deleteAccount } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileState>({
    id: authUser?.id || '',
    name: authUser?.name || 'Shofa Zulfia Zahra',
    email: authUser?.email || '',
    phone: authUser?.phone || '081234567890',
    avatarUrl:
      authUser?.avatarUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASU_mx41_tQVZO5PJK8thoHAwg3EmqwdxbO-1uCsQclTg_oEdDtDcxQuSaWht_p65HC5c5kde9C2nZpa5w4RoOWtfB8j6IBXY1Y3JTrsJbWMyIwws6S2_8klGCwNO8mlArvkBjH-4FJ4UvXAfKfmeJ-ochtXIDet-V_65nWx4HVXv7J8epJll0bVr_mTDwMjS8SL8J6NAgDhASn9IuTtfuwNsZPkmLO7lgdSO4QmsRHaNL5eocv7mh',
    streakCount: authUser?.streakCount || 0,
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    riskLevel: null,
    notes: null,
  });

  const [searchParams] = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettingsData>();
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
    if (searchParams.get('section') === 'reminder') {
      setIsReminderModalOpen(true);
    }
  }, [searchParams]);

  const handleSaveReminderSettings = async (settings: ReminderSettingsData) => {
    const schedule = await getUserScheduleAction(authUser?.id);
    if (!schedule) {
      showToast('Jadwal pengingat belum tersedia.');
      return;
    }

    const result = await updateUserScheduleSettingsAction(schedule.id, {
      isEnabled: settings.isEnabled,
      reminderTiming: settings.timing,
      channelPush: settings.channelPush,
      channelWhatsapp: settings.channelWhatsapp,
      channelEmail: settings.channelEmail,
    });
    if (!result.success) {
      showToast(result.error || 'Gagal menyimpan pengaturan pengingat.');
      return;
    }

    setReminderSettings(settings);
    showToast(
      settings.isEnabled
        ? 'Pengaturan pengingat otomatis berhasil disimpan!'
        : 'Pengingat otomatis dinonaktifkan.',
    );
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
            }));
            setEditName(data.user.name || userProfile.name);
            setEditFaskes(data.user.schoolOrOrg || userProfile.schoolOrOrg || '');
          }
        } catch (e) {
          console.error('Failed to load profile dashboard:', e);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  useEffect(() => {
    getUserScheduleAction(authUser?.id)
      .then(schedule => {
        if (schedule) {
          setReminderSettings({
            isEnabled: schedule.isEnabled,
            timing: schedule.reminderTiming,
            channelPush: schedule.channelPush,
            channelWhatsapp: schedule.channelWhatsapp,
            channelEmail: schedule.channelEmail,
          });
        }
      })
      .catch(error => console.error('Failed to load reminder settings:', error));
  }, [authUser?.id]);

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
        showToast('Profil calon pengantin berhasil disimpan!');
        setIsEditModalOpen(false);
      } else {
        showToast(res.error || 'Gagal menyimpan profil.');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-xl mx-auto pb-16'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toastMessage && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toastMessage}</span>
        </div>
      )}

      {/* Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        userName={userProfile.name}
        faskesName={userProfile.schoolOrOrg || 'Puskesmas Kebayoran'}
        partnerName={partnerName}
        currentTTLevel={currentTTLevel}
      />

      {/* 1. Top Action & Navigation Bar (Stitch Screen 9) */}
      <div className='flex items-center justify-between pb-2'>
        <button
          type='button'
          onClick={() => navigate('/user/dashboard')}
          aria-label='Kembali ke Beranda'
          className='w-11 h-11 rounded-full bg-[#eff4ff] text-[#574144] flex items-center justify-center hover:bg-[#dee9fc] active:scale-90 transition-all shadow-2xs cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center'>
          <h1 className='text-base sm:text-lg font-bold text-[#121c2a] tracking-tight'>
            Profil Saya
          </h1>
        </div>

        <button
          type='button'
          onClick={() => setIsEditModalOpen(true)}
          aria-label='Edit Profil'
          className='w-11 h-11 rounded-full bg-[#eff4ff] text-[#aa294d] flex items-center justify-center hover:bg-[#ffd9de]/50 active:scale-90 transition-all shadow-2xs cursor-pointer'
        >
          <Edit3 size={18} />
        </button>
      </div>

      {/* 2. User Identity Card (Stitch Screen 9) */}
      <div className='relative bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(31,41,55,0.04),0_6px_20px_-2px_rgba(217,78,111,0.05)] border border-[#eff4ff] overflow-hidden text-center'>
        {/* Subtle Background Glow Element */}
        <div className='absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#ffd9de]/30 blur-2xl pointer-events-none' />
        <div className='absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#aff1d0]/40 blur-xl pointer-events-none' />

        <div className='relative flex flex-col items-center'>
          {/* Avatar with Gentle Rose Border Accent */}
          <div className='relative mb-3 p-1 rounded-full bg-linear-to-tr from-[#aa294d]/30 via-[#debfc2]/40 to-[#ffd9de]'>
            <div className='w-24 h-24 rounded-full overflow-hidden shadow-sm bg-stone-100'>
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className='w-full h-full object-cover'
              />
            </div>
            <div className='absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#2a6950] text-white flex items-center justify-center shadow-md'>
              <CheckCircle2 size={14} />
            </div>
          </div>

          {/* Identity Metadata */}
          <h2 className='text-lg sm:text-xl font-bold text-[#121c2a] tracking-tight'>
            {userProfile.name}
          </h2>

          {/* Catin Status Pill */}
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd9de] text-[#8c0f39] mt-1.5 mb-2 shadow-2xs'>
            <Heart size={14} className='fill-[#aa294d]' />
            <span className='text-xs font-semibold tracking-wide'>
              Calon Pengantin Wanita (Catin)
            </span>
          </div>

          {/* Faskes / ID Metadata */}
          <p className='text-xs text-[#574144] flex items-center justify-center gap-1.5'>
            <span className='font-semibold text-[#121c2a]'>ID: {catinId}</span>
            <span className='inline-block w-1 h-1 rounded-full bg-[#debfc2]' />
            <span>{userProfile.schoolOrOrg || 'Puskesmas Kebayoran'}</span>
          </p>
        </div>
        <div className='relative flex flex-col items-center text-center'>
          <div className='w-full mt-4 pt-3 grid grid-cols-1 gap-2.5 bg-[#eff4ff] rounded-xl p-3.5 sm:p-4 text-left border border-[#d9e3f6]/60'>
            <div className='flex items-start gap-2.5'>
              <div className='p-1 rounded-md bg-[#ffd9de] text-[#aa294d] mt-0.5 shrink-0'>
                <Calendar size={16} />
              </div>
              <div className='flex-1'>
                <span className='text-[11px] text-[#574144] block'>Masa Perlindungan</span>
                <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                  Berlaku hingga 12 Juli 2028
                </span>
                <span className='text-[11px] text-[#574144] block'>
                  (± 5 tahun setelah dosis TT3)
                </span>
              </div>
            </div>

            <div className='flex items-start gap-2.5 pt-2 border-t border-[#d9e3f6]/60'>
              <div className='p-1 rounded-md bg-[#aff1d0] text-[#0a5139] mt-0.5 shrink-0'>
                <ShieldCheck size={16} />
              </div>
              <div className='flex-1'>
                <span className='text-[11px] text-[#574144] block'>Tingkat Kekebalan Imunitas</span>
                <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                  95% Perlindungan Efektif
                </span>
                <span className='text-[11px] text-[#574144] block'>
                  Melindungi ibu dan calon buah hati dari Tetanus Neonatorum
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Health Summary Pair (Bento Mini Stats from Stitch Screen 9) */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        {/* TT Status Summary */}
        <Link
          to='/user/imunisasi'
          className='bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff] relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group'
        >
          <div className='flex items-center justify-between mb-2'>
            <span className='text-[11px] text-[#574144] font-medium'>Status Vaksin</span>
            <div className='w-7 h-7 rounded-full bg-[#aff1d0] text-[#0a5139] flex items-center justify-center shadow-2xs'>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <p className='text-sm sm:text-base font-bold text-[#2a6950] leading-tight'>
              TT{currentTTLevel} (Aktif)
            </p>
            <span className='text-[11px] text-[#574144] mt-0.5 block'>Hingga 12 Jul 2028</span>
          </div>
        </Link>

        {/* Health Certificate Summary */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => setIsCertificateModalOpen(true)}
          className='bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff] relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group'
        >
          <div className='flex items-center justify-between mb-2'>
            <span className='text-[11px] text-[#574144] font-medium'>Sertifikat Sehat</span>
            <div className='w-7 h-7 rounded-full bg-[#ffd9de] text-[#aa294d] flex items-center justify-center shadow-2xs'>
              <Award size={16} />
            </div>
          </div>
          <div>
            <p className='text-sm sm:text-base font-bold text-[#aa294d] leading-tight'>
              Siap Unduh
            </p>
            <div className='flex items-center gap-1 text-[#574144] mt-0.5'>
              <span className='text-[11px]'>Format PDF Resmi</span>
              <Download size={13} className='text-[#aa294d]' />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Menu Navigation List (Stitch Screen 9) */}
      <div className='space-y-2'>
        <div className='px-1 mb-1'>
          <span className='text-[11px] text-[#574144] uppercase tracking-wider font-bold'>
            Pengaturan Akun & Riwayat
          </span>
        </div>

        {/* Item 1: Data Diri & Pasangan */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => setIsEditModalOpen(true)}
          className='group w-full bg-white hover:bg-[#eff4ff]/60 transition-colors rounded-2xl p-4 flex items-center justify-between shadow-xs border border-[#eff4ff] cursor-pointer'
        >
          <div className='flex items-center gap-3.5 min-w-0'>
            <div className='w-11 h-11 rounded-full bg-[#ffd9de]/60 text-[#aa294d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
              <span className='material-symbols-outlined text-[22px]'>badge</span>
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors truncate'>
                Data Diri & Pasangan
              </p>
              <p className='text-[11px] text-[#574144] truncate'>
                Informasi KTP, tanggal nikah, faskes pilihan
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-[#8b7074] shrink-0 ml-2 group-hover:text-[#aa294d] transition-colors'
          />
        </div>

        {/* Item: Pengingat & Notifikasi Jadwal */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => setIsReminderModalOpen(true)}
          className='group w-full bg-white hover:bg-[#eff4ff]/60 transition-colors rounded-2xl p-4 flex items-center justify-between shadow-xs border border-[#eff4ff] cursor-pointer'
        >
          <div className='flex items-center gap-3.5 min-w-0'>
            <div className='w-11 h-11 rounded-full bg-[#ffd9de]/80 text-[#aa294d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
              <BellRing size={20} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors truncate'>
                Pengingat & Notifikasi Jadwal
              </p>
              <p className='text-[11px] text-[#574144] truncate'>
                Atur pengingat otomatis WhatsApp & notifikasi ponsel
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-[#8b7074] shrink-0 ml-2 group-hover:text-[#aa294d] transition-colors'
          />
        </div>

        {/* Item 4: Pengaturan Akun & Keamanan */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => showToast('Fitur keamanan akun tersinkronisasi dengan Kemenkes ID')}
          className='group w-full bg-white hover:bg-[#eff4ff]/60 transition-colors rounded-2xl p-4 flex items-center justify-between shadow-xs border border-[#eff4ff] cursor-pointer'
        >
          <div className='flex items-center gap-3.5 min-w-0'>
            <div className='w-11 h-11 rounded-full bg-[#eff4ff] text-[#574144] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
              <Settings size={20} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors truncate'>
                Pengaturan Akun & Keamanan
              </p>
              <p className='text-[11px] text-[#574144] truncate'>
                Verifikasi nomor WhatsApp, proteksi data medis
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-[#8b7074] shrink-0 ml-2 group-hover:text-[#aa294d] transition-colors'
          />
        </div>

        {/* Item 5: Tentang Aplikasi PRELUNA */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => setIsAboutModalOpen(true)}
          className='group w-full bg-white hover:bg-[#eff4ff]/60 transition-colors rounded-2xl p-4 flex items-center justify-between shadow-xs border border-[#eff4ff] cursor-pointer'
        >
          <div className='flex items-center gap-3.5 min-w-0'>
            <div className='w-11 h-11 rounded-full bg-[#eff4ff] text-[#574144] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
              <Info size={20} />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <p className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors truncate'>
                  Tentang Aplikasi PRELUNA
                </p>
                <span className='px-1.5 py-0.5 rounded text-[10px] bg-[#eff4ff] text-[#574144] font-medium'>
                  v2.4.0
                </span>
              </div>
              <p className='text-[11px] text-[#574144] truncate'>
                Kemenkes RI, syarat & ketentuan privasi
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className='text-[#8b7074] shrink-0 ml-2 group-hover:text-[#aa294d] transition-colors'
          />
        </div>
      </div>

      {/* 5. Partner Sync Gentle Banner (Stitch Screen 9) */}
      <div className='bg-[#eff4ff] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs border border-[#d9e3f6]/60'>
        <div className='w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shrink-0'>
          <RefreshCw size={18} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-bold text-[#121c2a]'>Tersinkronisasi dengan Pasangan</p>
          <p className='text-[11px] text-[#574144] truncate mt-0.5'>
            {partnerName} (Calon Pengantin Pria)
          </p>
        </div>
        <CheckCircle2 size={18} className='text-[#2a6950] shrink-0' />
      </div>

      {/* 6. Logout Action (Stitch Screen 9) */}
      <div className='flex flex-col items-center justify-center pt-2 pb-4'>
        <button
          type='button'
          onClick={() => setIsLogoutModalOpen(true)}
          className='group inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-rose-700 hover:bg-rose-50 active:scale-95 transition-all text-center cursor-pointer'
        >
          <LogOut size={18} className='group-hover:-translate-x-0.5 transition-transform' />
          <span className='text-xs sm:text-sm font-bold tracking-wide'>Keluar dari Akun</span>
        </button>
        <p className='text-[11px] text-[#8b7074] mt-2 text-center'>
          PRELUNA • Sahabat Sehat Pranikah Indonesia
        </p>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh]'>
            {/* Mobile Drag Indicator Handle */}
            <div className='sm:hidden w-full pt-1 pb-2 flex justify-center'>
              <div className='w-12 h-1.5 rounded-full bg-stone-300' />
            </div>

            <div className='flex items-center justify-between pb-3 border-b border-stone-100 mb-4'>
              <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                Ubah Data Calon Pengantin
              </h3>
              <button
                type='button'
                onClick={() => setIsEditModalOpen(false)}
                className='w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-90 transition-all cursor-pointer'
                aria-label='Tutup Modal Edit'
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className='flex flex-col gap-3.5 overflow-y-auto'>
              <div>
                <label className='text-xs font-bold text-slate-800 mb-1 block'>Nama Lengkap</label>
                <input
                  type='text'
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className='w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-base sm:text-sm font-semibold focus:outline-none focus:border-[#aa294d]'
                  required
                />
              </div>

              <div>
                <label className='text-xs font-bold text-slate-800 mb-1 block'>
                  Fasilitas Kesehatan / Puskesmas
                </label>
                <input
                  type='text'
                  value={editFaskes}
                  onChange={e => setEditFaskes(e.target.value)}
                  className='w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-base sm:text-sm font-semibold focus:outline-none focus:border-[#aa294d]'
                  required
                />
              </div>

              <div>
                <label className='text-xs font-bold text-slate-800 mb-1 block'>
                  Nomor WhatsApp
                </label>
                <input
                  type='tel'
                  inputMode='tel'
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className='w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-base sm:text-sm font-semibold focus:outline-none focus:border-[#aa294d]'
                  required
                />
              </div>

              <div className='flex items-center gap-2.5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-0 border-t border-stone-100'>
                <Button
                  type='button'
                  variant='outline'
                  size='md'
                  shape='pill'
                  className='flex-1 min-h-[44px] text-xs font-semibold active:scale-95 cursor-pointer'
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  size='md'
                  shape='pill'
                  disabled={isSaving}
                  className='flex-1 min-h-[44px] bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold text-xs active:scale-95 cursor-pointer'
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative w-full max-w-sm bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 text-center pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6'>
            {/* Mobile Drag Indicator Handle */}
            <div className='sm:hidden w-full pt-1 pb-3 flex justify-center'>
              <div className='w-12 h-1.5 rounded-full bg-stone-300' />
            </div>

            <div className='w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3'>
              <LogOut size={22} />
            </div>
            <h3 className='text-base font-bold text-slate-900'>Keluar dari PRELUNA?</h3>
            <p className='text-xs text-slate-600 mt-1 mb-5'>
              Anda perlu masuk kembali untuk mengakses kartu vaksin dan jadwal kunjungan Faskes.
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
                className='flex-1 min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 cursor-pointer'
                onClick={handleLogout}
              >
                Ya, Keluar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* About App Modal */}
      {isAboutModalOpen && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div className='relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 text-left pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6'>
            {/* Mobile Drag Indicator Handle */}
            <div className='sm:hidden w-full pt-1 pb-3 flex justify-center'>
              <div className='w-12 h-1.5 rounded-full bg-stone-300' />
            </div>

            <div className='flex items-center justify-between pb-3 border-b border-stone-100 mb-3'>
              <h3 className='text-base font-bold text-slate-900'>Tentang PRELUNA</h3>
              <button
                type='button'
                onClick={() => setIsAboutModalOpen(false)}
                className='w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-90 transition-all cursor-pointer'
                aria-label='Tutup Modal Tentang'
              >
                <X size={16} />
              </button>
            </div>
            <p className='text-xs text-slate-600 leading-relaxed mb-3'>
              <strong>PRELUNA (Premarital Health & TT Immunization)</strong> adalah platform
              kesehatan terpadu calon pengantin berbasis standar pelayanan Kementerian Kesehatan
              Republik Indonesia.
            </p>
            <div className='p-3 bg-[#eff4ff] rounded-xl text-[11px] text-[#574144] space-y-1 mb-4'>
              <p>
                • Versi Aplikasi: <strong>v2.4.0 (Stitch Release)</strong>
              </p>
              <p>
                • Kerjasama: <strong>Fasilitas Kesehatan Tingkat Pertama (FKTP) & KUA</strong>
              </p>
              <p>
                • Standar TT: <strong>5 Dosis Kumulatif Seumur Hidup</strong>
              </p>
            </div>
            <Button
              variant='primary'
              size='md'
              shape='pill'
              className='w-full min-h-[44px] bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold text-xs active:scale-95 cursor-pointer'
              onClick={() => setIsAboutModalOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}

      {/* Reminder Settings Bottom Sheet Modal */}
      <ReminderSettingsModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminderSettings}
        defaultSettings={reminderSettings}
      />
    </div>
  );
}
