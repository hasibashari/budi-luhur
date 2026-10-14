import React from 'react';
import { Users, Building2, Globe, HeartHandshake, Award } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Users,
      title: 'Dosen Pakar & Praktisi',
      desc: 'Dosen berkualifikasi S2/S3 spesialis dengan pengalaman klinis aktif di RS rujukan nasional.',
      badgeColor: 'bg-blue-50 text-[#005EB8] border-blue-200',
      iconColor: 'text-[#005EB8]',
    },
    {
      icon: Building2,
      title: 'Laboratorium Mini Hospital',
      desc: 'Simulasi rumah sakit terpadu, lab keperawatan gerontik, dan lab kebidanan berteknologi modern.',
      badgeColor: 'bg-sky-50 text-[#00A3E0] border-sky-200',
      iconColor: 'text-[#00A3E0]',
    },
    {
      icon: Globe,
      title: 'Kemitraan Karir Global',
      desc: 'Penempatan kerja dan magang ke Jepang (program EPA) dan Jerman dengan kursus bahasa terarah.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-500',
    },
    {
      icon: HeartHandshake,
      title: 'Karakter Budi Luhur',
      desc: 'Pembinaan etika medis dan nilai religius untuk melahirkan nakes berintegritas dan berempati tinggi.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <section id="keunggulan" className="py-12 sm:py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <Award className="w-3.5 h-3.5 text-[#fdc800]" />
            <span>Keunggulan Institusi</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#202020] tracking-tight">
            Mengapa Memilih STIKes Budi Luhur?
          </h2>
          <div className="title-accent-blue" />
          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-[#444444] leading-relaxed">
            Kurikulum mutakhir, praktik rumah sakit komprehensif, dan jejaring karir internasional bagi lulusan siap kerja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="card-academic p-4 sm:p-6 lg:p-7 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl ${item.badgeColor} border flex items-center justify-center mb-4 sm:mb-5`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#202020] mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
