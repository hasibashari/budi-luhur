import dns from 'dns';
import net from 'net';
import pg from 'pg';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env.js';

const { Pool } = pg;
export type { PoolClient, QueryResult, QueryResultRow };

// Parse PostgreSQL DATE type (OID 1082) as raw string 'YYYY-MM-DD'
// to avoid local timezone offset shifting the date to the previous day.
pg.types.setTypeParser(1082, (val: string) => val);

// Prioritize IPv4 and disable autoSelectFamily (Happy Eyeballs) to avoid ETIMEDOUT
// on high-latency cloud connections (e.g. Neon serverless in US) where handshake > 250ms
try {
  dns.setDefaultResultOrder('ipv4first');
  if (typeof (net as any).setDefaultAutoSelectFamily === 'function') {
    (net as any).setDefaultAutoSelectFamily(false);
  }
} catch {
  // Ignore in environments where not supported
}

let poolInstance: InstanceType<typeof Pool> | null = null;

export function getDatabasePool(): InstanceType<typeof Pool> {
  if (poolInstance) return poolInstance;

  let connectionString = (config.databaseUrl || '').trim();

  if (!connectionString) {
    console.warn('⚠️ WARNING: DATABASE_URL is not set. Database operations will fail gracefully.');
    poolInstance = new Pool({
      connectionString: 'postgresql://localhost:5432/dummy',
      ssl: false,
    });
    return poolInstance;
  }

  // Strip unsupported channel_binding for pg compatibility
  connectionString = connectionString.replace(/[?&]channel_binding=[^&]+/g, '');
  // Modern pg prefers sslmode=verify-full over sslmode=require to avoid deprecation warnings
  connectionString = connectionString.replace(/sslmode=require\b/g, 'sslmode=verify-full');

  const isLocalhost =
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  poolInstance = new Pool({
    connectionString,
    ssl: isLocalhost
      ? false
      : {
          rejectUnauthorized: false,
        },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000, // 20s allowance for Neon serverless wake-up
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  poolInstance.on('error', err => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return poolInstance;
}

export const pool = {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) =>
    getDatabasePool().query<T>(text, params),
  connect: () => getDatabasePool().connect(),
  on: (event: any, listener: (...args: any[]) => void) =>
    (getDatabasePool() as any).on(event, listener),
  end: () => getDatabasePool().end(),
} as unknown as InstanceType<typeof Pool>;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getDatabasePool().query<T>(text, params);
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDatabasePool().connect();

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
  const client = await getDatabasePool().connect();

  try {
    await client.query('SELECT 1');
    console.log('✅ PostgreSQL (Neon) connected successfully.');
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  await getDatabasePool().end();
}

export const db = {
  pool,
  query,
  transaction,
};

export default db;
