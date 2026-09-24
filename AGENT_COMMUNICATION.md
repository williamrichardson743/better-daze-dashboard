# BETTER DAZE — AGENT COMMUNICATION

**Reset:** 2026-09-24 by Claude. Everything before this date is archived in
`docs/archive/AGENT_COMMUNICATION_2026-06.md`. It is **stale**, so do not act on it.
That includes the "87 Sketches" push and all its assignments.

---

## Read these first, in this order

1. **This file**: current blockers and the next actions.
2. **`DEPLOYMENT_TRUTH.md`** (branch `docs/deployment-truth`): hosting, branches, auth, database.
   Vercel is the host. `kimi-production` is production. `master` is dead. Railway is gone.
3. **`agent_coordination_protocol.md`**: claim before you act, credit ceilings, approval rules.

## Before you read any repo state

```bash
git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git fetch origin --prune
git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/remotes | head
```

The newest work is on branches, not in whatever the checkout happens to be on.
There are two local clones (`~/dev/better-daze-dashboard` and `~/Downloads/better-daze-dashboard`).
Neither one is authoritative. `origin` is.

---

## STATUS BOARD (update in place; newest first)

### 2026-09-24 · [BLOCKER] Shopify store is offline: zero revenue possible

- `shop.better-daze-sf.com` **and** `xe1y5t-hx.myshopify.com` return **HTTP 402 "Store unavailable."**
  That includes every product page and `products.json`. Shopify serves this when billing lapses or a plan/trial ends.
- The GitHub Pages storefront (official-narrative-div) is up, but every "Shop the Drop" button leads to that dead store.
- **Owner: Will.** Billing/plan is a payment action, so no agent touches it.
- **Until this is fixed, no other revenue work matters.** Do not build pipelines, ads or new designs ahead of it.

### 2026-09-24 · [BLOCKED on Will] Monthly cost baseline

- No subscription costs are recorded anywhere in the repo. The revenue target
  ("cover all subscriptions + a couple hundred") can't be measured without them.
- **Owner: Will.** List each paid service and its monthly cost (Shopify, Printify, Vercel, Manus, Kimi,
  Claude, ChatGPT, Monica, Gemini, domains, etc.). Claude records it in `docs/COST_BASELINE.md`.

### 2026-09-22 · [READY, needs Will] Supabase cutover

- Code done on `claude/vercel-supabase-backlog-jnvr9u`. Script on `ops/supabase-cutover` (`scripts/supabase-cutover.sh`).
- `ops/supabase-cutover` is built on the **dead `master` lineage**. Cherry-pick `8884a85c` only. Never merge the branch.
- Blocked on Will creating Supabase staging + prod projects and setting `DATABASE_URL` per environment.
- Not a revenue blocker. Production runs fine on MySQL today.

### 2026-09-22 · [DRAFT] Cycle 1788893755475 designs

- Two concept designs + social copy on `official-narrative-div` branch `claude/design-drafts-cycle-1788893755475`
  (Left-Handed Dungeon Master, Tattooed Beekeeping Mom). Concepts 3–5 are not in any repo. Whoever holds the list, post it here.
- Nothing is published until the store is back **and** the Revenue-First check passes.

### Standing decision · No continuous autonomous loop yet

- A proposed 30-second polling daemon (auto-start cycles, auto-publish to Shopify) was **declined** on 2026-09-22.
  Its endpoints don't exist, it would run without limit, and it skips the publish approval.
- Automation comes back as a **guarded runner** (manual or slow cron, stops before publish, spend cap,
  ledger entry per step) only **after** the store has made its first real sales.

---

## NEXT ACTIONS (one owner each; claim in AGENT_LEDGER.md before starting)

| # | Action | Owner | Depends on |
|---|---|---|---|
| 1 | Restore the Shopify store (billing/plan) | **Will** | none |
| 2 | Post the monthly subscription list | **Will** | none |
| 3 | Verify Printify→Shopify sync for all 17 listed products: provider, variants, price, shipping, checkout | Claude | #1 |
| 4 | Test purchase through checkout on 1 product, then refund it | Will (payment) + Claude (QA) | #3 |
| 5 | Record break-even: monthly costs ÷ margin per item = units/month needed | Claude | #2, #3 |
| 6 | Distribution for the verified catalog (organic social first, no paid ads until #4 passes) | Manus / Monica | #4 |
| 7 | Guarded automation runner (see standing decision) | Claude / Kimi | first real sales |

## MESSAGE FORMAT

Add new entries at the top of the STATUS BOARD. Don't append transmissions at the bottom.

```
### YYYY-MM-DD · [STATUS] Title
- What is true (with the evidence: URL + status code, commit hash, or screenshot).
- Owner: who acts next.
```

Statuses: `[BLOCKER]` `[BLOCKED on X]` `[READY]` `[IN PROGRESS]` `[DRAFT]` `[DONE, verified <how>]`.
A claim without evidence is not a status.
