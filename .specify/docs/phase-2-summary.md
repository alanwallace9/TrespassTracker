# Phase 2: Database Setup - Summary

**Status:** ✅ Complete
**Date:** 2025-10-02

---

## What We Accomplished

### 1. Supabase Project Verification ✅
- **Project URL:** `https://gnbxdjiibwjaurybohak.supabase.co`
- **Project ID:** `gnbxdjiibwjaurybohak`
- **Environment:** `.env.local` file configured with credentials
- **Keys Configured:**
  - ✅ `NEXT_PUBLIC_SUPABASE_URL`
  - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - ✅ `SUPABASE_SERVICE_ROLE_KEY`
- **Status:** Active and ready

### 2. Database Schema Migration ✅

#### Created New Migration: `20251002232000_clerk_compatibility.sql`

**Purpose:** Update schema to work with Clerk authentication instead of Supabase Auth

**Key Changes:**

1. **User ID Type Change**
   - `user_profiles.id`: UUID → TEXT (for Clerk user IDs like "user_2abc...")
   - `trespass_records.user_id`: UUID → TEXT
   - Removed foreign key constraints to `auth.users`

2. **User Profiles Table**
   ```sql
   CREATE TABLE user_profiles (
     id TEXT PRIMARY KEY,              -- Clerk user ID
     email TEXT,                       -- User email from Clerk
     display_name TEXT,
     role TEXT NOT NULL DEFAULT 'user',
     theme TEXT NOT NULL DEFAULT 'system',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **RLS Policies Updated**
   - Old: `auth.uid()` (Supabase Auth)
   - New: `auth.jwt() ->> 'sub'` (Clerk JWT)

   Example:
   ```sql
   CREATE POLICY "Users can view their own profile"
     ON user_profiles
     FOR SELECT
     USING (auth.jwt() ->> 'sub' = id);
   ```

### 3. TypeScript Types Updated ✅

**Updated Files:**
- `lib/supabase.ts` - Added `email` field to `UserProfile` type
- `lib/mockData.ts` - Updated mock user to include email

**UserProfile Type:**
```typescript
export type UserProfile = {
  id: string;                  // Clerk user ID (e.g., "user_2abc...")
  email: string | null;        // User email from Clerk
  display_name: string | null;
  role: 'user' | 'district_admin' | 'master_admin';
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
};
```

**TrespassRecord Type:**
```typescript
export type TrespassRecord = {
  id: string;
  user_id: string;             // Clerk user ID (changed from UUID)
  // ... rest of fields
};
```

---

## Migration Files Overview

### All Migrations (in order)
1. `20251001013256_create_trespass_tracking_tables.sql` - Initial tables
2. `20251002154545_add_user_profiles_and_roles.sql` - User profiles & roles
3. `20251002160555_add_trespassed_from_field.sql` - Trespassed from field
4. `20251002161753_add_additional_trespass_fields.sql` - Additional fields
5. **`20251002232000_clerk_compatibility.sql`** ← New migration for Clerk

---

## Database Schema (Current State)

### Tables

#### `user_profiles`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | Clerk user ID |
| email | TEXT | | From Clerk |
| display_name | TEXT | | User's name |
| role | TEXT | NOT NULL, CHECK | user, district_admin, master_admin |
| theme | TEXT | NOT NULL, CHECK | light, dark, system |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**RLS Enabled:** ✅
**Policies:** Users can only view/edit their own profile

#### `trespass_records`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | TEXT | NOT NULL | Clerk user ID (was UUID) |
| first_name | TEXT | NOT NULL | |
| last_name | TEXT | NOT NULL | |
| aka | TEXT | | Aliases |
| date_of_birth | DATE | | |
| school_id | TEXT | | Student ID |
| known_associates | TEXT | | |
| current_school | TEXT | | |
| guardian_first_name | TEXT | | |
| guardian_last_name | TEXT | | |
| guardian_phone | TEXT | | |
| contact_info | TEXT | | |
| incident_date | DATE | NOT NULL | |
| location | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | |
| notes | TEXT | | |
| photo_url | TEXT | | |
| status | TEXT | NOT NULL, CHECK | active, inactive |
| is_former_student | BOOLEAN | DEFAULT false | |
| expiration_date | DATE | | |
| trespassed_from | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**RLS Enabled:** ✅
**Policies:** All authenticated users can view/create/update/delete

---

## Next Steps for Production

### Before Running Migration in Production:

1. **Backup Current Database**
   ```bash
   # Export data
   pg_dump your_database > backup.sql
   ```

2. **Test Migration Locally**
   ```bash
   # Use Supabase CLI to test
   npx supabase db reset
   ```

3. **Configure Clerk JWT Template**
   - Go to Clerk Dashboard → JWT Templates
   - Create template named "supabase"
   - Add claims:
     ```json
     {
       "sub": "{{user.id}}",
       "email": "{{user.primary_email_address}}",
       "role": "authenticated"
     }
     ```

4. **Run Migration**
   ```bash
   # Push to Supabase
   npx supabase db push
   ```

### Data Migration Considerations

**If you have existing production data:**

- Existing UUIDs in `user_id` columns will be converted to TEXT
- You'll need to map old Supabase Auth UUIDs to new Clerk user IDs
- Consider creating a mapping table temporarily
- Migrate users first, then update records

**For development/testing:**

- Easiest to reset the database and start fresh
- Use mock data for testing
- Current mock setup works with Clerk-style IDs

---

## What Changed vs. Original Schema

### Before (Supabase Auth)
```sql
user_profiles.id: UUID (references auth.users)
trespass_records.user_id: UUID (references auth.users)
RLS: auth.uid() = user_id
```

### After (Clerk Auth)
```sql
user_profiles.id: TEXT (Clerk user ID: "user_2abc...")
trespass_records.user_id: TEXT (Clerk user ID)
RLS: auth.jwt() ->> 'sub' = user_id
```

---

## Testing

### Current Test Mode
- Mock authentication bypassed in `contexts/AuthContext.tsx`
- Mock Supabase client in `lib/supabase.ts`
- Test user ID: `'test-user-id'`
- Test email: `'test@example.com'`

### Verify Schema
```sql
-- Check user_profiles structure
\d user_profiles

-- Check trespass_records structure
\d trespass_records

-- List RLS policies
\dp user_profiles
\dp trespass_records
```

---

## Phase 2 Deliverables ✅

- [x] Supabase project verified and accessible
- [x] New migration created for Clerk compatibility
- [x] User ID columns changed from UUID to TEXT
- [x] RLS policies updated to use Clerk JWT
- [x] TypeScript types updated
- [x] Mock data updated
- [x] Documentation complete

**Phase 2 Status: COMPLETE** ✅

Ready for Phase 3: Clerk Authentication Setup
