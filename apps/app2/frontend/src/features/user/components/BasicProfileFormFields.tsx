import { Building2, Calendar, Droplets } from 'lucide-react';

export interface BasicProfileFormFieldsProps {
  schoolOrOrg: string;
  onSchoolOrOrgChange: (val: string) => void;
  dateOfBirth: string;
  onDateOfBirthChange: (val: string) => void;
  maxDate: string;
  bloodType: string;
  onBloodTypeChange: (val: string) => void;
  height: string;
  onHeightChange: (val: string) => void;
  weight: string;
  onWeightChange: (val: string) => void;
}

export function BasicProfileFormFields({
  schoolOrOrg,
  onSchoolOrOrgChange,
  dateOfBirth,
  onDateOfBirthChange,
  maxDate,
  bloodType,
  onBloodTypeChange,
  height,
  onHeightChange,
  weight,
  onWeightChange,
}: BasicProfileFormFieldsProps) {
  return (
    <>
      {/* Domisili / Faskes (Required) */}
      <div>
        <label className='block text-xs font-bold text-[#0F172A] mb-1.5'>
          Domisili / Faskes Rujukan <span className='text-[#0D9488]'>*</span>
        </label>
        <div className='relative flex items-center'>
          <div className='absolute left-3.5 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
            <Building2 size={15} />
          </div>
          <input
            type='text'
            placeholder='Contoh: Puskesmas Kebayoran Baru / Jakarta Selatan'
            value={schoolOrOrg}
            onChange={e => onSchoolOrOrgChange(e.target.value)}
            className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-12 sm:pl-13 pr-4 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
          />
        </div>
      </div>

      {/* Date of Birth & Blood Type */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5'>
        <div className='min-w-0'>
          <label className='block text-xs font-bold text-[#0F172A] mb-1.5 truncate'>
            Tanggal Lahir{' '}
            <span className='text-[#64748B] font-normal text-[10px] sm:text-[11px]'>
              (Opsional)
            </span>
          </label>
          <div className='relative flex items-center'>
            <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
              <Calendar size={13} />
            </div>
            <input
              type='date'
              value={dateOfBirth}
              max={maxDate}
              onChange={e => onDateOfBirthChange(e.target.value)}
              className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-2.5 sm:pr-3 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
            />
          </div>
        </div>

        <div className='min-w-0'>
          <label className='block text-xs font-bold text-[#0F172A] mb-1.5 truncate'>
            Gol. Darah{' '}
            <span className='text-[#64748B] font-normal text-[10px] sm:text-[11px]'>
              (Opsional)
            </span>
          </label>
          <div className='relative flex items-center'>
            <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
              <Droplets size={13} />
            </div>
            <select
              value={bloodType}
              onChange={e => onBloodTypeChange(e.target.value)}
              className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs cursor-pointer'
            >
              <option value=''>Pilih Golongan</option>
              <option value='A'>A</option>
              <option value='B'>B</option>
              <option value='AB'>AB</option>
              <option value='O'>O</option>
            </select>
          </div>
        </div>
      </div>

      {/* Height & Weight */}
      <div className='grid grid-cols-2 gap-2 sm:gap-3'>
        <div className='min-w-0'>
          <label className='block text-[11px] sm:text-xs font-bold text-[#0F172A] mb-1.5 truncate text-center sm:text-left'>
            Tinggi <span className='text-[#64748B] font-normal text-[10px]'>(cm)</span>
          </label>
          <input
            type='number'
            placeholder='158'
            value={height}
            onChange={e => onHeightChange(e.target.value)}
            className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs text-center'
          />
        </div>

        <div className='min-w-0'>
          <label className='block text-[11px] sm:text-xs font-bold text-[#0F172A] mb-1.5 truncate text-center sm:text-left'>
            Berat <span className='text-[#64748B] font-normal text-[10px]'>(kg)</span>
          </label>
          <input
            type='number'
            placeholder='48'
            value={weight}
            onChange={e => onWeightChange(e.target.value)}
            className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs text-center'
          />
        </div>
      </div>
    </>
  );
}

