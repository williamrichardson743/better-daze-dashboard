# AGENT COORDINATION PROTOCOL
**Version:** 1.0  
**Date:** 2026-05-26  
**Status:** ACTIVE

---

## OVERVIEW

This is the **real-time agent coordination system** for Better Daze operations.

**Agents:** Manus, Gemini, Claude, Monica, Kimi  
**Communication:** GitHub repository (this repo)  
**Sync Cycle:** Every 5 minutes  
**Status:** All agents pull/push updates to this repo

---

## HOW IT WORKS

### 1. Agent Status Updates
Each agent maintains a status file:
- `agents/manus-status.md` - Manus (Operations)
- `agents/gemini-status.md` - Gemini (UI/Chrome)
- `agents/claude-status.md` - Claude (Backend)
- `agents/monica-status.md` - Monica (Integration)
- `agents/kimi-status.md` - Kimi (Coordination)

### 2. 5-Minute Sync Cycle
Every 5 minutes, each agent:
1. **Pull** latest from GitHub
2. **Update** their status file
3. **Commit** changes to GitHub
4. **Push** to remote

### 3. Real-Time Coordination
All agents see what others are doing by reading status files.

---

## AGENT STATUS FORMAT

```markdown
# [AGENT_NAME] Status Report
**Time:** 2026-05-26 14:45 UTC  
**Status:** ACTIVE / IDLE / BLOCKED  
**Current Task:** [Description]  
**Progress:** [0-100%]  
**Next Action:** [What's next]  
**Blockers:** [Any issues]  
**Last Update:** [Timestamp]  
```

---

## WORKFLOW

### For Each Agent (Every 5 Minutes)

```bash
# 1. Pull latest
git pull origin master

# 2. Update your status file
# Edit: agents/[agent-name]-status.md

# 3. Commit
git add agents/[agent-name]-status.md
git commit -m "Update status: [brief description]"

# 4. Push
git push origin master
```

### Example: Manus Update

```bash
cd /path/to/agent-coordination
git pull origin master
# Edit: agents/manus-status.md
git add agents/manus-status.md
git commit -m "Update: Social media posts scheduled (5/5 complete)"
git push origin master
```

---

## STATUS FILE TEMPLATE

Create `agents/[agent-name]-status.md`:

```markdown
# [AGENT_NAME] Status Report

**Time:** [ISO 8601 timestamp]  
**Status:** ACTIVE / IDLE / BLOCKED  
**Uptime:** [Duration]

## Current Task
- **Title:** [What are you working on?]
- **Progress:** [0-100%]
- **Started:** [Timestamp]
- **ETA:** [Estimated completion]

## Recent Actions
- [Action 1] - [Timestamp]
- [Action 2] - [Timestamp]
- [Action 3] - [Timestamp]

## Next Actions
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Blockers
- [Blocker 1] - [Status]
- [Blocker 2] - [Status]

## Metrics
- Tasks Completed: [N]
- Revenue Generated: $[X]
- Errors: [N]

## Last Sync
- **Pulled:** [Timestamp]
- **Pushed:** [Timestamp]
- **Conflicts:** [None/Resolved/Pending]

---
*Updated by [Agent] at [Timestamp]*
```

---

## COMMIT MESSAGE FORMAT

Use consistent commit messages for tracking:

```
[AGENT_NAME] Update: [Brief description]

- Detailed change 1
- Detailed change 2
- Detailed change 3

Status: [ACTIVE/IDLE/BLOCKED]
Progress: [X%]
```

---

## EXAMPLE: MANUS STATUS

```markdown
# MANUS Status Report

**Time:** 2026-05-26 14:50 UTC  
**Status:** ACTIVE  
**Uptime:** 2 hours 5 minutes

## Current Task
- **Title:** Social Media Revenue Activation
- **Progress:** 60%
- **Started:** 2026-05-26 12:45 UTC
- **ETA:** 2026-05-26 15:15 UTC

## Recent Actions
- Generated 5 trending topic posts - 14:45 UTC
- Scheduled posts to Ayrshare - 14:48 UTC
- Verified posting times (12 PM, 3 PM, 6 PM) - 14:50 UTC

## Next Actions
1. Monitor social media engagement
2. Start email list building
3. Track conversion metrics

## Blockers
- Ayrshare API key needs verification - IN PROGRESS
- Shopify auth still broken - KNOWN ISSUE

## Metrics
- Posts Scheduled: 5
- Platforms: 4 (TikTok, Instagram, Twitter, Facebook)
- Expected Reach: 50,000+ impressions
- Revenue Generated: $0 (pending post execution)

## Last Sync
- **Pulled:** 2026-05-26 14:45 UTC
- **Pushed:** 2026-05-26 14:50 UTC
- **Conflicts:** None

---
*Updated by Manus at 2026-05-26 14:50 UTC*
```

---

## CONFLICT RESOLUTION

If two agents edit the same file:
1. Pull latest (`git pull`)
2. Resolve conflicts manually
3. Commit with note: `git commit -m "[AGENT] Resolved conflict with [OTHER_AGENT]"`
4. Push (`git push`)

---

## MONITORING

To see all agent status:
```bash
ls agents/
cat agents/*-status.md
```

To see recent activity:
```bash
git log --oneline -20
```

---

## AGENT RESPONSIBILITIES

### Manus
- Revenue activation (social, email)
- POD pipeline execution
- Overall coordination

### Gemini
- UI/UX review
- Chrome browser integration
- Frontend testing

### Claude
- Backend logic
- Webhook integration
- Code quality

### Monica
- Integration testing
- Test data seeding
- Performance monitoring

### Kimi
- System architecture
- Conflict resolution
- Deployment coordination

---

## SUCCESS CRITERIA

- [ ] All agents can pull/push to repo
- [ ] Status files update every 5 minutes
- [ ] No merge conflicts
- [ ] All agents see real-time updates
- [ ] Coordination working smoothly

---

## TROUBLESHOOTING

### Can't push to repo?
```bash
git pull origin master
# Resolve any conflicts
git push origin master
```

### Status file not updating?
```bash
git status
git add agents/[agent-name]-status.md
git commit -m "Update status"
git push origin master
```

### Need to see other agent's status?
```bash
git pull origin master
cat agents/[other-agent]-status.md
```

---

## NEXT STEPS

1. Each agent clones this repo
2. Creates their status file
3. Sets up 5-minute sync cycle
4. Starts coordinating via GitHub

**All agents should acknowledge receipt of this protocol.**

---

**Status:** READY FOR DEPLOYMENT  
**Coordinator:** Manus  
**Last Updated:** 2026-05-26 14:50 UTC

**GO LIVE NOW.**
