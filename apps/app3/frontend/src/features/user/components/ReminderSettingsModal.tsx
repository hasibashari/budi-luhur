'use client';

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Bell,
  MessageSquare,
  Mail,
  Check,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: ReminderSettingsData) => void;
  defaultSettings?: Partial<ReminderSettingsData>;
}

export interface ReminderSettingsData {
  isEnabled: boolean;
  timing: string; // '1_week' | '3_days' | '1_day' | 'day_of'
  channelPush: boolean;
  channelWhatsapp: boolean;
  channelEmail: boolean;
  targetPhone?: string;
}

export function ReminderSettingsModal({
  isOpen,
  onClose,
  onSave,
  defaultSettings,
}: ReminderSettingsModalProps) {
  const [isEnabled, setIsEnabled] = useState(defaultSettings?.isEnabled ?? true);
  const [timing, setTiming] = useState(defaultSettings?.timing ?? '3_days');
  const [channelPush, setChannelPush] = useState(defaultSettings?.channelPush ?? true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(
    defaultSettings?.channelWhatsapp ?? true,
  );
  const [channelEmail, setChannelEmail] = useState(defaultSettings?.channelEmail ?? false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (defaultSettings) {
      if (defaultSettings.isEnabled !== undefined) setIsEnabled(defaultSettings.isEnabled);
      if (defaultSettings.timing !== undefined) setTiming(defaultSettings.timing);
      if (defaultSettings.channelPush !== undefined) setChannelPush(defaultSettings.channelPush);
      if (defaultSettings.channelWhatsapp !== undefined)
        setChannelWhatsapp(defaultSettings.channelWhatsapp);
      if (defaultSettings.channelEmail !== undefined)
        setChannelEmail(defaultSettings.channelEmail);
    }
  }, [defaultSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (onSave) {
        onSave({
          isEnabled,
          timing,
          channelPush,
          channelWhatsapp,
          channelEmail,
        });
      }
      onClose();
    }, 300);
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in'
      onClick={onClose}
    >
      <div
        className='relative z-10 w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-[#eff4ff] flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-scale-up'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        {/* Mobile Drag Indicator */}
        <div className='w-12 h-1.5 bg-[#dee9fc] rounded-full mx-auto mt-2.5 sm:hidden shrink-0' />

        {/* Header */}
        <div className='p-5 sm:p-6 border-b border-[#eff4ff] flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-[#ffd9de]/70 border border-[#ffd9de] flex items-center justify-center text-[#aa294d] shrink-0'>
              <BellRing size={20} />
            </div>
            <div>
              <h3 className='font-extrabold text-base sm:text-lg text-[#121c2a] leading-tight'>
                Pengaturan Pengingat Jadwal
              </h3>
              <p className='text-xs text-[#574144] mt-0.5'>
                Notifikasi otomatis jadwal suntik TT & skrining catin
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup modal'
            className='p-2 rounded-full text-[#8b7074] hover:text-[#121c2a] hover:bg-[#eff4ff] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center'
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain'>
          {/* Master Switch Card */}
          <div className='flex items-center justify-between p-4 bg-gradient-to-r from-[#ffd9de]/30 to-[#f8f9ff] border border-[#ffd9de]/80 rounded-2xl'>
            <div className='flex items-center gap-3'>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  isEnabled ? 'bg-[#aa294d] text-white shadow-2xs' : 'bg-[#dee9fc] text-[#8b7074]'
                }`}
              >
                <BellRing size={20} />
              </div>
              <div>
                <span className='text-xs sm:text-sm font-bold text-[#121c2a] block'>
                  Aktifkan Pengingat Otomatis
                </span>
                <span className='text-[11px] text-[#574144]'>
                  {isEnabled
                    ? 'Pengingat aktif via WhatsApp & Notifikasi'
                    : 'Pengingat saat ini dimatikan'}
                </span>
              </div>
            </div>

            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={isEnabled}
                onChange={() => setIsEnabled(!isEnabled)}
                className='sr-only peer'
              />
              <div className="w-12 h-6 bg-[#dee9fc] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#aa294d]" />
            </label>
          </div>

          {/* Timing Selector */}
          <div
            className={`space-y-2.5 transition-opacity duration-300 ${
              isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
          >
            <div className='flex items-center justify-between px-1'>
              <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                Waktu Notifikasi Dikirim:
              </span>
              <span className='text-[10px] text-[#0a5139] bg-[#aff1d0] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1'>
                <Sparkles size={10} /> Tepat Waktu
              </span>
            </div>

            <div className='space-y-2'>
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
                  title: 'Pagi hari saat jadwal (08:00 WIB)',
                  desc: 'Peringatan hari-H untuk bawa KTP dan sarapan',
                },
              ].map(item => (
                <label
                  key={item.id}
                  onClick={() => setTiming(item.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    timing === item.id
                      ? 'bg-[#ffd9de]/20 border-[#aa294d] shadow-2xs'
                      : 'bg-white border-[#eff4ff] hover:bg-[#eff4ff]/50'
                  }`}
                >
                  <input
                    type='radio'
                    name='timing'
                    value={item.id}
                    checked={timing === item.id}
                    onChange={() => setTiming(item.id)}
                    className='sr-only'
                  />
                  <div
                    className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                      timing === item.id
                        ? 'bg-[#aa294d] border-[#aa294d]'
                        : 'border-[#dee9fc] bg-[#f8f9ff]'
                    }`}
                  >
                    {timing === item.id && <div className='w-2 h-2 rounded-full bg-white' />}
                  </div>
                  <div className='flex flex-col flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className='text-[10px] font-bold bg-[#ffd9de] text-[#8c0f39] px-2 py-0.5 rounded-full shrink-0'>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className='text-[11px] text-[#574144] mt-0.5'>{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div
            className={`space-y-2 transition-opacity duration-300 ${
              isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
          >
            <div className='px-1'>
              <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                Saluran Pengiriman Notifikasi:
              </span>
            </div>

            <div className='bg-[#f8f9ff] rounded-2xl p-2 border border-[#eff4ff] space-y-1.5'>
              {/* WhatsApp */}
              <label className='flex items-center justify-between p-3 rounded-xl bg-white border border-[#dee9fc]/60 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer min-h-[48px]'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-[#aff1d0] flex items-center justify-center text-[#2a6950] shrink-0'>
                    <MessageSquare size={18} />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                      Pesan WhatsApp Resmi
                    </span>
                    <span className='text-[11px] text-[#574144]'>
                      Terkirim ke WhatsApp Catin & Pasangan
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={channelWhatsapp}
                  onChange={e => setChannelWhatsapp(e.target.checked)}
                  className='w-5 h-5 accent-[#aa294d] rounded cursor-pointer'
                />
              </label>

              {/* In-App Push */}
              <label className='flex items-center justify-between p-3 rounded-xl bg-white border border-[#dee9fc]/60 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer min-h-[48px]'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-[#ffd9de]/60 flex items-center justify-center text-[#aa294d] shrink-0'>
                    <Bell size={18} />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                      Notifikasi Push Aplikasi (PWA)
                    </span>
                    <span className='text-[11px] text-[#574144]'>
                      Muncul di bar notifikasi ponselmu
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={channelPush}
                  onChange={e => setChannelPush(e.target.checked)}
                  className='w-5 h-5 accent-[#aa294d] rounded cursor-pointer'
                />
              </label>

              {/* Email */}
              <label className='flex items-center justify-between p-3 rounded-xl bg-white border border-[#dee9fc]/60 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer min-h-[48px]'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#574144] shrink-0'>
                    <Mail size={18} />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                      Email Pengingat & Dokumen KUA
                    </span>
                    <span className='text-[11px] text-[#574144]'>
                      Salinan jadwal & checklist dokumen
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={channelEmail}
                  onChange={e => setChannelEmail(e.target.checked)}
                  className='w-5 h-5 accent-[#aa294d] rounded cursor-pointer'
                />
              </label>
            </div>
          </div>

          {/* Clinical Assurance Note */}
          <div className='flex items-start gap-3 p-3.5 bg-[#eff4ff] rounded-2xl border border-[#d9e3f6]/60'>
            <ShieldCheck size={20} className='text-[#2a6950] shrink-0 mt-0.5' />
            <p className='text-[11px] text-[#0a5139] leading-relaxed'>
              Jadwal pengingat otomatis diselaraskan dengan interval imunisasi Tetanus Toxoid Kemenkes RI untuk sertifikasi layak nikah KUA.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 sm:p-5 border-t border-[#eff4ff] flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 bg-[#f8f9ff] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-5'>
          <button
            type='button'
            onClick={onClose}
            className='w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-[#574144] font-semibold text-sm hover:bg-[#eff4ff] transition-colors cursor-pointer min-h-[44px]'
          >
            Batal
          </button>
          <button
            type='button'
            disabled={isSaving}
            onClick={handleSave}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer bg-[#aa294d] hover:bg-[#cb4364] shadow-[#aa294d]/20 min-h-[44px] active:scale-95 disabled:opacity-50'
          >
            <Check size={18} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReminderSettingsModal;
