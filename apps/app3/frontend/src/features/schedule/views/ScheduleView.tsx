'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  Bell,
  BellRing,
  ArrowLeft,
  Share2,
  Heart,
  Clock,
  Pin,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Check,
  Sparkles,
  Info,
  CalendarClock,
  MessageSquare,
  Mail,
  Building2,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { TTIntervalGuideCard } from '../components/TTIntervalGuideCard';
import {
  getUserScheduleAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';

export default function ScheduleView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jadwal' | 'pengingat'>('jadwal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Screen 8 (Pengingat) interactive states
  const [isMasterEnabled, setIsMasterEnabled] = useState(true);
  const [selectedTiming, setSelectedTiming] = useState('3_days');
  const [channelPush, setChannelPush] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const data = await getUserScheduleAction(user?.id);
        if (isMounted) {
          setSchedule(data);
          if (data) {
            setIsMasterEnabled(data.isEnabled);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load schedule:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleMaster = async () => {
    const nextState = !isMasterEnabled;
    setIsMasterEnabled(nextState);
    showToast(
      nextState
        ? 'Pengingat otomatis jadwal TT diaktifkan!'
        : 'Pengingat otomatis dinonaktifkan.'
    );

    if (schedule) {
      await updateUserScheduleSettingsAction(schedule.id, {
        isEnabled: nextState,
      });
    }
  };

  const handleSaveReminderSettings = async () => {
    showToast('Pengaturan pengingat TT berhasil diperbarui!');
    if (schedule) {
      await updateUserScheduleSettingsAction(schedule.id, {
        isEnabled: isMasterEnabled,
      });
    }
  };

  if (loading && !schedule) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#121c2a] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 size={16} className="text-[#aff1d0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Bar (Stitch Screen 7 & 8) */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate('/user/dashboard')}
          aria-label="Kembali"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-tight">
            Jadwal Suntik TT
          </h1>
          <p className="text-[11px] sm:text-xs text-[#574144]">
            Rencana Kesehatan Calon Pengantin
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: 'Jadwal Suntik TT Pranikah - PRELUNA',
                  text: 'Jadwal suntik TT4 di Puskesmas Kebayoran Baru (15 Januari 2026).',
                  url: window.location.href,
                })
                .catch(() => {});
            } else {
              showToast('Tautan jadwal disalin ke papan klip');
            }
          }}
          aria-label="Bagikan"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Tabs: Jadwal Berikutnya (Screen 7) vs Pengingat Notifikasi (Screen 8) */}
      <div className="flex items-center p-1 bg-white rounded-2xl border border-stone-200 shadow-2xs max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab('jadwal')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'jadwal'
              ? 'bg-[#aa294d] text-white shadow-xs'
              : 'text-[#574144] hover:text-[#aa294d]'
          }`}
        >
          <CalendarIcon size={14} />
          <span>Jadwal TT4</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pengingat')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pengingat'
              ? 'bg-[#aa294d] text-white shadow-xs'
              : 'text-[#574144] hover:text-[#aa294d]'
          }`}
        >
          <BellRing size={14} />
          <span>Pengingat Otomatis</span>
        </button>
      </div>

      {activeTab === 'jadwal' ? (
        /* TAB 1: SCREEN 7 (Jadwal Imunisasi Berikutnya) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start animate-fade-in">
          {/* Main Column (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {/* Warm Introductory Greeting for Calon Pengantin (Stitch Screen 7) */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#aa294d] font-bold">
                  Rencana Kesehatan Catin
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#121c2a]">
                  Tetap Terlindungi Bersama
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-2xs">
                <Heart size={20} className="fill-[#aa294d]" />
              </div>
            </div>

            {/* Highlight Card: Jadwal Utama TT4 (Stitch Screen 7) */}
            <div className="relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-[#eff4ff] overflow-hidden">
              {/* Decorative Ambient Soft Glow */}
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#ffd9de]/40 blur-2xl pointer-events-none" />

              {/* Header Card Meta with Countdown Badge */}
              <div className="relative flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-inner shrink-0">
                    <CalendarClock size={26} />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#574144] block">
                      Dosis Dianjurkan Berikutnya
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#aa294d] tracking-tight">
                      TT4 (Dosis Keempat)
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-[#aff1d0] text-[#0a5139] text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2a6950] animate-pulse" />
                  Tersedia 12 hari lagi
                </span>
              </div>

              {/* Schedule Detail Section */}
              <div className="bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2 mb-4 border border-[#d9e3f6]/60">
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-[#ffd9de] text-[#aa294d] shrink-0">
                    <CalendarIcon size={18} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#574144]">
                      Rekomendasi Waktu Kunjungan
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                      15 Januari 2026
                    </span>
                    <span className="text-[10px] text-[#8b7074]">
                      (± 1 tahun setelah dosis TT3)
                    </span>
                  </div>
                </div>
              </div>

              {/* Protection Lifespan Metric */}
              <div className="flex items-start gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-[#aff1d0] shrink-0 flex items-center justify-center text-[#0a5139] mt-0.5 shadow-2xs">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#121c2a]">
                    Manfaat Perlindungan Imun
                  </span>
                  <p className="text-[11px] text-[#574144] leading-relaxed mt-0.5">
                    Menyuntikkan TT4 akan memperpanjang imunitas maternal dan calon bayi hingga{' '}
                    <strong className="text-[#2a6950] font-bold">10 tahun ke depan</strong> (sampai tahun 2036).
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Delight: Journey Milestones Peek (Stitch Screen 7) */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#121c2a]">
                  Progres Menuju Kekebalan Seumur Hidup
                </span>
                <span className="text-xs font-bold text-[#aa294d]">Dosis 4 dari 5</span>
              </div>
              {/* Stepper bar */}
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                <div className="h-2 rounded-full bg-[#2a6950]" />
                <div className="h-2 rounded-full bg-[#2a6950]" />
                <div className="h-2 rounded-full bg-[#2a6950]" />
                <div className="h-2 rounded-full bg-[#cb4364] animate-pulse" />
                <div className="h-2 rounded-full bg-[#dee9fc]" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#574144] font-semibold">
                <span className="text-[#2a6950]">TT1-TT3 Selesai</span>
                <span className="text-[#aa294d]">Langkah Saat Ini: TT4</span>
                <span className="text-[#8b7074]">TT5 Terakhir</span>
              </div>
            </div>

            {/* Medical Guidance Callout (Clinical Reassurance) (Stitch Screen 7) */}
            <div className="bg-[#eff4ff] rounded-2xl p-4 flex gap-3.5 items-start border border-[#d9e3f6]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#aa294d] shrink-0 shadow-2xs mt-0.5">
                <Info size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#121c2a] mb-0.5">
                  Catatan Bidan & Faskes
                </span>
                <p className="text-[11px] text-[#574144] leading-relaxed">
                  Pastikan kamu menerima vaksin sesuai interval waktu minimal agar respon antibodi optimal. Konsultasikan kartu riwayat TT ini kepada bidan desa atau dokter saat skrining berkala.
                </p>
              </div>
            </div>

            {/* Recommended Healthcare Facility (Faskes Terdekat) (Stitch Screen 7) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-sm sm:text-base font-bold text-[#121c2a]">
                  Faskes Rujukan Terpilih
                </span>
                <span className="text-[11px] text-[#aa294d] font-bold">Tersinkron BPJS</span>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff] flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#aff1d0]/50 flex items-center justify-center text-[#2a6950] shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#121c2a] truncate">
                        Puskesmas Kebayoran Baru
                      </h3>
                      <span className="text-[11px] text-[#574144] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={13} className="text-[#2a6950]" />
                        Faskes Utama Calon Pengantin
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#eff4ff] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <MapPin size={12} className="text-[#aa294d]" />
                    <span className="text-[11px] text-[#121c2a] font-semibold">1.2 km</span>
                  </div>
                </div>

                {/* Schedule & Operational Hours */}
                <div className="flex items-center gap-2 bg-[#eff4ff]/60 px-3 py-2 rounded-xl text-xs text-[#574144]">
                  <Clock size={15} className="text-[#8b7074]" />
                  <span className="font-medium text-[11px]">
                    Senin – Jumat, 08:00 – 14:00 WIB
                  </span>
                </div>

                {/* Facility Mini Map View Trigger (Stitch Screen 7) */}
                <div
                  className="w-full h-24 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-2.5 shadow-inner"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFV1kdSb2CiSwu7AGmIxW7cM2CvGaurtZEvxgwN5LglsjZEr4PHwHV2jIcAXZVHFNmvNTnmzp2cUTOElM0uVm3OcHxhGcl8426-bJN3C4R1XI5ZUCqvJYFHkR5UInfbiDmNHzydg83gH8NoBSqcjsLA7C4C4EvYrclwRBXjslcShlrtcQR8KTXL0rLHV2VPrvZkzmsE2Z2B2oJO1wWv5F45CdFGSp8jSuo60Y-c4lPw9uPGPU5j6aA')`,
                  }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-[#121c2a]/80 via-transparent to-transparent" />
                  <span className="relative text-[10px] text-white flex items-center gap-1 font-semibold truncate">
                    <Pin size={12} className="text-rose-300" />
                    Jl. Gandaria Tengah II No. 14, Jakarta Selatan
                  </span>
                </div>
              </div>
            </div>

            {/* Primary & Secondary Interactive Action Buttons (Stitch Screen 7) */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pengingat');
                  showToast('Buka pengaturan pengingat jadwal TT');
                }}
                className="w-full h-12 bg-[#aa294d] text-white rounded-full font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(170,41,77,0.32)] hover:bg-[#cb4364] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BellRing size={18} />
                <span>Pasang Pengingat Jadwal</span>
              </button>
              <a
                href="https://maps.google.com/?q=Puskesmas+Kebayoran+Baru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-white text-[#aa294d] border border-[#eff4ff] rounded-full font-bold text-xs sm:text-sm shadow-xs hover:bg-[#eff4ff] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                <span>Lihat Lokasi Faskes</span>
              </a>
            </div>
          </div>

          {/* Right Column (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <TTIntervalGuideCard />
          </div>
        </div>
      ) : (
        /* TAB 2: SCREEN 8 (Pengingat Imunisasi) */
        <div className="flex flex-col gap-5 max-w-xl mx-auto w-full animate-fade-in">
          {/* Hero Illustration & Delight Intro (Stitch Screen 8) */}
          <div className="flex flex-col items-center text-center mt-2 mb-2">
            <div className="relative w-24 h-24 flex items-center justify-center mb-3">
              {/* Ambient Glow */}
              <div className="absolute inset-0 rounded-full bg-[#ffd9de]/60 animate-pulse" />
              <div className="absolute w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
                <div className="relative flex items-center justify-center text-[#aa294d]">
                  <BellRing size={40} className="animate-bounce" />
                </div>
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#121c2a]">
              Pengingat Imunisasi TT
            </h2>
            <p className="text-xs text-[#574144] px-4 max-w-sm mt-1 leading-relaxed">
              Aktifkan pengingat otomatis agar kamu dan pasangan tidak melewatkan jadwal suntik dosis TT berikutnya.
            </p>
          </div>

          {/* Master Notification Toggle Card (Stitch Screen 8) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(217,78,111,0.08)] border border-[#eff4ff] transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shrink-0 mt-0.5">
                  <Bell size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#121c2a] leading-tight truncate">
                    Pengingat Otomatis Jadwal TT
                  </span>
                  <span className="text-[11px] text-[#574144] mt-0.5">
                    Kirim notifikasi ke aplikasi & WhatsApp
                  </span>
                </div>
              </div>

              {/* Modern Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isMasterEnabled}
                onClick={handleToggleMaster}
                className={`w-13 w-[52px] h-[30px] rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer shadow-inner relative ${
                  isMasterEnabled ? 'bg-[#aa294d]' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`block w-[26px] h-[26px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    isMasterEnabled ? 'translate-x-[22px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reminder Timing Selector (Radios) (Stitch Screen 8) */}
          <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isMasterEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                Pilih Waktu Notifikasi
              </span>
              <span className="text-[10px] text-[#0a5139] bg-[#aff1d0] px-2.5 py-0.5 rounded-full font-bold">
                Tepat Waktu
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: '1_week',
                  title: '1 Minggu sebelum jadwal',
                  desc: 'Cocok untuk mengatur cuti dan persiapan faskes',
                },
                {
                  id: '3_days',
                  title: '3 Hari sebelum jadwal',
                  desc: 'Waktu ideal konfirmasi ketersediaan vaksin di Puskesmas',
                  badge: 'Rekomendasi',
                },
                {
                  id: '1_day',
                  title: '1 Hari sebelum jadwal',
                  desc: 'Pengingat H-1 menjelang kunjungan faskes',
                },
                {
                  id: 'day_of',
                  title: 'Tepat pada hari jadwal (08:00 WIB)',
                  desc: 'Peringatan pagi hari untuk sarapan dan bawa buku KIA',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  onClick={() => setSelectedTiming(item.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedTiming === item.id
                      ? 'bg-[#ffd9de]/20 border-[#aa294d] shadow-xs'
                      : 'bg-white border-[#eff4ff] hover:bg-[#eff4ff]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reminder_timing"
                    value={item.id}
                    checked={selectedTiming === item.id}
                    onChange={() => setSelectedTiming(item.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                      selectedTiming === item.id
                        ? 'bg-[#aa294d] border-[#aa294d]'
                        : 'border-stone-300 bg-stone-100'
                    }`}
                  >
                    {selectedTiming === item.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-[#ffd9de] text-[#8c0f39] px-2 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#574144] mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Channels (Checkboxes) (Stitch Screen 8) */}
          <div className={`flex flex-col gap-2.5 transition-opacity duration-300 ${isMasterEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="px-1">
              <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                Saluran Pengingat
              </span>
              <p className="text-[11px] text-[#574144] mt-0.5">
                Notifikasi akan dikirimkan otomatis melalui opsi berikut
              </p>
            </div>

            <div className="bg-white rounded-2xl p-2 border border-[#eff4ff] shadow-xs flex flex-col gap-1">
              {/* Checkbox 1: In-App Push */}
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-[#eff4ff]/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] shrink-0">
                    <Bell size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#121c2a]">
                      Notifikasi Push Aplikasi
                    </span>
                    <span className="text-[11px] text-[#574144]">
                      Langsung muncul di layar ponselmu
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channelPush}
                  onChange={(e) => setChannelPush(e.target.checked)}
                  className="w-5 h-5 accent-[#aa294d] rounded cursor-pointer"
                />
              </label>

              {/* Checkbox 2: WhatsApp */}
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-[#eff4ff]/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#aff1d0] flex items-center justify-center text-[#2a6950] shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#121c2a]">
                      Pesan WhatsApp Pengingat Resmi
                    </span>
                    <span className="text-[11px] text-[#574144]">
                      Format interaktif terhubung ke hotline Puskesmas
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channelWhatsapp}
                  onChange={(e) => setChannelWhatsapp(e.target.checked)}
                  className="w-5 h-5 accent-[#aa294d] rounded cursor-pointer"
                />
              </label>

              {/* Checkbox 3: Email */}
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-[#eff4ff]/60 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#574144] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#121c2a]">
                      Email Pengingat
                    </span>
                    <span className="text-[11px] text-[#574144]">
                      Salinan dokumen jadwal & checklist Catin
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={(e) => setChannelEmail(e.target.checked)}
                  className="w-5 h-5 accent-[#aa294d] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Warm Reassurance Note (Stitch Screen 8) */}
          <div className="flex items-start gap-3 p-3.5 bg-[#eff4ff] rounded-2xl border border-[#d9e3f6]/60">
            <ShieldCheck size={20} className="text-[#2a6950] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#0a5139] leading-relaxed">
              Pengingat terjadwal tersinkronisasi otomatis dengan standar buku petunjuk imunisasi Kemenkes RI untuk Calon Pengantin.
            </p>
          </div>

          {/* Sticky CTA (Stitch Screen 8) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveReminderSettings}
              className="w-full h-12 bg-[#aa294d] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(170,41,77,0.32)] hover:bg-[#cb4364] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check size={18} />
              <span>Simpan Pengaturan Pengingat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
