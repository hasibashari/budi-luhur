/**
 * Helper: Calculates dynamic group streak based on members' combined chronological consumption logs.
 * - Collects unique completed dates across all group members.
 * - Checks if the latest completion is within the active tolerance window (<= 8 days).
 * - Counts unbroken chain of weekly intervals.
 */
export function calculateGroupChronologicalStreak(
  completedLogs: { userId: string; date: string | Date }[],
  totalMembers: number,
  now: Date = new Date(),
): number {
  if (!completedLogs || completedLogs.length === 0 || totalMembers === 0) {
    return 0;
  }

  // Normalize all dates to YYYY-MM-DD
  const dateSet = new Set<string>();
  completedLogs.forEach(log => {
    if (!log.date) return;
    const str =
      typeof log.date === 'string'
        ? log.date.split('T')[0]
        : new Date(log.date).toISOString().split('T')[0];
    dateSet.add(str);
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  if (sortedDates.length === 0) return 0;

  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const todayMs = new Date(todayStr + 'T00:00:00Z').getTime();

  const latestDateStr = sortedDates[0];
  const latestDateMs = new Date(latestDateStr + 'T00:00:00Z').getTime();
  const diffFromTodayDays = Math.round((todayMs - latestDateMs) / (1000 * 60 * 60 * 24));

  // If latest group consumption is older than 8 days, streak is broken
  if (diffFromTodayDays > 8) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currMs = new Date(sortedDates[i] + 'T00:00:00Z').getTime();
    const prevMs = new Date(sortedDates[i + 1] + 'T00:00:00Z').getTime();
    const gapDays = Math.round((currMs - prevMs) / (1000 * 60 * 60 * 24));

    if (gapDays <= 0) continue;
    if (gapDays >= 1 && gapDays <= 8) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
