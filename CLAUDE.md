# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrespassTracker is a Next.js 15.5.4 application for tracking trespass incidents across school districts. It uses Clerk for authentication, Supabase for database management, and is deployed as a dynamic Next.js app on Vercel.

## Development Commands

```bash
# Development server
npm run dev

# Type checking (important: run before commits)
npm run typecheck

# Build for production
npm run build

# Linting (auto-ignored during builds)
npm run lint

# Production preview
npm run start
```

## Architecture

### Deployment Configuration
- Deployed on Vercel as a dynamic Next.js application
- Uses Next.js Middleware for authentication
- Server Actions enabled with 5MB body size limit for image uploads
- Images are unoptimized
- ESLint is ignored during builds (but should be run manually)

### Security Features
- **Rate Limiting**: Upstash Redis (11 requests per 15 minutes per IP)
- **CSP Headers**: Content Security Policy configured in next.config.js
- **Input Validation**: Zod schemas for all user inputs
- **Webhook Security**: Clerk webhook signature verification
- **Audit Logging**: FERPA-compliant audit trail for all data access

### Authentication & Database
- **Clerk** handles authentication with custom domain (clerk.districttracker.com)
- **Supabase** for PostgreSQL database
- Auth state is managed via `AuthContext` (contexts/AuthContext.tsx)
- Database types are defined in lib/supabase.ts
- Environment variables required:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for server actions)
  - `UPSTASH_REDIS_REST_URL` (for rate limiting)
  - `UPSTASH_REDIS_REST_TOKEN` (for rate limiting)

### Database Schema - IMPORTANT
**⚠️ ALWAYS use MCP (Supabase) as the source of truth for database schema.**

DO NOT rely on:
- Migration files in `supabase/migrations/` (may be outdated)
- `DATABASE_SCHEMA.md` (reference only, may be stale)

Instead, use these MCP tools to query the live database:
```typescript
// Get current table structure
mcp__supabase__list_tables({ project_id: "gnbxdjiibwjaurybohak", schemas: ["public"] })

// Execute SQL to verify schema
mcp__supabase__execute_sql({
  project_id: "gnbxdjiibwjaurybohak",
  query: "SELECT * FROM information_schema.columns WHERE table_name = 'tablename'"
})

// List applied migrations
mcp__supabase__list_migrations({ project_id: "gnbxdjiibwjaurybohak" })
```

### Key Data Types
- `TrespassRecord`: Main incident record with personal info, incident details, status, and expiration
  - **Now includes `campus_id`** (nullable text, FK to campuses)
- `UserProfile`: User roles (viewer, campus_admin, district_admin, master_admin) and settings
- `Campus`: School campus definitions with tenant isolation
- `Tenant`: Multi-tenant organization/district definitions

### UI Framework
- **shadcn/ui** components in components/ui/
- Configured with Tailwind CSS and CSS variables for theming
- Path aliases configured: `@/*` maps to root

### Application Structure
- app/: Next.js 15 App Router pages
  - app/trespass/: Main trespass record management (protected)
  - app/login/: Custom Clerk login page
  - app/sign-up/: Custom Clerk sign-up page
  - app/admin/: Admin panel (campuses, users, audit logs, reports, feedback)
  - app/feedback/: Public feedback system (feature requests, bug reports, roadmap)
  - app/boards/: Public feedback boards with voting and comments
  - app/api/: API routes (webhooks, cron jobs)
- components/: Feature components (dialogs, tables, layouts, feedback UI)
- contexts/: React contexts (AuthContext)
- hooks/: Custom React hooks
- lib/: Utilities, Supabase client, rate limiting
- middleware.ts: Clerk authentication and public route handling
- supabase/migrations/: Database schema migrations (DO NOT READ - use MCP)

### Database Tables
**Use MCP to query live schema - DO NOT read migration files**

Core tables:
- `tenants`: Multi-tenant organizations
- `campuses`: School campuses within tenants
- `user_profiles`: User accounts with roles and campus assignments
- `trespass_records`: Main incident tracking with campus_id
- `record_photos`: Photo attachments for records
- `record_documents`: Document attachments for records
- `admin_audit_log`: FERPA-compliant audit trail
- `feedback_items`: User feedback submissions (public)
- `feedback_upvotes`: User votes on feedback
- `feedback_comments`: Comments on feedback items
- `feedback_categories`: Product categories for organizing feedback

All tables have:
- RLS policies enabled
- tenant_id for multi-tenant isolation (except tenants table)
- created_at/updated_at timestamps
- Some have soft delete (deleted_at)

## Important Notes

- Always run `npm run typecheck` before committing to catch TypeScript errors
- The app uses App Router with mix of server and client components
- Auth is handled via Clerk with middleware-based protection
- Protected routes require authentication, public routes (/feedback, /boards) are accessible without login
- **Database changes:** ALWAYS use MCP to apply migrations via `mcp__supabase__apply_migration`
- **Schema queries:** ALWAYS use MCP tools, never read migration files or DATABASE_SCHEMA.md
- **Dynamic APIs:** Use Suspense boundaries for `useSearchParams()` in client components to maintain static generation where possible

## Reference Documents (DO NOT SEARCH)

These files are reference only - use MCP for live data:
- `DATABASE_SCHEMA.md` - Static reference documentation (may be outdated)
- `adminpanelv2.md` - Implementation plan for campus management v2
- `supabase/migrations/*.sql` - Historical migrations (use `mcp__supabase__list_migrations` instead)
- `.claudeignore` - Files to exclude from Claude searches

## Multi-Tenant Architecture

The application uses a multi-tenant architecture:
- Each tenant (district) has isolated data via `tenant_id`
- Campuses belong to tenants
- Users belong to tenants and optionally to campuses
- Records belong to tenants and optionally to campuses
- RLS policies enforce tenant isolation at database level
- Master admins can switch between tenants via tenant selector
