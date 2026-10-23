import React from 'react';
import { Settings, ShieldCheck, Database, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import type { NavMenuId } from '../components/Sidebar';

interface PengaturanViewProps {
  onNavigate: (menu: NavMenuId) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ onNavigate }) => {
  return (
    <div className='max-w-3xl mx-auto px-6 py-8 space-y-8'>
      {/* Header Halaman Pengaturan */}
      <div className='border-b border-gray-100 pb-5'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#005EB8] text-xs font-semibold mb-2'>
          <Settings className='w-3.5 h-3.5' />
          <span>Pengaturan & Sistem</span>
        </div>
        <h2 className='text-2xl font-bold text-gray-900'>Pengaturan Aplikasi SIBIRU</h2>
        <p className='text-sm text-gray-600 mt-1 leading-relaxed'>
          Informasi profil kelembagaan, arsitektur basis data, dan status operasional sistem
          Aplikasi SIBIRU.
        </p>
      </div>

      {/* Profil Institusi STIKes Budi Luhur */}
      <section className='p-5 rounded-2xl bg-gradient-to-br from-[#004B87] to-[#005EB8] text-white shadow-md space-y-3.5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs'>
            <img src='/images/sibiru.png' alt='Logo SIBIRU' className='w-full h-full object-contain' />
          </div>
          <div>
            <h4 className='text-sm font-bold text-white leading-tight'>Aplikasi SIBIRU</h4>
            <p className='text-[11px] text-sky-200'>STIKes Budi Luhur Cimahi</p>
          </div>
        </div>

        <span className='inline-block text-[10px] uppercase font-bold tracking-wider text-[#fdc800] bg-white/10 px-2 py-0.5 rounded-md'>
          Visi Institusi 2040
        </span>
        <h3 className='text-base sm:text-lg font-bold leading-snug'>
          "Menjadi Perguruan Tinggi yang Religius, Berbudi Luhur, dan Unggul di Tingkat
          Internasional Tahun 2040."
        </h3>
        <p className='text-xs text-sky-100/90 leading-relaxed'>
          STIKes Budi Luhur Cimahi di bawah naungan Yayasan Pambudhi Luhur 1976 menyelenggarakan
          pendidikan tenaga kesehatan profesional dan berdaya saing global.
        </p>
      </section>

      {/* Status Isolasi Data & Sesi */}
      <section className='space-y-3'>
        <div className='flex items-center gap-2'>
          <ShieldCheck className='w-4 h-4 text-blue-600' />
          <h3 className='text-base font-bold text-gray-800'>Isolasi Data & Sesi Mandiri</h3>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs'>
          <div className='p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
            <span className='font-bold text-gray-800 block'>FEMORY</span>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <Database className='w-3.5 h-3.5 text-blue-600' />
              <span>fe_tablet_app1</span>
            </div>
            <p className='text-[11px] text-gray-500'>Sesi: app1_auth_token</p>
          </div>

          <div className='p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
            <span className='font-bold text-gray-800 block'>PILLUNA</span>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <Database className='w-3.5 h-3.5 text-blue-600' />
              <span>fe_tablet_app2</span>
            </div>
            <p className='text-[11px] text-gray-500'>Sesi: app2_auth_token</p>
          </div>

          <div className='p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
            <span className='font-bold text-gray-800 block'>PRELUNA</span>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <Database className='w-3.5 h-3.5 text-blue-600' />
              <span>fe_tablet_app3</span>
            </div>
            <p className='text-[11px] text-gray-500'>Sesi: app3_auth_token</p>
          </div>
        </div>
      </section>

      {/* Kontak & Alamat Kampus */}
      <section className='p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3'>
        <h3 className='text-sm font-bold text-gray-800'>Kontak Resmi Kampus</h3>
        <div className='space-y-2 text-xs text-gray-600'>
          <div className='flex items-start gap-2'>
            <MapPin className='w-4 h-4 text-[#005EB8] shrink-0 mt-0.5' />
            <span>
              Jl. Kerkof No. 243, Leuwigajah, Cimahi Selatan, Kota Cimahi 40532, Jawa Barat
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Phone className='w-4 h-4 text-[#005EB8] shrink-0' />
            <a href='tel:(022)6674696' className='hover:text-[#005EB8] transition-colors'>
              (022) 667 4696 • WA: 081223634281
            </a>
          </div>
          <div className='flex items-center gap-2'>
            <Mail className='w-4 h-4 text-[#005EB8] shrink-0' />
            <a
              href='mailto:info@stikesbudiluhurcimahi.ac.id'
              className='hover:text-[#005EB8] transition-colors'
            >
              info@stikesbudiluhurcimahi.ac.id
            </a>
          </div>
        </div>

        <div className='pt-2'>
          <a
            href='https://stikesbudiluhurcimahi.ac.id/index/profil'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 text-xs font-semibold text-[#005EB8] hover:underline'
          >
            <span>Kunjungi Website Resmi STIKes Budi Luhur</span>
            <ExternalLink className='w-3 h-3' />
          </a>
        </div>
      </section>

      {/* Navigasi Cepat Kembali */}
      <div className='pt-4 text-center'>
        <button
          onClick={() => onNavigate('beranda')}
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#005EB8] transition-colors py-2 px-4 rounded-xl hover:bg-blue-50'
        >
          <span>← Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
};

export default PengaturanView;
