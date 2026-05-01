/**
 * server/db/connection.ts
 *
 * MySQL connection pool using mysql2/promise.
 *
 * Key design decisions:
 * - Pool is created synchronously on module load (not lazily) so that any
 *   misconfiguration surfaces at startup rather than at first query time.
 * - pool.execute() returns a tuple [rows, fields]; query() unwraps the tuple
 *   and returns only the rows array so callers don't have to destructure.
 * - waitForPool() pings the database and resolves when a connection is
 *   successfully acquired, giving the application a clean hook to delay
 *   serving traffic until the pool is ready.
 */

import mysql, { Pool, RowDataPacket } from 'mysql2/promise';

// ─── Pool initialisation ──────────────────────────────────────────────────────

let pool: Pool | null = null;
let poolError: Error | null = null;

/**
 * Parse DATABASE_URL and create the pool synchronously at module load time.
 * Any URL-parsing or configuration error is captured so that waitForPool()
 * can surface it with a clear message instead of a cryptic runtime failure.
 */
function initPool(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    poolError = new Error(
      'DATABASE_URL environment variable is not set. ' +
        'Expected format: mysql://user:password@host:port/database',
    );
    console.error('[db/connection] ' + poolError.message);
    return;
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch (err) {
    poolError = new Error(
      `DATABASE_URL is not a valid URL: "${databaseUrl}". ` +
        `Parse error: ${(err as Error).message}`,
    );
    console.error('[db/connection] ' + poolError.message);
    return;
  }

  const host = url.hostname;
  const port = parseInt(url.port || '3306', 10);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  // pathname is "/database_name" — strip the leading slash
  const database = url.pathname.slice(1);

  if (!host || !user || !database) {
    poolError = new Error(
      `DATABASE_URL is missing required components. ` +
        `Parsed — host: "${host}", user: "${user}", database: "${database}".`,
    );
    console.error('[db/connection] ' + poolError.message);
    return;
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Return JS Date objects for DATETIME/TIMESTAMP columns
      dateStrings: false,
      // Automatically reconnect dropped connections
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
    });

    console.log(
      `[db/connection] Pool created — ${user}@${host}:${port}/${database}`,
    );
  } catch (err) {
    poolError = new Error(
      `Failed to create MySQL pool: ${(err as Error).message}`,
    );
    console.error('[db/connection] ' + poolError.message);
  }
}

// Create the pool immediately when this module is imported.
initPool();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Execute a parameterised SQL query and return the result rows.
 *
 * mysql2/promise pool.execute() returns a tuple:
 *   [RowDataPacket[] | ResultSetHeader, FieldPacket[]]
 *
 * This wrapper destructures the tuple so callers receive only the rows array,
 * matching the ergonomics of the legacy `pg` / `mysql` callback-style APIs.
 *
 * @param sql    Parameterised SQL string (use `?` placeholders)
 * @param params Values to bind to the placeholders
 * @returns      Promise resolving to an array of result rows
 */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!pool) {
    throw new Error(
      poolError
        ? `Database pool is not available: ${poolError.message}`
        : 'Database pool has not been initialised.',
    );
  }

  // pool.execute() returns [rows, fields] — we only need rows.
  const [rows] = await pool.execute<T[]>(sql, params);
  return rows;
}

/**
 * Verify that the pool is ready by acquiring a connection and running a
 * lightweight ping query.  Resolves when the database is reachable, rejects
 * with a descriptive error otherwise.
 *
 * Call this during application startup before accepting HTTP traffic:
 *
 *   await waitForPool();
 *   app.listen(PORT);
 */
export async function waitForPool(): Promise<void> {
  if (poolError) {
    throw new Error(
      `Cannot connect to database — pool initialisation failed: ${poolError.message}`,
    );
  }

  if (!pool) {
    throw new Error('Database pool has not been initialised.');
  }

  // Acquire a connection from the pool and immediately release it.
  // This confirms that the pool can reach the database server.
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('[db/connection] Database ping successful — pool is ready.');
  } finally {
    connection.release();
  }
}

/**
 * Expose the underlying pool for code that needs direct pool access
 * (e.g. Drizzle ORM initialisation).  Prefer query() for ad-hoc SQL.
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error(
      poolError
        ? `Database pool is not available: ${poolError.message}`
        : 'Database pool has not been initialised.',
    );
  }
  return pool;
}

export default pool;
