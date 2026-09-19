import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";

export const waitlistRouter = createRouter({
  join: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        source: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      try {
        await db.insert(schema.waitlistSignups).values({
          email: input.email,
          source: input.source,
        });
      } catch (err) {
        // Postgres reports a unique violation as SQLSTATE 23505. The message
        // text differs from MySQL's "Duplicate entry", so match on the code.
        const code = (err as { code?: string })?.code;
        const message = err instanceof Error ? err.message : "";
        if (code === "23505" || /duplicate key value/i.test(message)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This email is already on the list.",
          });
        }
        throw err;
      }

      return { ok: true };
    }),
});
