# Better Daze Operations Dashboard — External Agent Handoff

## Purpose and Current Status

This handoff covers the **Front-End Shift**: moving the Better Daze operations dashboard away from Railway and paid legacy hosting to Vercel, Cloudflare, and TiDB Cloud’s free tier. The deployment and database migration are complete enough to remove Railway from the live request path. The only unresolved production blocker is the final GitHub OAuth browser return to the custom domain.

> **Do not reconnect Railway.** The owner has an outstanding Railway balance and explicitly requires a Railway-free production path.

| Workstream | Status | Verified result |
|---|---|---|
| DNS and TLS | **Complete** | `better-daze-sf.com` is on Cloudflare DNS, while the Vercel custom-domain configuration is green. |
| Vercel deployment | **Complete** | The dashboard is deployed from `kimi-production` and `https://www.better-daze-sf.com/login` is live. |
| Railway removal | **Complete** | Legacy Railway/Kimi OAuth logic has been removed from the active Vercel runtime graph. |
| TiDB Cloud | **Complete** | The active `bdzpod` instance contains database `better_daze_dashboard` with all 31 dashboard tables migrated. |
| GitHub owner authorization | **Complete in code** | The callback accepts only GitHub login `williamrichardson743` or owner union ID `github:257014198`. |
| GitHub OAuth callback | **Blocked** | The callback responds with `Invalid OAuth state or missing authorization code`; the sign-in state is not being recovered. |

The active custom-domain OAuth start route returns a valid GitHub authorization redirect and sends a ten-minute `bd_github_oauth_state` cookie. The existing callback reads its query values from `req.query` and the cookie from `req.headers.cookie`. Its generic error does not distinguish a missing query parameter from a missing state cookie, so the actual failing input must be identified before changing the security model. [1] [2]

---

## Canonical Repository and Deployment Target

| Item | Value |
|---|---|
| Repository | `williamrichardson743/better-daze-dashboard` |
| Canonical branch | `kimi-production` |
| Remote | `https://github.com/williamrichardson743/better-daze-dashboard.git` |
| Vercel project | `better-daze-dashboard` (`prj_hZmb79poJ89Gs6tCxqGWzRRfMHTn`) |
| Vercel team | `williamrichardson743-1110s-projects` (`team_KfMHigShQWqGtDnKGoXw06E`) |
| Production URL | `https://www.better-daze-sf.com` |
| Dashboard route after login | `/app` |
| OAuth provider | GitHub OAuth App: **Better Daze Operations Dashboard** |
| GitHub OAuth App ID | `Ov23lir7wuMbVr5DR3Ms` |
| Registered callback URI | `https://www.better-daze-sf.com/api/oauth/callback` |

The repository root is `/home/ubuntu/better-daze-dashboard` in the working environment. The project’s previous documentation contains old references to Railway, legacy Kimi authentication, Webflow, and a 26-table database. Those statements are obsolete for this migration and must not guide the repair.

---

## What Is Already Deployed

The following commits are on `origin/kimi-production`. No Railway service is required by the active Vercel runtime.

| Commit | Purpose |
|---|---|
| `d164a433` | Uses a TLS-aware TiDB Cloud MySQL connection factory. |
| `c6285200` | Authorizes the owner by GitHub login or numeric union ID. |
| `bc29fae9` | Resolves remaining ESM local-import failures in the Vercel database runtime. |
| `69077a85` | Adds required explicit `.js` extensions for Vercel Node ESM resolution. |
| `9af92d11` | Removes legacy Railway OAuth implementation. |
| `3dcbbfed` | Adds dependency-free direct GitHub OAuth start function. |
| `c8795bcd` | Routes GitHub OAuth through direct Vercel functions. |
| `d74d2276` | Adds the explicit Vercel Node adapter for Hono routes. |

The Vercel routing configuration maps `/api/auth/github/start` to `api/github-start.ts`, `/api/oauth/callback` to `api/oauth-callback.ts`, and the remaining API routes to `api/boot.ts`. [3]

---

## Authentication Blocker — Exact Behavior

The required user journey is:

```text
https://www.better-daze-sf.com/login
  → /api/auth/github/start
  → github.com/login/oauth/authorize
  → https://www.better-daze-sf.com/api/oauth/callback?code=...&state=...
  → user upsert in TiDB
  → bd_session cookie
  → /app
```

### Confirmed working portion

`GET /api/auth/github/start` currently returns HTTP 302 to GitHub with the correct `redirect_uri` and an opaque UUID in `state`. It also sets:

```text
bd_github_oauth_state=<uuid>; Max-Age=600; Path=/; HttpOnly; Secure; SameSite=Lax
```

The cookie is host-only for `www.better-daze-sf.com`, which matches the registered callback host. This is an appropriate baseline for a top-level OAuth return; do **not** remove state validation or place secrets in the URL merely to bypass the error. [2]

### Current failing portion

`api/oauth-callback.ts` checks `req.query.code`, `req.query.state`, and `cookie.parse(req.headers.cookie)` before it calls GitHub or TiDB. If any of the three values is absent, it returns:

```text
Invalid OAuth state or missing authorization code
```

Because the three inputs share one generic error, there is not yet proof that the cookie is the failing value. In a Vercel Node function, the likely first fix is resilient query parsing from `req.url` when `req.query` is unavailable, followed by safe diagnostics that identify only the presence of values—not authorization codes, cookies, tokens, or secrets. [1]

### Required repair sequence

1. **Instrument safely.** In `api/oauth-callback.ts`, log a correlation ID plus booleans for `hasCode`, `hasState`, and `hasExpectedState`; log `req.url` only after redacting `code` and `state`. Do not log raw `Cookie` headers, OAuth codes, access tokens, client secrets, or `DATABASE_URL`.
2. **Make query parsing runtime-independent.** Parse the callback query from `new URL(req.url ?? "/", baseUrl).searchParams` as a fallback or primary source, instead of relying exclusively on optional `req.query`.
3. **Deploy one focused patch** to `kimi-production`, then perform a fresh browser sign-in from `https://www.better-daze-sf.com/login`. Do not open the callback URL directly and do not reuse a previous GitHub authorization tab.
4. **Read Vercel Function Logs** for the safe presence flags. If `hasCode` and `hasState` are true but `hasExpectedState` is false, inspect the browser network request and cookie storage for the same `www` host. If the cookie is present in the request, the issue is parsing; if absent, inspect the actual start route used by the UI and any host redirect before it.
5. **Only after state passes**, verify GitHub code exchange, owner authorization, TiDB `users` upsert, `bd_session` creation, and redirect to `/app` in that order.

> The historical hypothesis that `SameSite=Lax` itself prevents GitHub’s top-level redirect is unconfirmed. A `SameSite=Lax` cookie should ordinarily accompany a top-level safe navigation, so replace the assumption with request-level evidence before changing the cookie policy.

---

## Key Files

| File | Responsibility | Current status |
|---|---|---|
| `api/github-start.ts` | Generates OAuth state, sends state cookie, and redirects to GitHub. | Working in production. |
| `api/oauth-callback.ts` | Validates state, exchanges GitHub code, restricts owner access, upserts user, signs session. | Blocked at pre-exchange validation. |
| `api/github/auth.ts` | Secondary Hono GitHub OAuth path. | Retains aligned owner-authorization logic. |
| `api/lib/env.ts` | Maps Vercel environment variables and owner defaults. | Deployed. |
| `api/auth/session.ts` | Signs and verifies the `bd_session` JWT. | Deployed. |
| `api/queries/connection.ts` | Builds the Drizzle/MySQL connection and enables TLS for TiDB Cloud. | Deployed with `d164a433`. |
| `api/queries/users.ts` | Looks up and upserts the signed-in GitHub user. | Deployed. |
| `db/schema.ts` | Current dashboard schema. | 31 tables migrated to TiDB Cloud. |
| `db/migrations/0000_misty_risque.sql` | Initial MySQL migration. | Already applied. |
| `vercel.json` | Vercel function and SPA routes. | Deployed. |
| `contracts/constants.ts` | Defines the `bd_session` cookie contract. | Deployed. |

---

## Environment Variables — Production Only

Do not place credential values in the repository, handoff, GitHub issue, screenshots, or chat. The values below must be configured in **Vercel Production** for the `better-daze-dashboard` project.

| Variable | Required value shape | Status to verify |
|---|---|---|
| `DATABASE_URL` | TiDB Cloud MySQL URL for database `better_daze_dashboard`; use TLS-compatible connection settings. | The owner confirmed it was added; verify production scope after any password rotation. |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID. | Required; start route has a non-secret fallback, but configure explicitly. |
| `GITHUB_CLIENT_SECRET` | Current GitHub OAuth App client secret. | Required by callback code exchange; rotate before external sharing. |
| `SESSION_SECRET` | Unique high-entropy secret, at least 32 random characters. | Required for signed dashboard sessions. |
| `APP_URL` | Exactly `https://www.better-daze-sf.com`. | Required to keep start and callback on the canonical host. |
| `OWNER_UNION_ID` | `github:257014198`. | Required owner restriction; code also allows the specified GitHub login. |

The database target is TiDB Cloud Starter instance `bdzpod` (ID `10848825632083225918`), database `better_daze_dashboard`. The exact host, user, and password must be retrieved only from the owner’s TiDB console and stored only in Vercel Production environment settings.

---

## Security and Access Rules

The owner requires `williamrichardson743` to be the **only** authorized GitHub account. Keep both owner checks in the callback unless the owner deliberately changes the policy:

| Check | Expected value |
|---|---|
| GitHub login | `williamrichardson743` |
| GitHub numeric ID / union ID | `257014198` / `github:257014198` |

The TiDB password and GitHub OAuth client secret were exposed during the previous troubleshooting conversation. They must be treated as compromised. Before any external agent receives console access, rotate both values, update the Vercel Production variables, and test the flow again. Use least-privilege access and do not give an agent direct credentials when screen sharing or owner-operated console changes are sufficient.

---

## Operational Constraints

| Requirement | Rule |
|---|---|
| Hosting cost | Free-tier-only architecture: Cloudflare DNS/TLS, Vercel deployment, TiDB Cloud Starter. |
| Railway | Do not reconnect, redeploy, or route traffic through Railway. |
| Shopify | Preserve the Shopify store at `ond.better-daze-sf.com`; it is separate from this dashboard login repair. |
| IONOS | Preserve IONOS email functionality; do not alter MX records as part of this OAuth fix. |
| Data | Preserve the existing TiDB schema and records. Do not reset or drop the database. |
| OAuth scope | Keep the GitHub OAuth App redirect URI HTTPS-only and exact. |

---

## Repository Hygiene

At the time of this handoff, `AUTH_BLOCKER_FINDINGS.md` and `DEPLOYMENT_FINDINGS.md` are untracked local files and contain stale statements from before the GitHub/TiDB migration. Treat this `AGENT_HANDOFF.md` and the current `kimi-production` commit history as the source of truth. Do not commit those untracked files unless they are reconciled against the current deployment first.

## Credit and Delegation Context

No reliable project-level credit meter is recorded in the repository. The remaining fix is a small, bounded Vercel/TypeScript debugging task and does **not** require large-scale generation, design work, database rebuilds, or a paid service. Assign it to one engineer/agent with access to the repository and Vercel logs; avoid parallel OAuth changes that could obscure the root cause.

## Definition of Done

The Front-End Shift is complete only after an authenticated browser session proves all of the following:

1. Starting at `https://www.better-daze-sf.com/login` redirects to GitHub and returns to the same `www` callback host.
2. The callback accepts the fresh `state` and authorization `code` without exposing sensitive logs.
3. Only `williamrichardson743` is authorized.
4. A user record is created or updated in TiDB Cloud.
5. The server sends `bd_session` and redirects to `https://www.better-daze-sf.com/app`.
6. The dashboard loads authenticated data without a Railway request, error, or paid-hosting dependency.

---

## References

[1]: ./api/oauth-callback.ts "OAuth callback implementation"
[2]: ./api/github-start.ts "GitHub OAuth start implementation"
[3]: ./vercel.json "Vercel route configuration"

**Handoff date:** 2026-08-16

**Handoff from:** Manus

**Handoff to:** External Vercel/TypeScript engineer
