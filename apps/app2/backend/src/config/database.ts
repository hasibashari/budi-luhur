import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env.js';

const connectionString = config.databaseUrl?.trim();

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured.');
}

// Remove channel_binding only if required by your pg version.
const normalizedConnectionString = connectionString
  .replace(/[?&]channel_binding=[^&]+/g, match => (match.startsWith('?') ? '?' : ''))
  .replace(/\?&/, '?')
  .replace(/[?&]$/, '');

export const pool = new Pool({
  connectionString: normalizedConnectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', err => {
  console.error('Unexpected PostgreSQL idle client error:', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Transaction rollback failed:', rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    console.log('PostgreSQL connected successfully.');
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}

export const db = {
  pool,
  query,
  transaction,
};

export default db;
