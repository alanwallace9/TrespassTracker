<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 2.0.0 (MAJOR)
Last Amended: 2025-10-02
Modified Principles:
  - Principle I: Updated to TypeScript 5.7+ (from 5.2.2)
  - Principle II: Updated to Next.js 15.5+ with Vercel deployment (from 13.5 static export)
  - Principle III: BREAKING - Changed from Supabase Auth to Clerk authentication
  - Principle V: Updated to Tailwind CSS v4 and modern shadcn/ui
  - Principle VI: Enhanced with Vercel deployment checks

Added Sections:
  - Deployment Standards (Vercel-specific requirements)
  - Migration from Bolt MVP guidance

Removed Sections:
  - Static Export Constraints (replaced with Vercel deployment model)

Templates Status:
✅ spec-template.md - Reviewed, no updates needed (already references constitution checks)
✅ plan-template.md - UPDATED: Constitution Check v2.0.0, Next.js 15 structure, Server Actions, Clerk auth
✅ tasks-template.md - Reviewed, task ordering and TDD principles align
✅ agent-file-template.md - Reviewed, already generic (no updates needed)

Completed:
✅ Updated plan-template.md Constitution Check section for v2.0.0
✅ Created Clerk migration guide (bolt-mvp-migration-guide.md)
✅ Documented Vercel deployment workflow (bolt-mvp-migration-guide.md)
✅ Added Git workflow best practices (git-workflow-best-practices.md)
✅ Created integration summary (INTEGRATION_SUMMARY.md)
-->

# TrespassTracker Constitution

## Core Principles

### I. Type Safety First
TypeScript type checking MUST pass before any commit. The project uses TypeScript 5.7+ with strict mode enabled. All components, server actions, and utilities MUST have explicit type definitions. Database types MUST be synchronized with Supabase schema using code generation tools.

**Rationale**: Type errors caught at build time prevent runtime failures in production. Modern TypeScript provides enhanced inference and safety features critical for server components and actions.

### II. Modern Next.js Architecture (15.5+)
The application MUST use Next.js 15.5+ with App Router and be optimized for Vercel deployment. This enables:
- Server Components by default for optimal performance
- Server Actions for data mutations
- Partial Prerendering (PPR) support
- Edge runtime where beneficial
- Automatic image optimization via Vercel

**Rationale**: Next.js 15+ with Vercel provides best-in-class performance through server-first architecture, automatic optimizations, and seamless deployment pipeline.

### III. Clerk Authentication
Authentication MUST be handled via Clerk (@clerk/nextjs v6+). Auth checks MUST use async auth() helper in Server Components and middleware. Protected routes MUST be secured via clerkMiddleware(). Client-side auth state MUST use useAuth() hook.

**Rationale**: Clerk provides enterprise-grade authentication with Next.js 15 async support, built-in user management UI, and zero-config social auth, reducing auth complexity compared to custom implementations.

### IV. Row Level Security (RLS) Enforcement
Database access MUST be controlled through Supabase RLS policies based on user roles (user, district_admin, master_admin). ALL database tables MUST have RLS enabled. Policy changes MUST be tracked in supabase/migrations/.

**Rationale**: RLS provides database-level security that cannot be bypassed by client-side code, protecting sensitive trespass records even if frontend auth is compromised.

### V. Modern UI Stack (Tailwind v4 + shadcn/ui)
UI components MUST use Tailwind CSS v4+ with zero-config setup and shadcn/ui component patterns. Server Components MUST be default; Client Components MUST be marked with 'use client' directive. Path aliases (@/*) MUST be used for imports. CSS-in-JS MUST be avoided in favor of Tailwind utilities.

**Rationale**: Tailwind v4 provides 100x faster builds with zero configuration. Server Components by default ensure optimal performance. shadcn/ui provides accessible, customizable components that work seamlessly with the React Server Components architecture.

### VI. Deployment & Quality Gates
Pre-commit: `npm run typecheck` MUST pass (NON-NEGOTIABLE). Pre-deployment: Vercel preview deployments MUST be tested. Production: MUST use Vercel with automatic edge caching, ISR where applicable, and environment variables for secrets. ESLint SHOULD pass but won't block builds.

**Rationale**: TypeScript catches bugs at build time. Vercel preview deployments enable safe testing before production. Edge caching and ISR provide optimal performance for end users.

## Database & Schema Standards

### Schema Migration Management
ALL database schema changes MUST be versioned in supabase/migrations/ using Supabase CLI migration format. Migrations MUST be idempotent and reversible where possible. TypeScript types MUST be auto-generated using `supabase gen types typescript` after schema changes.

**Rationale**: Version-controlled migrations enable reproducible database states across environments. Auto-generated types ensure perfect sync between database schema and TypeScript definitions, eliminating manual type maintenance.

### Clerk + Supabase Integration
User authentication MUST use Clerk. Clerk user IDs MUST be stored in Supabase user_profiles table. Database queries MUST use Clerk user ID for RLS policy enforcement. Server Actions MUST fetch auth() from Clerk before database operations.

**Rationale**: Separating auth (Clerk) from data (Supabase) provides best-of-breed services. Clerk handles complex auth flows while Supabase provides powerful database with RLS security.

## Development Workflow

### Pre-Commit Checklist
Before creating any commit, developers MUST:
1. Run `npm run typecheck` - MUST pass (NON-NEGOTIABLE)
2. Run `npm run lint` - SHOULD pass (recommended)
3. Test affected features locally via `npm run dev`
4. Verify production build via `npm run build`
5. Check Clerk auth flows in development mode

### Deployment Workflow
1. **Local Development**: `npm run dev` with Clerk dev keys and local Supabase
2. **Preview Deployment**: Push to branch → Vercel auto-creates preview → Test Clerk auth with preview domain
3. **Production**: Merge to main → Vercel auto-deploys → Verify Clerk production instance
4. All environment variables MUST be configured in Vercel dashboard (never committed to repo)

## Technology Stack Constraints

### Core Stack (2025)
- **Next.js**: 15.5+ (App Router, Server Components, Server Actions)
- **React**: 19+ (with Next.js 15 compatibility)
- **TypeScript**: 5.7+
- **Tailwind CSS**: v4+ (zero-config, CSS-first)
- **shadcn/ui**: Latest (React 19 compatible)
- **Clerk**: @clerk/nextjs v6+ (Next.js 15 async auth support)
- **Supabase**: @supabase/supabase-js latest (database only, not auth)
- **Vercel**: Deployment platform with edge runtime support

Version changes to these core dependencies MUST be justified in documentation and tested thoroughly. ALWAYS use latest stable versions for security patches.

### Styling Standards
Tailwind CSS v4 MUST be used with zero-config setup (@import "tailwindcss" in global CSS). shadcn/ui component patterns MUST be followed. Custom CSS SHOULD be avoided. Theme customization MUST use CSS variables defined in app/globals.css.

## Governance

### Amendment Process
Constitution amendments require:
1. Documentation of change rationale
2. Impact assessment on existing codebase
3. Update to version number following semantic versioning
4. Review of dependent template files for consistency

### Versioning Policy
- **MAJOR**: Breaking changes to principles that require codebase refactoring
- **MINOR**: New principles added or significant expansions
- **PATCH**: Clarifications, wording improvements, non-semantic fixes

### Compliance Verification
All pull requests and code reviews MUST verify:
- Type safety compliance (typecheck passes)
- Server Components used by default (client components justified)
- Clerk auth properly integrated (middleware + async auth())
- RLS policy coverage for new database access
- Migration files for schema changes
- Vercel deployment successful (preview link tested)

### Bolt MVP Migration Standards
When integrating Bolt-generated MVPs:
1. MUST upgrade all dependencies to constitution-specified versions
2. MUST replace any existing auth with Clerk
3. MUST convert to Server Components where possible
4. MUST implement proper TypeScript types (no `any` types)
5. MUST add Supabase migrations for any database changes
6. MUST configure Vercel deployment with environment variables
7. MUST add proper error boundaries and loading states

### Runtime Guidance
Development-time guidance for AI assistants is maintained in `CLAUDE.md` at repository root. This file provides tactical instructions while the constitution provides strategic principles.

**Version**: 2.0.0 | **Ratified**: 2025-10-02 | **Last Amended**: 2025-10-02
