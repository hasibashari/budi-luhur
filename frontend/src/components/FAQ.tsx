import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana alur pendaftaran mahasiswa baru (PMB Online)?',
      a: 'Pendaftaran dilakukan daring melalui portal pmb.stikesbudiluhurcimahi.ac.id dengan mengisi biodata, mengunggah berkas, dan mengikuti seleksi serta tes kesehatan.',
    },
    {
      q: 'Apa saja program studi yang diselenggarakan STIKes Budi Luhur?',
      a: 'Tersedia 4 program studi resmi terakreditasi LAM-PTKes: D3 Keperawatan, S1 & Profesi Ners, D3 Kebidanan, serta Sarjana & Profesi Bidan.',
    },
    {
      q: 'Apakah tersedia program magang dan kerja ke luar negeri?',
      a: 'Ya, kami memiliki kerjasama penempatan kerja ke Jepang (program EPA) dan Jerman dengan pembekalan bahasa asing intensif.',
    },
    {
      q: 'Mengapa terdapat 3 portal aplikasi mandiri pada ekosistem ini?',
      a: 'Ketiga aplikasi beroperasi secara mandiri untuk kelompok studi dan mitra binaan dengan basis data serta sesi peramban terisolasi penuh.',
    },
    {
      q: 'Apakah portal aplikasi mandiri dapat diakses dari smartphone?',
      a: 'Bisa. Seluruh aplikasi mendukung standar PWA dan dapat langsung ditambahkan ke layar utama smartphone tanpa instalasi app store.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Tanya Jawab</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#202020] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="title-accent-blue" />
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#444444]">
            Informasi seputar pendaftaran PMB, program studi, karir global, dan akses portal digital STIKes Budi Luhur Cimahi.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-[#005EB8]/60 transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-4 py-3.5 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-[#202020] hover:text-[#005EB8] transition-colors min-h-[48px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base lg:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00A3E0]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-5 text-xs sm:text-sm text-[#444444] leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
