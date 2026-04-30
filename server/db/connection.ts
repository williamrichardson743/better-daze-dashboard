/**
 * MySQL connection pool using mysql2/promise.
 * Parses DATABASE_URL env var and exports query() + initializeDatabase().
 */

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const url = new URL(databaseUrl);
  pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
  });

  return pool;
}

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function initializeDatabase(): Promise<void> {
  console.log('🗄️  Initializing database tables...');

  await query(`
    CREATE TABLE IF NOT EXISTS trends (
      id INT PRIMARY KEY AUTO_INCREMENT,
      keyword VARCHAR(255) NOT NULL,
      search_volume INT DEFAULT 0,
      detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_keyword (keyword),
      INDEX idx_detected_at (detected_at)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cycle_runs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      status ENUM('running', 'completed', 'failed') DEFAULT 'running',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      error_message TEXT NULL,
      summary JSON NULL,
      INDEX idx_status (status),
      INDEX idx_started_at (started_at)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cycle_steps (
      id INT PRIMARY KEY AUTO_INCREMENT,
      cycle_run_id INT NOT NULL,
      step_number INT NOT NULL,
      step_name VARCHAR(100) NOT NULL,
      status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
      started_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      result JSON NULL,
      error_message TEXT NULL,
      INDEX idx_cycle_run_id (cycle_run_id),
      INDEX idx_step_number (step_number)
    )
  `);

  // Ensure the existing products table has the columns we need
  // (uses IF NOT EXISTS logic via separate ALTER statements caught silently)
  await query(`
    CREATE TABLE IF NOT EXISTS pod_products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      cycle_run_id INT NOT NULL,
      keyword VARCHAR(255) NOT NULL,
      printify_product_id VARCHAR(255),
      shopify_product_id VARCHAR(255),
      design_url TEXT,
      removed_bg_url TEXT,
      product_url TEXT,
      shopify_url TEXT,
      cost DECIMAL(10,2) DEFAULT 10.00,
      price DECIMAL(10,2) DEFAULT 25.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cycle_run_id (cycle_run_id),
      INDEX idx_keyword (keyword)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS pod_orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      cycle_run_id INT NOT NULL,
      shopify_order_id VARCHAR(255) UNIQUE,
      product_id VARCHAR(255),
      revenue DECIMAL(10,2) DEFAULT 0,
      cost DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      ordered_at TIMESTAMP NULL,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cycle_run_id (cycle_run_id),
      INDEX idx_shopify_order_id (shopify_order_id),
      INDEX idx_ordered_at (ordered_at)
    )
  `);

  console.log('✅ Database tables initialized');
}
