import dns from 'dns';
import fs from 'fs';
import net from 'net';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env.js';

// Prioritize IPv4 and disable autoSelectFamily (Happy Eyeballs) to avoid ETIMEDOUT
// on high-latency cloud connections (e.g. AWS Neon in US) where handshake > 250ms
try {
  dns.setDefaultResultOrder('ipv4first');
  if (typeof net.setDefaultAutoSelectFamily === 'function') {
    net.setDefaultAutoSelectFamily(false);
  }
} catch {
  // Ignore in environments where not supported
}

let poolInstance: Pool | null = null;

export function getDatabasePool(): Pool {
  if (poolInstance) return poolInstance;

  let connectionString = (config.databaseUrl || '').trim();
  // Strip unsupported channel_binding for pg compatibility
  connectionString = connectionString.replace(/[?&]channel_binding=[^&]+/g, '');
  // Modern pg prefers sslmode=verify-full over sslmode=require to avoid deprecation warnings
  connectionString = connectionString.replace(/sslmode=require\b/g, 'sslmode=verify-full');

  // In local environments where localhost TCP is restricted or using local socket
  if (
    (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) &&
    fs.existsSync('/tmp/.s.PGSQL.5432') &&
    !connectionString.includes('host=')
  ) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString = `${connectionString}${separator}host=/tmp`;
  }

  if (!connectionString) {
    console.warn('⚠️ WARNING: DATABASE_URL is not set. Database operations will fail gracefully.');
    poolInstance = new Pool({
      connectionString: 'postgresql://localhost:5432/dummy',
      ssl: false,
    });
    return poolInstance;
  }

  poolInstance = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost')
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
} as unknown as Pool;

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
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export const db = {
  query,
  transaction,
  pool,
};

export default db;
