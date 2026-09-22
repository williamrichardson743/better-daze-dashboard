import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // SSO auth disabled for development — fall back to a mock admin user
    ctx.user = {
      id: 1,
      unionId: "dev-local",
      name: "Dev User",
      email: "dev@local",
      avatar: null,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignInAt: new Date(),
    };
  }
  return ctx;
}
