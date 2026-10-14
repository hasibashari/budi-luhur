import React from 'react';
import { UserCheck, Laptop, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: UserCheck,
      title: 'Sistem PMB Online Terpadu',
      desc: 'Pendaftaran daring dengan panduan alur jelas, verifikasi berkas cepat, dan seleksi transparan.',
      highlights: [
        'Pendaftaran paperless praktis',
        'Konsultasi jalur beasiswa & KIP-K',
        'Konfirmasi kelulusan cepat',
      ],
      iconBg: 'bg-blue-50 text-[#005EB8] border-blue-200',
    },
    {
      icon: Laptop,
      title: 'Portal E-Academic Modern',
      desc: 'Pengelolaan KRS online, jadwal kuliah, presensi kehadiran, dan kartu hasil studi (KHS) mahasiswa.',
      highlights: [
        'Akses transkrip & KHS real-time',
        'Bimbingan akademik dosen wali online',
        'Notifikasi jadwal seminar & ujian',
      ],
      iconBg: 'bg-sky-50 text-[#00A3E0] border-sky-200',
    },
    {
      icon: BookOpen,
      title: 'Perpustakaan Digital & Jurnal JKBL',
      desc: 'Koleksi literatur kesehatan, buku ajar keperawatan & kebidanan, dan jurnal ilmiah terakreditasi JKBL.',
      highlights: [
        'Ribuan e-book & repository riset',
        'Ruang baca multimedia ber-AC',
        'Akses jurnal internasional gratis',
      ],
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      icon: Layers,
      title: 'Ekosistem Aplikasi Digital Mandiri',
      desc: 'Infrastruktur server modern, lab CBT berstandar Ukom, dan portal aplikasi mandiri terisolasi.',
      highlights: [
        'Laboratorium CBT 60+ unit komputer',
        'Asisten cerdas AI edukasi medis',
        'Portal aplikasi riset mandiri',
      ],
      iconBg: 'bg-slate-100 text-[#004B87] border-slate-300',
    },
  ];

  return (
    <section
      id='fasilitas'
      className='py-12 sm:py-16 lg:py-24 bg-[#f8fafc] border-b border-slate-200 scroll-mt-16'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-3xl mx-auto mb-8 sm:mb-12'>
          <div className='inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4'>
            <Laptop className='w-3.5 h-3.5 text-[#00A3E0]' />
            <span>Fasilitas & Layanan Terpadu</span>
          </div>
          <h2 className='text-2xl sm:text-4xl lg:text-5xl font-black text-[#202020] tracking-tight'>
            Layanan Kampus Terintegrasi & Berbasis Digital
          </h2>
          <div className='title-accent-blue' />
          <p className='mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-[#444444] leading-relaxed'>
            Integrasi sarana fisik berstandar rumah sakit dan infrastruktur teknologi digital untuk
            pembelajaran optimal.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7'>
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className='card-academic p-5 sm:p-7 bg-white flex flex-col justify-between'
              >
                <div>
                  <div className='flex items-center space-x-3.5 mb-3.5 sm:mb-4'>
                    <div
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl ${item.iconBg} border flex items-center justify-center shrink-0`}
                    >
                      <Icon className='w-5 h-5 sm:w-6 sm:h-6' />
                    </div>
                    <h3 className='text-lg sm:text-xl font-bold text-[#202020]'>{item.title}</h3>
                  </div>
                  <p className='text-xs sm:text-sm text-[#444444] leading-relaxed mb-4 sm:mb-5'>
                    {item.desc}
                  </p>
                </div>
                <div className='space-y-2 border-t border-slate-100 pt-3.5 sm:pt-4'>
                  {item.highlights.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className='flex items-center space-x-2 text-xs font-medium text-slate-700'
                    >
                      <CheckCircle2 className='w-3.5 h-3.5 text-[#00A3E0] shrink-0' />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
