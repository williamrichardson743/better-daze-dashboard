# Legacy MySQL/TiDB migration metadata

Frozen baseline of the pre-cutover MySQL schema (drizzle-kit snapshot,
dialect `mysql`, journal tag `0000_misty_risque`). It is kept as migration
provenance for ticket A-01 and as the reference the compatibility matrix in
`docs/migration/mysql-to-postgres-matrix.md` was derived from.

Nothing here is executed. The Postgres migration history starts empty in
`db/migrations/`. Do not point drizzle-kit at this directory.

`manual-migrations/` holds the hand-written MySQL/TiDB DDL that was applied to
the legacy database before the cutover (notably the `users` OAuth alignment).
Its effects are already folded into the Postgres schema in `db/schema.ts`; the
files are kept as provenance for the backfill transform and must not be run
against Postgres.
