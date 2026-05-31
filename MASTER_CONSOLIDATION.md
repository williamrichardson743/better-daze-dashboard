# Better Daze: Master Consolidation & Revenue Execution Plan

**Version:** 3.0 (Revenue-First Pivot)
**Date:** May 6, 2026
**Author:** Manus AI (Master Consolidation Agent)

---

## 1. Final Site Goal

The primary objective of the Better Daze web presence is to serve as a **high-velocity revenue engine**. The site and its underlying systems must convert cultural trends and internal operational IP into monetizable assets (Print-on-Demand streetwear and digital products) with minimal friction and maximum speed. 

The dashboard is strictly an operational command center to support this goal. It is infrastructure, not the business itself. All development must prioritize revenue-producing actions, scalable digital assets, and audience capture over UI polish or complex analytics.

## 2. Final Page Structure (Revenue-Optimized)

The dashboard structure is simplified to focus entirely on the "Trend-to-Cash" pipeline.

| Page | Primary Function | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Dashboard (Command Center)** | High-level view of active drops, revenue, and the 6-phase cycle monitor. | Exists | Wire cycle monitor to actual `run_loop.py` execution. |
| **Products (The Factory)** | View generated designs, trigger manual Printify/Shopify pushes, and manage the digital product catalog (BD OS). | Missing | Build minimal UI to list products and trigger API pushes. |
| **Social (The Megaphone)** | Manage connected accounts and view generated viral hooks/captions. | Exists (Mocked) | Connect to `trending.ts` to display generated content. |
| **Settings (The Engine Room)** | Manage API keys (OpenAI, Printify, Shopify, ElevenLabs, Ayrshare). | Exists | Ensure all keys are securely passed to the backend runner. |

*Note: The Analytics page is deprioritized until significant sales data exists.*

## 3. Brand & Design Direction

The brand identity is **"Official Narrative Div"**—a satirical, institutional, and slightly gritty aesthetic.

*   **Color Palette:** High-contrast `#FFC800` (Yellow) against `#111827` (Dark Navy/Black).
*   **Typography:** Professional sans-serif for UI elements, mono-spaced fonts (e.g., JetBrains Mono) for data and metrics to enhance the "institutional" feel.
*   **Visual Style:** Minimalist, retro-broadcast aesthetic. Clean vector styles for designs, no illustrations. The UI should feel like a high-end industrial or government dashboard.
*   **Tone:** Direct, structured, actionable. Avoid generic SaaS aesthetics (e.g., standard emojis, overly clean white cards).

## 4. Files to Keep

The following files contain the core "Manus-native" logic and must be retained and integrated:

*   `/home/ubuntu/skills/better-daze-pod/scripts/run_loop.py`: The actual Python implementation of the 6-phase automation loop (Trend -> DALL-E -> Printify -> Shopify -> Ayrshare).
*   `/home/ubuntu/better-daze-dashboard/server/integrations/trending.ts`: The "Viral Brain" containing the 8 categories of viral psychology hooks and the virality scoring algorithm.
*   `/home/ubuntu/better-daze-dashboard/server/services/cycleRunner.ts`: The TypeScript structure for the 6-phase cycle (needs to be wired to the Python script or rewritten to use the TS integrations).
*   `/home/ubuntu/better-daze-dashboard/server/integrations/*.ts`: The OAuth and API client structures for TikTok, Instagram, and YouTube.

## 5. Files to Discard / Deprioritize

*   Complex UI refactoring tasks (e.g., dark mode overhauls, custom icon sets) that do not directly impact revenue.
*   Placeholder analytics logic (`getAnalyticsSummary`, `getSocialStats` returning zeros) until real data is flowing.
*   Extensive testing suites (Vitest/Playwright) until the core revenue loop is proven in production.

## 6. Remaining Tasks (Revenue-Focused)

1.  **Activate the "Trend-to-Sale" Pipeline:** Connect the frontend `CycleMonitor` trigger to the actual execution of the `run_loop.py` script (or its TypeScript equivalent) to push real products to Shopify.
2.  **Deploy the "Viral Hook" Engine:** Integrate `trending.ts` into the content generation phase to automatically produce optimized captions and hashtags for social posts.
3.  **Productize the "BD OS":** Create the first digital product package (e.g., "Better Daze Resale & Automation Kit") and set up a simple sales funnel/landing page for it.
4.  **Audience Capture:** Implement a basic email opt-in mechanism on the public-facing site to start building an owned audience.

## 7. One-Task-at-a-Time Execution Queue (For Claude/Specialized Dev)

This queue is strictly prioritized for fastest viable revenue.

**Task 1: Wire the Printify/Shopify Integration**
*   **Objective:** Replace the `TODO` in `runPhase3` of `cycleRunner.ts` with actual API calls to Printify and Shopify (referencing the logic in `run_loop.py`).
*   **Success Criteria:** A triggered cycle successfully creates a product in Printify and publishes it to the connected Shopify store.

**Task 2: Integrate the Viral Hook Engine**
*   **Objective:** Connect `trending.ts` to `runPhase4` and `runPhase5` of `cycleRunner.ts`.
*   **Success Criteria:** The system automatically generates a caption using a high-converting viral hook and schedules the post via Ayrshare or the native social APIs.

**Task 3: Build the Digital Product Landing Page**
*   **Objective:** Create a simple, high-converting landing page for the "BD OS" digital product.
*   **Success Criteria:** A live page with a clear value proposition, audience capture form, and a "Buy Now" button linked to Stripe or Shopify.

**Task 4: Implement Audience Capture on Dashboard**
*   **Objective:** Add a minimal email capture form to the public-facing areas of the site.
*   **Success Criteria:** User emails are successfully collected and stored in the database or a connected email marketing tool.
