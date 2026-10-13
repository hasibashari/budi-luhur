/**
 * Helper utilities for reminder schedule dates and intervals
 */

export const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MONTHS_INDO = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function calculateNextSchedule(targetDayName: string, targetTime: string) {
  const now = new Date();
  const currentDayIndex = now.getDay();
  let targetDayIndex = INDO_DAYS.indexOf(targetDayName);
  if (targetDayIndex === -1) targetDayIndex = 6; // Default Sabtu

  let diff = targetDayIndex - currentDayIndex;
  if (diff < 0) diff += 7;
  if (diff === 0) {
    const [h, m] = targetTime.split(':').map(Number);
    const scheduleDate = new Date(now);
    scheduleDate.setHours(h || 8, m || 0, 0, 0);
    if (now.getTime() > scheduleDate.getTime()) {
      diff = 7;
    }
  }

  const nextDateObj = new Date(now);
  nextDateObj.setDate(now.getDate() + diff);

  const formattedNextDate = `${targetDayName}, ${nextDateObj.getDate()} ${MONTHS_INDO[nextDateObj.getMonth()]} ${nextDateObj.getFullYear()}`;

  return {
    nextDate: formattedNextDate,
    daysRemaining: diff,
  };
}
