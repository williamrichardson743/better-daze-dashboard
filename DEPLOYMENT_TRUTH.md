# DEPLOYMENT TRUTH — read this before touching deploys

**Established:** 2026-09-22 by Claude (Opus 5), verified against live Vercel API and live HTTP.
**Supersedes:** every Railway instruction in this repo, in `AGENT_HANDOFF.md`, and in any agent status file.

---

## 1. We deploy to Vercel. Railway is dead.

| | |
| --- | --- |
| Host | **Vercel** — project `better-daze-dashboard` (`prj_hZmb79poJ89Gs6tCxqGWzRRfMHTn`) |
| Scope | `williamrichardson743-1110s-projects` (`team_KfMHigShQWqGtDnKGoXw06wE`) |
| **Production branch** | **`kimi-production`** — *not* `master` |
| Live aliases | `ops.better-daze-sf.com`, `www.better-daze-sf.com`, `better-daze-dashboard.vercel.app` |
| Status as of 2026-09-22 | **UP.** All aliases 200. `/api/trpc/ping` 200. `/api/auth/github/start` 302. |

Railway is not used. The Supabase branch deletes `railway.json` and `railway.toml`.
If you are reading Railway instructions in this repo, they are stale — ignore them.

## 2. `master` is a dead branch. Do not deploy it.

`master` is the old Railway + Kimi-OAuth lineage. Pushing to it produces a **Preview**
deploy only, never Production. Production has only ever been built from `kimi-production`.

## 3. Why every agent kept "rediscovering" Railway

The local clone at `~/Downloads/better-daze-dashboard` had a **narrowed fetch refspec**:

```
remote.origin.fetch = +refs/heads/master:refs/remotes/origin/master
```

That made `git branch -r` show exactly one branch — `master`, the dead Railway lineage.
All 22 other branches, including `kimi-production` (production) and the Supabase work,
were invisible. Every agent that opened that folder saw Railway config and "fixed" Railway.

**Fix (already applied):**

```bash
git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git fetch origin --prune
```

Any clone that cannot see `kimi-production` is lying to you. Run the above first.

## 4. Production auth is GitHub OAuth, not Kimi OAuth

`kimi-production` uses `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `SESSION_SECRET` /
`OWNER_GITHUB_LOGIN`. The branch name is historical — **there is no Kimi OAuth in production.**
`APP_ID` / `APP_SECRET` / `KIMI_AUTH_URL` / `KIMI_OPEN_URL` belong to the dead `master`
lineage and are not read by production code.

## 5. Supabase is written but NOT merged and NOT deployed

Branch **`claude/vercel-supabase-backlog-jnvr9u`** — 2 commits ahead of `kimi-production`:

- `d7dc3dbec` Convert data layer from MySQL/TiDB to Supabase Postgres
- `216c8cea3` Wire the POD pipeline to real publishing, lock down public reads, drop Stripe

It is complete work: full Postgres schema, `db/migrations/0000_init_postgres.sql`,
MySQL archived to `db/legacy-mysql/`, a cutover runbook, an env-var matrix, a schema
verification script, and CI acceptance tests. It deletes the Railway config.

**Production today still runs MySQL** (`mysql2`, drizzle `dialect: "mysql"`).
So the honest status is: *Vercel yes, Supabase not yet.*

### What blocks the Supabase cutover

Operational, not code. Per `docs/migration/database-cutover-runbook.md`:

1. Supabase **staging and production projects must exist** (they are separate projects).
2. `DATABASE_URL` must be set per-environment — Preview → staging project,
   Production → production project. They must resolve to different project refs.
3. Use the Supavisor **transaction pooler on port 6543** for serverless;
   port **5432** direct for migrations. The code disables prepared statements
   automatically for pooled URLs.
4. Run `pnpm run db:migrate`, `db:check`, `db:verify` against empty staging first.
5. Rehearse once end-to-end with a real rollback before touching production.

Do not point Production `DATABASE_URL` at Postgres until steps 1–5 are done —
the app code is dialect-specific, so a half-switch takes the site down.

## 6. Rules for every agent

1. **Verify before you claim.** A deploy is real only with a live URL returning 200.
2. **Never deploy `master`.** Production is `kimi-production`.
3. **Never point Production `DATABASE_URL` at Supabase** without the runbook preconditions met.
4. **Do not re-add Railway config.** It was deliberately removed.
5. **Fix your refspec** before reading branch state, or you will repeat this whole incident.
