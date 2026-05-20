# Better Daze POD Dashboard — Agent Handoff

## Project Status: CODE COMPLETE — DEPLOYMENT PENDING

**Date:** May 13, 2026  
**Current Agent:** Kimi  
**Next Agent:** [Assign]

---

## What's Live

### Architecture
Full-stack Print-on-Demand operations platform with public storefront, AI design automation, social media autopilot, subscription billing, and admin controls.

| Layer | Stack |
|-------|-------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Hono + tRPC 11 + Drizzle ORM |
| Database | MySQL (26 tables) |
| Auth | OAuth 2.0 (role-based: user/admin/viewer) |
| Payments | Stripe (subscriptions + customer checkout) |

---

## Database Schema (26 Tables)

### Core Business
- `users` — OAuth users with roles (user/admin/viewer)
- `cycles` — POD design cycles with phases (ideation → design → review → production → marketing → complete)
- `products` — Product catalog with designUrl, mockupUrl, status (draft → live)
- `orders` — Internal order tracking
- `socialAccounts` — Connected social platforms
- `socialPosts` — Scheduled/published posts per platform
- `transmissionLogs` — System event logs

### E-Commerce
- `productVariants` — Size/color/price variants
- `productImages` — Mockup images with primary/variant association
- `collections` — Product categories (slug-based)
- `productCollections` — Junction table
- `customerOrders` — Public store orders with Stripe integration
- `orderItems` — Line items per order

### Marketing & Automation
- `campaigns` — Multi-platform marketing campaigns with auto-publish/auto-social flags
- `socialTemplates` — Reusable caption templates per platform

### Operations (New)
- `pipelineRuns` — 6-phase autonomous cycle tracking (trend → design → printify → shopify → social → log), per-phase status
- `actionItems` — Checklist with sections (immediate/short-term/deferred) and priority
- `apiCredentials` — API service health monitoring (never stores actual credential values)

### Admin & Billing
- `adminSettings` — Brand config, notification preferences, cycle frequency
- `apiKeys` — API key management with permissions
- `sessions` — Active user sessions
- `loginHistory` — Sign-in audit trail
- `roles` — Custom role definitions
- `permissions` — Resource/action grants per role
- `auditLogs` — All admin actions logged
- `subscriptions` — Stripe subscription lifecycle (starter/growth/enterprise)

---

## Backend API (8 Routers)

| Router | Endpoints | Description |
|--------|-----------|-------------|
| `auth` | login, logout, me, sessions | OAuth flow + session management |
| `dashboard` | stats, cycles, products, recentOrders, recentLogs, socialAccounts, product.{create,update,delete,publish} | Main dashboard data + product CRUD |
| `admin` | users.{list,update,delete}, settings.{get,upsert}, roles.*, permissions.*, auditLogs.* | Admin-only operations |
| `billing` | checkoutSession, portalSession, subscription.{cancel,resume}, webhook | Stripe integration |
| `shop` | products, productById, collections, productsByCollection, createOrder, trackOrder, updatePayment, sellerOrders | Public e-commerce API |
| `campaign` | campaigns.{list,create,update,delete}, templates.{list,create,update,delete}, posts.{list,create,update,delete} | Marketing automation |
| `operations` | pipeline.{list,create,update,delete,start}, actions.{list,create,update,toggleComplete,delete}, credentials.{list,upsert,updateStatus,delete} | Pipeline, checklist, health monitoring |
| `webhook` | stripe | Stripe webhook handler |

---

## Frontend Routes (25 Pages)

### Public
| Route | Page | Auth |
|-------|------|------|
| `/` | Landing page | Public |
| `/login` | OAuth login | Public |
| `/shop` | Product catalog | Public |
| `/shop/product/:id` | Product detail | Public |
| `/shop/cart` | Shopping cart (localStorage) | Public |
| `/shop/checkout` | Guest checkout | Public |
| `/shop/order-success` | Order confirmation | Public |
| `/shop/track` | Order tracking | Public |

### Dashboard (Requires Auth)
| Route | Page | Key Feature |
|-------|------|-------------|
| `/app` | Dashboard home | KPIs, recent activity |
| `/app/design-studio` | AI Design Studio | Prompt → DB product, publish to store |
| `/app/cycles` | Cycle management | POD design cycle tracking |
| `/app/campaigns` | Campaign builder | Multi-platform marketing campaigns |
| `/app/products` | Product catalog | Internal product listing |
| `/app/marketing` | Social Autopilot | Template management, post scheduling |
| `/app/orders` | Seller orders | Customer order fulfillment |
| `/app/analytics` | Revenue analytics | Charts via Recharts |
| `/app/team` | Team management | Role assignments |
| `/app/billing` | Subscription billing | Stripe plans (Starter/Growth/Enterprise) |
| `/app/pipeline` | Pipeline | 6-phase cycle visualization with real-time status |
| `/app/checklist` | Checklist | 3-section action items (immediate/short-term/deferred) |
| `/app/health` | Health Panel | API credential monitoring without exposing secrets |
| `/app/admin` | Admin Settings | User management, roles, security, preferences |

---

## Integrated Features (Backend + Frontend)

### AI Design Studio
- Prompt → style → product type → database product creation via `dashboard.product.create`
- Gallery fetches real draft products from DB
- Publish button updates product status to "live" via `dashboard.product.publish`
- Generates full product mockup descriptions with style + product modifiers

### Social Autopilot
- Templates: Full CRUD via `campaign.templates.*` (stored in `socialTemplates` table)
- Scheduled Posts: Create/manage via `campaign.posts.*` (stored in `socialPosts` table)
- AI Generate: Creates actual post records in DB with auto-generated captions
- Platform support: Instagram, TikTok, Twitter, Facebook

### Campaign Builder
- Full campaign CRUD via `campaign.campaigns.*`
- Platform selection, auto-publish, auto-social, frequency settings
- Status tracking: draft → scheduled → active → paused → completed

### Pipeline (6-Phase Autonomous Cycle)
- Create → Start → Track each phase individually
- Per-phase status: pending, in_progress, completed, failed
- Progress bar computed from completed phases
- Visual flow diagram showing all 6 phases

### Checklist (Action Items)
- 3 columns: Immediate, Short-Term, Deferred
- Priority: Critical, High, Medium, Low with color-coded badges
- Toggle completion via checkbox (updates DB status + completedAt)
- Completion counter per section

### Health Panel (API Monitoring)
- Services: Shopify, Printify, Ayrshare, OpenAI, Stripe, Unsplash
- Status: active, expiring, expired, needs_rotation, error, unknown
- Quick status update buttons
- Alert banner for credentials needing attention
- **Security**: Never stores or displays actual API keys/tokens

### E-Commerce Store
- Public shop with collections
- Product detail with variants (size/color)
- localStorage-based cart
- Guest checkout → Stripe payment → order tracking
- Seller order fulfillment dashboard

### Billing
- Stripe Checkout for subscriptions (Starter/Growth/Enterprise)
- Customer portal for subscription management
- Webhook handler for subscription lifecycle events

---

## Key Files

| File | Purpose |
|------|---------|
| `db/schema.ts` | All 26 tables |
| `api/router.ts` | Root router — registers all 8 sub-routers |
| `api/operations-router.ts` | Pipeline, checklist, health panel endpoints |
| `api/campaign-router.ts` | Campaigns, templates, social posts |
| `api/dashboard-router.ts` | Dashboard stats + product CRUD |
| `api/shop-router.ts` | Public e-commerce + checkout |
| `api/middleware.ts` | publicQuery, authedQuery, adminQuery procedures |
| `src/App.tsx` | All 25 route definitions |
| `src/components/DashboardLayout.tsx` | Sidebar nav with 13 items |
| `src/pages/DesignStudio.tsx` | AI design with tRPC integration |
| `src/pages/SocialAutopilot.tsx` | Social automation with tRPC |
| `src/pages/CampaignBuilder.tsx` | Campaign management with tRPC |
| `src/pages/Pipeline.tsx` | 6-phase cycle visualization |
| `src/pages/Checklist.tsx` | 3-section action tracker |
| `src/pages/HealthPanel.tsx` | API credential monitoring |

---

## Auth & Roles
- `publicQuery` — no auth needed (shop, landing)
- `authedQuery` — requires login (most dashboard pages)
- `adminQuery` — requires role=admin (settings, user management, credential admin)
- Admin nav section conditionally renders based on `user.role`

---

## What Needs Doing Next

### Phase 2: Real-Time Features
- WebSocket or polling for live dashboard updates
- Toast notifications on pipeline completion, new orders, social posts
- Activity feed auto-refresh

### Phase 3: LLM Assistant
- Chat interface reading pipeline status, agent ledger
- Suggest next actions based on remaining quota, products in queue
- Streaming responses with markdown rendering

### Phase 4: External Integrations
- Shopify webhooks for product/order sync
- Ayrshare API for actual social posting
- Printify API for mockup generation
- OpenAI API for design generation

### Phase 5: Data Seeding
- Seed script for demo data (products, pipeline runs, action items)
- Connect to real Better Daze systems

### Phase 6: Performance
- Code splitting (large bundle: ~1.3MB JS)
- Pagination for large lists
- Image optimization for product mockups

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run check        # TypeScript type check
npm run build        # Production build
cd db && npx tsx seed.ts   # Run seed script (create one first)
```

---

## Environment Variables
- `DATABASE_URL` — MySQL connection
- `VITE_KIMI_AUTH_URL`, `VITE_APP_ID` — OAuth config
- Stripe keys — Checkout + webhook handling

---

## Deployment Status (May 13, 2026)

| Asset | Status | URL |
|-------|--------|-----|
| Shopify Store | LIVE | shop.better-daze-sf.com (4 products) |
| GitHub Pages Storefront | LIVE | williamrichardson743.github.io/official-narrative-div |
| Webflow Brand Site | SSL BROKEN | better-daze-sf.com |
| Dashboard API | NOT DEPLOYED | Needs Railway deploy from master |
| Dashboard Domain | NOT CONFIGURED | Point dashboard.better-daze-sf.com to Railway |

### What's Blocking
1. **Railway project** — needs to be created and connected to `better-daze-dashboard` repo
2. **Environment variables** — DATABASE_URL, Stripe keys, OAuth creds need to be set in Railway
3. **DNS** — `dashboard.better-daze-sf.com` needs CNAME to Railway domain
4. **SSL** — `better-daze-sf.com` SSL certificate needs re-issue in IONOS/Webflow

### Next Agent Tasks
1. Create Railway project, deploy from `master` branch
2. Add env vars to Railway dashboard
3. Configure DNS for dashboard subdomain
4. Fix SSL on main domain
5. Connect storefront checkout to dashboard API

Handoff complete.
