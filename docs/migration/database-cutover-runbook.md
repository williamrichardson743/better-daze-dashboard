# Supabase Postgres cutover and rollback runbook (A-06, Phase 5)

This covers the **database** cutover. The application, alias and DNS rollback
procedure is separate and already documented in
[`docs/vercel-cutover-rollback.md`](../vercel-cutover-rollback.md). A database
failure and a deployment failure are different incidents with different
rollbacks; do not combine them.

## Preconditions

None of this starts until all of the following are true:

- [ ] Separate Supabase development/staging and production projects exist (A-03).
- [ ] The environment variable matrix is filled in and Preview and Production
      resolve to different project refs (A-04).
- [ ] `pnpm run db:migrate`, `db:check` and `db:verify` pass against an empty
      staging project (B-03, B-06).
- [ ] A staging backfill has been loaded and validated: row counts, foreign
      keys, timestamps, enum values, representative dashboard queries (C-03, C-04).
- [ ] At least one full rehearsal has been run end to end, with a measured
      duration and an exercised rollback (C-05).
- [ ] Custom GitHub OAuth callback, owner authorization, session persistence,
      expiry and logout pass against the Postgres-backed application (D-03).
- [ ] The browser bundle check in the environment matrix returns clean.

## Named owners

Fill in before the window opens; an unnamed owner is a blocker.

| Role | Name | Decides |
| --- | --- | --- |
| Product owner | | Go/no-go, rollback trigger |
| Application owner | | Vercel env switch, deployment, smoke tests |
| Data owner | | Final export, transform, load, validation queries |
| Integration owner | | Provider mapping checks after cutover |
| Security reviewer | | Secret boundary sign-off |

## Cutover sequence

1. **Announce and freeze.** Stop merges to the deployment branch. Announce the
   window. Record the start time.
2. **Enter read-only.** Stop writes to MySQL/TiDB — disable the POD cycle
   runner and any scheduled jobs first, then dashboard writes. Record the
   moment writes stopped; it is the recovery point.
3. **Final export.** Take the final source snapshot. Record its provenance,
   timestamp and row counts per table.
4. **Transform and load.** Run the scripted transform and load into the
   production Supabase project. Quarantined rows are reported, never silently
   coerced. Record the count of quarantined rows and their reasons.
5. **Validate.** Compare row counts per table against the export, verify
   foreign key integrity, spot-check timestamps against known UTC values,
   confirm enum distributions, and run the representative dashboard queries.
   Then run `pnpm run db:verify` against production with
   `ALLOW_PRODUCTION_VERIFY=1` — it creates and removes its own rows.
6. **Switch.** Point `DATABASE_URL` in Vercel Production at the production
   Supabase project and redeploy. Do not change any other variable in the same
   step.
7. **Smoke test.** `/api/health`, GitHub OAuth login, owner authorization,
   one dashboard read, one dashboard write, logout. Then a POD read path
   without creating a live order.
8. **Observe.** Watch for the agreed observation period (default 24 hours)
   before re-enabling scheduled jobs and the cycle runner.
9. **Record.** Log the actual duration, anything that surprised anyone, and
   the rollback deadline.

## Rollback triggers

Any one of these stops the cutover — the decision is the product owner's, and
it is not a discussion:

- Row counts or foreign key integrity do not reconcile, and the discrepancy is
  not explained and approved.
- GitHub OAuth login, owner authorization or session expiry misbehaves.
- A critical dashboard mutation fails.
- Provider mappings cannot be validated.
- Any secret appears in a browser bundle, a log or a deployment record.
- The full revenue-path smoke test fails.

## Rollback procedure

1. Stop writes to Supabase immediately.
2. Restore `DATABASE_URL` in Vercel Production to the previous MySQL/TiDB
   connection and redeploy. The application code is dialect-specific, so this
   also requires redeploying the last pre-cutover deployment — use the Vercel
   rollback path in `docs/vercel-cutover-rollback.md`.
3. Lift the read-only freeze on the source database.
4. Verify login and one dashboard read/write against the restored path.
5. Preserve the Supabase project as-is. Do not delete it; it is the evidence.
6. Open a postmortem ticket with the failing validation output attached.

**Rollback window:** the source MySQL/TiDB database stays available and
unmodified for a minimum of 14 days after cutover. Rolling back after any
production writes have landed in Supabase means reconciling those writes by
hand — after the window, roll-forward is the only option. Say this out loud
before the window opens so nobody assumes otherwise.

## What this runbook does not cover

- Supabase Auth adoption. Identity ownership stays with the existing custom
  GitHub OAuth implementation through this cutover (Phase 8, separate plan).
- Edge Function decomposition. Workloads stay on Vercel until the schema and
  data are stable (Phase 7).
- Storage migration. Asset moves are a separate ticket (Epic E) and must not
  share a window with the database cutover.
