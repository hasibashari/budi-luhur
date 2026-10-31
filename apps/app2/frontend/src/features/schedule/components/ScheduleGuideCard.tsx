import React from 'react';
import { ShieldCheck, Check, Bell } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';

export function ScheduleGuideCard() {
  return (
    <div className='flex flex-col gap-4'>
      {/* Panduan Jadwal Harian */}
      <Card padding='md' className='bg-teal-50/60 border-teal-100'>
        <div className='flex items-center gap-2 text-sm font-bold text-teal-900 mb-3'>
          <div className='w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0'>
            <ShieldCheck size={15} />
          </div>
          <h4>Panduan Jadwal Harian</h4>
        </div>
        <ul className='space-y-2.5 text-xs text-teal-800/80 leading-relaxed'>
          <li className='flex items-start gap-2'>
            <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
            <span>Pilih jam yang mudah kamu ingat dan konsisten setiap harinya.</span>
          </li>
          <li className='flex items-start gap-2'>
            <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
            <span>
              Aktifkan pengingat 15 menit sebelumnya agar kamu punya waktu persiapan.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
            <span>Kamu bisa memiliki lebih dari satu jadwal harian sesuai kebutuhan.</span>
          </li>
        </ul>
      </Card>

      {/* Info Cara Kerja */}
      <Card padding='md' className='bg-slate-50 border border-slate-200/80'>
        <div className='flex items-start gap-3'>
          <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5'>
            <Bell size={16} />
          </div>
          <div>
            <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
              Cara Kerja Pengingat Harian
            </h4>
            <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
              Setiap jadwal aktif akan membunyikan notifikasi pengingat tepat pada jam yang
              kamu tentukan setiap hari. Kamu bisa mematikan atau menghapus jadwal kapan saja.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

