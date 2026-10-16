import React from 'react';
import { Check, AlertCircle, Clock, Info, ShieldCheck } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { ActivityDateInfo } from '../api/consumptionRepository';

interface FullBlisterPackCalendarProps {
  activityMap: Record<string, ActivityDateInfo>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
  currentStreak?: number;
}

export const FullBlisterPackCalendar: React.FC<FullBlisterPackCalendarProps> = ({
  activityMap,
  selectedDate,
  onSelectDate,
  todayStr,
  todayStatus = 'pending',
  currentStreak = 0,
}) => {
  // Hitung pil ke berapa dalam siklus 28 hari saat ini
  const activePillIndex = ((currentStreak % 28) === 0 && currentStreak > 0 ? 28 : (currentStreak % 28) || 1);

  // Buat 28 butir pil (4 baris x 7 kolom)
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4, 5, 6];

  // Label hari standar blister
  const daysHeader = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <Card padding="md" className="border border-slate-200/90 shadow-xs bg-white">
      {/* Header Blister Pack Fisik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Kemasan Blister 28 Butir (Siklus Berjalan)
            </h3>
            <Badge variant="protected" size="sm">
              99% Proteksi Optimal
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikuti petunjuk arah panah blister secara teratur tanpa putus
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block shadow-xs" />
            <span className="font-medium">Pil Aktif (1-21)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="font-medium">Plasebo (22-28)</span>
          </div>
        </div>
      </div>

      {/* Grid Blister Pack 4 x 7 */}
      <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/50 border border-slate-200/80">
        {/* Header Nama Hari Kolom */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {daysHeader.map((d) => (
            <span key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </span>
          ))}
        </div>

        {/* 4 Baris Kemasan Blister */}
        <div className="space-y-2.5">
          {rows.map((rowIdx) => {
            const isRowPlacebo = rowIdx === 3;
            return (
              <div key={rowIdx} className="relative">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                  {cols.map((colIdx) => {
                    const pillNumber = rowIdx * 7 + colIdx + 1;
                    const isPlacebo = pillNumber > 21;
                    const isTodayPill = pillNumber === activePillIndex;
                    const isPastPill = pillNumber < activePillIndex;
                    
                    let pillState = 'upcoming';
                    if (isPastPill) {
                      pillState = 'taken';
                    } else if (isTodayPill) {
                      pillState = todayStatus === 'recorded' ? 'taken' : todayStatus === 'missed' ? 'missed' : 'today';
                    }

                    return (
                      <button
                        key={pillNumber}
                        type="button"
                        onClick={() => {
                          // Jika hari ini, pilih todayStr
                          if (isTodayPill) {
                            onSelectDate(todayStr);
                          }
                        }}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-center ${
                          isTodayPill
                            ? 'ring-2 ring-teal-500 bg-teal-50/40 border-teal-400 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                        }`}
                        title={`Pil ${pillNumber} - ${isPlacebo ? 'Plasebo (Bebas Hormon)' : 'Hormon Aktif'}`}
                      >
                        {/* Tablet Pill Shape */}
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                            pillState === 'taken'
                              ? isPlacebo
                                ? 'bg-slate-300 text-slate-700'
                                : 'bg-teal-600 text-white shadow-xs shadow-teal-600/30'
                              : pillState === 'today'
                              ? 'bg-orange-50 text-orange-600 border-2 border-orange-500 animate-pulse'
                              : pillState === 'missed'
                              ? 'bg-red-50 text-red-600 border-2 border-red-500'
                              : isPlacebo
                              ? 'bg-slate-100 text-slate-400 border border-dashed border-slate-300'
                              : 'bg-teal-50/70 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {pillState === 'taken' ? (
                            <Check size={13} strokeWidth={3} />
                          ) : pillState === 'missed' ? (
                            <AlertCircle size={13} />
                          ) : (
                            pillNumber
                          )}
                        </div>

                        {/* Indikator Baris/Keterangan */}
                        <span className={`text-[10px] mt-1 font-semibold ${
                          isTodayPill ? 'text-teal-700 font-extrabold' : 'text-slate-400'
                        }`}>
                          {isTodayPill ? 'Hari Ini' : `P${pillNumber}`}
                        </span>

                        {/* Arrow hint between pills */}
                        {colIdx < 6 && (
                          <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 pointer-events-none z-10">
                            →
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-teal-800 font-medium">
            <ShieldCheck size={14} className="text-teal-600 shrink-0" />
            <span>Baris 4 (Pil 22-28) adalah fase menstruasi alami tanpa penurunan proteksi.</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info size={12} className="text-slate-400 shrink-0" />
            <span>Klik nomor pil untuk detail konsumsi</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
