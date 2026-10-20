import React, { useState } from 'react';
import { BookOpen, ChevronDown, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { APPS } from '../config/apps';
import type { NavMenuId } from '../components/Sidebar';

interface PanduanViewProps {
  onNavigate: (menu: NavMenuId) => void;
}

export const PanduanView: React.FC<PanduanViewProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Mengapa terdapat 3 portal aplikasi mandiri pada ekosistem ini?',
      a: 'Ketiga aplikasi beroperasi secara otonom untuk kelompok studi dan sasaran layanan yang berbeda: FEMORY (siswi/remaja), PILLUNA (wanita akseptor KB), dan PRELUNA (calon pengantin), dengan basis data dan sesi peramban terisolasi penuh.',
    },
    {
      q: 'Bagaimana cara mengakses setiap aplikasi?',
      a: 'Pilih kartu aplikasi pada menu Beranda. Anda akan diarahkan langsung ke halaman orientasi (onboarding) atau login dari aplikasi yang bersangkutan.',
    },
    {
      q: 'Apakah ketiga aplikasi dapat dipasang di smartphone (PWA)?',
      a: 'Ya. Seluruh aplikasi dan portal utama mendukung standar Progressive Web Apps (PWA). Anda dapat memasangnya ke layar utama (Add to Home Screen) melalui peramban.',
    },
    {
      q: 'Apakah data akun saya tercampur antar aplikasi?',
      a: 'Tidak. Setiap aplikasi memiliki sistem penyimpanan sesi terpisah (app1_auth_token, app2_auth_token, app3_auth_token) sehingga data dan autentikasi tidak akan saling menimpa.',
    },
  ];

  return (
    <div className='max-w-3xl mx-auto px-6 py-8 space-y-8'>
      {/* Header Halaman Panduan */}
      <div className='border-b border-gray-100 pb-5'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#149690] text-xs font-semibold mb-2'>
          <BookOpen className='w-3.5 h-3.5' />
          <span>Panduan Penggunaan</span>
        </div>
        <h2 className='text-2xl font-bold text-gray-900'>Panduan Layanan Aplikasi SORA</h2>
        <p className='text-sm text-gray-600 mt-1 leading-relaxed'>
          Informasi panduan operasional 3 aplikasi mandiri dalam ekosistem SORA STIKes Budi Luhur
          Cimahi.
        </p>
      </div>

      {/* Ringkasan 3 Aplikasi */}
      <section className='space-y-4'>
        <h3 className='text-base font-bold text-gray-800'>Alur & Fokus 3 Aplikasi</h3>
        <div className='space-y-3.5'>
          {APPS.map(app => (
            <div
              key={app.id}
              className='p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-teal-300 transition-all shadow-2xs'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-gray-900 text-sm sm:text-base'>{app.name}</span>
                    <span className='text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                      Port {app.port}
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 leading-relaxed'>{app.description}</p>
                </div>
                <a
                  href={app.onboardingUrl}
                  className='shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#149690] hover:text-[#0f766e] bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs hover:bg-teal-50 transition-colors'
                >
                  <span>Buka</span>
                  <ArrowRight className='w-3.5 h-3.5' />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tanya Jawab (FAQ) */}
      <section className='space-y-4 pt-2'>
        <div className='flex items-center gap-2'>
          <HelpCircle className='w-4 h-4 text-[#149690]' />
          <h3 className='text-base font-bold text-gray-800'>Pertanyaan Umum (FAQ)</h3>
        </div>

        <div className='space-y-3'>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className='border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs'
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className='w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-semibold text-gray-800 hover:text-[#149690] transition-colors'
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#149690]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className='px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50 leading-relaxed'>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigasi Cepat Kembali */}
      <div className='pt-4 text-center'>
        <button
          onClick={() => onNavigate('beranda')}
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#149690] transition-colors py-2 px-4 rounded-xl hover:bg-teal-50'
        >
          <span>← Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
};

export default PanduanView;
