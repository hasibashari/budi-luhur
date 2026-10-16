import React from 'react';
import { CalendarDays, Check, Clock, AlertCircle, Info } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';

interface ActiveBlisterStripWidgetProps {
  streakCount: number;
  todayStatus: 'recorded' | 'missed' | 'pending';
  consecutiveDates?: string[];
  currentPillDay?: number; // 1 to 28
}

export const ActiveBlisterStripWidget: React.FC<ActiveBlisterStripWidgetProps> = ({
  streakCount,
  todayStatus,
  currentPillDay: initialPillDay,
}) => {
  // Hitung nomor butir pil aktif dalam siklus kemasan 28 butir
  // Default: hitung dari streak atau hari ini (modulo 28)
  const currentPillDay = initialPillDay || ((streakCount % 28) === 0 && streakCount > 0 ? 28 : (streakCount % 28) || 1);
  const isPlaceboWeek = currentPillDay > 21;

  // Nama-nama hari untuk strip 7 hari berjalan
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  // Tentukan jendela 7 hari (minggu saat ini di blister)
  const currentWeekIndex = Math.floor((currentPillDay - 1) / 7); // 0, 1, 2, atau 3
  const startDayOfWeek = currentWeekIndex * 7 + 1;

  const currentWeekPills = Array.from({ length: 7 }, (_, i) => {
    const pillNum = startDayOfWeek + i;
    const isPlacebo = pillNum > 21;
    const isToday = pillNum === currentPillDay;
    const isPast = pillNum < currentPillDay;
    const isFuture = pillNum > currentPillDay;

    let status: 'taken' | 'today-pending' | 'today-taken' | 'missed' | 'upcoming' = 'upcoming';
    if (isPast) {
      status = 'taken';
    } else if (isToday) {
      status = todayStatus === 'recorded' ? 'today-taken' : todayStatus === 'missed' ? 'missed' : 'today-pending';
    } else {
      status = 'upcoming';
    }

    return {
      dayName: dayNames[i],
      pillNum,
      isPlacebo,
      isToday,
      status,
    };
  });

  return (
    <Card padding="md" className="border border-slate-200/80 shadow-xs bg-white">
      {/* Header Widget */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <CalendarDays size={18} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Strip Kemasan Aktif (Minggu ke-{currentWeekIndex + 1})
              </h3>
              {isPlaceboWeek ? (
                <Badge variant="placebo" size="sm">Fase Plasebo</Badge>
              ) : (
                <Badge variant="protected" size="sm">Fase Aktif</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Butir ke-{currentPillDay} dari total 28 butir kemasan blister
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock size={13} className="text-teal-600" />
          <span className="font-semibold text-slate-700">Rutinitas: 20:00 WIB</span>
        </div>
      </div>

      {/* Visual Strip 7 Butir */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 py-2">
        {currentWeekPills.map((pill) => {
          let pillBg = 'bg-slate-100 text-slate-400 border-slate-200';
          let statusIcon = null;

          if (pill.status === 'taken' || pill.status === 'today-taken') {
            pillBg = pill.isPlacebo 
              ? 'bg-slate-200 text-slate-700 border-slate-300' 
              : 'bg-teal-600 text-white border-teal-600 shadow-xs shadow-teal-600/30';
            statusIcon = <Check size={12} strokeWidth={3} />;
          } else if (pill.status === 'today-pending') {
            pillBg = 'bg-orange-50 text-orange-600 border-2 border-orange-500 animate-pulse';
            statusIcon = <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />;
          } else if (pill.status === 'missed') {
            pillBg = 'bg-red-50 text-red-600 border-red-300';
            statusIcon = <AlertCircle size={12} />;
          } else {
            // upcoming
            pillBg = pill.isPlacebo 
              ? 'bg-slate-50 text-slate-400 border-dashed border-slate-300' 
              : 'bg-teal-50/60 text-teal-700 border-teal-200/70';
          }

          return (
            <div
              key={pill.pillNum}
              className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${
                pill.isToday ? 'ring-2 ring-teal-500/20 bg-teal-50/20' : ''
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                pill.isToday ? 'text-teal-700 font-extrabold' : 'text-slate-400'
              }`}>
                {pill.dayName}
              </span>

              {/* Bentuk Tablet / Pil Fisik */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-transform ${pillBg}`}
                title={`Pil ke-${pill.pillNum} (${pill.isPlacebo ? 'Plasebo' : 'Hormon Aktif'})`}
              >
                {statusIcon || pill.pillNum}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 font-medium">
                P{pill.pillNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keterangan & Indikator Medis */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <span>21 Pil Hormon Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>7 Pil Plasebo (Bebas Hormon)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-teal-700 font-medium text-[11px] bg-teal-50/70 px-2.5 py-1 rounded-md">
          <Info size={12} className="shrink-0" />
          <span>Jangan lewatkan urutan panah blister</span>
        </div>
      </div>
    </Card>
  );
};
