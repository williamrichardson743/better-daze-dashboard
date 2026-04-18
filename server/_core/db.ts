import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../../drizzle/schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection
 */
export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse connection string
  const url = new URL(databaseUrl);
  const host = url.hostname;
  const port = parseInt(url.port || '3306');
  const user = url.username;
  const password = url.password;
  const database = url.pathname.slice(1);

  // Create connection pool
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Create drizzle instance
  dbInstance = drizzle(pool, { schema, mode: 'default' });

  return dbInstance;
}

/**
 * Export db instance
 */
export const db = new Proxy(
  {},
  {
    get: async (target, prop) => {
      const database = await getDb();
      return (database as any)[prop];
    },
  }
) as any;
