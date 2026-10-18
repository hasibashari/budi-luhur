import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env.js';

let poolInstance: Pool | null = null;

export function getDatabasePool(): Pool {
  if (poolInstance) return poolInstance;

  let connectionString = (config.databaseUrl || '').trim();
  // Strip unsupported channel_binding for pg compatibility
  connectionString = connectionString.replace(/[?&]channel_binding=[^&]+/g, '');

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
    connectionTimeoutMillis: 10000,
  });

  poolInstance.on('error', (err) => {
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
} as unknown as Pool;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getDatabasePool().query<T>(text, params);
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
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
