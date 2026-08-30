# Migration Branch CI Prerequisites

The `migration/live-three-divisions` workflow has been committed and is executing on GitHub. It now installs pnpm, performs a script-free dependency installation, explicitly rebuilds `esbuild`, and then runs the repository’s type, lint, test, and build gates. The workflow correctly stopped at the first existing repository health failure rather than attempting a Vercel preview or a root-domain change.

## Current baseline blocker

The current migration branch fails during `pnpm check` due to TypeScript errors that pre-date the migration workflow. The errors are not caused by the public-route verification or Vercel deployment logic. The affected code areas are listed below.

| Area | Observed baseline error | Required remediation |
|---|---|---|
| `api/operations-router.ts` | Insert payload does not match the current `apiCredentials` schema; it supplies legacy `service`/`inactive` fields where the model expects `serviceName`, `displayName`, and the current status enum. | Reconcile the router payload and update query predicates with the present Drizzle schema. |
| `api/operations-router.ts` | Status union includes `inactive`, which is absent from the current `apiCredentials` status enum. | Map inactive records to an allowed state or extend the schema through a reviewed migration. |
| `api/queries/connection.ts` | Drizzle database types are duplicated/incompatible because their inferred client/pool types resolve differently. | Standardize the database client export/import type and eliminate duplicate driver type resolution. |

> The acceptance workflow should remain red until these errors are corrected. That is the intended release-control behavior; bypassing `pnpm check` would undermine the root-domain cutover gates.

## Vercel preview prerequisites

After the static gate passes, the workflow provisions a preview deployment from the exact migration-branch commit and verifies the route contract against the emitted preview URL. Configure these **repository secrets** before enabling that stage:

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Deploy-token with access to the Better Daze Vercel project. |
| `VERCEL_ORG_ID` | Team or personal Vercel scope that owns the project. |
| `VERCEL_PROJECT_ID` | The exact Vercel project used for migration previews. |

Do not commit or paste secret values into the repository, workflow file, pull-request comments, or logs. Repository secret visibility could not be inspected with the current GitHub token scope, so the owner must confirm their presence in **GitHub → Repository Settings → Secrets and variables → Actions**.

## Verification sequence

1. Fix the baseline type errors in a reviewed commit.
2. Confirm `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build` pass locally and in the migration workflow.
3. Add or verify the three Vercel repository secrets.
4. Push a migration-branch commit or open an internal pull request; the workflow will provision a preview and run `scripts/verify-public-routes.mjs` against it.
5. Complete the required browser review for client-rendered route content, mobile behavior, keyboard navigation, and restoration inquiry persistence.
6. Follow `docs/vercel-cutover-rollback.md` before any root-domain alias or DNS action.
