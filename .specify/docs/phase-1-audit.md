# Phase 1 Audit: Bolt MVP Assessment

**Date**: 2025-10-02
**Branch**: feature/bolt-mvp-integration
**Status**: ✅ Complete

---

## 1. Component Audit: Client vs Server Potential

### Current State
**All 45 components are marked as 'use client'** - typical of Bolt-generated MVPs.

### App Routes (Pages)
- `app/page.tsx` - **Client** (uses useAuth, useRouter, useEffect) - **Can convert to Server**
- `app/dashboard/page.tsx` - **Client** (uses useState, useEffect, useAuth) - **Can convert to Server**
- `app/login/page.tsx` - **Client** (uses useState, form handling) - **Keep as Client**

### Feature Components (Need Review for Server Component Conversion)
1. **DashboardLayout.tsx** - Client (useState, useEffect, router) - **Partially convertible**
2. **RecordsTable.tsx** - Client (useState for filtering) - **Keep as Client**
3. **RecordCard.tsx** - Client (minimal, just rendering) - **Can convert to Server**
4. **RecordDetailDialog.tsx** - Client (useState, dialogs) - **Keep as Client**
5. **AddRecordDialog.tsx** - Client (forms, state) - **Keep as Client**
6. **AddUserDialog.tsx** - Client (forms, state) - **Keep as Client**
7. **CSVUploadDialog.tsx** - Client (file upload, state) - **Keep as Client**
8. **SettingsDialog.tsx** - Client (forms, theme switching) - **Keep as Client**
9. **StatsDropdown.tsx** - Client (dropdown interactions) - **Keep as Client**

### Context Providers
- **AuthContext.tsx** - Client (React Context, useState) - **Will be removed** (replace with Clerk)

### shadcn/ui Components
All 36 UI components remain Client Components (accordion, alert-dialog, avatar, badge, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, slider, switch, tabs, table, textarea, toast, toaster, toggle, toggle-group, tooltip) - **Keep as Client** (designed for interactivity)

### Server Component Conversion Candidates
1. `app/page.tsx` - Simple redirect logic, can be Server Component
2. `app/dashboard/page.tsx` - Data fetching can move to Server Component, pass data to Client UI components
3. `RecordCard.tsx` - Pure presentational, can be Server Component

---

## 2. Dependencies & Versions

### Current Stack (Bolt MVP)
```json
{
  "next": "13.5.1",           // ⚠️ OLD - Need 15.5+
  "react": "18.2.0",          // ⚠️ OLD - Need 19+
  "react-dom": "18.2.0",      // ⚠️ OLD - Need 19+
  "typescript": "5.2.2",      // ⚠️ OLD - Need 5.7+
  "tailwindcss": "3.3.3",     // ⚠️ OLD - Need v4
  "@supabase/supabase-js": "^2.58.0"  // ✅ OK
}
```

### shadcn/ui & Radix UI (36 components)
```json
{
  "@radix-ui/react-*": "Various versions",  // ✅ OK - Will work with React 19
  "lucide-react": "^0.446.0",               // ✅ OK
  "class-variance-authority": "^0.7.0",     // ✅ OK
  "tailwind-merge": "^2.5.2",               // ✅ OK
  "tailwindcss-animate": "^1.0.7"           // ✅ OK
}
```

### Form & Validation Libraries
```json
{
  "react-hook-form": "^7.53.0",       // ✅ OK
  "@hookform/resolvers": "^3.9.0",   // ✅ OK
  "zod": "^3.23.8"                    // ✅ OK
}
```

### Utility Libraries
```json
{
  "date-fns": "^3.6.0",              // ✅ OK
  "cmdk": "^1.0.0",                   // ✅ OK
  "sonner": "^1.5.0",                 // ✅ OK (toast notifications)
  "next-themes": "^0.3.0",            // ✅ OK
  "recharts": "^2.12.7",              // ✅ OK (charts)
  "embla-carousel-react": "^8.3.0",   // ✅ OK
  "vaul": "^0.9.9"                    // ✅ OK (drawer)
}
```

### Missing Dependencies (Need to Install)
```bash
@clerk/nextjs                        # For authentication
@supabase/ssr                        # For Server Component Supabase client
```

---

## 3. Authentication Approach

### Current Implementation (Supabase Auth - Client-Side)
```typescript
// contexts/AuthContext.tsx
- Uses Supabase Auth (supabase.auth)
- Client-side React Context provider
- useAuth() hook for components
- Methods: signUp, signIn, signOut
- Session management via useEffect + onAuthStateChange

// Usage in components:
const { user, loading, signIn, signOut } = useAuth();
```

### Current Test Mode (Bypassed for Testing)
```typescript
// Currently using mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
} as User;
```

### Migration Plan (to Clerk)
**Replace with:**
1. Clerk middleware for route protection
2. Server Components: `const { userId } = await auth()`
3. Client Components: `const { user } = useUser()`
4. Remove AuthContext.tsx entirely
5. Remove all Supabase Auth calls
6. Update user_profiles.id to store Clerk user ID (TEXT instead of UUID)

---

## 4. Database Schema Requirements

### Existing Migrations
- **Initial schema**: `supabase/migrations/20251002154545_add_user_profiles_and_roles.sql`

### Tables & Structure

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY,              -- ⚠️ Change to TEXT for Clerk user ID
  display_name text,
  role text NOT NULL DEFAULT 'user',
  theme text NOT NULL DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'district_admin', 'master_admin')),
  CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system'))
);
```

#### `trespass_records`
```sql
CREATE TABLE trespass_records (
  id uuid PRIMARY KEY,
  user_id uuid,                     -- ⚠️ Change to TEXT for Clerk user ID
  first_name text NOT NULL,
  last_name text NOT NULL,
  aka text,
  date_of_birth date,
  school_id text,
  known_associates text,
  current_school text,
  guardian_first_name text,
  guardian_last_name text,
  guardian_phone text,
  contact_info text,
  incident_date date NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  notes text,
  photo_url text,
  status text NOT NULL,
  is_former_student boolean DEFAULT false,
  expiration_date date,
  trespassed_from text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'))
);
```

### RLS Policies (Supabase Row Level Security)
- Enabled on both tables
- Currently uses `auth.uid()` from Supabase Auth
- **Need to update** to use Clerk JWT token: `auth.jwt() ->> 'sub'`

### Required Schema Changes for Clerk
1. Change `user_profiles.id` from `uuid` to `TEXT`
2. Change `trespass_records.user_id` from `uuid` to `TEXT`
3. Update RLS policies to use Clerk JWT: `auth.jwt() ->> 'sub'`
4. Remove FK constraint from `user_profiles.id` to `auth.users(id)`

---

## 5. API Routes / Server Functions

### Current State
**No API routes found** - No `/app/api` directory exists.

### Current Data Flow
All database operations are **client-side direct Supabase calls**:
- `supabase.from('trespass_records').select()`
- `supabase.from('trespass_records').insert()`
- `supabase.from('trespass_records').update()`
- `supabase.from('trespass_records').delete()`
- `supabase.from('user_profiles').select()`
- `supabase.from('user_profiles').update()`

Located in:
- `app/dashboard/page.tsx` - fetchRecords()
- `components/RecordDetailDialog.tsx` - update/delete operations
- `components/AddRecordDialog.tsx` - insert operations
- `components/AddUserDialog.tsx` - user profile insert
- `components/CSVUploadDialog.tsx` - bulk inserts
- `components/SettingsDialog.tsx` - user profile updates
- `components/DashboardLayout.tsx` - fetch display name/role

### Migration Plan (to Server Actions)
**Create Server Actions** for all mutations:
```typescript
// app/actions/records.ts
'use server';
export async function createRecord(formData: FormData) { ... }
export async function updateRecord(id: string, data: Partial<TrespassRecord>) { ... }
export async function deleteRecord(id: string) { ... }

// app/actions/users.ts
'use server';
export async function updateUserProfile(data: { display_name?: string; theme?: string }) { ... }
```

**Server Components** for data fetching:
- Move `fetchRecords()` to Server Component
- Pass data as props to Client Components

---

## Summary & Next Steps

### Current Architecture
- ✅ Next.js 13.5 App Router (good foundation)
- ✅ shadcn/ui + Radix UI (modern, compatible)
- ✅ Supabase database with RLS (good, keep)
- ⚠️ Supabase Auth (replace with Clerk)
- ⚠️ All client components (convert some to Server)
- ⚠️ Client-side data fetching (move to Server)
- ⚠️ Outdated Next.js/React/TypeScript/Tailwind versions

### Phase 2 Priorities
1. **Update dependencies**: Next.js 15.5+, React 19, TypeScript 5.7+, Tailwind v4
2. **Install Clerk**: `@clerk/nextjs`, set up middleware
3. **Update database schema**: Change ID fields from UUID to TEXT for Clerk
4. **Create Supabase server client**: `lib/supabase/server.ts` with Clerk JWT
5. **Configure Clerk JWT template** for Supabase RLS

### Risk Assessment
- **Low Risk**: Dependencies update (good test coverage exists)
- **Medium Risk**: Auth migration (need to preserve user sessions)
- **Medium Risk**: Server Component conversion (need to identify boundaries)
- **Low Risk**: Database schema changes (migrations handle safely)

### Estimated Timeline
- Phase 2 (Database Setup): 1 day
- Phase 3 (Clerk Auth): 1 day
- Phase 4 (Code Migration): 3 days
- Phase 5 (RLS Integration): 1 day
- Phase 6 (Vercel Deployment): 1 day
- Phase 7 (Testing): 1 day

**Total**: 8 days
