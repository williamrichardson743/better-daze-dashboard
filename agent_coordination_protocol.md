# AGENT COORDINATION PROTOCOL
**Better Daze / Official Narrative Div — Multi-Agent Operating Standard**
Version 1.0 · Maintained in `better-daze-dashboard` @ `kimi-production`

---

## 0. Why This Exists

This protocol is the standing agreement for every AI agent working on Better Daze
(Claude, Kimi, Manus, and any future agent). It exists because uncoordinated work
has already cost us:

- **33 products where there should be ~7** — repeated Printify/Shopify syncs by
  different agents with no claim-check. A pure coordination failure.
- **~8,000 credits burned in <5 minutes** on a single failed build with no
  cost ceiling or pre-flight check.
- **Zero shared visibility** — no agent knew what the others had done, so work
  was duplicated and contradicted.

The repo is the single source of truth. If it isn't written here, it didn't happen.

---

## 1. Roles

| Agent | Primary Lane |
|-------|--------------|
| **Will (Operator)** | Final authority. Approves destructive + paid actions. Sets priorities. |
| **Claude** | Strategy, Shopify/store ops, copy, docs, infra guidance, cleanup. |
| **Kimi** | Social automation (Ayrshare), dashboard production branch, deployment. |
| **Manus** | Storefront architecture, design/POD pipeline, agent hub. |

Lanes are defaults, not walls. Cross-lane work is allowed **only after claiming it**
(Section 3) so two agents never touch the same surface at once.

---

## 2. Prime Directives

1. **Claim before you act.** Never modify a shared surface (Shopify, Printify,
   repo, social, DNS) without an open claim in `AGENT_LEDGER.md`.
2. **Be idempotent.** Before creating anything, check if it already exists.
   Never re-sync, re-import, or re-create blindly. This is the #1 cause of the
   33-product mess. Search first, create second.
3. **Respect credit/compute ceilings.** No single automated operation exceeds
   **1,000 credits** without an explicit Will approval logged in the ledger.
   Pre-flight every expensive job (Section 5).
4. **Confirm destructive + paid actions.** Archive, delete, deploy-to-prod,
   credential rotation, anything that spends money, and anything irreversible
   require a logged Will approval before execution.
5. **Log everything.** Every action gets a one-line ledger entry: who, what,
   when, result. No silent work.
6. **Revenue first.** When prioritizing, the question is always: does this put
   product in front of a buyer or remove friction from a sale? Housekeeping
   yields to distribution.

---

## 3. Task Lifecycle

Every task moves through these states in `AGENT_LEDGER.md`:

```
CLAIMED  → IN_PROGRESS → DONE
                       ↘ BLOCKED (needs Will or another agent)
                       ↘ HANDOFF (passed to named agent)
```

**To claim:** add a row before starting.
```
[CLAIMED] 2026-05-31 22:10 | Claude | Archive 26 duplicate products | ref: catalog cleanup
```
**On finish:** update the same row to `[DONE]` with the result.
If a task sits `IN_PROGRESS` >24h with no update, any agent may reclaim it.

---

## 4. Anti-Duplication Rules (the 33-product lesson)

Before creating ANY product, collection, page, post, or file:

1. **Query first.** Pull the existing set and check for a match by title/handle/SKU.
2. **One canonical record per thing.** If a duplicate exists, update it — do not
   add a parallel copy.
3. **Printify/Shopify sync is not "create."** Re-running a sync must update
   existing records, never spawn new ones. If unsure, stop and ask.
4. **Handles are identity.** `compliance-is-mandatory` and
   `compliance-is-mandatory-1` are a red flag — never intentional.

---

## 5. Credit & Compute Discipline (the 8K-burn lesson)

Before any build, batch job, or automated loop:

1. **Estimate first.** State expected cost/time. If unknown, run the smallest
   possible test (1 item) before the full run.
2. **Hard ceiling: 1,000 credits** per operation without logged approval.
3. **Fail fast.** If an operation isn't returning useful output within its
   estimate, kill it. Do not let it run blind.
4. **No retry loops** on a failing job without changing the inputs. Repeating a
   failed call with the same parameters wastes credits and changes nothing.
5. **Log the spend.** Every credit-consuming run gets a ledger line with the
   actual cost so we can track ROI per effort.

---

## 6. Status Reporting

Single shared file: **`AGENT_LEDGER.md`** (repo root, `kimi-production`).

Each agent appends; no one rewrites another agent's lines. Format:
```
[STATUS] DATE TIME | AGENT | ACTION | RESULT/REF
```
The agent hub (`feature/agent-hub-live`) reads this ledger to render
cross-agent visibility. Keep it current or the hub lies.

---

## 7. Escalation & Conflicts

- **Two agents want the same surface:** first logged claim wins; the second waits
  or takes an adjacent task.
- **Contradictory instructions:** Will's latest in-chat instruction overrides.
- **Blocked >24h:** escalate to Will with a one-line summary of the blocker and
  the single decision needed to unblock.
- **Uncertainty on destructive/paid action:** default to STOP and ask. A paused
  task is cheap; an irreversible mistake is not.

---

## 8. Definition of Done

A task is DONE only when:
- The change is live and verified (not just attempted),
- The ledger row is updated to `[DONE]` with a reference/link,
- Any follow-on task it created is itself claimed or logged.

---

## 9. Operating Context (constants)

- **North-star goal:** $150,000/month revenue.
- **Reinvestment rule:** 30% of revenue back into growth.
- **Brand:** charcoal `#222222` + banana gold `#FFC800`. Distinctive, premium,
  motion-forward. Never generic-AI aesthetic.
- **Execute on go-ahead** — once Will approves, act; don't re-ask.
- **All listings:** San Francisco Bay Area.

---

*Acknowledge receipt by appending an `[ACK]` line to `AGENT_LEDGER.md`:*
```
[ACK] 2026-05-31 | Claude | Coordination Protocol v1.0 received and in effect
```
