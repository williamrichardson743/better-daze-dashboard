import express, { Express, Response, Request } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../routers';
import { createContext } from './context';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from '../db/connection';
import { initializeCronJob, triggerCycleManually } from '../jobs/cycleRunnerJob';
import { query } from '../db/connection';

/**
 * Create and configure Express server
 */
export function createServer(): Express {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(__dirname, '../../dist/public');

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    })
  );

  // Serve static assets with correct MIME types
  app.use(express.static(publicDir, {
    maxAge: '1d',
    etag: false,
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      }
    },
  }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // ─── Cycle Runner REST API ──────────────────────────────────────────────

  /**
   * POST /api/cycle/run
   * Manually trigger the 9-step daily cycle.
   */
  app.post('/api/cycle/run', async (_req: Request, res: Response) => {
    try {
      // Fire-and-forget: respond immediately, cycle runs in background
      res.json({ success: true, message: 'Cycle triggered — running in background' });
      await triggerCycleManually();
    } catch (err: any) {
      // Error already logged inside cycleRunner; response already sent
      console.error('Cycle run error:', err.message);
    }
  });

  /**
   * GET /api/cycle/history
   * Returns the last 20 cycle runs with status and summary.
   */
  app.get('/api/cycle/history', async (_req: Request, res: Response) => {
    try {
      const rows = await query(
        `SELECT id, status, started_at, completed_at, error_message,
                JSON_LENGTH(summary) AS has_summary
         FROM cycle_runs
         ORDER BY started_at DESC
         LIMIT 20`
      );
      res.json({ success: true, runs: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * GET /api/cycle/run/:id
   * Returns full details for a specific cycle run including step logs.
   */
  app.get('/api/cycle/run/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid run ID' });
        return;
      }

      const [run] = await query(
        'SELECT * FROM cycle_runs WHERE id = ?',
        [id]
      );

      if (!run) {
        res.status(404).json({ success: false, error: 'Cycle run not found' });
        return;
      }

      const steps = await query(
        `SELECT step_number, step_name, status, started_at, completed_at, result, error_message
         FROM cycle_steps
         WHERE cycle_run_id = ?
         ORDER BY step_number ASC`,
        [id]
      );

      res.json({ success: true, run, steps });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // tRPC API
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(404).json({ error: 'Not found' });
      }
    });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
}

/**
 * Start server
 */
async function start() {
  // Initialize database tables (idempotent — safe to run on every startup)
  try {
    await initializeDatabase();
  } catch (err: any) {
    console.error('⚠️  Database initialization failed (continuing):', err.message);
  }

  // Initialize the daily cron job
  try {
    initializeCronJob();
  } catch (err: any) {
    console.error('⚠️  Cron job initialization failed (continuing):', err.message);
  }

  const app = createServer();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📡 tRPC API available at http://localhost:${port}/api/trpc`);
    console.log(`🔄 Cycle API available at http://localhost:${port}/api/cycle/run`);
  });
}

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch(console.error);
}

export default createServer;
