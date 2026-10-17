import React, { useState, useEffect, useRef } from 'react';
import { BellRing, MessageSquare, Send, X, Smartphone, Sparkles } from 'lucide-react';
import { generateAiUserNudgeAction } from '@/src/lib/gemini';

export interface SendReminderModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  userPhone?: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  scheduleId?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  onSendSuccess: (channel: 'app' | 'whatsapp', messageSent: string) => void;
}

function SendReminderModalContent({
  onClose,
  userName,
  userPhone,
  patientName,
  patientPhone = '0812-3456-7890',
  medicationName = 'Vaksin Tetanus Toxoid (TT Catin)',
  dosage = '0.5 mL (Intramuskular)',
  timeSlot = '09:00 WIB',
  onSendSuccess,
}: Omit<SendReminderModalProps, 'open'>) {
  const displayName = userName || patientName || 'Calon Pengantin';
  const displayPhone = userPhone || patientPhone || '0812-3456-7890';
  const [channel, setChannel] = useState<'app' | 'whatsapp'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const getTemplateContent = (templateKey: string) => {
    switch (templateKey) {
      case 'standard':
        return `Halo ${displayName}, ini pengingat resmi dari Petugas Faskes & KUA (PRELUNA) untuk jadwal imunisasi ${medicationName} (${dosage}) pada jam ${timeSlot}. Jangan lupa hadir membawa KTP dan dokumen skrining pranikah ya!`;
      case 'friendly':
        return `Halo ${displayName}, cegah tetanus maternal & neonatal dan lindungi calon buah hati kelak! Jangan lupa jadwal imunisasi TT (${medicationName}) kamu hari ini ya. Semoga persiapan hari bahagia lancar selalu!`;
      case 'urgent':
        return `PENGINGAT PENTING: Halo ${displayName}, jadwal imunisasi TT (${medicationName}) kamu menjelang hari H akad nikah belum tercatat. Segera kunjungi Puskesmas rujukan agar sertifikat imunisasi catin dapat diproses untuk persyaratan KUA.`;
      default:
        return `Halo ${displayName}, jangan lupa jadwal imunisasi/skrining ${medicationName} (${dosage}) sesuai jadwal persiapan pernikahan kamu ya!`;
    }
  };

  const [message, setMessage] = useState<string>(() => getTemplateContent('standard'));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleTemplateChange = (newTemplate: string) => {
    setSelectedTemplate(newTemplate);
    setMessage(getTemplateContent(newTemplate));
  };

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateAiUserNudgeAction({
        userName: displayName,
        medicationName,
        dosage,
        timeSlot,
        tone:
          selectedTemplate === 'urgent'
            ? 'urgent'
            : selectedTemplate === 'friendly'
              ? 'friendly'
              : 'motivational',
      });
      if (res.success && res.message) {
        setMessage(res.message);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSend = () => {
    const finalMsg = message || getTemplateContent(selectedTemplate);
    if (channel === 'whatsapp') {
      const cleanPhone = displayPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      const encodedMsg = encodeURIComponent(finalMsg);
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMsg}`, '_blank');
    }

    onSendSuccess(channel, finalMsg);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        className='relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-scale-up'
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='p-5 sm:p-6 border-b border-emerald-100 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600'>
              <BellRing size={20} />
            </div>
            <div>
              <h3 className='font-extrabold text-base sm:text-lg text-slate-800 leading-tight'>
                Kirim Pengingat Imunisasi & Skrining TT
              </h3>
              <p className='text-xs text-slate-500 mt-0.5'>
                Calon Pengantin: {displayName} • {dosage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className='p-5 sm:p-6 space-y-5 overflow-y-auto flex-1'>
          {/* Channel Selector */}
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2'>
              Pilih Saluran Pengiriman:
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setChannel('whatsapp')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  channel === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <MessageSquare size={16} />
                </div>
                <div className='text-left'>
                  <div className='text-xs font-bold'>WhatsApp</div>
                  <div className='text-[10px] text-slate-500'>Direct via wa.me</div>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setChannel('app')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  channel === 'app'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'app' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Smartphone size={16} />
                </div>
                <div className='text-left'>
                  <div className='text-xs font-bold'>Notifikasi App</div>
                  <div className='text-[10px] text-slate-500'>Push Notification PWA</div>
                </div>
              </button>
            </div>
          </div>

          {/* Template Quick Selection */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-500'>
                Pilihan Template Pesan:
              </label>
              <button
                type='button'
                onClick={handleGenerateAiMessage}
                disabled={isGeneratingAi}
                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50'
              >
                <Sparkles size={12} className='text-emerald-600' />
                <span>{isGeneratingAi ? 'AI Menulis...' : 'Generate Teks AI'}</span>
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {[
                { id: 'standard', label: 'Standar Rutin' },
                { id: 'friendly', label: 'Ramah & Hari H' },
                { id: 'urgent', label: 'Penting (Menjelang Akad)' },
              ].map(t => (
                <button
                  key={t.id}
                  type='button'
                  onClick={() => handleTemplateChange(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTemplate === t.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2'>
              Pratinjau & Edit Isi Pesan:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className='w-full p-3.5 rounded-2xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-800 leading-relaxed outline-none transition-all resize-none'
              placeholder='Ketik pesan pengingat di sini...'
            />
            <p className='text-[11px] text-slate-400 mt-1.5'>
              *Pesan dapat diedit secara bebas sebelum dikirimkan ke calon pengantin.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 sm:p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 bg-slate-50/50'>
          <button
            type='button'
            onClick={onClose}
            className='w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer'
          >
            Batal
          </button>
          <button
            type='button'
            onClick={handleSend}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
          >
            {channel === 'whatsapp' ? <MessageSquare size={16} /> : <Send size={16} />}
            <span>
              {channel === 'whatsapp' ? 'Buka WhatsApp Catin' : 'Kirim Pengingat Sekarang'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SendReminderModal(props: SendReminderModalProps) {
  if (!props.open) return null;
  const keyId = props.userId || props.userName || props.patientId || props.patientName;
  return (
    <SendReminderModalContent
      key={`${keyId}_${props.medicationName || ''}`}
      {...props}
    />
  );
}
