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

### Key Data Types
- `TrespassRecord`: Main incident record with personal info, incident details, status, and expiration
- `UserProfile`: User roles (user, district_admin, master_admin) and settings

### UI Framework
- **shadcn/ui** components in components/ui/
- Configured with Tailwind CSS and CSS variables for theming
- Path aliases configured: `@/*` maps to root

### Application Structure
- app/: Next.js 13 App Router pages
  - app/dashboard/: Protected dashboard area
  - app/login/: Authentication page
- components/: Feature components (dialogs, tables, layouts)
- contexts/: React contexts (AuthContext)
- hooks/: Custom React hooks
- lib/: Utilities and Supabase client
- supabase/migrations/: Database schema migrations

### Database Schema
Key tables (see migrations):
- `trespass_records`: Main incident tracking
- `user_profiles`: User roles and preferences
- Records have RLS policies based on user roles

## Important Notes

- Always run `npm run typecheck` before committing to catch TypeScript errors
- The app uses App Router with client components ('use client') for interactive features
- Auth is handled client-side via Supabase Auth
- Static export means no server-side rendering or API routes at runtime
