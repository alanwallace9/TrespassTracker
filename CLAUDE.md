# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrespassTracker is a Next.js 13.5 application for tracking trespass incidents across school districts. It uses Supabase for authentication and database management, and is configured for static export.

## Development Commands

```bash
# Development server
npm run dev

# Type checking (important: run before commits)
npm run typecheck

# Build for production (static export)
npm run build

# Linting (auto-ignored during builds)
npm run lint

# Production preview
npm run start
```

## Architecture

### Static Export Configuration
- The app is configured with `output: 'export'` in next.config.js
- Images are unoptimized for static hosting
- ESLint is ignored during builds (but should be run manually)

### Database & Authentication
- **Supabase** handles both auth and database
- Auth state is managed via `AuthContext` (contexts/AuthContext.tsx)
- Database types are defined in lib/supabase.ts
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for server actions)

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
- app/: Next.js 13 App Router pages
  - app/dashboard/: Protected dashboard area
  - app/login/: Authentication page
  - app/admin/: Admin panel (campuses, users, audit logs, reports)
- components/: Feature components (dialogs, tables, layouts)
- contexts/: React contexts (AuthContext)
- hooks/: Custom React hooks
- lib/: Utilities and Supabase client
- supabase/migrations/: Database schema migrations (DO NOT READ - use MCP)

### Database Tables (7 tables, 234+ records)
**Use MCP to query live schema - DO NOT read migration files**

Core tables:
- `tenants`: Multi-tenant organizations (2 records)
- `campuses`: School campuses within tenants (33 records)
- `user_profiles`: User accounts with roles and campus assignments (2 records)
- `trespass_records`: Main incident tracking with campus_id (136 records)
- `record_photos`: Photo attachments for records (0 records)
- `record_documents`: Document attachments for records (0 records)
- `admin_audit_log`: FERPA-compliant audit trail (61 records)

All tables have:
- RLS policies enabled
- tenant_id for multi-tenant isolation (except tenants table)
- created_at/updated_at timestamps
- Some have soft delete (deleted_at)

## Important Notes

- Always run `npm run typecheck` before committing to catch TypeScript errors
- The app uses App Router with client components ('use client') for interactive features
- Auth is handled client-side via Supabase Auth (Clerk integration)
- Static export means no server-side rendering or API routes at runtime
- **Database changes:** ALWAYS use MCP to apply migrations via `mcp__supabase__apply_migration`
- **Schema queries:** ALWAYS use MCP tools, never read migration files or DATABASE_SCHEMA.md

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
