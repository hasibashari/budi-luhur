'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Eye,
  Edit3,
  Columns2,
  Sparkles,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  readOnly?: boolean;
}

const TEMPLATES = [
  {
    title: 'Panduan Imunisasi Tetanus Toxoid (TT) Pranikah',
    content: `## Pentingnya Imunisasi TT bagi Calon Pengantin
Imunisasi Tetanus Toxoid (TT) wajib dijalani oleh calon pengantin wanita untuk mencegah infeksi Tetanus Neonatorum pada bayi yang kelak dilahirkan serta melindungi calon ibu saat bersalin.

> Tips Medis Pranikah: Pastikan imunisasi TT2 diselesaikan minimal 4 minggu sebelum akad nikah untuk kekebalan protektif 3 tahun!

### Jadwal 5 Dosis Imunisasi TT Kemenkes:
- **TT1**: Langkah awal (skrining saat pendaftaran catin di faskes)
- **TT2**: 4 minggu setelah TT1 (masa perlindungan 3 tahun)
- **TT3**: 6 bulan setelah TT2 (masa perlindungan 5 tahun)
- **TT4**: 1 tahun setelah TT3 (masa perlindungan 10 tahun)
- **TT5**: 1 tahun setelah TT4 (perlindungan seumur hidup / >25 tahun)

### Yang Perlu Disiapkan Sebelum Imunisasi:
1. Istirahat cukup dan sarapan sehat sebelum ke Puskesmas / klinik.
2. Bawa KTP dan surat pengantar pengantin dari kelurahan.
3. Sampaikan riwayat alergi atau imunisasi sebelumnya kepada bidan/dokter.`,
  },
  {
    title: 'Mitos vs Fakta Seputar Imunisasi TT & Skrining Pranikah',
    content: `## Mitos & Fakta Imunisasi TT Calon Pengantin

Masih banyak kesalahpahaman seputar vaksinasi sebelum menikah. Mari kita bedah faktanya secara medis!

| Mitos | Fakta Sebenarnya |
|---|---|
| Vaksin TT tidak diperlukan jika merasa sehat | Vaksinasi TT melindungi ibu dan calon bayi dari infeksi tetanus mematikan |
| Catin yang sehat tidak butuh skrining | Skrining mendeteksi dini risiko kesehatan dan status imunitas TT tanpa gejala |
| Suntik TT menimbulkan efek samping berat | Efeknya hanya nyeri ringan atau pegal pada lengan suntik selama 1–2 hari |

> Fakta Medis: Program imunisasi TT pranikah telah menyelamatkan jutaan ibu dan bayi dari risiko tetanus obstetrik yang fatal.`,
  },
  {
    title: 'Pedoman Gizi Pranikah & Pencegahan Stunting',
    content: `## Pilihan Nutrisi Optimal Menjelang Kehamilan

Persiapan generasi sehat bebas stunting dimulai dari pemenuhan gizi optimal calon ibu dan calon ayah:

### 1. Zat Besi & Asam Folat (Mencegah Anemia & Cacat Janin):
- Suplemen asam folat 400 mcg setiap hari
- Hati ayam/sapi, daging merah tanpa lemak, dan bayam
- Telur dan kacang-kacangan

### 2. Kalsium & Seng (Zinc):
- Susu, yogurt, dan keju pasteurisasi
- Ikan dengan duri lunak (teri, sarden)
- Biji labu dan kacang almond

> Tips Sehat: Ukur Lingkar Lengan Atas (LILA) di Puskesmas. Pastikan LILA minimal 23.5 cm untuk mencegah risiko Kurang Energi Kronis (KEK).`,
  },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Tulis isi artikel edukasi di sini menggunakan format Markdown...',
  minHeight = 320,
  readOnly = false,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const stats = useMemo(() => {
    const text = value || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 150));
    return {
      charCount,
      words,
      readTime: `${readTimeMinutes} menit baca`,
    };
  }, [value]);

  const insertToken = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const handleApplyTemplate = (templateContent: string) => {
    onChange(templateContent);
    setShowTemplateDropdown(false);
  };

  return (
    <div className='w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between flex-wrap gap-2 p-2 border-b border-slate-200 bg-emerald-50/40'>
        {/* Formatting Tools */}
        <div className='flex items-center gap-1 flex-wrap'>
          <button
            type='button'
            title='Tebal (Ctrl+B)'
            onClick={() => insertToken('**', '**', 'teks tebal')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <Bold size={15} />
          </button>
          <button
            type='button'
            title='Miring (Ctrl+I)'
            onClick={() => insertToken('*', '*', 'teks miring')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <Italic size={15} />
          </button>

          <div className='w-px h-5 bg-emerald-200/80 mx-1' />

          <button
            type='button'
            title='Heading 2'
            onClick={() => insertToken('## ', '\n', 'Judul Bagian')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <Heading2 size={15} />
          </button>
          <button
            type='button'
            title='Heading 3'
            onClick={() => insertToken('### ', '\n', 'Subjudul')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <Heading3 size={15} />
          </button>

          <div className='w-px h-5 bg-emerald-200/80 mx-1' />

          <button
            type='button'
            title='Daftar Poin (Bullet List)'
            onClick={() => insertToken('- ', '\n', 'Poin informasi')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <List size={15} />
          </button>
          <button
            type='button'
            title='Daftar Bernomor'
            onClick={() => insertToken('1. ', '\n', 'Langkah')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <ListOrdered size={15} />
          </button>

          <div className='w-px h-5 bg-emerald-200/80 mx-1' />

          <button
            type='button'
            title='Kotak Tips / Quote (> )'
            onClick={() =>
              insertToken(
                '> Tips Medis Pranikah: ',
                '\n',
                'Informasi penting kesehatan reproduksi & imunisasi',
              )
            }
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <Quote size={15} />
          </button>
          <button
            type='button'
            title='Tabel Markdown'
            onClick={() =>
              insertToken('\n| Kolom 1 | Kolom 2 |\n|---|---|\n| Data 1 | Data 2 |\n', '', '')
            }
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <TableIcon size={15} />
          </button>
          <button
            type='button'
            title='Tautan / Link'
            onClick={() => insertToken('[Teks Tautan](', ')', 'https://example.com')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40'
          >
            <LinkIcon size={15} />
          </button>

          {/* Template Dropdown */}
          <div className='relative ml-1'>
            <button
              type='button'
              onClick={() => setShowTemplateDropdown(prev => !prev)}
              disabled={readOnly}
              className='inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer'
            >
              <Sparkles size={13} />
              <span>Gunakan Template</span>
            </button>

            {showTemplateDropdown && (
              <div className='absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 flex flex-col gap-1'>
                <span className='text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider'>
                  Template Edukasi Pranikah
                </span>
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => handleApplyTemplate(tmpl.content)}
                    className='text-left px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer'
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className='flex items-center bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5'>
          <button
            type='button'
            title='Tulis Markdown'
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 size={13} />
            <span className='hidden sm:inline'>Tulis</span>
          </button>
          <button
            type='button'
            title='Tampilan Split'
            onClick={() => setViewMode('split')}
            className={`hidden md:flex px-2 py-1 rounded-md text-xs font-bold items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Columns2 size={13} />
            <span>Split</span>
          </button>
          <button
            type='button'
            title='Pratinjau'
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye size={13} />
            <span className='hidden sm:inline'>Pratinjau</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div
        style={{ minHeight }}
        className='grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1'
      >
        {/* Write View */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`p-4 flex flex-col ${viewMode === 'edit' ? 'col-span-2' : ''}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              className='w-full h-full min-h-[260px] bg-transparent text-sm text-slate-800 font-mono leading-relaxed outline-none resize-none'
            />
          </div>
        )}

        {/* Preview View */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`p-5 bg-white overflow-y-auto max-h-[460px] ${
              viewMode === 'preview' ? 'col-span-2' : ''
            }`}
          >
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className='text-xs text-slate-400 italic py-8 text-center'>
                Pratinjau artikel akan tampil di sini saat kamu menulis markdown.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      <div className='flex items-center justify-between flex-wrap gap-2 px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500'>
        <div className='flex items-center gap-3'>
          <span className='flex items-center gap-1'>
            <FileText size={13} />
            <span>{stats.words} kata</span>
          </span>
          <span>•</span>
          <span>{stats.charCount} karakter</span>
          <span>•</span>
          <span className='flex items-center gap-1 text-emerald-700 font-bold'>
            <Clock size={13} />
            <span>{stats.readTime}</span>
          </span>
        </div>

        {value.trim().length > 0 && !readOnly && (
          <button
            type='button'
            onClick={() => onChange('')}
            className='text-xs text-slate-400 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer'
          >
            <RotateCcw size={12} />
            <span>Reset Konten</span>
          </button>
        )}
      </div>
    </div>
  );
}
