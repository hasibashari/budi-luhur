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
    title: 'Panduan Suplementasi TTD Remaja',
    content: `## Pentingnya Tablet Tambah Darah (TTD)
Remaja putri memiliki risiko anemia yang lebih tinggi karena siklus menstruasi bulanan dan masa pertumbuhan yang pesat.

> Tips UKS: Minum 1 tablet TTD setiap minggu setelah makan malam atau sarapan untuk penyerapan optimal!

### Manfaat Rutin Minum TTD:
- Menjaga konsentrasi belajar tetap optimal di sekolah
- Mencegah tubuh cepat lemas, letih, lesu, dan lunglai (5L)
- Meningkatkan daya tahan tubuh dari serangan penyakit

### Aturan Minum yang Benar:
1. Minum dengan **air putih** atau **jus jeruk/buah segar** (Vitamin C membantu penyerapan zat besi).
2. Hindari minum TTD bersamaan dengan **teh**, **kopi**, atau **susu** karena dapat menghambat penyerapan zat besi.
3. Jangan minum dalam keadaan perut kosong untuk menghindari rasa mual.`,
  },
  {
    title: 'Mitos vs Fakta Seputar Anemia & TTD',
    content: `## Mitos & Fakta Tablet Tambah Darah

Masih banyak anggapan keliru mengenai konsumsi suplemen zat besi di kalangan siswi sekolah. Mari kita bedah faktanya!

| Mitos | Fakta Sebenarnya |
|---|---|
| Minum TTD bikin tensi darah tinggi | TTD hanya menambah zat besi (Hb), bukan menaikkan tekanan darah |
| Tubuh gemuk pasti bebas anemia | Anemia berkaitan dengan kadar zat besi, bukan berat badan |
| TTD menyebabkan ketergantungan | TTD adalah suplemen nutrisi pencegahan, bukan obat adiktif |

> Fakta Medis: Minum TTD secara teratur 1 kali seminggu aman dikonsumsi jangka panjang dan direkomendasikan Kemenkes RI.`,
  },
  {
    title: 'Daftar Makanan Sumber Zat Besi & Gizi Seimbang',
    content: `## Pilihan Makanan Pencegah Anemia

Selain rutin meminum TTD, siswi disarankan memperbanyak konsumsi makanan tinggi zat besi:

### 1. Sumber Hewani (Zat Besi Heme):
- Hati ayam / sapi
- Daging merah tanpa lemak
- Ikan dan telur ayam

### 2. Sumber Nabati (Zat Besi Non-Heme):
- Bayam, daun kelor, dan brokoli
- Kacang kedelai, tahu, dan tempe
- Kacang merah dan kacang hijau

> Tips Sehat: Padukan makanan sumber zat besi dengan buah kaya Vitamin C (jeruk, jambu biji, tomat) agar penyerapannya maksimal di dalam tubuh!`,
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
    <div className='w-full rounded-2xl border border-[#fce7f3] bg-white overflow-hidden shadow-xs flex flex-col'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between flex-wrap gap-2 p-2 border-b border-[#fce7f3] bg-[#fff5f7]/60'>
        {/* Formatting Tools */}
        <div className='flex items-center gap-1 flex-wrap'>
          <button
            type='button'
            title='Tebal (Ctrl+B)'
            onClick={() => insertToken('**', '**', 'teks tebal')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <Bold size={15} />
          </button>
          <button
            type='button'
            title='Miring (Ctrl+I)'
            onClick={() => insertToken('*', '*', 'teks miring')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <Italic size={15} />
          </button>

          <div className='w-px h-5 bg-rose-200/80 mx-1' />

          <button
            type='button'
            title='Heading 2'
            onClick={() => insertToken('## ', '\n', 'Judul Bagian')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <Heading2 size={15} />
          </button>
          <button
            type='button'
            title='Heading 3'
            onClick={() => insertToken('### ', '\n', 'Subjudul')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <Heading3 size={15} />
          </button>

          <div className='w-px h-5 bg-rose-200/80 mx-1' />

          <button
            type='button'
            title='Daftar Poin (Bullet List)'
            onClick={() => insertToken('- ', '\n', 'Poin informasi')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <List size={15} />
          </button>
          <button
            type='button'
            title='Daftar Bernomor'
            onClick={() => insertToken('1. ', '\n', 'Langkah')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <ListOrdered size={15} />
          </button>

          <div className='w-px h-5 bg-rose-200/80 mx-1' />

          <button
            type='button'
            title='Kotak Tips / Quote (> )'
            onClick={() => insertToken('> Tips UKS: ', '\n', 'Informasi penting pencegahan anemia')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
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
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <TableIcon size={15} />
          </button>
          <button
            type='button'
            title='Tautan / Link'
            onClick={() => insertToken('[Teks Tautan](', ')', 'https://example.com')}
            disabled={readOnly}
            className='p-1.5 rounded-lg text-[#475569] hover:bg-rose-100/70 hover:text-[#e11d48] transition-colors cursor-pointer disabled:opacity-40'
          >
            <LinkIcon size={15} />
          </button>

          {/* Template Dropdown */}
          <div className='relative ml-1'>
            <button
              type='button'
              onClick={() => setShowTemplateDropdown(prev => !prev)}
              disabled={readOnly}
              className='inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#fce7f3] text-[#e11d48] rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer'
            >
              <Sparkles size={13} />
              <span>Gunakan Template</span>
            </button>

            {showTemplateDropdown && (
              <div className='absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#fce7f3] z-50 p-1.5 flex flex-col gap-1'>
                <span className='text-[10px] font-bold text-[#94a3b8] px-2.5 py-1 uppercase tracking-wider'>
                  Template Edukasi TTD
                </span>
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => handleApplyTemplate(tmpl.content)}
                    className='text-left px-2.5 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-rose-50 hover:text-[#e11d48] rounded-lg transition-colors cursor-pointer'
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className='flex items-center bg-white border border-[#fce7f3] rounded-lg p-0.5 gap-0.5'>
          <button
            type='button'
            title='Tulis Markdown'
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-[#e11d48] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
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
                ? 'bg-[#e11d48] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
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
                ? 'bg-[#e11d48] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
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
        className='grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#fce7f3] flex-1'
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
              className='w-full h-full min-h-[260px] bg-transparent text-sm text-[#1e293b] font-mono leading-relaxed outline-none resize-none'
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
              <div className='text-xs text-[#94a3b8] italic py-8 text-center'>
                Pratinjau artikel akan tampil di sini saat kamu menulis markdown.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats Bar */}
      <div className='flex items-center justify-between flex-wrap gap-2 px-4 py-2 border-t border-[#fce7f3] bg-[#fff5f7]/40 text-xs text-[#64748b]'>
        <div className='flex items-center gap-3'>
          <span className='flex items-center gap-1'>
            <FileText size={13} />
            <span>{stats.words} kata</span>
          </span>
          <span>•</span>
          <span>{stats.charCount} karakter</span>
          <span>•</span>
          <span className='flex items-center gap-1 text-[#e11d48] font-bold'>
            <Clock size={13} />
            <span>{stats.readTime}</span>
          </span>
        </div>

        {value.trim().length > 0 && !readOnly && (
          <button
            type='button'
            onClick={() => onChange('')}
            className='text-xs text-[#94a3b8] hover:text-[#e11d48] font-semibold flex items-center gap-1 cursor-pointer'
          >
            <RotateCcw size={12} />
            <span>Reset Konten</span>
          </button>
        )}
      </div>
    </div>
  );
}
