<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Ratification: 2025-10-02
Modified Principles: N/A (initial creation)
Added Sections: All sections (initial constitution)
Removed Sections: None

Templates Status:
✅ spec-template.md - Reviewed, no updates needed (already references constitution checks)
✅ plan-template.md - Updated with specific constitution checklist items for all 6 principles
✅ tasks-template.md - Reviewed, task ordering and TDD principles align
✅ agent-file-template.md - Reviewed, already generic (no updates needed)

Follow-up TODOs: None
-->

# TrespassTracker Constitution

## Core Principles

### I. Type Safety First
TypeScript type checking MUST pass before any commit. The project uses TypeScript 5.2.2 with strict mode enabled. All components, contexts, and utilities MUST have explicit type definitions. Database types MUST be synchronized with Supabase schema definitions in lib/supabase.ts.

**Rationale**: Type errors caught at build time prevent runtime failures in production. Static export deployment means no server-side error recovery, making compile-time safety critical.

### II. Static Export Constraints
The application MUST maintain compatibility with Next.js static export (`output: 'export'`). This means:
- NO server-side rendering (SSR) at runtime
- NO API routes that require a Node.js server
- NO dynamic image optimization (images unoptimized)
- ALL data fetching MUST occur client-side via Supabase

**Rationale**: Static export enables deployment to any static host (GitHub Pages, S3, CDN) without server infrastructure, reducing costs and complexity for school districts.

### III. Client-Side Authentication Flow
Authentication MUST be handled entirely client-side using Supabase Auth. Auth state MUST be managed through AuthContext (contexts/AuthContext.tsx). Protected routes MUST verify authentication status before rendering sensitive data.

**Rationale**: Supabase provides secure client-side auth with JWT tokens, eliminating need for server-side session management while maintaining security through Row Level Security (RLS) policies.

### IV. Row Level Security (RLS) Enforcement
Database access MUST be controlled through Supabase RLS policies based on user roles (user, district_admin, master_admin). ALL database tables MUST have RLS enabled. Policy changes MUST be tracked in supabase/migrations/.

**Rationale**: RLS provides database-level security that cannot be bypassed by client-side code, protecting sensitive trespass records even if frontend auth is compromised.

### V. Component Architecture Standards
UI components MUST follow shadcn/ui patterns located in components/ui/. Feature components (dialogs, tables, layouts) MUST use 'use client' directive when interactive. Path aliases (@/*) MUST be used for imports to maintain consistency.

**Rationale**: Consistent component patterns reduce cognitive load, improve maintainability, and ensure proper Next.js App Router client/server boundary handling.

### VI. Test-Before-Commit Discipline
`npm run typecheck` MUST be executed and pass before creating commits. ESLint checks (`npm run lint`) SHOULD be run manually but are ignored during builds to prevent deployment blockers from linting issues.

**Rationale**: TypeScript errors indicate actual bugs; linting errors indicate style issues. Blocking builds on type errors catches real problems while allowing flexibility on style enforcement.

## Database & Schema Standards

### Schema Migration Management
ALL database schema changes MUST be versioned in supabase/migrations/ using Supabase CLI migration format. Migrations MUST be idempotent and reversible where possible. Type definitions in lib/supabase.ts MUST be regenerated after schema changes.

**Rationale**: Version-controlled migrations enable reproducible database states across environments and team members, preventing schema drift.

### Key Data Types
- **TrespassRecord**: Main incident tracking with personal info, incident details, status, and expiration
- **UserProfile**: User roles and district-specific settings

NEW types MUST be added to lib/supabase.ts with full TypeScript definitions matching database schema.

## Development Workflow

### Pre-Commit Checklist
Before creating any commit, developers MUST:
1. Run `npm run typecheck` - MUST pass (NON-NEGOTIABLE)
2. Run `npm run lint` - SHOULD pass (manual fix recommended)
3. Test affected features locally via `npm run dev`
4. Verify static export builds via `npm run build`

### Build Verification
Production builds (`npm run build`) MUST complete successfully. Static export output in `out/` directory MUST be tested locally before deployment.

## Technology Stack Constraints

### Fixed Dependencies
- **Next.js**: 13.5.1 (App Router, static export)
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Supabase**: @supabase/supabase-js ^2.58.0
- **shadcn/ui**: Radix UI components with Tailwind CSS

Version changes to these core dependencies MUST be justified in documentation and tested thoroughly.

### Styling Standards
Tailwind CSS with CSS variables for theming MUST be used for all styling. shadcn/ui component patterns MUST be followed. Custom CSS SHOULD be avoided unless shadcn/ui patterns are insufficient.

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
- Static export compatibility (no SSR/API routes)
- RLS policy coverage for new database access
- Client-side auth flow preservation
- Migration files for schema changes

### Runtime Guidance
Development-time guidance for AI assistants is maintained in `CLAUDE.md` at repository root. This file provides tactical instructions while the constitution provides strategic principles.

**Version**: 1.0.0 | **Ratified**: 2025-10-02 | **Last Amended**: 2025-10-02
