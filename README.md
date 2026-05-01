# Better Daze Dashboard

A production-grade autonomous content creation and distribution platform. Orchestrates a complete six-phase workflow: trend analysis → design generation → product creation → content production → social distribution → performance optimization.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Express.js + tRPC (type-safe API)
- **Database**: MySQL 8 + Drizzle ORM
- **Deployment**: Railway (nixpacks)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL 8 database

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — MySQL connection string
- `PORT` — Server port (default: 3000)

### Development

```bash
pnpm dev
```

This starts both the Express server (port 3000) and Vite dev server (port 5173) concurrently.

### Build

```bash
pnpm build
```

Builds the React frontend and bundles the server into `dist/`.

### Start (Production)

```bash
pnpm start
```

Runs `node dist/index.js`.

### Database

```bash
pnpm db:push   # Generate and run migrations
```

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── lib/trpc.ts
│   └── index.html
├── server/          # Express backend
│   ├── _core/       # Server infrastructure
│   │   ├── index.ts    # Express app setup
│   │   ├── trpc.ts     # tRPC initialization
│   │   ├── db.ts       # Database connection
│   │   └── context.ts  # Request context
│   ├── integrations/   # Social media API clients
│   │   ├── tiktok.ts
│   │   ├── instagram.ts
│   │   └── youtube.ts
│   ├── routers.ts   # tRPC router (all API procedures)
│   └── db.ts        # Database query helpers
├── drizzle/
│   └── schema.ts    # Database schema
├── dist/            # Compiled output (git-ignored in production)
├── railway.toml     # Railway deployment config
└── drizzle.config.ts
```

## Deployment

Configured for Railway via `railway.toml`. Set the required environment variables in your Railway service dashboard.
