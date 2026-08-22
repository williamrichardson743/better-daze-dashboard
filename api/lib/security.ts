import type { Context } from "hono";
import type { ServerResponse } from "node:http";

export const dashboardSecurityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export function applyNodeSecurityHeaders(response: ServerResponse) {
  for (const [name, value] of Object.entries(dashboardSecurityHeaders)) {
    response.setHeader(name, value);
  }
  response.setHeader("Cache-Control", "no-store");
}

export function applyHonoSecurityHeaders(context: Context) {
  for (const [name, value] of Object.entries(dashboardSecurityHeaders)) {
    context.header(name, value);
  }
  context.header("Cache-Control", "no-store");
}
