import React from 'react';
import { Building2, CheckCircle2, MapPin, Clock, Pin, ExternalLink } from 'lucide-react';

export interface FaskesRujukanCardProps {
  faskesName?: string;
  className?: string;
  subtitle?: string;
  address?: string;
  hours?: string;
  distance?: string;
  googleMapsUrl?: string;
  mapImageUrl?: string;
}

export function FaskesRujukanCard({
  faskesName = '',
  className = '',
  subtitle = 'Tersinkron BPJS',
  address = '',
  hours = '',
  distance = '',
  googleMapsUrl = '',
  mapImageUrl = '',
}: FaskesRujukanCardProps) {
  return (
    <section aria-label='Faskes Rujukan Terpilih' className={className}>
      <div className='flex items-center justify-between mb-2.5 px-0.5'>
        <span className='text-sm sm:text-base font-bold text-[#121c2a]'>
          Faskes Rujukan Terpilih
        </span>
        <span className='text-[11px] text-[#aa294d] font-bold'>{subtitle}</span>
      </div>
      <div className='bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff] flex flex-col gap-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex gap-3 min-w-0'>
            <div className='w-11 h-11 rounded-xl bg-[#aff1d0]/50 flex items-center justify-center text-[#2a6950] shrink-0 shadow-2xs'>
              <Building2 size={24} />
            </div>
            <div className='flex flex-col min-w-0'>
              <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] truncate'>
                {faskesName || 'Belum dipilih'}
              </h3>
              <span className='text-[11px] text-[#574144] flex items-center gap-1 mt-0.5'>
                <CheckCircle2 size={13} className='text-[#2a6950] shrink-0' />
                <span className='truncate'>Faskes Utama Calon Pengantin</span>
              </span>
            </div>
          </div>
          {distance && (
            <div className='bg-[#eff4ff] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0'>
              <MapPin size={12} className='text-[#aa294d]' />
              <span className='text-[11px] text-[#121c2a] font-semibold'>{distance}</span>
            </div>
          )}
        </div>

        {hours && (
          <div className='flex items-center gap-2 bg-[#eff4ff]/60 px-3 py-2 rounded-xl text-xs text-[#574144]'>
            <Clock size={15} className='text-[#8b7074] shrink-0' />
            <span className='font-medium text-[11px]'>{hours}</span>
          </div>
        )}

        {/* Map Preview Banner */}
        {address && mapImageUrl && (
          <div
            className='w-full h-24 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-2.5 shadow-inner'
            style={{
              backgroundImage: `url('${mapImageUrl}')`,
            }}
          >
            <div className='absolute inset-0 bg-gradient-to-t from-[#121c2a]/80 via-transparent to-transparent' />
            <span className='relative text-[10px] text-white flex items-center gap-1 font-semibold truncate'>
              <Pin size={12} className='text-rose-300 shrink-0' />
              <span className='truncate'>{address}</span>
            </span>
          </div>
        )}

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full h-11 bg-white text-[#aa294d] border border-[#dee9fc] rounded-xl font-bold text-xs shadow-2xs hover:bg-[#eff4ff] active:scale-95 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer'
          >
            <ExternalLink size={16} />
            <span>Buka Petunjuk Arah di Google Maps</span>
          </a>
        )}
      </div>
    </section>
  );
}

export default FaskesRujukanCard;
