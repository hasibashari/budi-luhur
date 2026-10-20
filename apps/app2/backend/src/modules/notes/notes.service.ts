import db from '../../config/database.js';

export type HealthLogInput = {
  logDate: string;
  mood: 'sedih' | 'murung' | 'biasa_saja' | 'bahagia';
  pain: 'tidak_ada' | 'ringan' | 'sedang' | 'berat';
  bleeding: 'haid_normal' | 'haid_banyak' | 'flek' | 'tidak_ada';
  sideEffects: string[];
  weightStatus: 'stabil' | 'naik' | 'turun';
  weightKg: string;
  notes: string;
};

export class NotesService {
  static async getLogs(userId: string) {
    const result = await db.query(
      `SELECT id, log_date, mood, pain, bleeding, side_effects, weight_status,
              weight_kg, notes, updated_at
       FROM daily_health_logs
       WHERE user_id = $1
       ORDER BY log_date DESC`,
      [userId],
    );

    return result.rows.map(row => ({
      id: row.id,
      logDate: row.log_date instanceof Date ? row.log_date.toISOString().slice(0, 10) : row.log_date,
      mood: row.mood,
      pain: row.pain,
      bleeding: row.bleeding,
      sideEffects: row.side_effects || ['tidak_ada'],
      weightStatus: row.weight_status,
      weightKg: row.weight_kg == null ? '' : String(row.weight_kg),
      notes: row.notes || '',
      updatedAt: new Date(row.updated_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    }));
  }

  static async upsertLog(userId: string, input: HealthLogInput) {
    const id = `health_${userId}_${input.logDate}`;
    const result = await db.query(
      `INSERT INTO daily_health_logs
        (id, user_id, log_date, mood, pain, bleeding, side_effects, weight_status, weight_kg, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULLIF($9, '')::NUMERIC, $10)
       ON CONFLICT (user_id, log_date) DO UPDATE SET
         mood = EXCLUDED.mood,
         pain = EXCLUDED.pain,
         bleeding = EXCLUDED.bleeding,
         side_effects = EXCLUDED.side_effects,
         weight_status = EXCLUDED.weight_status,
         weight_kg = EXCLUDED.weight_kg,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, log_date, mood, pain, bleeding, side_effects, weight_status, weight_kg, notes, updated_at`,
      [
        id,
        userId,
        input.logDate,
        input.mood,
        input.pain,
        input.bleeding,
        input.sideEffects,
        input.weightStatus,
        input.weightKg,
        input.notes,
      ],
    );
    const row = result.rows[0];
    return {
      id: row.id,
      logDate: row.log_date instanceof Date ? row.log_date.toISOString().slice(0, 10) : row.log_date,
      mood: row.mood,
      pain: row.pain,
      bleeding: row.bleeding,
      sideEffects: row.side_effects,
      weightStatus: row.weight_status,
      weightKg: row.weight_kg == null ? '' : String(row.weight_kg),
      notes: row.notes || '',
      updatedAt: new Date(row.updated_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    };
  }
}
