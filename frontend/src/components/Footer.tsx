import React from 'react';
import { ExternalLink, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { APPS } from '../config/apps';

export const Footer: React.FC = () => {
  return (
    <footer className='bg-[#005EB8] text-white pt-10 sm:pt-14 pb-8 sm:pb-10 border-t-4 border-[#004B87]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Main Grid */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-8 sm:pb-10 border-b border-white/20'>
          {/* Column 1: Institutional Brand & Contact Us (5 cols) */}
          <div className='md:col-span-5 space-y-3 sm:space-y-4'>
            <div className='flex items-center space-x-3'>
              <img
                src='/images/logo-2.png'
                alt='Logo STIKes Budi Luhur Cimahi'
                className='h-10 sm:h-12 w-auto object-contain brightness-0 invert'
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <p className='text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-md pt-0.5'>
              Institusi pendidikan tinggi kesehatan yang religius, berbudi luhur, dan unggul di
              tingkat internasional di bawah naungan Yayasan Pambudhi Luhur 1976.
            </p>

            <div className='space-y-2 text-xs text-sky-100/80 pt-1'>
              <div className='flex items-start space-x-2.5'>
                <MapPin className='w-4 h-4 text-[#fdc800] shrink-0 mt-0.5' />
                <span>Jl. Kerkof No. 243 Leuwigajah Cimahi 40532, Jawa Barat - Indonesia</span>
              </div>
              <div className='flex items-center space-x-2.5'>
                <Phone className='w-4 h-4 text-[#fdc800] shrink-0' />
                <a href='tel:(022)6674696' className='hover:text-[#fdc800] transition-colors py-1'>
                  Telp: (022) 667 4696 • WA: 081223634281
                </a>
              </div>
              <div className='flex items-center space-x-2.5'>
                <Mail className='w-4 h-4 text-[#fdc800] shrink-0' />
                <a
                  href='mailto:info@stikesbudiluhurcimahi.ac.id'
                  className='hover:text-[#fdc800] transition-colors py-1 truncate'
                >
                  info@stikesbudiluhurcimahi.ac.id
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Layanan Akademik & Portal Kampus (3 cols) */}
          <div className='md:col-span-3'>
            <h4 className='text-xs sm:text-sm font-bold text-[#fdc800] uppercase tracking-wider mb-3 sm:mb-4 border-b border-white/20 pb-1.5 inline-block'>
              Layanan Akademik
            </h4>
            <ul className='space-y-2 text-xs sm:text-sm text-sky-100'>
              <li>
                <a
                  href='https://pmb.stikesbudiluhurcimahi.ac.id/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#fdc800] transition-colors inline-flex items-center space-x-1.5 py-1 min-h-[36px]'
                >
                  <span>PMB Online (Penerimaan)</span>
                  <ExternalLink className='w-3 h-3 text-sky-300' />
                </a>
              </li>
              <li>
                <a
                  href='https://mahasiswa.stikesbudiluhurcimahi.ac.id'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#fdc800] transition-colors inline-flex items-center space-x-1.5 py-1 min-h-[36px]'
                >
                  <span>E-Academic Mahasiswa</span>
                  <ExternalLink className='w-3 h-3 text-sky-300' />
                </a>
              </li>
              <li>
                <a
                  href='https://stikesbudiluhurcimahi.ac.id/penelitian/perpustakaan'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#fdc800] transition-colors inline-flex items-center space-x-1.5 py-1 min-h-[36px]'
                >
                  <span>E-Library Perpustakaan</span>
                  <ExternalLink className='w-3 h-3 text-sky-300' />
                </a>
              </li>
              <li>
                <a
                  href='http://jurnal.stikesbudiluhurcimahi.ac.id/index.php/jkbl/issue/archive'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#fdc800] transition-colors inline-flex items-center space-x-1.5 py-1 min-h-[36px]'
                >
                  <span>E-Journal Kesehatan (JKBL)</span>
                  <ExternalLink className='w-3 h-3 text-sky-300' />
                </a>
              </li>
              <li>
                <a
                  href='https://stikesbudiluhurcimahi.ac.id/index/profil'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#fdc800] transition-colors inline-flex items-center space-x-1.5 py-1 min-h-[36px]'
                >
                  <span>Profil & Sejarah Institusi</span>
                  <ExternalLink className='w-3 h-3 text-sky-300' />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Tautan Ekosistem 3 Aplikasi (4 cols) */}
          <div className='md:col-span-4'>
            <h4 className='text-xs sm:text-sm font-bold text-[#fdc800] uppercase tracking-wider mb-3 sm:mb-4 border-b border-white/20 pb-1.5 inline-block'>
              Ekosistem 3 Aplikasi
            </h4>
            <ul className='space-y-2 text-xs sm:text-sm'>
              {APPS.map(app => (
                <li key={app.id}>
                  <a
                    href={app.loginUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 min-h-[44px]'
                  >
                    <div className='text-left'>
                      <span className='font-bold block text-xs'>{app.name}</span>
                      <span className='text-[11px] text-sky-200'>{app.tagline}</span>
                    </div>
                    <ExternalLink className='w-3.5 h-3.5 text-[#fdc800] shrink-0' />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar (Verified Copyright & Principles) */}
        <div className='pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-sky-200 gap-3 text-center sm:text-left'>
          <p>© 2019–2026 STIKes BUDILUHUR CIMAHI — All rights reserved.</p>
          <p className='text-sky-100'>
            Mencetak Tenaga Kesehatan yang Religius, Berbudi Luhur, dan Unggul di Tingkat
            Internasional.
          </p>
        </div>
      </div>
    </footer>
  );
};
