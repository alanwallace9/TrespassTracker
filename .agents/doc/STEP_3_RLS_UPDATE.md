# Step 3: Update RLS Policies for 4-Role System

You've completed Steps 1 & 2 of the Clerk native integration. **Step 3 implements the 4-role permission system.**

## ✅ Solution: Run the New Migration

Migration file: `20251003_update_rls_for_4_roles.sql`

### What It Does:

**Implements 4-role permissions:**

| Role | View Records | Create Records | Update Records | Delete Records | Manage Users |
|------|--------------|----------------|----------------|----------------|--------------|
| **viewer** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **campus_admin** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **district_admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **master_admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

**Creates helper functions:**
- `get_clerk_user_role()` - Gets role from Clerk JWT
- `get_clerk_user_id()` - Gets user ID from Clerk JWT

## 🚀 How to Apply

### Option 1: Apply via Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `supabase/migrations/20251003_update_rls_for_4_roles.sql`
3. Copy the entire SQL content
4. Paste into SQL Editor
5. Click **Run**

### Option 2: Apply via CLI (if you have Supabase CLI)
```bash
supabase db push
```

## 📋 Verify Clerk Native Integration

**IMPORTANT:** Using Clerk's native Supabase integration (April 2025+):

1. **Clerk Dashboard** → **Integrations** → **Supabase**
   - Should show as "Active" or "Connected"
   - Copy the Clerk domain displayed

2. **Supabase Dashboard** → **Authentication** → **Providers**
   - Ensure "Clerk" is listed and enabled
   - The Clerk domain should be configured

**No JWT template needed!** Clerk's native integration automatically passes `user_metadata.role` from public metadata.

## 🧪 Test the Permissions

After running the migration:

### Test as `viewer` (read-only):
1. Sign in as a viewer
2. ✅ Should see records
3. ❌ No "Add Record", "Upload CSV", or "Invite User" options
4. ❌ Update/delete should fail

### Test as `campus_admin`:
1. Sign in as campus admin
2. ✅ Can view all records
3. ✅ Can create new records
4. ✅ Can update records
5. ❌ No delete option
6. ❌ No "Invite User" option

### Test as `district_admin`:
1. Sign in as district admin
2. ✅ Can view all records
3. ✅ Can create, update records
4. ✅ Can delete records
5. ❌ No "Invite User" option

### Test as `master_admin`:
1. Sign in as master admin
2. ✅ Full access to everything
3. ✅ Can create, update, delete records
4. ✅ Can invite users via "Invite User (Email)" button
5. ✅ Can assign roles when inviting

## 🔑 Role Assignment in Clerk

Set roles in **Clerk Dashboard → Users → [Select User] → Metadata → Public metadata**:

```json
{ "role": "master_admin" }
```

**Valid roles:** `viewer`, `campus_admin`, `district_admin`, `master_admin`

**Or use the in-app invite system:**
1. Sign in as `master_admin`
2. Click user dropdown → **"Invite User (Email)"**
3. Enter email and select role
4. User receives email invitation with role pre-assigned

## 📝 Summary

- ✅ **4-role system**: viewer, campus_admin, district_admin, master_admin
- ✅ **In-app invitations**: Master admins invite users with role selection
- ✅ **Clerk native integration**: No manual JWT templates needed
- 🎯 **Run the migration**: `20251003_update_rls_for_4_roles.sql`
- 🔐 **Invite-only**: Disable public sign-ups in Clerk Dashboard

**Next Steps:**
1. Enable Clerk's native Supabase integration
2. Disable public sign-ups in Clerk
3. Run this RLS migration in Supabase
4. Create your first master_admin user in Clerk
5. Sign in and start inviting users!

Once complete, your 4-role permission system will be fully operational! 🎉
