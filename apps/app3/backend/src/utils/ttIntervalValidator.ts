/**
 * Validasi & peringatan interval imunisasi Tetanus Toxoid (TT).
 *
 * Aturan mengikuti pedoman interval medis:
 * - TT1 → TT2 : minimal 28 hari
 * - TT2 → TT3 : minimal 180 hari (6 bulan)
 * - TT3 → TT4 : minimal 365 hari (1 tahun)
 * - TT4 → TT5 : minimal 365 hari (1 tahun)
 *
 * Pelanggaran interval TIDAK memblokir penyimpanan (data historis pasien bisa
 * saja tidak ideal), tetapi dikembalikan sebagai `warnings` agar pengguna
 * mengonfirmasi sebelum menyimpan.
 */

export type TTDoseLevel = 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';

export const TT_DOSE_ORDER: TTDoseLevel[] = ['TT1', 'TT2', 'TT3', 'TT4', 'TT5'];

export const TT_MIN_INTERVAL: Record<
  Exclude<TTDoseLevel, 'TT1'>,
  { after: TTDoseLevel; days: number }
> = {
  TT2: { after: 'TT1', days: 28 },
  TT3: { after: 'TT2', days: 180 },
  TT4: { after: 'TT3', days: 365 },
  TT5: { after: 'TT4', days: 365 },
};

const MS_PER_DAY = 86_400_000;

export function isTTDoseLevel(value: unknown): value is TTDoseLevel {
  return typeof value === 'string' && TT_DOSE_ORDER.includes(value as TTDoseLevel);
}

/** Ambil bagian YYYY-MM-DD dari string date/timestamp apa pun. */
export function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : null;
}

function parseDateKey(value: string | null | undefined): Date | null {
  const key = toDateKey(value);
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function diffInDays(from: string | null | undefined, to: string | null | undefined): number | null {
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/** Tanggal hari ini (zona WIB) dalam format YYYY-MM-DD. */
export function todayWibKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export interface TTValidationInput {
  doseLevel: TTDoseLevel;
  vaccineDate: string;
  /** Tanggal pemberian dosis lain yang sudah tercatat (dose → YYYY-MM-DD). */
  existingDates?: Partial<Record<TTDoseLevel, string>>;
  dateOfBirth?: string | null;
  weddingDate?: string | null;
}

export interface TTValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateTTRecord(input: TTValidationInput): TTValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const vaccineKey = toDateKey(input.vaccineDate);
  if (!vaccineKey) {
    errors.push('Tanggal pemberian wajib berupa tanggal yang valid (YYYY-MM-DD).');
    return { errors, warnings };
  }

  if (vaccineKey > todayWibKey()) {
    errors.push('Tanggal pemberian tidak boleh melebihi hari ini.');
  }

  const dobKey = toDateKey(input.dateOfBirth);
  if (dobKey && vaccineKey < dobKey) {
    errors.push('Tanggal pemberian tidak boleh lebih awal dari tanggal lahir.');
  }

  const rule = input.doseLevel === 'TT1' ? null : TT_MIN_INTERVAL[input.doseLevel];
  if (rule) {
    const previousDate = input.existingDates?.[rule.after];
    if (!previousDate) {
      warnings.push(
        `Riwayat ${rule.after} belum tercatat. Interval minimal ${rule.days} hari menuju ${input.doseLevel} tidak dapat diverifikasi otomatis.`,
      );
    } else {
      const gap = diffInDays(previousDate, vaccineKey);
      if (gap !== null && gap < rule.days) {
        warnings.push(
          `Interval ${input.doseLevel} dari ${rule.after} baru ${gap} hari, sedangkan anjuran minimal ${rule.days} hari.`,
        );
      }
    }
  }

  // Untuk calon pengantin: TT2 idealnya tuntas minimal 30 hari sebelum akad.
  const weddingKey = toDateKey(input.weddingDate);
  if (input.doseLevel === 'TT2' && weddingKey) {
    const daysBeforeWedding = diffInDays(vaccineKey, weddingKey);
    if (daysBeforeWedding !== null && daysBeforeWedding < 30) {
      warnings.push(
        daysBeforeWedding < 0
          ? 'Tanggal TT2 berada setelah tanggal pernikahan. Perlindungan optimal sebaiknya terbentuk sebelum akad.'
          : `TT2 diberikan ${daysBeforeWedding} hari sebelum pernikahan. Idealnya minimal 30 hari sebelum akad agar perlindungan sudah terbentuk.`,
      );
    }
  }

  // Dosis tidak boleh melompati urutan (mis. TT4 tanpa TT3) — hanya peringatan.
  if (input.doseLevel !== 'TT1') {
    const previousDose = TT_DOSE_ORDER[TT_DOSE_ORDER.indexOf(input.doseLevel) - 1];
    if (previousDose && !input.existingDates?.[previousDose]) {
      const message = `Dosis ${previousDose} belum tercatat sebelum ${input.doseLevel}.`;
      if (!warnings.includes(message)) warnings.push(message);
    }
  }

  return { errors, warnings };
}
