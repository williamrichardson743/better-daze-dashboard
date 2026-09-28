import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import {
  createGitHubStartHandler,
  createGitHubCallbackHandler,
} from "./github/auth.js";
import { Paths } from "../contracts/constants.js";
import { applyHonoSecurityHeaders } from "./lib/security.js";
import { sql } from "drizzle-orm";
import { getDb } from "./queries/connection.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("/api/*", async (c, next) => {
  applyHonoSecurityHeaders(c);
  await next();
});

app.get("/api/health", (c) => c.json({ status: "ok" }, 200));
app.get("/api/health/db", async (c) => {
  try {
    await getDb().execute(sql`select 1`);
    return c.json({ status: "ok", database: "postgres" }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const category = /must use PostgreSQL/i.test(message)
      ? "database_url_wrong_dialect"
      : /postgres|database_url|connection|connect|authentication|password|schema|relation|does not exist/i.test(
          message
        )
        ? "database_unavailable_or_mismatched"
        : "database_check_failed";
    console.error("[Health] database readiness failed", { category });
    return c.json(
      { status: "error", database: "unavailable", category },
      503
    );
  }
});
app.get("/api/auth/github/start", createGitHubStartHandler());
app.get(Paths.oauthCallback, createGitHubCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

async function readBody(req: IncomingMessage & { body?: unknown }) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  if (req.body !== undefined) {
    if (typeof req.body === "string" || req.body instanceof Uint8Array) {
      return req.body;
    }
    return JSON.stringify(req.body);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

async function vercelHandler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  try {
    const protocol =
      (Array.isArray(req.headers["x-forwarded-proto"])
        ? req.headers["x-forwarded-proto"][0]
        : req.headers["x-forwarded-proto"]) || "https";
    const host = req.headers.host || "localhost";
    const requestUrl = new URL(req.url || "/", `${protocol}://${host}`);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else if (value) headers.set(key, value);
    }

    const body = await readBody(req);
    const request = new Request(requestUrl, {
      method: req.method || "GET",
      headers,
      body,
      // Required by Node's Request implementation when a streamed body is used.
      ...(body ? { duplex: "half" as const } : {}),
    });
    const response = await app.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const setCookies = response.headers.getSetCookie?.();
    if (setCookies?.length) res.setHeader("set-cookie", setCookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("[Vercel] Hono request failed", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "Internal server error" }));
    } else {
      res.end();
    }
  }
}

export default vercelHandler;
export { app };
