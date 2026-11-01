import { useState, useRef, useMemo  } from 'react';
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
    title: 'Panduan Konsumsi Pil KB Harian',
    content: `## Pentingnya Disiplin Minum Pil KB
Pil KB kombinasi maupun progestin bekerja efektif mencegah kehamilan hingga 99% bila dikonsumsi secara disiplin setiap hari pada jam yang sama.

> Tips Medis: Pilih waktu yang paling mudah diingat, misalnya setelah makan malam atau sebelum tidur malam!

### Aturan Konsumsi yang Benar:
1. Minum 1 tablet setiap hari pada jam yang sama secara berurutan mengikuti tanda panah pada blister pack.
2. Jika terlewat < 12 jam: segera minum pil yang terlupa, lalu lanjutkan pil berikutnya sesuai jadwal normal.
3. Selalu sediakan air putih dan simpan kemasan pil pada suhu ruang yang terhindar dari sinar matahari langsung.`,
  },
  {
    title: 'Mitos vs Fakta Seputar Pil KB',
    content: `## Mitos & Fakta Kontrasepsi Oral
Masih banyak kekhawatiran yang keliru seputar penggunaan pil KB. Mari kita telaah faktanya secara medis!

| Mitos | Fakta Sebenarnya |
|---|---|
| Minum Pil KB bikin rahim kering / mandul | Kesuburan akan kembali normal setelah konsumsi pil dihentikan |
| Harus minum pil saat jam kosong perut | Boleh diminum bersama atau setelah makan untuk mengurangi rasa mual |
| Pil KB menyebabkan ketergantungan obat | Pil KB bekerja mengatur hormon secara reversibel, bukan zat adiktif |

> Fakta Medis: Konsumsi pil KB secara teratur juga dapat membantu meredakan kram menstruasi dan menstabilkan siklus haid.`,
  },
  {
    title: 'Penanganan Efek Samping Ringan & Adaptasi Tubuh',
    content: `## Mengatasi Efek Samping Awal Pil KB
Pada 1-3 bulan pertama, tubuh sedang beradaptasi dengan hormon kontrasepsi.

### Efek Samping Ringan yang Wajar:
- **Flek / Spotting di luar jadwal:** Lanjutkan minum pil sesuai urutan, biasanya mereda setelah 2-3 siklus.
- **Rasa Mual:** Minum pil bersama makanan atau tepat sebelum tidur di malam hari.
- **Payudara Terasa Kencang:** Kenakan pakaian yang nyaman dan hindari konsumsi kafein berlebih.

> Tips Sehat: Jika mengalami keluhan yang tidak kunjung reda setelah 3 siklus, konsultasikan dengan dokter atau tenaga medis di fasilitas kesehatan.`,
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
            onClick={() => insertToken('> Tips Medis: ', '\n', 'Informasi penting seputar penggunaan Pil KB')}
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
                  Template Edukasi Pil KB
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
