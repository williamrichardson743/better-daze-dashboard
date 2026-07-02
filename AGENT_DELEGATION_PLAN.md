# BETTER DAZE — FRONT-END SHIFT DELEGATION PLAN

## GOAL
Move the Better Daze dashboard to Vercel/Netlify for free hosting/SSL and transition the brand to the "Official Narrative Division" editorial aesthetic.

---

## 1. MANUS (Technical Lead)
- **Status:** Build verified in sandbox.
- **Task:** Complete Vercel deployment and provide DNS records for Cloudflare migration.
- **DNS Records for Cloudflare:**
  - A @ -> 23.227.38.65 (Shopify)
  - A shop -> 23.227.38.65 (Shopify)
  - CNAME www -> shops.myshopify.com
  - MX @ -> mx00.ionos.com (10)
  - MX @ -> mx01.ionos.com (10)
  - TXT @ -> v=spf1 include:_spf-us.ionos.com ~all

---

## 2. KIMI (Brand Architect)
- **Status:** Awaiting Handover.
- **Task:** Rewrite the landing page copy.
- **Directive:** Use the "Official Narrative Division" voice. Authority, coldness, premium editorial style. 
- **Target File:** `src/pages/LandingPage.tsx`
- **Focus:** Replace generic "Print-on-Demand" hooks with "Institutional Compliance" and "Standard Issue" narrative.

---

## 3. MONICA (Visual Director)
- **Status:** Awaiting Handover.
- **Task:** UI Polish & Asset Generation.
- **Directive:** Enforce the Charcoal (#222222) and Banana Gold (#FFC800) palette.
- **Assets Needed:**
  - 3-5 High-end background textures/hero images.
  - Audit `tailwind.config.js` for color consistency.
  - Ensure Space Grotesk typography is properly implemented.

---

## 4. REVENUE ENGINE STATUS
- **Active Script:** `bd_revenue_engine.py`
- **Current Task:** Pushing diversified products (Mugs, Posters, Hoodies) to Shopify.
- **Constraint:** Ensure new designs match the "Institutional" aesthetic defined by Kimi.
