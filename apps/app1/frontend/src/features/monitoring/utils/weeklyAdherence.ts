import { ConsumptionLog } from '../types';

export interface WeeklyAdherencePoint {
  week: number; // 1, 2, 3, 4
  label: string; // 'M1', 'M2', 'M3', 'M4'
  fullLabel: string; // 'Minggu 1', 'Minggu 2', ...
  dateRange: string; // '1 - 7 Okt', '8 - 14 Okt', dst.
  startDate: string; // 'YYYY-MM-01'
  endDate: string; // 'YYYY-MM-07'
  scheduledCount: number; // Jadwal jatuh tempo di minggu ini
  completedCount: number; // Jadwal diminum (ON_TIME, LATE) di minggu ini
  missedCount: number; // Jadwal terlewat (MISSED, SKIPPED) di minggu ini
  cumulativeCompleted: number; // Akumulatif dosis diminum s/d minggu ini
  cumulativeMissed: number; // Akumulatif dosis terlewat s/d minggu ini
  percentage: number | null; // Persentase kepatuhan progresif (0 - 100%), null jika belum tiba
  delta: number | null; // Perubahan dibanding minggu sebelumnya (+25%, -10%, dst.)
  isUpcoming: boolean; // True jika minggu ini di masa depan dan belum ada aktivitas
  isCurrent: boolean; // True jika tanggal hari ini berada di rentang minggu ini
  status: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'UPCOMING';
}

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Menghitung kepatuhan mingguan (M1 - M4) dari kecil ke atas (0% -> 100%)
 * berdasarkan data konsumsi aktual dan target bulanan 4 dosis TTD.
 *
 * Formula:
 * Target 4 dosis (masing-masing 25%).
 * Persentase = (cumulativeCompleted / 4 * 100%) - (cumulativeMissed * 10%)
 * dengan batas [0%, 100%].
 */
export function calculateWeeklyAdherence(
  logs: ConsumptionLog[] = [],
  referenceDateStr?: string,
): WeeklyAdherencePoint[] {
  // Ambil referensi tanggal hari ini (default Asia/Jakarta)
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthShort = MONTH_NAMES_SHORT[month] || '';

  // Definisikan 4 rentang tanggal minggu
  const weekRanges = [
    { week: 1, startDay: 1, endDay: 7 },
    { week: 2, startDay: 8, endDay: 14 },
    { week: 3, startDay: 15, endDay: 21 },
    { week: 4, startDay: 22, endDay: daysInMonth },
  ];

  // Helper format YYYY-MM-DD
  const formatYMD = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  let runningCompleted = 0;
  let runningMissed = 0;
  let previousPercentage: number | null = null;

  return weekRanges.map(wr => {
    const startDate = formatYMD(wr.startDay);
    const endDate = formatYMD(wr.endDay);
    const dateRange = `${wr.startDay} - ${wr.endDay} ${monthShort}`;

    // Filter log aktual pengguna yang jatuh di rentang minggu ini
    const logsInWeek = logs.filter(log => {
      if (!log.scheduledDate) return false;
      return log.scheduledDate >= startDate && log.scheduledDate <= endDate;
    });

    const completedCount = logsInWeek.filter(
      l => l.status === 'ON_TIME' || l.status === 'LATE',
    ).length;
    const missedCount = logsInWeek.filter(
      l => l.status === 'MISSED' || l.status === 'SKIPPED',
    ).length;
    const scheduledCount = completedCount + missedCount;

    // Evaluasi apakah minggu ini berada di masa depan
    const isUpcoming = todayDate < wr.startDay && scheduledCount === 0;
    const isCurrent = todayDate >= wr.startDay && todayDate <= wr.endDay;

    let percentage: number | null = null;
    let delta: number | null = null;
    let status: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'UPCOMING' = 'UPCOMING';

    if (!isUpcoming) {
      runningCompleted += completedCount;
      runningMissed += missedCount;

      // Formula kepatuhan dari kecil ke atas (0 - 100%)
      // Dimulai dari 0, setiap dosis menambah +25%, dan setiap dosis terlewat mengurangi 10%
      const rawPercentage = Math.round((runningCompleted / 4) * 100 - runningMissed * 10);
      percentage = Math.max(0, Math.min(100, rawPercentage));

      if (previousPercentage !== null) {
        delta = percentage - previousPercentage;
      }
      previousPercentage = percentage;

      if (percentage >= 60) {
        status = 'OPTIMAL';
      } else if (percentage >= 30) {
        status = 'MODERATE';
      } else {
        status = 'LOW';
      }
    }

    return {
      week: wr.week,
      label: `M${wr.week}`,
      fullLabel: `Minggu ${wr.week}`,
      dateRange,
      startDate,
      endDate,
      scheduledCount,
      completedCount,
      missedCount,
      cumulativeCompleted: runningCompleted,
      cumulativeMissed: runningMissed,
      percentage,
      delta,
      isUpcoming,
      isCurrent,
      status,
    };
  });
}
