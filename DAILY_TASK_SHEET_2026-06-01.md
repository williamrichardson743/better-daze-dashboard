# BETTER DAZE — DAILY TASK SHEET
**Date:** June 1, 2026
**Objective:** Get every build up and running today.

---

## SYSTEM STATUS (RIGHT NOW)

| Build | Status | URL |
| :--- | :--- | :--- |
| Shopify Store | **LIVE** (30 products) | `shop.better-daze-sf.com` |
| Printify Catalog | **LIVE** (32 products) | Synced to Shopify |
| Master Site (Root) | **DOWN** (SSL + No Content) | `better-daze-sf.com` |
| Dashboard | **LIVE** | `betterdash-xwa4ss6e.manus.space` |
| Landing Page (HTML) | **READY** (Not Deployed) | GitHub: `kimi-production` branch |
| 87 Sketches | **10/87 Complete** | GitHub: `betterdazedesign` repo |
| Social Posts | **READY** (10 posts locked) | Awaiting landing page URL |
| POD Automation Loop | **FUNCTIONAL** | `run_loop.py` tested |

---

## TODAY'S EXECUTION QUEUE (Sequential, No Friction)

### TASK 1: Fix the Master Site (better-daze-sf.com)
**Owner:** Will (1 minute in IONOS panel)
**Action:** Log in to IONOS. Go to **Domains > better-daze-sf.com > DNS Settings**. Change the A record from `185.158.133.1` to point to Shopify: `23.227.38.65`. Then in Shopify Admin, go to **Settings > Domains > Connect Existing Domain** and add `better-daze-sf.com`.
**Why:** This eliminates the SSL issue entirely. Shopify handles SSL automatically. Your root domain will serve the same store as `shop.better-daze-sf.com`.
**Alternative:** If you want the root domain to serve the landing page instead of the shop, upload `OND_LandingPage_Final.html` to your IONOS web space and activate SSL in the IONOS panel.
**Result:** `better-daze-sf.com` goes live with SSL.

### TASK 2: Deploy the Landing Page
**Owner:** Manus (Executing Now)
**Action:** I am hosting the landing page at a public URL you can use as your "Link in Bio" immediately while the root domain is being fixed.
**Result:** Traffic can flow to the landing page today.

### TASK 3: Fire Social Posts
**Owner:** Will (Manual) or Manus (via Ayrshare if upgraded)
**Action:** Post the 10 locked-and-loaded social posts with the landing page URL.
**Result:** First traffic hits the store.

### TASK 4: Publish "YOUR DATA, OUR VISION" to Shopify
**Owner:** Manus (Executing Now)
**Action:** The product exists in Printify but hasn't synced to Shopify yet. I am publishing it now.
**Result:** 31st product goes live.

### TASK 5: Continue 87 Sketches (Items #11-20)
**Owner:** Manus
**Action:** Generate the next 10 sketches and push to GitHub.
**Result:** 20/87 complete.

### TASK 6: Prepare BD OS Digital Product Package
**Owner:** Manus + Claude
**Action:** Package the Electronics Repair App and MCI JH 636 logic into a sellable digital download.
**Result:** Second revenue stream ready.

---

## WHAT YOU NEED TO DO (1 ACTION)
**Log in to IONOS and point `better-daze-sf.com` A record to `23.227.38.65` (Shopify).**
Then add `better-daze-sf.com` as a custom domain in your Shopify Admin.

That is the only thing blocking full revenue activation.

---

## WHAT I AM DOING RIGHT NOW (NO INTERVENTION NEEDED)
1. Hosting the landing page at a live URL.
2. Publishing "YOUR DATA, OUR VISION" to Shopify.
3. Generating the next 10 sketches.
