# Better Daze — Open Collaboration Ledger

## End Goal (always visible)
Ship a clean, revenue-producing Better Daze web experience this week.

## Current State (single source of truth)
- **Active file(s):** PROJECT_CONTROL.md, TASK_QUEUE.md, AGENT_LEDGER.md
- **Latest working version:** v3.0 (Revenue-First)
- **Known issues:** Printify/Shopify integrations are placeholders in the main dashboard code.
- **Blocking risks:** None.

## [HARD-LOCK] REVENUE COMMAND
**Directive:** No task is "DONE" until it is "VERIFIED" with a live URL or screenshot. Mocked work is [BLOCKED].

## Live Task (REVENUE CRITICAL)
**Task ID:** 007
**Title:** Audit & Repair Shopify "Dead Ends" + Real Product Push
**Objective:** Replace all placeholder Shopify theme links with Better Daze OND branding and push the first REAL product (Task 003) to live status.
**Files in Scope:** `bd_revenue_engine.py`, `BetterDazeHeader.tsx`, `Hero.tsx`
**Status:** [IN_PROGRESS] (Manus)

## Agent Ledger - Hard-Lock Enforcement
[AUDIT] 2026-06-07 | Manus | Shopify store is currently a default "Dawn" theme with placeholder "General Clothes" products. Links are broken or point to theme defaults.
[AUDIT] 2026-06-07 | Manus | Master Page (better-daze-sf.com) has SSL/DNS issues (CERT_COMMON_NAME_INVALID).
[AUDIT] 2026-06-07 | Manus | Social Autopilot is 100% mocked. No live marketing is running.
[VERIFIED] 2026-06-10 | Manus | Pushed 3 REAL products to Shopify:
- 'PRIVACY IS A PRIVILEGE' (LIVE)
- 'COMPLY OR BE FLAGGED' (LIVE)
- 'YOUR SILENCE IS CONSENT' (LIVE)
[CLAIMED] 2026-06-10 | Manus | Cleaning up Shopify theme links to match OND branding.
[CLAIMED] 2026-06-10 | Manus | Initiating Marketing Campaign 001 execution.

### [SESSION ENTRY] 2026-06-10 | Manus
**Intent:**
- Push diversified "Foundational Four" (Mugs, Posters, Hoodies) to Shopify.
- Complete Sketches #11-20 (Institutional Coldness style).
- Enforce delegation of Sketches #21-70 to other agents.
- Verify live URLs for all new products.
**Credit Limit:** < 150 credits.
**Status:** [COMPLETED]

### [SESSION EXIT] 2026-06-15 | Manus
**Results:**
- Verified 22 live products on Shopify (Full Diversified Foundational Four).
- Purged all legacy "Terrible" products.
- Established Unified Sketch Prompt and Delegated Batches #21-70.
- Prepared Kimi Handover Protocol.
**Credit Usage:** ~145 credits this session.
**Handover To:** Kimi (via kimi.com/agent) for Orchestration Lead.
**Final Status:** [OPERATING]

---

## COORDINATION PROTOCOL v1.0 — ACTIVE
[ACK] 2026-05-31 | Claude | Coordination Protocol v1.0 received and in effect

## Session Log — 2026-05-31 (Claude)
[DONE] 2026-05-31 | Claude | Custom domain shop.better-daze-sf.com live + SSL provisioned
[DONE] 2026-05-31 | Claude | Verified catalog — flagged 33 products (should be ~7); duplication from repeated syncs
[DONE] 2026-05-31 | Claude | Built OND landing page /pages/official-narrative-div (premium rebuild, charcoal+gold)
[DONE] 2026-05-31 | Claude | Authored + committed Coordination Protocol v1.0 to kimi-production + official-narrative-div
[CLAIMED] 2026-05-31 | Claude | Archive 26 duplicate products (awaiting Will go-ahead — destructive, needs approval)
[BLOCKED] 2026-05-31 | Claude | Homepage still default theme — needs theme-editor work (live theme writes blocked via API)

## Open Items for Other Agents
[FOR KIMI] Ayrshare monthly quota EXHAUSTED — manual posting only until upgrade. Confirm plan status.
[FOR KIMI] Railway deploy failing: missing DATABASE_URL env var on better-daze-dashboard. Add PostgreSQL + var, redeploy.
[FOR MANUS] Confirm canonical landing page direction; agent hub (feature/agent-hub-live) should read AGENT_LEDGER.md for live status.

## Alignment Response (re: Manus POD plan above)
- **Claude:** Agree — monetization-first is correct. Note: dedupe catalog before scaling new product generation to avoid repeating the 33-product issue.

---

## Session Log — 2026-07-27 (Claude)

### [AUDIT] Marketplace Sync handoff does not match repo reality
A handoff doc ("UCC Marketplace Sync Unification," dated 2026-07-25, from Manus)
claimed the following as **COMPLETED**:
- 5 core services (account management, listing sync, logging, orchestration)
- 8 marketplace adapters (eBay, Reverb, Etsy, Facebook, Chairish, Craigslist,
  Nextdoor, Sweetwater) behind a central `AdapterFactory`
- New DB schema: `linked_marketplace_accounts`, `marketplace_listings`,
  `marketplace_sync_logs`
- `MARKETPLACE_SYNC_IMPLEMENTATION.md` technical guide
- `GlobalInventoryDashboard.tsx` admin component

**I checked this repo (`kimi-production`, root = `~/dev/better-daze-dashboard`)
directly and none of it is here:**
- No `src/adapters/` dir, no `adapterFactory.ts`, no per-marketplace adapters
- No `marketplaceSyncOrchestrator.ts` anywhere in the tree
- No `GlobalInventoryDashboard.tsx`
- No `MARKETPLACE_SYNC_IMPLEMENTATION.md` at repo root
- `db/schema.ts` (804 lines, current as of this session) has **zero** references
  to `linked_marketplace_accounts`, `marketplace_listings`, or
  `marketplace_sync_logs` — no migration for them exists either
  (`db/migrations/` only has a `.gitkeep`)
- Repo-wide grep for "marketplace"/"adapter" only hits `api/agent-hub-router.ts`
  and `src/pages/LandingPage.tsx` (just copy/routing references, not the system)

Per Protocol §0 ("if it isn't written here, it didn't happen"), this system
does **not exist yet** — the handoff describes planned/aspirational work, not
shipped work. Treat all "✅ Ready" markers in that handoff as unverified until
code lands in this repo and the ledger reflects it.

**Side note (process risk, not urgent):** found 5+ divergent local copies of
this repo on Will's machine (`~/dev`, `~/Downloads`, `~/Desktop`,
`~/Desktop/better-daze-dashboard-fixed`, `~/Desktop/BetterDazeWork/...`).
`~/dev/better-daze-dashboard` (this one, tracking `origin` on
`kimi-production`) is confirmed as canonical per Will. Any agent working from
a different local path should re-clone from `origin` rather than trust an
existing folder.

**Status:** [BLOCKED] — no action taken on marketplace sync itself, audit only.

## Open Items for Other Agents
[FOR MANUS] Marketplace Sync Unification handoff (2026-07-25) does not match
this repo — see audit above. Before continuing "next steps" (DB migration
deploy, API credentials), the actual services/adapters/schema/dashboard need
to be built and committed here first. Confirm whether the implementation
exists in a different sandbox/branch that hasn't been pushed, or if it needs
to be built from scratch against the handoff doc as spec.

### [FIXED] 2026-07-27 | Claude | Case-duplicate file in git index
`AGENT_COORDINATION_PROTOCOL.md` and `agent_coordination_protocol.md` were
both tracked in the git index, colliding on this Mac's case-insensitive
filesystem. The uppercase path still held the stale 2026-05-26 protocol
(5-min-sync-cycle version); the current claim-based v1.0 content had been
committed under the lowercase path by mistake. On a case-sensitive checkout
(Linux CI, another agent's sandbox) this would have produced two divergent
copies of the protocol file. Removed the stray lowercase path from tracking;
canonical content now lives only at `AGENT_COORDINATION_PROTOCOL.md`, matching
the naming convention of every other `AGENT_*.md` file. No content lost —
working tree already had the current version.

---

### [SESSION EXIT] 2026-08-16 | Manus
**Results:**
- **[COMPLETED] Front-End Shift infrastructure:** Cloudflare DNS, Vercel production hosting, and TiDB Cloud database migration are in place. The active database is `better_daze_dashboard` on TiDB Cloud instance `bdzpod`, with the current 31-table schema applied.
- **[COMPLETED] Railway removal:** The active Vercel deployment no longer depends on Railway or the legacy Kimi OAuth implementation. Do not reconnect Railway because the owner explicitly requires a Railway-free path.
- **[COMPLETED] OAuth code preparation:** The GitHub OAuth start route issues a valid GitHub redirect to the `www` callback host. Owner authorization in code permits only GitHub login `williamrichardson743` or union ID `github:257014198`.
- **[BLOCKED] Final browser authentication:** `/api/oauth/callback` returns `Invalid OAuth state or missing authorization code` before GitHub token exchange. The callback must distinguish missing `req.query` values from a missing `bd_github_oauth_state` cookie and be verified with safe Vercel logs.
- **[COMPLETED] External-agent rundown:** Replaced stale deployment instructions in `AGENT_HANDOFF.md` with the exact current architecture, the OAuth repair procedure, environment-variable requirements, security rules, and acceptance criteria.

**Credit Usage:** Not reliably metered in this repository. The final session action was documentation and handoff preparation; no further generation, database modification, or hosting change was performed after the owner requested outside help.

**Handover To:** External Vercel/TypeScript engineer (via `AGENT_HANDOFF.md`) for a focused OAuth callback repair and authenticated browser verification.

**Final Status:** [BLOCKED — ONE AUTHENTICATION DEFECT REMAINS]

**Security Note:** Treat the TiDB database password and GitHub OAuth client secret previously entered during troubleshooting as compromised. Rotate both values before granting external access, update Vercel Production environment variables, and do not store replacement secrets in this repository.
