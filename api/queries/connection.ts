import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

type DbInstance = ReturnType<typeof drizzle<typeof fullSchema>>;

let client: ReturnType<typeof postgres> | undefined;
let instance: DbInstance | undefined;

/**
 * Supabase serves Postgres through Supavisor. The transaction pooler
 * (port 6543 / *.pooler.supabase.com) does not support prepared statements,
 * so they are disabled for pooled connection strings. Direct connections
 * (port 5432) keep prepared statements enabled.
 */
function isTransactionPooler(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return url.port === "6543" || url.hostname.includes("pooler.supabase.com");
  } catch {
    return false;
  }
}

/**
 * TLS is required everywhere Supabase is reachable. Only an explicit
 * `sslmode=disable` (local Postgres in CI or a migration rehearsal) turns it
 * off, so a missing parameter can never silently downgrade a production link.
 */
function sslSetting(connectionString: string): "require" | false {
  try {
    return new URL(connectionString).searchParams.get("sslmode") === "disable"
      ? false
      : "require";
  } catch {
    return "require";
  }
}

export function getDb() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!instance) {
    const pooled = isTransactionPooler(env.databaseUrl);

    client = postgres(env.databaseUrl, {
      // Serverless invocations are short-lived; a small pool avoids exhausting
      // Supavisor client slots across concurrent Vercel functions.
      max: pooled ? 1 : 5,
      prepare: !pooled,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: sslSetting(env.databaseUrl),
    });

    instance = drizzle(client, { schema: fullSchema });
  }

  return instance;
}

/** Closes the pool. Used by migration/verification scripts, not by request handlers. */
export async function closeDb() {
  if (client) {
    await client.end({ timeout: 5 });
    client = undefined;
    instance = undefined;
  }
}
