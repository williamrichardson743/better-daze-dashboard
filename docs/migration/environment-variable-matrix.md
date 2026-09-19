# Environment variable and secret matrix (A-04, H-01)

No value appears in this document. Variables are listed by **name, scope,
classification and rotation owner** only. If a value is ever needed, read it
from the Vercel or Supabase dashboard — never from source control, a pull
request, a log line or a chat message.

## Classification

- **Public** — safe in the browser bundle.
- **Server-only** — may appear in Vercel Function and Supabase Edge Function
  runtimes only. Never in `VITE_*`, never in client code, never in logs.
- **Privileged** — server-only *and* bypasses authorization. Rotate on any
  suspected exposure; log the rotation.

## Matrix

| Variable | Class | Local | Vercel Preview | Vercel Production | Edge Functions | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| `APP_URL` | Public | localhost origin | preview origin | production origin | n/a | Application |
| `GITHUB_CLIENT_ID` | Public | dev OAuth app | dev OAuth app | prod OAuth app | n/a | Security |
| `GITHUB_CLIENT_SECRET` | Server-only | dev OAuth app | dev OAuth app | prod OAuth app | n/a | Security |
| `SESSION_SECRET` | Privileged | local random | preview random | production-only random | n/a | Security |
| `OWNER_UNION_ID` | Server-only | yes | yes | yes | n/a | Product |
| `OWNER_GITHUB_LOGIN` | Server-only | yes | yes | yes | n/a | Product |
| `DATABASE_URL` | Privileged | dev Supabase project | **staging** Supabase project | **production** Supabase project | n/a | Data |
| `SUPABASE_URL` | Public | dev project | staging project | production project | yes | Data |
| `SUPABASE_ANON_KEY` | Public | dev project | staging project | production project | yes | Data |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged | dev project only | staging project | production project | yes | Data |
| `SUPABASE_STORAGE_BUCKET` | Public | dev bucket | staging bucket | production bucket | yes | Data |
| `SHOPIFY_STORE_URL` | Server-only | dev store | dev store | live store | yes | Integration |
| `SHOPIFY_ADMIN_TOKEN` | Privileged | dev store | dev store | live store | yes | Integration |
| `PRINTIFY_API_TOKEN` | Privileged | dev/sandbox | dev/sandbox | live shop | yes | Integration |
| `PRINTIFY_SHOP_ID` | Server-only | dev shop | dev shop | live shop | yes | Integration |
| `VERCEL_TOKEN` | Privileged | n/a | GitHub Actions secret | GitHub Actions secret | n/a | Release |
| `VERCEL_ORG_ID` | Server-only | n/a | GitHub Actions secret | GitHub Actions secret | n/a | Release |
| `VERCEL_PROJECT_ID` | Server-only | n/a | GitHub Actions secret | GitHub Actions secret | n/a | Release |

## Hard rules

1. **Production credentials are never available locally.** Local development
   and Preview point at non-production Supabase projects. A developer machine
   that can reach production Postgres is a finding, not a convenience.
2. **`SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security.** It may be read
   only by server-side code. Any appearance in a client bundle, a `VITE_*`
   variable, a log line or a commit is an immediate rotation event.
3. **No provider token reaches the browser.** Shopify Admin and Printify calls
   run server-side in `api/` (and later in Edge Functions). The browser calls
   the application's own API, never a provider directly.
4. **Preview ≠ Production.** Confirm the two `DATABASE_URL` values resolve to
   different Supabase project refs before promoting anything.
5. **`DATABASE_URL` port matters.** Serverless runtimes use the Supavisor
   transaction pooler (`6543`); migrations and local scripts use the direct
   connection (`5432`). The application disables prepared statements
   automatically for pooled URLs.

## Rotation procedure

For every Privileged variable:

1. Issue the replacement in the provider (GitHub OAuth app, Supabase project
   settings, Shopify admin, Printify account).
2. Update Vercel Preview and Production, and Supabase Edge Function secrets.
3. Redeploy so running functions pick up the new value.
4. Revoke the previous credential at the provider.
5. Record date, variable name, reason and operator in the release log. Record
   the name only — never the old or new value.

`SESSION_SECRET` rotation invalidates every signed dashboard session. Treat it
as a forced logout and schedule it deliberately.

## Verification before production cutover

```bash
pnpm build
grep -rIl -e "SUPABASE_SERVICE_ROLE_KEY" -e "SHOPIFY_ADMIN_TOKEN" \
  -e "PRINTIFY_API_TOKEN" -e "postgresql://" dist/public || echo "clean"
```

The browser bundle must contain none of these names or a connection string.
This check belongs in the launch checklist (H-01, H-04).
