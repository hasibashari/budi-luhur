import { User } from 'lucide-react';
import { AdminVerificationDetail } from '../../types/admin.types';

export interface VerificationBioCardProps {
  detail: AdminVerificationDetail;
}

export function VerificationBioCard({ detail }: VerificationBioCardProps) {
  return (
    <div className='p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5'>
      <span className='text-xs font-bold text-slate-800 flex items-center gap-1.5'>
        <User size={14} className='text-teal-600' />
        <span>Informasi Akseptor</span>
      </span>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs'>
        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Nama Lengkap
          </span>
          <span className='font-bold text-slate-900'>{detail.userName}</span>
        </div>

        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Email
          </span>
          <span className='font-medium text-slate-700 truncate block'>{detail.userEmail}</span>
        </div>

        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Nomor Telepon
          </span>
          <span className='font-medium text-slate-700'>{detail.userPhone}</span>
        </div>

        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Pilihan Pil KB
          </span>
          <span className='font-bold text-teal-700'>{detail.pillType || 'Pil KB Kombinasi'}</span>
        </div>

        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Faskes Rujukan
          </span>
          <span className='font-medium text-slate-800'>{detail.schoolOrOrg || '-'}</span>
        </div>

        <div>
          <span className='text-[10px] text-slate-400 block font-medium uppercase'>
            Biometrik
          </span>
          <span className='font-medium text-slate-700'>
            {detail.bloodType ? `Gol. ${detail.bloodType}` : '-'} •{' '}
            {detail.height ? `${detail.height} cm` : '-'} /{' '}
            {detail.weight ? `${detail.weight} kg` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

