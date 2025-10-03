# Bolt MVP Migration Guide

## Overview
This guide provides a step-by-step approach to integrate a Bolt-generated MVP into the TrespassTracker project while ensuring compliance with constitution v2.0.0.

## Migration Strategy

### Phase 1: Setup & Assessment (Day 1) ✅ COMPLETED

#### 1.1 Create Feature Branch ✅
```bash
git checkout -b bolt-mvp-integration
```

#### 1.2 Audit Bolt MVP Code ✅
- [x] Identify all components (client vs server potential)
- [x] List all dependencies and versions
- [x] Document authentication approach used
- [x] Map database schema requirements
- [x] Identify API routes or server functions

#### 1.3 Prepare Modern Stack ✅
```bash
# Update to latest Next.js 15.5+
npm install next@latest react@latest react-dom@latest

# Install TypeScript 5.7+
npm install -D typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest

# Install Tailwind v4 (skipped - keeping v3 for compatibility)
# npm install tailwindcss@next @tailwindcss/vite@next

# Install Clerk
npm install @clerk/nextjs

# Ensure latest Supabase client
npm install @supabase/supabase-js@latest @supabase/ssr

# Install shadcn/ui CLI (skipped - already configured)
# npx shadcn@latest init
```

**Installed Versions:**
- Next.js: 15.5.4 ✅
- React: 19.2.0 ✅
- React DOM: 19.2.0 ✅
- TypeScript: 5.9.3 ✅
- @clerk/nextjs: 6.33.1 ✅
- @supabase/supabase-js: 2.58.0 ✅
- @supabase/ssr: 0.7.0 ✅
- Tailwind CSS: 3.3.3 (kept for compatibility)

### Phase 2: Database Setup (Day 1-2) ✅ COMPLETED

#### 2.1 Supabase Project Setup ✅
1. ✅ Supabase project created and configured
2. ✅ Environment variables configured in `.env.local`
3. ✅ Project URL: `https://gnbxdjiibwjaurybohak.supabase.co`
4. ✅ Project ID: `gnbxdjiibwjaurybohak`

#### 2.2 Create Database Migrations ✅
**All Migrations Executed Successfully:**
1. ✅ `20251001013256_create_trespass_tracking_tables.sql` - Initial schema
2. ✅ `20251002154545_add_user_profiles_and_roles.sql` - User profiles & roles
3. ✅ `20251002160555_add_trespassed_from_field.sql` - Trespassed from field
4. ✅ `20251002161753_add_additional_trespass_fields.sql` - Additional fields
5. ✅ `COMBINED_MIGRATION.sql` - Consolidated migration with role-based RLS

**Key Database Features:**
- `user_id` fields are TEXT type (ready for Clerk user IDs like "user_2abc...")
- `user_profiles` table with role-based access control (user, district_admin, master_admin)
- Comprehensive RLS policies:
  - All authenticated users can view records
  - Users, district_admins, and master_admins can create records
  - All authenticated users can update records
  - Only district_admins and master_admins can delete records
  - Only district_admins and master_admins can create users
- Additional fields: `aka`, `school_id`, `known_associates`, `current_school`, `guardian_*`, `contact_info`, `notes`, `trespassed_from`
- Image storage: `photo_url`, `original_image_url`, `cached_image_url`
- Status tracking: `is_former_student`, `expiration_date`, `status` (active/inactive)

Migration structure:
```sql
-- supabase/migrations/YYYYMMDD_initial_schema.sql

-- Create user_profiles table
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trespass_records table (from existing schema)
CREATE TABLE trespass_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(id),
  -- ... other fields from migration files
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trespass_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Authenticated users can view records"
  ON trespass_records FOR SELECT
  TO authenticated
  USING (true);
```

#### 2.3 Generate TypeScript Types ✅
**Updated Type Definitions:**
- ✅ `TrespassRecord` - `user_id` is now `string` (Clerk compatible)
- ✅ `UserProfile` - Complete type with all fields
- ✅ All types updated in `lib/supabase.ts`
- ✅ Connected to real Supabase database (mock wrapper removed)

**Data Import:**
- ✅ Created `fix_csv_headers.py` to convert legacy CSV format
- ✅ Imported 61 existing trespass records from legacy system
- ✅ Added missing columns (`original_image_url`, `cached_image_url`)
- ✅ Removed status constraint to allow legacy values ("Active", "Expired", etc.)

**Note:** Types are manually maintained in `lib/supabase.ts`.
In production, can generate from Supabase:
```bash
npx supabase gen types typescript --project-id gnbxdjiibwjaurybohak > lib/database.types.ts
```

### Phase 3: Clerk Authentication Setup (Day 2) ⏸️ SKIPPED (For Later)

**Prerequisites Completed:**
- ✅ Database schema is Clerk-compatible (TEXT user_id fields)
- ✅ RLS policies ready for JWT tokens (`auth.jwt() ->> 'sub'`)
- ✅ Real data loaded and tested (61 records)
- ⏳ Need to create Clerk application and configure authentication

**Current State:**
- AuthContext.tsx has mock authentication bypass (lines 22-30)
- Login screen is commented out for testing
- Ready to implement proper Clerk authentication flow

#### 3.1 Create Clerk Application ⏸️ TODO
1. Sign up at https://clerk.com
2. Create new application
3. Enable email/password (or preferred providers)
4. Note Publishable Key and Secret Key

#### 3.2 Configure Environment Variables (Vercel)
```bash
# .env.local (for local dev - NOT committed)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Add same variables in Vercel dashboard for preview/production.

#### 3.3 Setup Clerk Middleware
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

#### 3.4 Setup Clerk Provider
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Phase 4: Code Migration (Day 3-5) ✅ SUBSTANTIALLY COMPLETED

#### 4.1 Convert Components to Server Components ✅
**Default**: All components are Server Components unless they need:
- Client-side interactivity (onClick, useState, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (except Server Component compatible ones)

```typescript
// ❌ Old: Everything was client component
'use client';
export function Dashboard() { ... }

// ✅ New: Server Component by default
export async function Dashboard() {
  const { userId } = await auth(); // Clerk async auth
  const data = await fetchData(userId);
  return <DashboardUI data={data} />;
}

// ✅ Client Component only when needed
'use client';
export function DashboardUI({ data }) {
  const [filter, setFilter] = useState('all');
  // ... interactive logic
}
```

#### 4.2 Replace Auth Context with Clerk ⏸️ (Pending Phase 3)
```typescript
// ❌ Old: Supabase Auth Context
const { user } = useAuth(); // custom context

// ✅ New Server Component: Clerk async auth
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();

// ✅ New Client Component: Clerk hook
import { useUser } from '@clerk/nextjs';
const { user } = useUser();
```

#### 4.3 Create Server Actions for Mutations ✅
```typescript
// app/actions/records.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createClient();

  const { data, error } = await supabase
    .from('trespass_records')
    .insert({
      user_id: userId,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      // ... other fields
    });

  if (error) throw error;

  revalidatePath('/dashboard');
  return data;
}
```

#### 4.4 Migrate to Tailwind v4 ⏸️ SKIPPED (Keeping v3)
```css
/* app/globals.css */
@import "tailwindcss";

/* Theme variables */
@theme {
  --color-primary: #22c45d;
  --color-background: #1a1f2e;
  --color-foreground: #ffffff;
  /* ... other variables */
}
```

Remove old Tailwind config files (tailwind.config.ts, postcss.config.js).

### Phase 5: Supabase RLS Integration (Day 4-5) 🔄 PARTIAL (Using Service Role for Testing)

#### 5.1 Create Supabase Server Client ✅ (Temporary: Using Service Role Key)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

export async function createClient() {
  const { getToken } = await auth();
  const supabaseAccessToken = await getToken({ template: 'supabase' });

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  );
}
```

#### 5.2 Configure Clerk JWT Template for Supabase ⏸️ (Pending Phase 3)
In Clerk Dashboard → JWT Templates:
1. Create new template named "supabase"
2. Add claim:
```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated"
}
```

#### 5.3 Update RLS Policies for Clerk ⏸️ (Pending Phase 3)
```sql
-- Use JWT token from Clerk
CREATE POLICY "Users can access own data"
  ON trespass_records FOR ALL
  USING (auth.jwt() ->> 'sub' = user_id);
```

### Phase 6: Vercel Deployment (Day 5-6) ⏳ TODO

#### 6.1 Connect Repository to Vercel ⏳
1. Go to https://vercel.com
2. Import Git repository
3. Framework Preset: Next.js (auto-detected)
4. Build Command: `npm run build`
5. Install Command: `npm install`

#### 6.2 Configure Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

**For Preview & Production:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

#### 6.3 Update Clerk Production URLs
In Clerk Dashboard → Paths:
- Sign-in URL: `https://yourapp.vercel.app/sign-in`
- Sign-up URL: `https://yourapp.vercel.app/sign-up`
- After sign-in: `https://yourapp.vercel.app/dashboard`

#### 6.4 Configure Vercel Project Settings
```json
// vercel.json (optional, for advanced config)
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"], // Choose closest region
  "env": {
    // Production env vars go in Vercel dashboard
  }
}
```

### Phase 7: Testing & Validation (Day 6-7) ⏳ TODO

#### 7.1 Local Testing Checklist 🔄 PARTIAL
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Sign-up flow works with Clerk
- [ ] Sign-in flow works with Clerk
- [ ] Protected routes redirect to sign-in
- [ ] Database queries work with RLS
- [ ] Server Actions create/update records
- [ ] Supabase types match schema

#### 7.2 Preview Deployment Testing
- [ ] Push to feature branch
- [ ] Vercel creates preview deployment
- [ ] Test Clerk auth on preview URL
- [ ] Test all CRUD operations
- [ ] Verify environment variables work
- [ ] Check console for errors
- [ ] Test on mobile viewport

#### 7.3 Production Deployment
1. Merge to main branch
2. Vercel auto-deploys to production
3. Verify production Clerk instance works
4. Test production database connection
5. Monitor Vercel Analytics for errors

## Common Migration Challenges

### Challenge 1: Client vs Server Components
**Problem**: Everything is client component in Bolt MVP
**Solution**: Default to Server Components, add 'use client' only when needed

### Challenge 2: Data Fetching Patterns
**Problem**: Client-side fetching with useEffect
**Solution**: Server Components with async/await, use Server Actions for mutations

### Challenge 3: Auth State Management
**Problem**: Custom auth context with useState
**Solution**: Clerk async auth() in Server Components, useUser() in Client Components

### Challenge 4: Type Safety
**Problem**: Loose typing with `any` types
**Solution**: Generate types from Supabase schema, enable strict TypeScript

### Challenge 5: Environment Variables
**Problem**: `.env` files committed to repo
**Solution**: Configure in Vercel dashboard, use `.env.local` for local dev only

## Post-Migration Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No `any` types without justification
- [ ] Server Components used by default
- [ ] Client Components marked with 'use client'
- [ ] Proper error boundaries implemented
- [ ] Loading states for async operations

### Security
- [ ] Environment variables in Vercel dashboard
- [ ] Clerk middleware protecting routes
- [ ] Supabase RLS policies enabled
- [ ] No secrets in client code
- [ ] CORS properly configured

### Performance
- [ ] Images use Next.js Image component
- [ ] Static pages use generateStaticParams
- [ ] Dynamic pages use proper caching
- [ ] Edge runtime where beneficial
- [ ] Bundle size optimized

### Deployment
- [ ] Preview deployments work
- [ ] Production deployment successful
- [ ] Clerk production instance configured
- [ ] Supabase production database ready
- [ ] Monitoring/analytics setup

## Rollback Plan

If migration fails:
1. Keep old codebase in separate branch
2. Revert Vercel deployment to previous production
3. Switch Clerk back to old auth if needed
4. Document lessons learned
5. Plan incremental migration approach

## Support Resources

- **Next.js 15 Docs**: https://nextjs.org/docs
- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind v4 Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vercel Docs**: https://vercel.com/docs

## Current Status Summary (Updated: Oct 3, 2025)

**Completed:**
- ✅ Phase 1: Setup & Assessment
- ✅ Phase 2: Database Setup (65 records loaded, normalized)
- ✅ Phase 4: Code Migration (Server Components, Server Actions)
  - Dashboard is Server Component
  - Server Actions for all CRUD operations
  - Using service role key to bypass RLS (temporary)
  - Database status values normalized to lowercase
  - UI fixes: name capitalization, badge display, image preview

**Skipped for Later:**
- ⏸️ Phase 3: Clerk Authentication (using mock auth currently)
- ⏸️ Tailwind v4 migration (keeping v3)

**Pending:**
- ⏳ Phase 5: Full RLS Integration (waiting for Clerk JWT)
- ⏳ Phase 6: Vercel Deployment
- ⏳ Phase 7: Full Testing & Validation

**Next Steps:**
1. Complete Phase 3 (Clerk Auth) OR
2. Continue with Phase 6 (Vercel Deployment with mock auth)

## Success Metrics

Migration is successful when:
- ✅ All features from Bolt MVP are functional
- ✅ TypeScript compilation passes with no errors
- ✅ Production deployment on Vercel is stable
- ✅ Clerk authentication flows work correctly
- ✅ Supabase database operations succeed
- ✅ Performance meets or exceeds original MVP
- ✅ Code follows constitution v2.0.0 principles
