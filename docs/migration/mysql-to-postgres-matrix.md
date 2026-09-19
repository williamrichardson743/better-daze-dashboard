# MySQL/TiDB → Supabase Postgres compatibility matrix (B-01)

Source of truth for every conversion decision applied to `db/schema.ts`. The
pre-cutover MySQL snapshot is frozen at `db/legacy-mysql/meta/` (drizzle-kit
journal tag `0000_misty_risque`). Change this document whenever a rule changes.

Scope of the converted schema: **35 tables, 49 enum types, 45 foreign keys,
54 unique indexes**, generated as one reviewed migration at
`db/migrations/0000_init_postgres.sql` (652 statements, **zero** DROP or
TRUNCATE statements).

## Type and construct mapping

| MySQL / Drizzle construct | Postgres treatment | Why, and what to watch |
| --- | --- | --- |
| `mysqlTable` | `pgTable` | Table names keep their existing camelCase spelling and are therefore quoted in SQL. Renaming them is a separate, breaking ticket. |
| `serial().primaryKey()` (bigint unsigned auto_increment) | `bigserial({ mode: "number" }).primaryKey()` | MySQL `serial` is 64-bit; `pg.serial` is only 32-bit. `bigserial` preserves the id range. TypeScript still sees `number`. |
| `bigint({ unsigned: true })` foreign keys | `bigint({ mode: "number" })` + explicit `.references()` | Postgres has no unsigned integers. The unsigned range above 2^63-1 was never reachable; the loss is theoretical. Negative ids are now representable and are rejected by the foreign key instead. |
| `mysqlEnum` | `pgEnum`, named `<table>_<column>` | Postgres enums are database-level types, so every enum needs a unique name. Adding a value later requires `ALTER TYPE ... ADD VALUE` in a reviewed migration — it is no longer a free column change. |
| Six identical `pipelineRuns` phase enums | one shared `pipeline_phase_status` type | The value sets were byte-identical in MySQL; one type keeps them from drifting apart. |
| `int` | `integer` | Identical range. |
| `json` | `jsonb` | `jsonb` is indexable and normalizes key order. Whitespace and duplicate keys from the source JSON are not preserved; the transform step must not rely on raw text equality. |
| `timestamp` | `timestamp with time zone` | MySQL `TIMESTAMP` carried no offset and was read back as server-local. Every value must be loaded as explicit UTC during backfill or timestamps shift by the server offset. |
| `decimal(10,2)` | `numeric(10,2)` (`decimal` in drizzle) | Returned as a string in both dialects, so application code is unchanged. Money stays exact; do not convert to float anywhere in the transform. |
| `varchar(n)`, `text`, `boolean` | unchanged | Postgres `varchar(n)` counts characters, as MySQL `utf8mb4` did. |
| `.$onUpdate(() => new Date())` | unchanged | Drizzle applies this in the application layer, not the database, in both dialects. A direct SQL `UPDATE` does not touch `updatedAt` in either. |

## Query API changes

| MySQL API | Postgres replacement | Call sites |
| --- | --- | --- |
| `.$returningId()` | `.returning({ id: <table>.id })` | 11 sites across `api/` — routers for products, campaigns, pipeline runs, action items, agents, agent tasks, customer orders, users, cycles, subscriptions. |
| `.onDuplicateKeyUpdate({ set })` | `.onConflictDoUpdate({ target, set })` | `api/queries/users.ts`. **Behavior change:** MySQL matched *any* unique key; Postgres requires a named conflict target. `users.unionId` is named explicitly, so a shared email address can no longer overwrite a different GitHub identity. |
| `drizzle-orm/mysql2` + `mysql2` pool, `mode: "planetscale"` | `drizzle-orm/postgres-js` + `postgres` | `api/queries/connection.ts`. |

## Connection behavior

Supabase serves Postgres through Supavisor. `api/queries/connection.ts` treats
port `6543` or a `pooler.supabase.com` host as the transaction pooler and
disables prepared statements there (Supavisor in transaction mode does not
support them), capping the pool at one connection per serverless invocation.
Direct connections on port `5432` keep prepared statements and a pool of five.
TLS is required unless the URL carries an explicit `sslmode=disable`, which
exists only for local and CI Postgres.

## Constraints and ownership decisions (B-04)

Foreign keys did not exist in the MySQL schema; they are declared now. The
delete rules encode business rules, so review them before any backfill:

| Relationship | Rule | Reason |
| --- | --- | --- |
| `users` → cycles, social accounts, sessions, API keys, settings, campaigns, templates, action items, agent tasks, API credentials | `CASCADE` | User-owned working data follows the user. |
| `cycles` → products, social posts, transmission logs | `CASCADE` | A deleted cycle takes its own artifacts with it. |
| `products` → variants, images, collections junction | `CASCADE` | Product detail is meaningless without the product. |
| `products` → `orders`, `orderItems` | `RESTRICT` | **Revenue records block deletion.** Deleting a user whose products carry orders now fails until the order rows are dealt with explicitly. This is verified by `pnpm run db:verify`. |
| `auditLogs.userId`, `campaigns.cycleId`, `pipelineRuns.cycleId`, `agentTasks.assignedAgentId`/`approvedBy`, `productImages.variantId`, `orderItems.variantId` | `SET NULL` | The history outlives the referenced row. |
| `integrationRuns` → cycle, product, pipeline run | `SET NULL` | Integration history must survive the deletion of what it acted on. |

New uniqueness that MySQL did not enforce — the backfill will reject source
rows that violate it, which is the point:

- `cycles (userId, cycleNumber)`
- `products.sku`, `productVariants.sku`, `orders.shopifyOrderId` (unique where not null)
- `adminSettings.userId` — one settings row per user
- `permissions (roleId, resource, action)`
- `apiCredentials (userId, serviceName)`
- `productCollections (productId, collectionId)`
- `integrationRuns.idempotencyKey`
- `integrationSteps (runId, step, attempt)`
- `providerMappings (provider, resourceType, providerResourceId)`
- `reconciliationChecks (productId, check)`

## Open items carried into the backfill (C-02)

These are known blockers for the data transform, not schema ambiguities:

1. **Timestamp offsets.** Every MySQL `TIMESTAMP` must be exported as explicit
   UTC. An implicit server-local read shifts every row by the server offset.
2. **Zero dates.** MySQL accepted `0000-00-00 00:00:00`; Postgres does not.
   Such rows must be quarantined, not coerced.
3. **Enum values outside the declared set.** MySQL silently stored `''` for an
   invalid enum write under non-strict mode. Any such row must be quarantined.
4. **New unique constraints.** Duplicate SKUs, duplicate `adminSettings` rows
   per user and duplicate `(roleId, resource, action)` rows will be rejected on
   load. Resolve them at the source, before the rehearsal.
5. **JSON text fidelity.** `jsonb` normalizes key order and whitespace.
   Validate by parsed value, never by string comparison.

## Verification

```bash
pnpm run db:generate   # regenerate SQL after a schema.ts change
pnpm run db:migrate    # apply to an empty database
pnpm run db:check      # migration-history collision check
pnpm run db:verify     # representative reads/writes (10 checks)
```

`pnpm run db:verify` refuses to run against a URL containing `prod` unless
`ALLOW_PRODUCTION_VERIFY=1` is set. The `postgres-schema-gate` CI job runs all
four against a throwaway Postgres 16 service on every pull request and fails on
schema drift between `db/schema.ts` and `db/migrations/`.

Evidence at the time of conversion: migration applied cleanly to an empty
Postgres 16 database twice from scratch, re-running `migrate` was a no-op,
`drizzle-kit generate` reported no pending changes, and all 10 verification
checks passed.
