import type { IncomingMessage } from "node:http";

type QueryValue = string | string[] | undefined;

export type OAuthCallbackRequest = IncomingMessage & {
  query?: Record<string, QueryValue>;
};

function firstValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function requestOrigin(req: IncomingMessage) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || "https";
  return `${protocol}://${req.headers.host || "localhost:3000"}`;
}

/**
 * Reads OAuth callback values from Vercel's optional query wrapper and the raw
 * request URL. Raw URL parsing is required because not every Node serverless
 * adapter populates req.query consistently.
 */
export function readOAuthCallbackInput(req: OAuthCallbackRequest) {
  const wrappedQuery = req.query ?? {};
  const urlQuery = new URL(req.url ?? "/", requestOrigin(req)).searchParams;

  return {
    error: firstValue(wrappedQuery.error) ?? urlQuery.get("error") ?? undefined,
    code: firstValue(wrappedQuery.code) ?? urlQuery.get("code") ?? undefined,
    state: firstValue(wrappedQuery.state) ?? urlQuery.get("state") ?? undefined,
  };
}

/** Compares opaque OAuth state values without early exit on differing bytes. */
export function statesMatch(actual: string, expected: string) {
  const actualBytes = new TextEncoder().encode(actual);
  const expectedBytes = new TextEncoder().encode(expected);
  if (actualBytes.length !== expectedBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}
