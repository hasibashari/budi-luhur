import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Berapa kali saya harus meminum Tablet Tambah Darah (TTD)?',
      a: 'Sesuai rekomendasi Kementerian Kesehatan RI, remaja putri cukup meminum TTD sebanyak 1 tablet setiap minggu pada hari yang sama secara teratur sepanjang tahun.',
    },
    {
      q: 'Kenapa ada 3 portal aplikasi terpisah di website ini?',
      a: 'Ketiga aplikasi (Aplikasi 1, 2, dan 3) sengaja dipisahkan secara otonom untuk mendukung kelompok studi, jenjang kelas, atau instansi berbeda dengan database PostgreSQL dan sesi peramban independen.',
    },
    {
      q: 'Apakah akun saya bisa dipakai bergantian di ketiga aplikasi?',
      a: 'Setiap aplikasi memiliki sistem autentikasi, akun pengguna, dan database tersendiri. Anda perlu mendaftar atau login pada aplikasi yang telah ditentukan untuk kelompok Anda.',
    },
    {
      q: 'Kapan waktu terbaik untuk minum TTD agar tidak mual?',
      a: 'Waktu terbaik adalah malam hari setelah makan malam atau sebelum tidur. Hindari meminum TTD bersamaan dengan teh, kopi, atau susu karena dapat menghambat penyerapan zat besi.',
    },
    {
      q: 'Apakah aplikasi FEMORY bisa diakses di smartphone tanpa download dari PlayStore?',
      a: 'Bisa! Ketiga aplikasi telah mendukung teknologi Progressive Web App (PWA). Anda cukup membuka tautan aplikasi di peramban ponsel lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen).',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-50/70 border-t border-rose-100/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tanya Jawab</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Informasi lengkap seputar program pencegahan anemia dan penggunaan portal ekosistem FEMORY.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-rose-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
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
