import type { TTDatePrecision, TTInfoSource } from '@/src/features/user/types';

const MONTHS_ID = [
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

/** Ambil bagian YYYY-MM-DD dari string tanggal/timestamp apa pun. */
export function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : null;
}

export function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

/** Format tanggal sesuai presisi yang benar-benar diketahui pengguna. */
export function formatTTDate(
  value: string | null | undefined,
  precision: TTDatePrecision = 'exact',
): string {
  const key = toDateKey(value);
  if (!key) return '-';
  const [year, month, day] = key.split('-').map(Number);

  if (precision === 'year') return String(year);
  if (precision === 'month') return `${MONTHS_ID[month - 1]} ${year}`;
  return `${day} ${MONTHS_ID[month - 1]} ${year}`;
}

export function formatDateTime(value: string | null | undefined): string {
  const key = toDateKey(value);
  if (!key) return '-';
  const date = formatTTDate(key, 'exact');
  const time = String(value).match(/T(\d{2}):(\d{2})/);
  return time ? `${date}, ${time[1]}.${time[2]} WIB` : date;
}

export const DATE_PRECISION_LABEL: Record<TTDatePrecision, string> = {
  exact: 'Tanggal pasti',
  month: 'Perkiraan bulan',
  year: 'Perkiraan tahun',
};

export const INFO_SOURCE_LABEL: Record<TTInfoSource, string> = {
  self_reported: 'Diisi mandiri oleh pengguna',
  faskes_record: 'Disalin dari buku KIA / KMS',
  health_worker: 'Dicatat tenaga kesehatan',
};

export function daysUntil(value: string | null | undefined): number | null {
  const key = toDateKey(value);
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const [ty, tm, td] = todayKey().split('-').map(Number);
  const now = Date.UTC(ty, tm - 1, td);
  return Math.round((target - now) / 86_400_000);
}

export function doseNumber(doseLevel: string): number {
  return Number(String(doseLevel).replace(/\D/g, '')) || 0;
}
