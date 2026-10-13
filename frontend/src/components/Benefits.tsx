import React from 'react';
import { Zap, Brain, Shield, HeartPulse, Sparkles } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Bebas Gejala 5L',
      desc: 'Mencegah Lesu, Lelah, Letih, Lemah, dan Lalai sehingga tubuh selalu berenergi sepanjang hari di sekolah.',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Brain,
      title: 'Meningkatkan Konsentrasi',
      desc: 'Oksigenasi optimal ke otak membuat daya ingat, fokus belajar, dan prestasi akademik meningkat tajam.',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Daya Tahan Tubuh Kuat',
      desc: 'Zat besi esensial mendukung pembentukan sel darah merah yang memperkuat sistem imun tubuh dari penyakit.',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: HeartPulse,
      title: 'Investasi Masa Depan',
      desc: 'Mencegah anemia jangka panjang dan mempersiapkan generasi masa depan yang bebas risiko stunting.',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <section id="benefits" className="py-20 lg:py-28 bg-slate-50/70 border-y border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manfaat Penting</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kenapa Tablet Tambah Darah Begitu Penting?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Remaja putri kehilangan zat besi setiap siklus menstruasi. Konsumsi rutin 1 tablet setiap minggu sangat penting untuk menjaga kebugaran tubuh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
