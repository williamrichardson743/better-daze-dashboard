# Better Daze Dashboard — Production Architecture

**Version:** 2.0.0  
**Status:** Production Build  
**Target:** Enterprise SaaS Product

---

## Executive Summary

Better Daze Dashboard is a fully autonomous social media automation platform designed for print-on-demand e-commerce businesses. The system orchestrates a complete six-phase workflow: trend analysis → design generation → product creation → content production → social distribution → performance optimization. Once configured with API credentials, the platform runs entirely autonomously on a 72-hour cycle, requiring zero manual intervention.

---

## Core Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | Modern, responsive UI |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Professional design system |
| **Backend** | Express.js + tRPC | Type-safe API layer |
| **Database** | MySQL 8 + Drizzle ORM | Relational data persistence |
| **Real-time** | Server-Sent Events (SSE) | Live cycle monitoring |
| **Authentication** | OAuth 2.0 + JWT | Secure user management |
| **Deployment** | Docker + Kubernetes | Cloud-native infrastructure |
| **Testing** | Vitest + Playwright | Comprehensive test coverage |

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Better Daze Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │   Admin UI   │  │ Analytics    │       │
│  │  (React)     │  │  (Settings)  │  │ Dashboard    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                    ┌───────▼────────┐                         │
│                    │  tRPC Router   │                         │
│                    │  (Type-Safe)   │                         │
│                    └───────┬────────┘                         │
│                            │                                  │
│  ┌─────────────────────────┼─────────────────────────┐       │
│  │                         │                         │       │
│  ▼                         ▼                         ▼       │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │  Cycle       │  │  Social      │  │  Analytics   │       │
│ │  Engine      │  │  Media APIs  │  │  Engine      │       │
│ │  (6-Phase)   │  │  (TikTok,    │  │  (Metrics)   │       │
│ │              │  │   Instagram, │  │              │       │
│ │              │  │   YouTube)   │  │              │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                    ┌───────▼────────┐                         │
│                    │  MySQL Database│                         │
│                    │  (Drizzle ORM) │                         │
│                    └────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Six-Phase Autonomous Cycle

The system executes a complete business cycle every 72 hours (configurable):

### Phase 1: Trend Ingestion
- Scrapes trending topics from Google Trends, TikTok, Reddit
- Analyzes search volume and growth velocity
- Generates conspiracy/satire-themed slogans using GPT-4o
- **Output:** Trending slogan + theme classification

### Phase 2: Design Generation
- Generates typography-based design using DALL-E 3
- Applies visual style consistent with brand aesthetic
- Removes background using Remove.bg API
- **Output:** PNG design file + metadata

### Phase 3: Product Creation
- Creates Printify product (Bella+Canvas t-shirt)
- Uploads design to product
- Publishes to Shopify storefront
- Sets price ($27.99 default, configurable)
- **Output:** Product ID + Shopify URL

### Phase 4: Content Generation
- Writes 15-second product video script
- Generates AI voiceover using ElevenLabs
- Creates MP4 video with text overlays
- **Output:** Video file + captions

### Phase 5: Social Distribution
- Schedules posts to TikTok, Instagram, YouTube
- Injects trending sounds and hashtags
- Optimizes posting times based on audience
- **Output:** Post IDs + scheduled timestamps

### Phase 6: Performance Optimization
- Collects engagement metrics from all platforms
- Calculates ROI per design
- Updates inventory based on demand
- Selects best-performing design for next cycle
- **Output:** Performance report + next cycle parameters

---

## Social Media Integration

### TikTok API
- **OAuth Flow:** User authorizes app → receives access token
- **Capabilities:** Post videos, retrieve analytics, trending sounds
- **Rate Limits:** 1000 requests/day
- **Monetization:** Revenue share on views

### Instagram Graph API
- **OAuth Flow:** Business account authorization
- **Capabilities:** Post Reels, retrieve engagement metrics
- **Rate Limits:** 200 requests/hour
- **Monetization:** Affiliate commissions

### YouTube API
- **OAuth Flow:** Channel authorization
- **Capabilities:** Upload Shorts, retrieve view counts
- **Rate Limits:** 10,000 quota units/day
- **Monetization:** Ad revenue + channel memberships

---

## Database Schema

### Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  oauth_id VARCHAR(255),
  subscription_tier ENUM('free', 'pro', 'enterprise'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cycles (6-phase workflow executions)
CREATE TABLE cycles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  cycle_number INT,
  status ENUM('pending', 'running', 'completed', 'failed'),
  current_phase INT,
  slogan VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Social Media Accounts
CREATE TABLE social_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  platform ENUM('tiktok', 'instagram', 'youtube'),
  account_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Social Posts
CREATE TABLE social_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cycle_id INT NOT NULL,
  platform ENUM('tiktok', 'instagram', 'youtube'),
  post_id VARCHAR(255),
  content_url VARCHAR(255),
  posted_at TIMESTAMP,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id)
);

-- Products
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cycle_id INT NOT NULL,
  printify_id VARCHAR(255),
  shopify_id VARCHAR(255),
  slogan VARCHAR(255),
  design_url VARCHAR(255),
  price DECIMAL(10, 2),
  created_at TIMESTAMP,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id)
);

-- Orders
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  shopify_order_id VARCHAR(255),
  customer_email VARCHAR(255),
  quantity INT,
  revenue DECIMAL(10, 2),
  status ENUM('pending', 'paid', 'fulfilled', 'cancelled'),
  created_at TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Analytics
CREATE TABLE analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cycle_id INT NOT NULL,
  total_revenue DECIMAL(10, 2),
  total_views INT,
  total_engagement INT,
  roi DECIMAL(5, 2),
  best_platform VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id)
);
```

---

## API Integration Specifications

### OpenAI Integration
- **Endpoint:** https://api.openai.com/v1
- **Models:** GPT-4o (slogan generation), DALL-E 3 (design)
- **Cost:** ~$0.08 per cycle
- **Fallback:** Simulation mode with pre-generated content

### Printify Integration
- **Endpoint:** https://api.printify.com/v1
- **Authentication:** API Key
- **Operations:** Create product, upload design, publish to Shopify
- **Cost:** Included in product markup

### Shopify Integration
- **Endpoint:** https://{store}.myshopify.com/admin/api/2024-01
- **Authentication:** OAuth + Admin API token
- **Operations:** Create products, sync orders, manage inventory
- **Rate Limits:** 2 requests/second

### ElevenLabs Integration
- **Endpoint:** https://api.elevenlabs.io/v1
- **Authentication:** API Key
- **Operations:** Generate voiceover, list voices
- **Cost:** ~$0.10 per cycle

### Ayrshare Integration
- **Endpoint:** https://app.ayrshare.com/api
- **Authentication:** Bearer token
- **Operations:** Schedule posts to TikTok, Instagram
- **Cost:** ~$0.03 per cycle

### Remove.bg Integration
- **Endpoint:** https://api.remove.bg/v1
- **Authentication:** API Key
- **Operations:** Remove background from images
- **Cost:** ~$0.10 per cycle

---

## Error Handling & Recovery

### Retry Strategy
- **Exponential Backoff:** 1s → 2s → 4s → 8s → 16s (max 5 retries)
- **Transient Errors:** Network timeouts, rate limits, temporary service outages
- **Permanent Errors:** Invalid credentials, malformed requests, API deprecations

### Fallback Mechanisms
- **API Failure:** Switch to simulation mode, continue with mock data
- **Database Failure:** Queue operations in memory, retry on reconnection
- **Social Media Failure:** Skip platform, continue with others

### Monitoring & Alerting
- **Health Checks:** Every 60 seconds for all API endpoints
- **Error Logging:** Comprehensive logging to database + external service
- **Alerts:** Email/SMS on critical failures, dashboard notifications

---

## Security & Compliance

### Authentication
- OAuth 2.0 with PKCE for user authentication
- JWT tokens for API access (15-minute expiry)
- Refresh tokens stored securely (encrypted in database)

### Data Protection
- All API keys encrypted at rest (AES-256)
- HTTPS/TLS for all external communications
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in escaping

### Compliance
- GDPR-compliant data handling
- SOC 2 Type II audit-ready logging
- PCI DSS compliance for payment data (via Shopify)
- CCPA data retention policies

---

## Performance & Scalability

### Optimization Strategies
- **Caching:** Redis for session storage, API response caching
- **Database:** Connection pooling (max 20 connections)
- **Frontend:** Code splitting, lazy loading, image optimization
- **Backend:** Request batching, async processing

### Scaling Approach
- **Horizontal:** Stateless Express servers behind load balancer
- **Vertical:** Database read replicas for analytics queries
- **Async:** Bull queue for long-running tasks (video generation, etc.)

### Performance Targets
- **Page Load:** < 2 seconds (First Contentful Paint)
- **API Response:** < 200ms (p95)
- **Cycle Execution:** < 15 minutes (all 6 phases)
- **Uptime:** 99.9% (SLA target)

---

## Deployment Architecture

### Development Environment
- Local Docker Compose stack
- MySQL 8 + Redis
- Hot module reloading (Vite)
- Seeded test data

### Production Environment
- Kubernetes cluster (3+ nodes)
- CloudSQL for managed MySQL
- Redis Cloud for caching
- CDN for static assets
- SSL/TLS termination at load balancer

### CI/CD Pipeline
- GitHub Actions for automated testing
- Docker image build on every commit
- Automated deployment to staging
- Manual approval for production

---

## Monetization Model

### Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Cycles/month | 1 | 4 | Unlimited |
| Social platforms | 1 | 3 | 3 |
| API integrations | Limited | Full | Full |
| Analytics | Basic | Advanced | Custom |
| Support | Community | Email | Dedicated |
| Price | $0 | $99/mo | Custom |

### Revenue Streams
1. **Subscription fees:** $99-999/month per customer
2. **Revenue share:** 5% of customer sales through Shopify
3. **Premium features:** Advanced analytics ($49/mo), white-label ($299/mo)
4. **Professional services:** Custom integrations, setup assistance

---

## Success Metrics

### Product Metrics
- **Activation:** 80% of users complete first cycle
- **Retention:** 70% monthly retention rate
- **Revenue:** $5K MRR within 6 months
- **NPS:** > 50 (Net Promoter Score)

### Technical Metrics
- **Uptime:** 99.9% availability
- **Error Rate:** < 0.1% of requests
- **Cycle Success Rate:** > 95% completion
- **Response Time:** < 200ms p95

---

## Next Steps

1. **Week 1:** Build UI + database schema
2. **Week 2:** Implement social media APIs
3. **Week 3:** Build cycle engine + analytics
4. **Week 4:** Testing, documentation, launch

---

**Document Version:** 1.0  
**Last Updated:** April 13, 2026  
**Author:** Manus AI
