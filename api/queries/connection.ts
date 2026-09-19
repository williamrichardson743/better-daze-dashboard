import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

type DbInstance = ReturnType<typeof drizzle<typeof fullSchema>>;

let instance: DbInstance;

function isTiDbCloudUrl(connectionString: string) {
  try {
    return new URL(connectionString).hostname.endsWith(".tidbcloud.com");
  } catch {
    return false;
  }
}

export function getDb() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!instance) {
    if (isTiDbCloudUrl(env.databaseUrl)) {
      const pool = mysql.createPool({
        uri: env.databaseUrl,
        ssl: { minVersion: "TLSv1.2" },
        enableKeepAlive: true,
      });
      instance = drizzle(pool, {
        mode: "planetscale",
        schema: fullSchema,
      }) as unknown as DbInstance;
    } else {
      instance = drizzle(env.databaseUrl, {
        mode: "planetscale",
        schema: fullSchema,
      });
    }
  }

  return instance;
}
