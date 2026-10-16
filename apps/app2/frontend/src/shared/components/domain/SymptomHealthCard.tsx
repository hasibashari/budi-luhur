import React, { useState } from 'react';
import { Activity, Check, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Chip } from '@/src/shared/components/ui/Chip';
import { Button } from '@/src/shared/components/ui/Button';

interface SymptomHealthCardProps {
  onSaveSymptom?: (symptoms: string[]) => void;
}

const COMMON_SYMPTOMS = [
  { id: 'none', label: 'Bebas Keluhan / Nyaman', isNormal: true },
  {
    id: 'spotting',
    label: 'Flek / Spotting Ringan',
    isNormal: true,
    advice: 'Flek ringan umum terjadi pada 1-3 bulan pertama adaptasi pil KB hormonal.',
  },
  {
    id: 'cramp',
    label: 'Kram Perut Ringan',
    isNormal: true,
    advice: 'Dapat diredakan dengan kompres hangat dan minum air putih yang cukup.',
  },
  {
    id: 'nausea',
    label: 'Mual Ringan',
    isNormal: true,
    advice: 'Konsumsi pil KB setelah makan malam atau menjelang tidur untuk meminimalkan mual.',
  },
  {
    id: 'breast_tenderness',
    label: 'Nyeri Payudara',
    isNormal: true,
    advice: 'Perubahan hormon sementara. Gunakan bra tanpa kawat yang nyaman.',
  },
  {
    id: 'headache',
    label: 'Pusing / Sakit Kepala',
    isNormal: false,
    advice: 'Jika sakit kepala hebat mendadak, segera konsultasikan dengan dokter atau bidan.',
  },
  {
    id: 'mood',
    label: 'Perubahan Mood',
    isNormal: true,
    advice: 'Respon adaptasi fluktuasi hormon alami.',
  },
];

export const SymptomHealthCard: React.FC<SymptomHealthCardProps> = ({ onSaveSymptom }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['none']);
  const [isSaved, setIsSaved] = useState(false);

  const toggleSymptom = (id: string) => {
    setIsSaved(false);
    if (id === 'none') {
      setSelectedSymptoms(['none']);
      return;
    }

    const withoutNone = selectedSymptoms.filter(s => s !== 'none');
    if (withoutNone.includes(id)) {
      const updated = withoutNone.filter(s => s !== id);
      setSelectedSymptoms(updated.length > 0 ? updated : ['none']);
    } else {
      setSelectedSymptoms([...withoutNone, id]);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveSymptom) {
      onSaveSymptom(selectedSymptoms);
    }
  };

  // Cari saran medis jika ada gejala terpilih yang memiliki saran
  const activeAdvices = COMMON_SYMPTOMS.filter(s => selectedSymptoms.includes(s.id) && s.advice);

  return (
    <Card padding='md' className='border border-slate-200/80 shadow-xs bg-white'>
      <div className='flex items-center justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100'>
            <Activity size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-800 tracking-tight'>
              Kondisi & Efek Samping Hari Ini
            </h3>
            <p className='text-xs text-slate-500 mt-0.5'>
              Pantau respon tubuh terhadap adaptasi hormon pil KB
            </p>
          </div>
        </div>
      </div>

      {/* Chip Pilihan Gejala */}
      <div className='flex flex-wrap gap-1.5 py-1.5'>
        {COMMON_SYMPTOMS.map(symptom => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          return (
            <Chip
              key={symptom.id}
              active={isSelected}
              size='sm'
              onClick={() => toggleSymptom(symptom.id)}
            >
              {symptom.label}
            </Chip>
          );
        })}
      </div>

      {/* Feedback Medis Edukatif Singkat */}
      {activeAdvices.length > 0 && selectedSymptoms[0] !== 'none' && (
        <div className='mt-3 p-3 bg-teal-50/70 rounded-xl border border-teal-100/80 text-xs text-slate-700 space-y-1.5 animate-fade-in'>
          <div className='flex items-center gap-1.5 text-teal-800 font-bold'>
            <Sparkles size={13} className='text-teal-600' />
            <span>Catatan Klinis Bidan Pilluna</span>
          </div>
          {activeAdvices.map(item => (
            <p key={item.id} className='text-[11px] leading-relaxed text-slate-600'>
              <strong className='text-teal-900'>{item.label}:</strong> {item.advice}
            </p>
          ))}
        </div>
      )}

      {/* Tombol Simpan & Status Terkirim */}
      <div className='mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between'>
        <span className='text-[11px] text-slate-400'>
          {isSaved ? 'Catatan tersimpan di jurnal kesehatan' : 'Pilih kondisi Anda hari ini'}
        </span>

        <Button
          variant={isSaved ? 'soft' : 'primary'}
          size='sm'
          onClick={handleSave}
          icon={isSaved ? <Check size={14} className='text-teal-700' /> : undefined}
          className={isSaved ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : ''}
        >
          {isSaved ? 'Tersimpan' : 'Simpan Gejala'}
        </Button>
      </div>
    </Card>
  );
};
