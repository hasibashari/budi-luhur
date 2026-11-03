import { BellOff, Plus } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';

export interface ScheduleEmptyStateProps {
  onAdd: () => void;
}

export function ScheduleEmptyState({ onAdd }: ScheduleEmptyStateProps) {
  return (
    <Card
      padding='lg'
      className='text-center py-10 sm:py-14 border-2 border-dashed border-teal-200 bg-teal-50/20 rounded-3xl'
    >
      <div className='w-16 h-16 rounded-3xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4 shadow-sm'>
        <BellOff size={32} />
      </div>
      <h3 className='text-lg font-black text-slate-900 tracking-tight'>
        Belum Ada Jadwal Harian ⏰
      </h3>
      <p className='text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed'>
        Kamu belum mengaktifkan alarm pengingat. Tambahkan jadwal harian sekarang agar Pilluna dapat
        mengingatkanmu minum Pil KB secara rutin tepat waktu setiap hari.
      </p>

      <div className='flex items-center justify-center'>
        <Button
          variant='primary'
          size='md'
          shape='pill'
          icon={<Plus size={16} />}
          onClick={onAdd}
          className='font-bold shadow-md shadow-teal-500/20 text-xs px-6 py-2.5'
        >
          Buat Jadwal Pertama
        </Button>
      </div>
    </Card>
  );
}

