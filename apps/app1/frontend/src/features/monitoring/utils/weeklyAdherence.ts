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
  targetDoses?: number; // Target dosis aktif dalam bulan ini
  isInactive?: boolean; // True jika minggu lampau sebelum jadwal/pengguna mulai
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
 * berdasarkan data konsumsi aktual dan target bulanan yang aktif.
 *
 * Formula dinamis:
 * Jika pengguna baru mulai di pertengahan bulan (misal M3-M4 tersisa 2 minggu),
 * target bulanan disesuaikan menjadi 2 dosis (masing-masing 50%).
 * Minggu lampau sebelum jadwal/catatan dibuat tidak dihitung sebagai kewajiban.
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

  // Identifikasi log dan status untuk masing-masing minggu terlebih dahulu
  const weekLogsInfo = weekRanges.map(wr => {
    const startDate = formatYMD(wr.startDay);
    const endDate = formatYMD(wr.endDay);

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

    // Minggu lampau tanpa catatan/jadwal sama sekali (sebelum jadwal dibuat/sebelum user isi)
    const isPastEmpty = todayDate > wr.endDay && scheduledCount === 0;
    // Minggu masa depan
    const isUpcoming = todayDate < wr.startDay && scheduledCount === 0;
    // Minggu berjalan
    const isCurrent = todayDate >= wr.startDay && todayDate <= wr.endDay;

    return {
      wr,
      startDate,
      endDate,
      completedCount,
      missedCount,
      scheduledCount,
      isPastEmpty,
      isUpcoming,
      isCurrent,
    };
  });

  // Tentukan target dosis aktif bulan ini.
  // Jika 2 minggu pertama belum ada jadwal/log (misal user baru mulai di M3),
  // target yang dibebankan hanyalah minggu-minggu aktif (misal 2 dosis).
  const activeWeeks = weekLogsInfo.filter(w => !w.isPastEmpty);
  const targetDoses = Math.max(1, activeWeeks.length);
  const doseWeight = 100 / targetDoses;

  let runningCompleted = 0;
  let runningMissed = 0;
  let previousPercentage: number | null = null;

  return weekLogsInfo.map(info => {
    const {
      wr,
      startDate,
      endDate,
      completedCount,
      missedCount,
      scheduledCount,
      isPastEmpty,
      isUpcoming,
      isCurrent,
    } = info;
    const dateRange = `${wr.startDay} - ${wr.endDay} ${monthShort}`;

    let percentage: number | null = null;
    let delta: number | null = null;
    let status: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'UPCOMING' = 'UPCOMING';

    if (isPastEmpty) {
      // Minggu lampau sebelum pengguna mulai/ada jadwal
      status = 'UPCOMING';
    } else if (!isUpcoming) {
      runningCompleted += completedCount;
      runningMissed += missedCount;

      // Formula kepatuhan dari kecil ke atas (0 - 100%) berdasarkan target dosis aktif
      const rawPercentage = Math.round(runningCompleted * doseWeight - runningMissed * 10);
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
      isUpcoming: isUpcoming || isPastEmpty,
      isCurrent,
      status,
      targetDoses,
      isInactive: isPastEmpty,
    };
  });
}
