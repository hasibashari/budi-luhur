'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Share2,
  Printer,
  ArrowLeft,
  Clock,
  Hourglass,
  PlusCircle,
  Activity,
  FileCheck2,
  Heart,
  Award,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useMonitoringData } from '../hooks/useMonitoringData';
import { InputRiwayatTTModal, NewTTRiwayatData } from '../components/InputRiwayatTTModal';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import { MonthlyEvaluationView } from '../components/MonthlyEvaluationView';
import { TT_DOSAGE_LEVELS } from '@/src/shared/constants/domain.constants';

export default function HistoryView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

  const [activeTab, setActiveTab] = useState<'status_tt' | 'suplementasi'>('status_tt');
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isVaccineCardOpen, setIsVaccineCardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook for existing backend sync
  const { dashboardData, loading, stats } = useMonitoringData(userId);

  // Extract TT Level from notes or default 3
  const notesStr = (dashboardData?.user as any)?.notes || '';
  const ttLevelMatch = notesStr.match(/Status TT Awal:\s*TT(\d)/);
  const currentTTLevel = ttLevelMatch ? parseInt(ttLevelMatch[1], 10) : 3;

  const partnerMatch = notesStr.match(/Pasangan:\s*([^|]+)/);
  const partnerName = partnerMatch ? partnerMatch[1].trim() : 'Farhan Ramadhan';
  const faskesName = dashboardData?.user.schoolOrOrg || 'Puskesmas Kebayoran';

  // Dynamic Doses list state (allows adding new ones via Screen 5 modal)
  const [dosesHistory, setDosesHistory] = useState([
    {
      dose: 'TT1',
      title: 'Dosis TT1',
      faskes: 'Puskesmas Kebayoran',
      date: '10 Januari 2020',
      batch: 'Batch: TT-A902',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Langkah awal pembentukan antibodi',
    },
    {
      dose: 'TT2',
      title: 'Dosis TT2',
      faskes: 'Puskesmas Kebayoran',
      date: '12 Februari 2020',
      batch: 'Batch: TT-B114',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Proteksi 3 tahun terhadap tetanus maternal',
    },
    {
      dose: 'TT3',
      title: 'Dosis TT3 (Pranikah)',
      faskes: 'RSUD Pasar Minggu',
      date: '15 Juli 2023',
      batch: 'Batch: BIO-883C',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Proteksi 5 tahun masa awal pernikahan',
    },
    {
      dose: 'TT4',
      title: 'Dosis TT4',
      faskes: 'Puskesmas Kebayoran Baru',
      date: 'Estimasi: Juli 2026',
      batch: 'Minimal 1 Th setelah TT3',
      status: 'upcoming',
      statusLabel: 'Jadwal Berikutnya',
      description: 'Perlindungan 10 tahun untuk kehamilan berikutnya',
    },
    {
      dose: 'TT5',
      title: 'Dosis TT5',
      faskes: 'Faskes Rujukan Terdaftar',
      date: 'Belum ada data pencatatan',
      batch: 'TT4 ± 1 tahun',
      status: 'pending',
      statusLabel: 'Belum Terjadwal',
      description: 'Perlindungan seumur hidup (≥ 25 tahun)',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Status Imunisasi TT Pranikah - PRELUNA',
          text: `Status TT${currentTTLevel} Terverifikasi ${faskesName}. Berlaku aktif hingga 2028.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Ringkasan status disalin ke papan klip');
    }
  };

  const handleAddNewDose = (newData: NewTTRiwayatData) => {
    setDosesHistory((prev) => {
      const idx = prev.findIndex((d) => d.dose === newData.doseLevel);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          faskes: newData.faskesName,
          date: new Date(newData.vaccineDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          batch: newData.batchNumber ? `Batch: ${newData.batchNumber}` : 'Menunggu Verifikasi',
          status: 'completed',
          statusLabel: 'Lengkap / Terverifikasi',
        };
        return updated;
      }
      return [
        {
          dose: newData.doseLevel,
          title: `Dosis ${newData.doseLevel}`,
          faskes: newData.faskesName,
          date: newData.vaccineDate,
          batch: newData.batchNumber ? `Batch: ${newData.batchNumber}` : 'Dicatat Mandiri',
          status: 'completed',
          statusLabel: 'Lengkap / Terverifikasi',
          description: 'Dicatat mandiri melalui PRELUNA',
        },
        ...prev,
      ];
    });
    showToast(`Dosis ${newData.doseLevel} berhasil disimpan & menunggu verifikasi!`);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#121c2a] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 size={16} className="text-[#aff1d0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 5 Modal: Input Riwayat TT */}
      <InputRiwayatTTModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSubmit={handleAddNewDose}
        defaultDose={`TT${Math.min(5, currentTTLevel + 1)}`}
      />

      {/* Printable Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isVaccineCardOpen}
        onClose={() => setIsVaccineCardOpen(false)}
        userName={dashboardData?.user.name || 'Shofa Zulfia Zahra'}
        faskesName={faskesName}
        partnerName={partnerName}
        currentTTLevel={currentTTLevel}
      />

      {/* 1. Top Navigation & Action Bar (Stitch Screen 6) */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => navigate('/user/dashboard')}
          aria-label="Kembali ke Beranda"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-snug">
            Status Imunisasi TT
          </h1>
          <p className="text-[11px] sm:text-xs text-[#574144]">
            Tetanus Toxoid Calon Pengantin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Bagikan Kartu"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer"
            title="Bagikan Ringkasan"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsVaccineCardOpen(true)}
            aria-label="Cetak Kartu Imunisasi"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer"
            title="Cetak Kartu Vaksin"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Status Vaksin TT vs Evaluasi Suplementasi */}
      <div className="flex items-center p-1 bg-white rounded-2xl border border-stone-200 shadow-2xs max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab('status_tt')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'status_tt'
              ? 'bg-[#aa294d] text-white shadow-xs'
              : 'text-[#574144] hover:text-[#aa294d]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Status Imunisasi TT</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suplementasi')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'suplementasi'
              ? 'bg-[#aa294d] text-white shadow-xs'
              : 'text-[#574144] hover:text-[#aa294d]'
          }`}
        >
          <Activity size={14} />
          <span>Grafik Evaluasi</span>
        </button>
      </div>

      {activeTab === 'status_tt' ? (
        <div className="flex flex-col gap-5 sm:gap-6 animate-fade-in">
          {/* 2. Hero Status Card (Verified Shield) (Stitch Screen 6) */}
          <section className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(170,41,77,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-[#eff4ff]">
            {/* Soft Decorative Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#aff1d0]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-[#ffd9de]/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col items-center text-center">
              {/* Shield Icon Emblem with Warm Botanical Touch */}
              <div className="relative mb-3.5">
                <div className="w-20 h-20 rounded-full bg-[#aff1d0]/40 flex items-center justify-center shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-[#2a6950] text-white flex items-center justify-center shadow-sm">
                    <ShieldCheck size={32} className="fill-white/20" />
                  </div>
                </div>
                {/* Micro celebration spark badge */}
                <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-[#2a6950]" />
                </span>
              </div>

              {/* Clinical Verification Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#aff1d0] text-[#0a5139] mb-2 font-semibold text-xs">
                <span className="material-symbols-outlined text-[15px]">health_and_safety</span>
                <span>Terverifikasi {faskesName}</span>
              </div>

              {/* Dose Status Heading */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a] mt-1">
                Status Saat Ini: TT{currentTTLevel}
              </h2>
              <p className="text-xs sm:text-sm text-[#2a6950] font-semibold">
                Tercapai & Terlindungi Aktif
              </p>

              {/* Key Clinical Metrics Banner */}
              <div className="w-full mt-4 pt-3 grid grid-cols-1 gap-2.5 bg-[#eff4ff] rounded-xl p-3.5 sm:p-4 text-left border border-[#d9e3f6]/60">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-[#ffd9de] text-[#aa294d] mt-0.5 shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-[#574144] block">Masa Perlindungan</span>
                    <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                      Berlaku hingga 12 Juli 2028
                    </span>
                    <span className="text-[11px] text-[#574144] block">
                      (± 5 tahun setelah dosis TT3)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#d9e3f6]/60">
                  <div className="p-1 rounded-md bg-[#aff1d0] text-[#0a5139] mt-0.5 shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-[#574144] block">Tingkat Kekebalan Imunitas</span>
                    <span className="text-xs sm:text-sm font-bold text-[#121c2a]">
                      95% Perlindungan Efektif
                    </span>
                    <span className="text-[11px] text-[#574144] block">
                      Melindungi maternal dan bayi terhadap Tetanus Neonatorum
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 5-Step Horizontal Milestone Tracker (Stitch Screen 6) */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">linear_scale</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#121c2a]">
                  Rangkaian 5 Dosis TT
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffd9de] text-[#8c0f39] text-xs font-bold">
                {currentTTLevel} / 5 Selesai
              </span>
            </div>

            {/* Step Visual Track */}
            <div className="relative w-full pt-2 pb-2">
              {/* Connecting Bar */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-[#d9e3f6] rounded-full -translate-y-1/2" />
              <div
                className="absolute top-6 left-6 h-1 bg-[#2a6950] rounded-full -translate-y-1/2 transition-all duration-700"
                style={{ width: `${Math.min(100, (currentTTLevel / 5) * 100)}%` }}
              />

              {/* Steps Nodes */}
              <div className="relative flex items-start justify-between z-10 px-1">
                {[1, 2, 3, 4, 5].map((step) => {
                  const isCompleted = step <= currentTTLevel;
                  const isUpcoming = step === currentTTLevel + 1;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ring-4 ring-white transition-all ${
                          isCompleted
                            ? 'bg-[#2a6950] text-white'
                            : isUpcoming
                            ? 'bg-[#ffd9dd] text-[#ac254b]'
                            : 'bg-[#e6eeff] text-[#8b7074]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : isUpcoming ? (
                          <Hourglass size={14} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#8b7074]/40" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#121c2a] mt-1.5">
                        TT{step}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isCompleted
                            ? 'text-[#2a6950]'
                            : isUpcoming
                            ? 'text-[#ac254b]'
                            : 'text-[#8b7074]'
                        }`}
                      >
                        {isCompleted ? 'Selesai' : isUpcoming ? 'Jadwal' : 'Belum'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational Microtip Callout */}
            <div className="mt-4 p-3 rounded-xl bg-[#eff4ff] flex items-start gap-2.5 text-left border border-[#d9e3f6]/60">
              <span className="material-symbols-outlined text-[#aa294d] text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-[11px] sm:text-xs text-[#574144] leading-relaxed">
                Dengan menyelesaikan TT3, Anda telah memenuhi syarat kesehatan pranikah KUA & memiliki imunitas perlindungan aktif selama minimal 5 tahun.
              </p>
            </div>
          </section>

          {/* 4. Chronological Immunization History List (Stitch Screen 6) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm sm:text-base font-bold text-[#121c2a]">
                Daftar Riwayat Suntik TT
              </h3>
              <span className="text-xs text-[#574144]">5 Tahapan Dosis</span>
            </div>

            <div className="flex flex-col gap-3">
              {dosesHistory.map((item, idx) => (
                <div
                  key={item.dose}
                  className="p-4 rounded-2xl bg-white shadow-xs border border-[#eff4ff] flex flex-col gap-2.5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          item.status === 'completed'
                            ? 'bg-[#aff1d0] text-[#0a5139]'
                            : item.status === 'upcoming'
                            ? 'bg-[#ffd9dd] text-[#ac254b]'
                            : 'bg-stone-100 text-[#8b7074]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#121c2a] leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-[#574144]">{item.faskes}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold shrink-0 ${
                        item.status === 'completed'
                          ? 'bg-[#aff1d0] text-[#0a5139]'
                          : item.status === 'upcoming'
                          ? 'bg-[#ffd9dd] text-[#ac254b]'
                          : 'bg-stone-100 text-[#8b7074]'
                      }`}
                    >
                      {item.status === 'completed' && <CheckCircle2 size={12} />}
                      {item.status === 'upcoming' && <Clock size={12} />}
                      <span>{item.statusLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 mt-1 bg-[#eff4ff]/60 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-[#574144]">
                      <Calendar size={14} />
                      <span className="text-[11px] sm:text-xs">{item.date}</span>
                    </div>
                    {item.status === 'upcoming' ? (
                      <Link
                        to="/user/schedule"
                        className="text-[#aa294d] font-bold text-xs hover:underline inline-flex items-center gap-1"
                      >
                        Setel Pengingat
                      </Link>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#2a6950]">
                        {item.batch}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Secondary Action: Tambah Dosis Lainnya (Screen 5 trigger) */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsInputModalOpen(true)}
              className="w-full h-13 rounded-full bg-white border border-[#aa294d] text-[#aa294d] hover:bg-[#ffd9de]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer font-bold text-xs sm:text-sm"
            >
              <PlusCircle size={18} />
              <span>Tambah Dosis Lainnya</span>
            </button>
            <p className="text-center text-[11px] text-[#574144]">
              Punya bukti fisik KMS/Buku KIA terdahulu? Unggah foto cap puskesmas untuk rekonsiliasi.
            </p>
          </div>
        </div>
      ) : (
        /* Evaluation View */
        <div className="animate-fade-in">
          <MonthlyEvaluationView
            stats={stats}
            streakCount={dashboardData?.user.streakCount || 0}
            streakUnit={dashboardData?.user.streakUnit || 'Minggu'}
            hbLevel={dashboardData?.user.hbLevel}
            riskLevel={dashboardData?.user.riskLevel}
          />
        </div>
      )}
    </div>
  );
}
