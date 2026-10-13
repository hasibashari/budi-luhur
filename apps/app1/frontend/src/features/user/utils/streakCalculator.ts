import { StreakResult } from '../types';

/**
 * Calculates dynamic streak count considering chronological date sequence.
 * - Sorts unique completed dates in descending order.
 * - Checks if the most recent completed date is within the active schedule window.
 * - Counts unbroken chain of consecutive dates based on schedule frequency (daily vs weekly).
 * - If a gap exceeds schedule tolerance or an expected date was missed, streak breaks.
 */
export async function calculateChronologicalStreak(
  completedDates: (string | Date)[],
  frequency: 'daily' | 'weekly' = 'weekly',
  now: Date = new Date(),
): Promise<StreakResult> {
  const isDaily = frequency === 'daily';
  const streakUnit: 'Hari' | 'Minggu' = isDaily ? 'Hari' : 'Minggu';

  if (!completedDates || completedDates.length === 0) {
    return { streakCount: 0, consecutiveDates: [], streakUnit, isActive: false };
  }

  // Normalize all dates to YYYY-MM-DD
  const dateSet = new Set<string>();
  completedDates.forEach(d => {
    if (!d) return;
    const str = typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0];
    dateSet.add(str);
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  if (sortedDates.length === 0) {
    return { streakCount: 0, consecutiveDates: [], streakUnit, isActive: false };
  }

  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const todayMs = new Date(todayStr + 'T00:00:00Z').getTime();

  const latestDateStr = sortedDates[0];
  const latestDateMs = new Date(latestDateStr + 'T00:00:00Z').getTime();
  const diffFromTodayDays = Math.round((todayMs - latestDateMs) / (1000 * 60 * 60 * 24));

  // Active window limits:
  // For daily: latest completed date should be today or yesterday (diff <= 1 day).
  // For weekly: latest completed date should be within the last 8 days (diff <= 8 days).
  const activeWindowLimit = isDaily ? 1 : 8;
  const maxGapDays = isDaily ? 1 : 8;

  // If latest completed date is within active window (or scheduled today/future):
  const isWithinActiveWindow = diffFromTodayDays <= activeWindowLimit;

  if (!isWithinActiveWindow) {
    return { streakCount: 0, consecutiveDates: [], streakUnit, isActive: false };
  }

  let streak = 1;
  const consecutiveDates: string[] = [sortedDates[0]];

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currMs = new Date(sortedDates[i] + 'T00:00:00Z').getTime();
    const prevMs = new Date(sortedDates[i + 1] + 'T00:00:00Z').getTime();
    const gapDays = Math.round((currMs - prevMs) / (1000 * 60 * 60 * 24));

    if (gapDays <= 0) {
      continue;
    }

    if (isDaily) {
      if (gapDays === 1) {
        streak++;
        consecutiveDates.push(sortedDates[i + 1]);
      } else {
        break;
      }
    } else {
      if (gapDays >= 1 && gapDays <= maxGapDays) {
        streak++;
        consecutiveDates.push(sortedDates[i + 1]);
      } else {
        break;
      }
    }
  }

  return {
    streakCount: streak,
    consecutiveDates,
    streakUnit,
    isActive: true,
  };
}
