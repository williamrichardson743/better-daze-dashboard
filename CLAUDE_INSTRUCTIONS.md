# Claude Instructions — Better Daze Dashboard

**Copy this entire section and paste it into Claude**

---

## PROJECT CONTEXT

You are part of a **2-agent parallel build** for Better Daze Dashboard, a production-grade social media automation platform.

**Project Location:** `/home/ubuntu/better-daze-dashboard`  
**Your Domains:** Frontend UI + Testing Suite  
**Partner Agent:** Manus (building Backend + Social APIs)  
**Coordination:** Git commits to shared repository

---

## YOUR MISSION

Build two critical components in parallel:

### 1. FRONTEND AGENT (Priority 1)
Build a modern, professional React dashboard UI with all pages and components.

### 2. TESTING AGENT (Priority 2)
Write comprehensive test suite (100+ tests) for the entire application.

---

## PART 1: FRONTEND AGENT

### Objective
Create a production-grade React UI using React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui.

### Files to Create

```
client/src/
├── App.tsx                          (Main app with routing)
├── main.tsx                         (React entry point)
├── index.css                        (Global styles + design tokens)
├── const.ts                         (Constants and config)
├── pages/
│   ├── Dashboard.tsx                (Main dashboard)
│   ├── Social.tsx                   (Social media hub)
│   ├── Analytics.tsx                (Analytics dashboard)
│   ├── Settings.tsx                 (Configuration page)
│   └── NotFound.tsx                 (404 page)
├── components/
│   ├── DashboardLayout.tsx          (Main layout wrapper)
│   ├── Sidebar.tsx                  (Navigation sidebar)
│   ├── Header.tsx                   (Top header)
│   ├── MetricsCard.tsx              (Metric display card)
│   ├── CycleMonitor.tsx             (Cycle status monitor)
│   ├── SocialPlatformCard.tsx       (Social platform card)
│   ├── AnalyticsChart.tsx           (Chart component)
│   ├── LoadingSpinner.tsx           (Loading state)
│   └── ui/                          (shadcn/ui components)
├── hooks/
│   ├── useAuth.ts                   (Authentication hook)
│   └── useCycleStatus.ts            (Cycle status hook)
├── lib/
│   ├── trpc.ts                      (tRPC client setup)
│   └── utils.ts                     (Utility functions)
└── contexts/
    └── AuthContext.tsx              (Auth context provider)
```

### Design Requirements

**Color Palette:**
- Primary: Blue (#2563EB)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: White (#FFFFFF)
- Surface: Gray (#F9FAFB)

**Typography:**
- Headings: Inter, 600-700 weight
- Body: Inter, 400-500 weight
- Monospace: JetBrains Mono (for data)

**Spacing:**
- Base unit: 4px
- Use Tailwind spacing scale (1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32)

**Animations:**
- Smooth transitions (200-300ms)
- Fade in/out effects
- Slide animations for modals
- Micro-interactions on buttons/inputs

### Pages to Build

#### Dashboard.tsx
- **Purpose:** Main dashboard showing system status and metrics
- **Components:**
  - Metrics grid (Revenue, Units, Active Drops, TikTok Views, IG Reach, Cycles Run)
  - Cycle status indicator (current phase, progress bar)
  - Recent orders ticker
  - Activity feed/transmission log
  - "Run Cycle Now" button
- **Data Source:** tRPC `dashboard.metrics` query
- **Features:**
  - Real-time updates (poll every 10 seconds)
  - Responsive grid layout
  - Loading skeletons

#### Social.tsx
- **Purpose:** Unified social media hub
- **Components:**
  - Platform connection cards (TikTok, Instagram, YouTube)
  - Connect/Disconnect buttons
  - Platform stats (followers, engagement rate)
  - Recent posts grid
  - Trending content section
- **Data Source:** tRPC `social.accounts` query, `social.posts` query
- **Features:**
  - OAuth connection flow
  - Real-time engagement metrics
  - Post preview cards

#### Analytics.tsx
- **Purpose:** Comprehensive analytics dashboard
- **Components:**
  - Revenue chart (line chart over time)
  - Engagement by platform (bar chart)
  - Top performing posts (table)
  - ROI calculator
  - Trending topics (tag cloud)
- **Data Source:** tRPC `analytics.get` query
- **Features:**
  - Date range selector
  - Export to CSV
  - Custom report builder

#### Settings.tsx
- **Purpose:** Configuration and API key management
- **Components:**
  - API key input fields (with masking)
  - Scheduler configuration (enable/disable, interval)
  - Platform connection status
  - Test buttons for each API
  - Webhook configuration
- **Data Source:** tRPC `config.loadApiKeys` query
- **Features:**
  - Form validation
  - Test endpoint integration
  - Success/error notifications

### Component Details

#### DashboardLayout.tsx
```typescript
// Main layout wrapper with sidebar + header
// Props: children
// Features:
// - Responsive sidebar (collapsible on mobile)
// - Top header with user menu
// - Navigation links
// - Logout functionality
```

#### MetricsCard.tsx
```typescript
// Reusable card for displaying metrics
// Props: label, value, delta, positive, loading
// Features:
// - Animated number transitions
// - Color-coded delta (green/red)
// - Loading skeleton
// - Tooltip on hover
```

#### CycleMonitor.tsx
```typescript
// Shows current cycle status and phase progress
// Props: cycle (from tRPC query)
// Features:
// - Phase timeline visualization
// - Progress percentage
// - Current phase description
// - Estimated completion time
```

### Technical Requirements

1. **Authentication:**
   - Use `useAuth()` hook from `client/src/_core/hooks/useAuth.ts`
   - Redirect to login if not authenticated
   - Display user profile in header

2. **Data Fetching:**
   - Use tRPC hooks: `trpc.dashboard.metrics.useQuery()`
   - Implement proper loading states
   - Handle errors with toast notifications
   - Use React Query for caching

3. **Styling:**
   - Use Tailwind CSS utility classes
   - Import shadcn/ui components from `@/components/ui/*`
   - Create custom CSS in `index.css` for global styles
   - Support dark mode (optional but nice)

4. **Accessibility:**
   - ARIA labels on interactive elements
   - Keyboard navigation support
   - Focus management in modals
   - Color contrast compliance (WCAG AA)

5. **Performance:**
   - Code splitting with React.lazy()
   - Image optimization
   - Memoization for expensive components
   - Debounce on resize events

### Implementation Order

1. Create `client/src/index.css` with design tokens
2. Create `client/src/App.tsx` with routing
3. Create `client/src/components/DashboardLayout.tsx`
4. Create `client/src/pages/Dashboard.tsx`
5. Create supporting components (MetricsCard, CycleMonitor, etc.)
6. Create `client/src/pages/Social.tsx`
7. Create `client/src/pages/Analytics.tsx`
8. Create `client/src/pages/Settings.tsx`
9. Create `client/src/lib/trpc.ts` (tRPC client setup)
10. Create `client/src/hooks/useAuth.ts`

### Key Files Already Exist

- `package.json` — All dependencies installed
- `tsconfig.json` — TypeScript configuration
- `drizzle/schema.ts` — Database schema
- `PRODUCT_ARCHITECTURE.md` — Full specifications

---

## PART 2: TESTING AGENT

### Objective
Create comprehensive test suite with 100+ tests covering all layers.

### Files to Create

```
├── vitest.config.ts                 (Vitest configuration)
├── server/
│   ├── routers.test.ts              (tRPC router tests - 30+ tests)
│   ├── db.test.ts                   (Database tests - 10+ tests)
│   ├── integrations/
│   │   ├── tiktok.test.ts           (TikTok API tests - 10+ tests)
│   │   ├── instagram.test.ts        (Instagram API tests - 10+ tests)
│   │   └── youtube.test.ts          (YouTube API tests - 10+ tests)
│   └── _core/
│       └── context.test.ts          (Auth context tests - 5+ tests)
├── client/src/
│   ├── pages/
│   │   ├── Dashboard.test.tsx       (Dashboard tests - 8+ tests)
│   │   ├── Social.test.tsx          (Social page tests - 8+ tests)
│   │   ├── Analytics.test.tsx       (Analytics tests - 8+ tests)
│   │   └── Settings.test.tsx        (Settings tests - 8+ tests)
│   ├── components/
│   │   ├── DashboardLayout.test.tsx (Layout tests - 5+ tests)
│   │   ├── MetricsCard.test.tsx     (Card tests - 5+ tests)
│   │   └── CycleMonitor.test.tsx    (Monitor tests - 5+ tests)
│   └── hooks/
│       ├── useAuth.test.ts          (Auth hook tests - 5+ tests)
│       └── useCycleStatus.test.ts   (Cycle hook tests - 5+ tests)
└── shared/
    └── test-utils.ts               (Test utilities and fixtures)
```

### Test Coverage Targets

| Layer | Target | Count |
|-------|--------|-------|
| Backend Routes | 80%+ | 30+ tests |
| Database | 80%+ | 10+ tests |
| Social APIs | 75%+ | 30+ tests |
| Frontend Pages | 70%+ | 32+ tests |
| Frontend Components | 70%+ | 15+ tests |
| Frontend Hooks | 80%+ | 10+ tests |
| **TOTAL** | **75%+** | **100+ tests** |

### Backend Tests (30+ tests)

**routers.test.ts:**
```typescript
describe('tRPC Routers', () => {
  describe('cycle router', () => {
    test('trigger creates new cycle', async () => {})
    test('trigger returns cycle ID', async () => {})
    test('status returns current cycle', async () => {})
    test('history returns past cycles', async () => {})
    test('trigger fails without auth', async () => {})
    // ... 10+ total tests
  })
  
  describe('product router', () => {
    test('create creates new product', async () => {})
    test('list returns all products', async () => {})
    test('update updates product', async () => {})
    // ... 8+ total tests
  })
  
  describe('order router', () => {
    test('sync syncs from Shopify', async () => {})
    test('stats calculates totals', async () => {})
    // ... 6+ total tests
  })
  
  describe('analytics router', () => {
    test('get returns analytics data', async () => {})
    test('get calculates ROI', async () => {})
    // ... 4+ total tests
  })
})
```

**db.test.ts:**
```typescript
describe('Database Helpers', () => {
  test('upsertUser creates new user', async () => {})
  test('upsertUser updates existing user', async () => {})
  test('getUser returns correct user', async () => {})
  test('createCycle creates cycle', async () => {})
  test('updateCycle updates cycle', async () => {})
  test('createProduct creates product', async () => {})
  test('getOrders returns orders', async () => {})
  test('syncOrders updates orders', async () => {})
  test('getAnalytics calculates metrics', async () => {})
  test('createLog creates transmission log', async () => {})
})
```

### Social API Tests (30+ tests)

**tiktok.test.ts:**
```typescript
describe('TikTok API Client', () => {
  test('getAccessToken exchanges code for token', async () => {})
  test('refreshToken refreshes access token', async () => {})
  test('postVideo uploads and posts video', async () => {})
  test('getVideoStats retrieves video metrics', async () => {})
  test('getTrendingSounds returns trending sounds', async () => {})
  test('postVideo handles API errors', async () => {})
  test('postVideo retries on rate limit', async () => {})
  // ... 10+ total tests
})
```

**instagram.test.ts:**
```typescript
describe('Instagram Graph API Client', () => {
  test('getAccessToken exchanges code for token', async () => {})
  test('postReel uploads and posts Reel', async () => {})
  test('getReelStats retrieves engagement metrics', async () => {})
  test('getTrendingHashtags returns trending hashtags', async () => {})
  // ... 10+ total tests
})
```

**youtube.test.ts:**
```typescript
describe('YouTube API Client', () => {
  test('getAccessToken exchanges code for token', async () => {})
  test('uploadShort uploads video', async () => {})
  test('getVideoStats retrieves view count', async () => {})
  // ... 10+ total tests
})
```

### Frontend Tests (32+ tests)

**Dashboard.test.tsx:**
```typescript
describe('Dashboard Page', () => {
  test('renders metrics cards', () => {})
  test('displays cycle status', () => {})
  test('shows recent orders', () => {})
  test('run cycle button triggers mutation', () => {})
  test('loading state shows skeleton', () => {})
  test('error state shows error message', () => {})
  test('real-time updates poll data', () => {})
  test('responsive layout on mobile', () => {})
})
```

**Social.test.tsx:**
```typescript
describe('Social Page', () => {
  test('renders platform cards', () => {})
  test('connect button opens OAuth flow', () => {})
  test('displays platform stats', () => {})
  test('shows recent posts', () => {})
  test('trending section renders', () => {})
})
```

**MetricsCard.test.tsx:**
```typescript
describe('MetricsCard Component', () => {
  test('renders label and value', () => {})
  test('displays delta with correct color', () => {})
  test('shows loading skeleton', () => {})
  test('animates number changes', () => {})
  test('shows tooltip on hover', () => {})
})
```

### Test Utilities (shared/test-utils.ts)

```typescript
// Mock data factories
export const createMockUser = () => {}
export const createMockCycle = () => {}
export const createMockProduct = () => {}
export const createMockOrder = () => {}

// Mock API responses
export const mockTRPCResponse = () => {}
export const mockSocialAPIResponse = () => {}

// Test helpers
export const renderWithProviders = () => {}
export const waitForLoadingToFinish = () => {}
export const mockFetch = () => {}
```

### Vitest Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
})
```

### Implementation Order

1. Create `vitest.config.ts`
2. Create `shared/test-utils.ts` with mock factories
3. Create `server/db.test.ts` (database tests)
4. Create `server/routers.test.ts` (tRPC tests)
5. Create `server/integrations/*.test.ts` (API tests)
6. Create `client/src/pages/*.test.tsx` (page tests)
7. Create `client/src/components/*.test.tsx` (component tests)
8. Create `client/src/hooks/*.test.ts` (hook tests)

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- server/routers.test.ts

# Watch mode
pnpm test -- --watch
```

---

## COORDINATION INSTRUCTIONS

### Git Workflow

1. **Clone the repository:**
   ```bash
   cd /home/ubuntu/better-daze-dashboard
   git status
   ```

2. **Create feature branches:**
   ```bash
   git checkout -b feature/frontend
   git checkout -b feature/testing
   ```

3. **Commit frequently:**
   ```bash
   git add .
   git commit -m "feat: add Dashboard page"
   git push origin feature/frontend
   ```

4. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

### Dependency Coordination

**Frontend depends on:**
- `server/routers.ts` (tRPC routes) — Manus is building this
- `drizzle/schema.ts` — Already complete ✅

**Testing depends on:**
- All code from Frontend and Backend — Both agents complete their code first

### File Naming Conventions

- Components: PascalCase (e.g., `DashboardLayout.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCycleStatus.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Tests: `*.test.ts` or `*.test.tsx`
- Types: `*.types.ts`

### Code Style

- Use TypeScript strict mode
- Use React hooks (no class components)
- Use functional components
- Add JSDoc comments for complex functions
- Use Prettier for formatting
- Use ESLint for linting

### Communication

- **Manus is building:** Backend routes + Social APIs
- **You are building:** Frontend UI + Testing
- **Coordination:** Via Git commits
- **Integration:** Automatic when both complete

---

## DELIVERABLES CHECKLIST

### Frontend Deliverables
- [ ] `client/src/App.tsx` — Main app with routing
- [ ] `client/src/main.tsx` — React entry point
- [ ] `client/src/index.css` — Global styles
- [ ] `client/src/pages/Dashboard.tsx` — Dashboard page
- [ ] `client/src/pages/Social.tsx` — Social hub page
- [ ] `client/src/pages/Analytics.tsx` — Analytics page
- [ ] `client/src/pages/Settings.tsx` — Settings page
- [ ] `client/src/components/` — All components
- [ ] `client/src/hooks/` — Custom hooks
- [ ] `client/src/lib/trpc.ts` — tRPC client

### Testing Deliverables
- [ ] `vitest.config.ts` — Test configuration
- [ ] `shared/test-utils.ts` — Test utilities
- [ ] `server/*.test.ts` — Backend tests (30+ tests)
- [ ] `client/src/**/*.test.tsx` — Frontend tests (32+ tests)
- [ ] All tests passing
- [ ] Coverage report generated

---

## SUCCESS CRITERIA

✅ **Frontend:**
- All pages render correctly
- tRPC integration works
- Responsive design on mobile
- No TypeScript errors
- Smooth animations

✅ **Testing:**
- 100+ tests written
- 75%+ code coverage
- All tests passing
- Test utilities complete
- CI/CD ready

---

## ESTIMATED TIMELINE

- **Frontend:** 3-4 hours
- **Testing:** 2-3 hours
- **Total:** 5-7 hours (parallel with Manus)

---

## NEXT STEPS

1. **Read this entire document carefully**
2. **Understand the architecture** from `PRODUCT_ARCHITECTURE.md`
3. **Review the database schema** in `drizzle/schema.ts`
4. **Start with Frontend Agent** first
5. **Then move to Testing Agent**
6. **Commit frequently to Git**
7. **Coordinate with Manus** via Git commits

---

**Ready to build? Start with Frontend Agent now!**

---

*Document Version: 1.0*  
*Project: Better Daze Dashboard*  
*Date: April 13, 2026*
