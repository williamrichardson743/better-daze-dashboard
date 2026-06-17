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
