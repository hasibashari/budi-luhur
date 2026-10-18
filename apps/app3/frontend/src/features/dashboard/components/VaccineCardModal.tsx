import React, { useRef } from 'react';
import { X, ShieldCheck, Download, Printer, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface VaccineCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  faskesName: string;
  partnerName?: string;
  currentTTLevel: number;
}

export function VaccineCardModal({
  isOpen,
  onClose,
  userName,
  faskesName,
  partnerName,
  currentTTLevel = 3,
}: VaccineCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const doses = [
    { level: 'TT1', status: currentTTLevel >= 1 ? 'Selesai' : 'Belum', date: '10 Feb 2024', faskes: faskesName, duration: 'Skrining Awal' },
    { level: 'TT2', status: currentTTLevel >= 2 ? 'Selesai' : 'Belum', date: '12 Mar 2024', faskes: faskesName, duration: '3 Tahun' },
    { level: 'TT3', status: currentTTLevel >= 3 ? 'Selesai' : 'Belum', date: '12 Jul 2024', faskes: faskesName, duration: '5 Tahun' },
    { level: 'TT4', status: currentTTLevel >= 4 ? 'Selesai' : 'Jadwal 2025', date: 'Estimasi Jul 2025', faskes: faskesName, duration: '10 Tahun' },
    { level: 'TT5', status: currentTTLevel >= 5 ? 'Selesai' : 'Jadwal 2026', date: 'Estimasi Jul 2026', faskes: faskesName, duration: 'Seumur Hidup' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                Kartu Vaksin Catin Kemenkes RI
              </h3>
              <p className="text-[11px] text-rose-100">
                Sertifikat Imunisasi Tetanus Toxoid Pranikah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Body - Printable Area */}
        <div ref={cardRef} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]">
          {/* Institution Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center font-black text-xs">
                P
              </div>
              <div>
                <span className="font-bold text-slate-800 block">KEMENTERIAN KESEHATAN RI</span>
                <span className="text-[10px] text-slate-500">Program Skrining Kesehatan Calon Pengantin</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#aff1d0] text-[#0a5139] text-[10px] font-bold">
              Terverifikasi Faskes
            </span>
          </div>

          {/* Catin Identity */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#eff4ff] border border-[#d9e3f6]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Nama Catin</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{userName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Calon Pasangan</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{partnerName || 'Tercatat di KUA'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Faskes Pelaksana</span>
              <span className="text-xs font-semibold text-slate-800 block truncate flex items-center gap-1">
                <Building2 size={12} className="text-[#2a6950]" />
                {faskesName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Status Proteksi</span>
              <span className="text-xs font-bold text-[#2a6950] block">
                TT{currentTTLevel} Tercapai (Terlindungi)
              </span>
            </div>
          </div>

          {/* Doses History Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">Riwayat Pemberian Dosis (TT 5 Dosis):</h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2">Dosis</th>
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Proteksi</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {doses.map((dose) => (
                    <tr key={dose.level} className="hover:bg-slate-50/50">
                      <td className="p-2 font-bold text-slate-800">{dose.level}</td>
                      <td className="p-2 text-slate-600">{dose.date}</td>
                      <td className="p-2 text-slate-600">{dose.duration}</td>
                      <td className="p-2 text-right">
                        {dose.status === 'Selesai' ? (
                          <span className="inline-flex items-center gap-0.5 text-[#2a6950] font-bold">
                            <CheckCircle2 size={12} /> Selesai
                          </span>
                        ) : (
                          <span className="text-slate-400">{dose.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Verification & Seal */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl p-1 flex items-center justify-center text-slate-800 shadow-2xs">
                <QrCode size={36} />
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-bold text-slate-800 block">Validasi Digital PRELUNA</span>
                <span>Pindai untuk memeriksa keaslian surat keterangan imunisasi TT.</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Diterbitkan oleh</span>
              <span className="text-[11px] font-bold text-[#aa294d]">{faskesName}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            shape="pill"
            onClick={onClose}
            className="text-xs"
          >
            Tutup
          </Button>
          <Button
            variant="primary"
            size="sm"
            shape="pill"
            icon={<Printer size={14} />}
            onClick={handlePrint}
            className="bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold text-xs shadow-xs"
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VaccineCardModal;
