#!/usr/bin/env python3
"""
Better Daze Dashboard - Multi-Agent Orchestrator
Coordinates 5 specialized agents working in parallel to build the production dashboard
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Any
from datetime import datetime

# Add to path for imports
sys.path.insert(0, str(Path(__file__).parent))

class AgentOrchestrator:
    """Orchestrates multiple specialized agents for parallel development"""
    
    def __init__(self, project_root: str = "/home/ubuntu/better-daze-dashboard"):
        self.project_root = Path(project_root)
        self.agents = {
            "frontend": {
                "name": "Frontend Agent",
                "description": "Builds React UI, components, and dashboard",
                "tasks": [
                    "Create modern design system (Tailwind + shadcn/ui)",
                    "Build dashboard layout and navigation",
                    "Create social media hub page",
                    "Build cycle monitoring UI",
                    "Create analytics dashboard",
                    "Build settings/configuration pages"
                ],
                "output_files": [
                    "client/src/App.tsx",
                    "client/src/pages/Dashboard.tsx",
                    "client/src/pages/Social.tsx",
                    "client/src/pages/Analytics.tsx",
                    "client/src/pages/Settings.tsx",
                    "client/src/components/",
                    "client/src/index.css"
                ]
            },
            "backend": {
                "name": "Backend Agent",
                "description": "Builds tRPC routes, business logic, and database helpers",
                "tasks": [
                    "Create tRPC router structure",
                    "Implement cycle management routes",
                    "Implement product management routes",
                    "Implement order management routes",
                    "Implement analytics routes",
                    "Create database query helpers"
                ],
                "output_files": [
                    "server/routers.ts",
                    "server/db.ts",
                    "server/_core/context.ts",
                    "server/_core/trpc.ts"
                ]
            },
            "social_apis": {
                "name": "Social APIs Agent",
                "description": "Implements TikTok, Instagram, YouTube integrations",
                "tasks": [
                    "Build TikTok API client with OAuth",
                    "Build Instagram Graph API client with OAuth",
                    "Build YouTube API client with OAuth",
                    "Implement video posting logic",
                    "Implement engagement tracking",
                    "Create trending engine"
                ],
                "output_files": [
                    "server/integrations/tiktok.ts",
                    "server/integrations/instagram.ts",
                    "server/integrations/youtube.ts",
                    "server/integrations/trending.ts"
                ]
            },
            "devops": {
                "name": "DevOps Agent",
                "description": "Handles deployment, Docker, monitoring, and CI/CD",
                "tasks": [
                    "Create Dockerfile for production",
                    "Create docker-compose.yml for local dev",
                    "Create Kubernetes manifests",
                    "Set up GitHub Actions CI/CD",
                    "Create monitoring and logging setup",
                    "Create deployment documentation"
                ],
                "output_files": [
                    "Dockerfile",
                    "docker-compose.yml",
                    "k8s/",
                    ".github/workflows/",
                    "DEPLOYMENT.md"
                ]
            },
            "testing": {
                "name": "Testing Agent",
                "description": "Builds comprehensive test suite",
                "tasks": [
                    "Create vitest configuration",
                    "Write backend integration tests (30+ tests)",
                    "Write frontend component tests (30+ tests)",
                    "Write API endpoint tests (20+ tests)",
                    "Write database tests (10+ tests)",
                    "Create test utilities and fixtures"
                ],
                "output_files": [
                    "server/*.test.ts",
                    "client/src/**/*.test.tsx",
                    "vitest.config.ts"
                ]
            }
        }
        self.start_time = datetime.now()
    
    def print_header(self):
        """Print orchestrator header"""
        print("\n" + "="*80)
        print("BETTER DAZE DASHBOARD - MULTI-AGENT ORCHESTRATOR")
        print("="*80)
        print(f"Project Root: {self.project_root}")
        print(f"Start Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total Agents: {len(self.agents)}")
        print("="*80 + "\n")
    
    def print_agent_plan(self):
        """Print the agent team and their tasks"""
        print("\n📋 AGENT TEAM STRUCTURE\n")
        for agent_id, agent_info in self.agents.items():
            print(f"🤖 {agent_info['name']}")
            print(f"   Description: {agent_info['description']}")
            print(f"   Tasks:")
            for i, task in enumerate(agent_info['tasks'], 1):
                print(f"      {i}. {task}")
            print(f"   Output Files: {len(agent_info['output_files'])} files")
            print()
    
    def create_agent_prompts(self):
        """Create specialized prompts for each agent"""
        prompts = {}
        
        prompts["frontend"] = """
You are the Frontend Agent for the Better Daze Dashboard project.

RESPONSIBILITIES:
1. Build modern, professional React UI using React 19 + TypeScript
2. Use Tailwind CSS 4 and shadcn/ui for consistent design
3. Create responsive, accessible components
4. Implement smooth animations and transitions
5. Build all pages: Dashboard, Social Hub, Analytics, Settings

DELIVERABLES:
- client/src/App.tsx (main app with routing)
- client/src/pages/Dashboard.tsx (main dashboard)
- client/src/pages/Social.tsx (social media hub)
- client/src/pages/Analytics.tsx (analytics dashboard)
- client/src/pages/Settings.tsx (configuration)
- client/src/components/ (reusable components)
- client/src/index.css (global styles with design tokens)

DESIGN REQUIREMENTS:
- Modern, clean aesthetic (no retro/terminal look)
- Professional color palette (blues, grays, accents)
- Smooth transitions and micro-interactions
- Mobile-responsive design
- Dark mode support
- Accessibility (WCAG 2.1 AA)

TECHNICAL REQUIREMENTS:
- Use React hooks (useState, useEffect, useContext)
- Integrate with tRPC for data fetching
- Use React Query for state management
- Implement proper error boundaries
- Add loading states and skeletons

START IMMEDIATELY: Create the complete UI layer with all pages and components.
"""
        
        prompts["backend"] = """
You are the Backend Agent for the Better Daze Dashboard project.

RESPONSIBILITIES:
1. Build tRPC router with type-safe procedures
2. Implement business logic for cycles, products, orders
3. Create database query helpers using Drizzle ORM
4. Implement authentication and authorization
5. Build real-time SSE streaming for cycle monitoring

DELIVERABLES:
- server/routers.ts (main tRPC router with all procedures)
- server/db.ts (database query helpers)
- server/_core/context.ts (tRPC context with user auth)
- server/_core/trpc.ts (tRPC setup)

PROCEDURES TO IMPLEMENT:
- cycle.trigger (start new cycle)
- cycle.status (get current cycle status)
- cycle.history (get past cycles)
- product.create (create new product)
- product.list (list products)
- order.sync (sync from Shopify)
- order.stats (get order statistics)
- analytics.get (get analytics data)
- social.connect (connect social account)
- social.disconnect (disconnect social account)

TECHNICAL REQUIREMENTS:
- Use Drizzle ORM for database queries
- Implement proper error handling
- Add input validation with Zod
- Use protectedProcedure for auth-required endpoints
- Implement proper TypeScript types
- Add comprehensive logging

START IMMEDIATELY: Create the complete backend API layer.
"""
        
        prompts["social_apis"] = """
You are the Social APIs Agent for the Better Daze Dashboard project.

RESPONSIBILITIES:
1. Implement TikTok API client with OAuth 2.0
2. Implement Instagram Graph API client with OAuth 2.0
3. Implement YouTube API client with OAuth 2.0
4. Build video posting logic for all platforms
5. Implement engagement tracking and analytics
6. Create trending engine for sounds/hashtags

DELIVERABLES:
- server/integrations/tiktok.ts (TikTok API client)
- server/integrations/instagram.ts (Instagram API client)
- server/integrations/youtube.ts (YouTube API client)
- server/integrations/trending.ts (Trending engine)

TIKTOK REQUIREMENTS:
- OAuth 2.0 flow with PKCE
- Video posting capability
- Analytics retrieval (views, likes, shares)
- Trending sounds API integration

INSTAGRAM REQUIREMENTS:
- OAuth 2.0 flow with business account
- Reels posting capability
- Engagement metrics retrieval
- Hashtag trending data

YOUTUBE REQUIREMENTS:
- OAuth 2.0 flow for channel access
- Shorts upload capability
- View count tracking
- Trending audio library

TECHNICAL REQUIREMENTS:
- Implement retry logic with exponential backoff
- Handle token refresh automatically
- Add comprehensive error handling
- Implement rate limiting awareness
- Add request logging and monitoring
- Use environment variables for API keys

START IMMEDIATELY: Create all social media API integrations.
"""
        
        prompts["devops"] = """
You are the DevOps Agent for the Better Daze Dashboard project.

RESPONSIBILITIES:
1. Create production-grade Docker setup
2. Create local development docker-compose
3. Create Kubernetes manifests for cloud deployment
4. Set up GitHub Actions CI/CD pipeline
5. Create monitoring and logging setup
6. Write deployment documentation

DELIVERABLES:
- Dockerfile (production image)
- docker-compose.yml (local dev stack)
- k8s/deployment.yaml (Kubernetes deployment)
- k8s/service.yaml (Kubernetes service)
- .github/workflows/ci.yml (CI/CD pipeline)
- DEPLOYMENT.md (deployment guide)

DOCKER REQUIREMENTS:
- Multi-stage build for optimization
- Node.js 22 LTS base image
- Proper health checks
- Environment variable configuration
- Non-root user for security

KUBERNETES REQUIREMENTS:
- Deployment with 3+ replicas
- Service for load balancing
- ConfigMap for configuration
- Secrets for sensitive data
- Resource limits and requests
- Horizontal Pod Autoscaling

CI/CD REQUIREMENTS:
- Run tests on every commit
- Build Docker image on main branch
- Push to registry
- Deploy to staging on PR merge
- Manual approval for production

TECHNICAL REQUIREMENTS:
- Use best practices for container security
- Implement proper logging (stdout/stderr)
- Add health check endpoints
- Configure graceful shutdown
- Set up monitoring hooks

START IMMEDIATELY: Create complete deployment infrastructure.
"""
        
        prompts["testing"] = """
You are the Testing Agent for the Better Daze Dashboard project.

RESPONSIBILITIES:
1. Create comprehensive vitest test suite
2. Write backend integration tests (30+ tests)
3. Write frontend component tests (30+ tests)
4. Write API endpoint tests (20+ tests)
5. Write database tests (10+ tests)
6. Create test utilities and fixtures

DELIVERABLES:
- vitest.config.ts (test configuration)
- server/*.test.ts (backend tests)
- client/src/**/*.test.tsx (frontend tests)
- shared/test-utils.ts (test utilities)

TEST COVERAGE TARGETS:
- Backend: 80%+ coverage
- Frontend: 70%+ coverage
- Critical paths: 100% coverage
- Total: 100+ tests

BACKEND TESTS (30+):
- Cycle creation and execution
- Product management
- Order synchronization
- Analytics calculation
- Social account connection
- Error handling and recovery

FRONTEND TESTS (30+):
- Dashboard rendering
- User interactions
- Form submissions
- Data fetching with tRPC
- Error states
- Loading states

API TESTS (20+):
- Authentication flows
- Authorization checks
- Input validation
- Error responses
- Rate limiting
- Concurrent requests

DATABASE TESTS (10+):
- CRUD operations
- Relationships
- Transactions
- Migration validation

TECHNICAL REQUIREMENTS:
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Create test fixtures and mocks
- Implement test data factories
- Add performance benchmarks
- Create test documentation

START IMMEDIATELY: Create comprehensive test suite.
"""
        
        return prompts
    
    def create_agent_instructions(self):
        """Create detailed instructions for each agent"""
        instructions = {}
        
        for agent_id, agent_info in self.agents.items():
            instructions[agent_id] = f"""
AGENT: {agent_info['name']}
PROJECT: Better Daze Dashboard - Production Build
ROLE: Specialized developer for {agent_id.replace('_', ' ')}

CONTEXT:
You are part of a 5-agent team building a production-grade social media automation dashboard.
Your team is working in parallel, so coordinate through shared code and Git commits.

YOUR DOMAIN: {agent_id.upper()}

KEY FILES YOU'LL CREATE:
{json.dumps(agent_info['output_files'], indent=2)}

TASKS TO COMPLETE:
{json.dumps(agent_info['tasks'], indent=2)}

CONSTRAINTS:
1. All code must be production-ready (no TODOs or FIXMEs)
2. Follow TypeScript strict mode
3. Include proper error handling
4. Add comprehensive comments
5. Use existing project structure
6. Integrate with other agents' code
7. Write tests as you go
8. Commit frequently to Git

COORDINATION:
- Frontend Agent: Builds UI that calls tRPC endpoints
- Backend Agent: Builds tRPC routes that use database and social APIs
- Social APIs Agent: Builds integrations used by backend
- DevOps Agent: Creates deployment infrastructure
- Testing Agent: Tests all components

YOUR DEPENDENCIES:
- All agents depend on the database schema (already created)
- Backend depends on Social APIs
- Frontend depends on Backend (tRPC routes)
- DevOps depends on all code being complete
- Testing depends on all code being complete

EXECUTION:
1. Start immediately
2. Work in parallel with other agents
3. Commit code frequently
4. Use Git for coordination
5. Report completion when done

PROJECT STRUCTURE:
/home/ubuntu/better-daze-dashboard/
├── client/src/          (Frontend)
├── server/              (Backend)
├── drizzle/             (Database schema - DONE)
├── package.json         (Dependencies - DONE)
└── PRODUCT_ARCHITECTURE.md (Specs - DONE)

START NOW: Begin implementing your domain immediately.
"""
        
        return instructions
    
    def print_execution_plan(self):
        """Print the execution plan"""
        print("\n🚀 EXECUTION PLAN\n")
        print("All 5 agents will work in PARALLEL:")
        print()
        print("1. Frontend Agent")
        print("   → Builds React UI, pages, components")
        print("   → Creates design system and styling")
        print()
        print("2. Backend Agent")
        print("   → Builds tRPC routes and procedures")
        print("   → Creates database query helpers")
        print()
        print("3. Social APIs Agent")
        print("   → Implements TikTok, Instagram, YouTube clients")
        print("   → Builds trending engine")
        print()
        print("4. DevOps Agent")
        print("   → Creates Docker, Kubernetes, CI/CD")
        print("   → Builds deployment infrastructure")
        print()
        print("5. Testing Agent")
        print("   → Writes 100+ tests")
        print("   → Creates test utilities and fixtures")
        print()
        print("COORDINATION:")
        print("- All agents commit to Git")
        print("- Dependencies managed through code")
        print("- Final integration happens automatically")
        print()
        print("TIMELINE: 6-8 hours wall-clock time")
        print()
    
    def run(self):
        """Run the orchestrator"""
        self.print_header()
        self.print_agent_plan()
        self.print_execution_plan()
        
        # Create agent prompts
        prompts = self.create_agent_prompts()
        instructions = self.create_agent_instructions()
        
        # Save prompts to files for agents
        prompts_dir = self.project_root / ".agent-prompts"
        prompts_dir.mkdir(exist_ok=True)
        
        for agent_id, prompt in prompts.items():
            prompt_file = prompts_dir / f"{agent_id}_prompt.txt"
            prompt_file.write_text(prompt)
            print(f"✅ Created prompt for {agent_id} agent")
        
        print("\n" + "="*80)
        print("AGENT ORCHESTRATOR READY")
        print("="*80)
        print("\nNext steps:")
        print("1. Spawn 5 specialized agents with their respective prompts")
        print("2. Each agent works on their domain in parallel")
        print("3. Agents coordinate through Git commits")
        print("4. Final integration and testing")
        print("\nEstimated completion: 6-8 hours")
        print("="*80 + "\n")


if __name__ == "__main__":
    orchestrator = AgentOrchestrator()
    orchestrator.run()
