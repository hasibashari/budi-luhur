import { ConsumptionLog } from '../types';

export interface WeeklyAdherencePoint {
  week: number; // 1, 2, 3, 4, 5
  label: string; // 'M1', 'M2', 'M3', 'M4', 'M5'
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
  targetDoses?: number; // Target total dosis aktif dalam bulan ini
  targetCumulative?: number; // Target kumulatif dosis aktif s/d minggu ini (misal M3 = 1, M4 = 2)
  totalWeeksInMonth?: number; // Jumlah total minggu dalam bulan ini (4 atau 5)
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
 * Menghasilkan rentang minggu dinamis berdasarkan bulan (4 atau 5 minggu).
 * Bulan dengan > 28 hari (seperti Oktober, 31 hari) memiliki 5 minggu (M1 - M5).
 */
export function getMonthWeekRanges(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ranges = [
    { week: 1, startDay: 1, endDay: 7 },
    { week: 2, startDay: 8, endDay: 14 },
    { week: 3, startDay: 15, endDay: 21 },
    { week: 4, startDay: 22, endDay: 28 },
  ];
  if (daysInMonth > 28) {
    ranges.push({ week: 5, startDay: 29, endDay: daysInMonth });
  }
  return ranges;
}

/**
 * Menghitung kepatuhan mingguan (M1 - M4 / M5) secara dinamis & progresif.
 *
 * Contoh logika progresif:
 * - Jika mulai di M3 dan minum 1 kali: target kumulatif di M3 adalah 1 dosis ➔ 1/1 = 100%.
 * - Saat masuk M4: target kumulatif bertambah jadi 2 dosis. Jika belum minum di M4 ➔ 1/2 = 50%.
 * - Setelah minum di M4 ➔ 2/2 = 100%.
 * - Minggu masa depan (misal M5 jika belum tgl 29) berstatus UPCOMING ('-').
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
  const monthShort = MONTH_NAMES_SHORT[month] || '';

  // Definisikan rentang minggu dinamis (4 atau 5 minggu tergantung jumlah hari bulan ini)
  const weekRanges = getMonthWeekRanges(year, month);

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
    // Minggu masa depan murni
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

  // Tentukan target total dosis aktif bulan ini (minggu yang bukan lampau kosong)
  const activeWeeks = weekLogsInfo.filter(w => !w.isPastEmpty);
  const totalActiveTarget = Math.max(1, activeWeeks.length);

  let runningCompleted = 0;
  let runningMissed = 0;
  let runningActiveWeeks = 0;
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
    let targetCumulative = 0;

    if (isPastEmpty) {
      // Minggu lampau sebelum pengguna mulai/ada jadwal
      status = 'UPCOMING';
    } else if (isUpcoming) {
      // Minggu masa depan yang belum tiba
      status = 'UPCOMING';
    } else {
      // Minggu aktif yang sudah berjalan atau sedang berjalan saat ini
      runningActiveWeeks += 1;
      targetCumulative = runningActiveWeeks;
      runningCompleted += completedCount;
      runningMissed += missedCount;

      // Kepatuhan progresif berjalan:
      // (Dosis diminum s/d minggu ini / Target kumulatif minggu aktif s/d minggu ini) * 100% - penalti terlewat
      const basePercentage = (runningCompleted / targetCumulative) * 100;
      const rawPercentage = Math.round(basePercentage - runningMissed * 10);
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
      targetDoses: totalActiveTarget,
      targetCumulative,
      totalWeeksInMonth: weekRanges.length,
      isInactive: isPastEmpty,
    };
  });
}
