import React from 'react';
import { Bell, Users, Bot, BarChart3, CheckCircle } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Bell,
      title: 'Pengingat Mingguan Cerdas',
      desc: 'Notifikasi otomatis di hari dan jam yang dipilih pengguna. Dilengkapi sistem pencatatan minum obat dengan satu sentuhan.',
      highlights: ['Hero reminder interaktif', 'Pencatatan tepat waktu & terlambat', 'Histori kalender 3-tab'],
      color: 'bg-rose-500 text-white',
    },
    {
      icon: Users,
      title: 'Sahabat Sehat & Streak Group',
      desc: 'Bangun kebiasaan sehat bersama teman sekolah melalui kode grup unik, papan peringkat kepatuhan, dan kirim emoji penyemangat.',
      highlights: ['Group streak monitoring', 'Kirim cheer semangat', 'Saling mengingatkan tanpa canggung'],
      color: 'bg-fuchsia-500 text-white',
    },
    {
      icon: Bot,
      title: 'Tanya Sahabat Sehat (AI Gemini)',
      desc: 'Asisten virtual cerdas yang siap menjawab pertanyaan seputar menstruasi, nutrisi zat besi, dan efek samping TTD kapan saja.',
      highlights: ['Respons medis tervalidasi', 'Gaya bahasa ramah remaja', 'Tersedia 24/7 tanpa antre'],
      color: 'bg-pink-500 text-white',
    },
    {
      icon: BarChart3,
      title: 'Portal Khusus Fasilitator & UKS',
      desc: 'Bagi guru pembina UKS dan petugas kesehatan puskesmas untuk memantau tren kepatuhan agregat dan mengirim pengingat langsung.',
      highlights: ['Analitik kepatuhan sekolah', 'Deteksi siswi berisiko anemia', 'Kirim WhatsApp reminder cepat'],
      color: 'bg-slate-800 text-white',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
            <span>Fitur Lengkap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dirancang Khusus untuk Gaya Hidup Remaja
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Menggabungkan pendekatan medis yang akurat dengan gamifikasi sosial yang menyenangkan agar minum tablet tambah darah menjadi rutinitas alami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-3xl p-8 bg-slate-50/80 border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="space-y-2 border-t border-slate-200/60 pt-4">
                  {item.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 shrink-0" />
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
