# Clerk Configuration Instructions (Native Integration - April 2025)

Phase 3 implementation is complete with **4-role system** and **invite-only authentication**!

## ✅ What's Been Implemented

1. **Clerk Integration**
   - ✅ Clerk middleware for route protection
   - ✅ ClerkProvider added to app layout
   - ✅ Sign-in and sign-up pages created
   - ✅ AuthContext updated to use Clerk
   - ✅ Server actions updated to use Clerk tokens

2. **Authentication Flow**
   - ✅ `/sign-in` - Clerk sign-in page
   - ✅ `/sign-up` - Clerk sign-up page
   - ✅ Protected routes automatically redirect to sign-in
   - ✅ After sign-in, users redirect to `/dashboard`

## 🔧 Required: Clerk Dashboard Configuration

### 1. Enable Clerk's Native Supabase Integration (NEW!)

**No JWT templates needed!** Clerk now has native integration:

1. Go to **Clerk Dashboard** → **Integrations**
2. Find and click **"Supabase"**
3. Click **"Enable Integration"** or **"Configure"**
4. **Copy the Clerk domain** shown (e.g., `clerk-abc123.clerk.accounts.dev`)
5. Go to **Supabase Dashboard** → **Authentication** → **Sign In / Up**
6. Click **"Add provider"** → Select **"Clerk"**
7. Paste the **Clerk domain** you copied
8. Click **"Save"**

✅ That's it! Roles from Clerk public metadata automatically pass to Supabase.

### 2. Disable Public Sign-ups (Invite-Only Mode)

1. **Clerk Dashboard** → **User & Authentication** → **Email, Phone, Username**
2. Scroll to **"Sign-up modes"**
3. **Disable** the toggle for **"Allow users to sign up"**
   - OR enable **"Invite only"** mode
4. Click **"Save"**

Now only invited users can create accounts!

### 3. Configure Authentication Methods

Still in **User & Authentication** → **Email, Phone, Username**:

1. **Enable** Email Address authentication
2. **Enable** "Require email address"
3. **Enable** "Verify at sign-up"
4. **Enable** Password authentication
5. Click **"Save"**

### 4. Set User Roles in Clerk

**Create your first master_admin user:**

**Option A: Create manually in Clerk Dashboard**
1. Go to **Clerk Dashboard → Users → Create User**
2. Enter your email and password
3. After created, click the user → **"Metadata"** tab
4. Under **"Public metadata"**, add:
   ```json
   {
     "role": "master_admin"
   }
   ```
5. Click **"Save"**

**Option B: Enable sign-ups temporarily**
1. Temporarily enable sign-ups in Clerk
2. Go to your app `/sign-up` and create your account
3. In Clerk Dashboard, add `{ "role": "master_admin" }` to your public metadata
4. Disable sign-ups again

**Valid roles for the 4-role system:**
- `viewer` - Read-only access
- `campus_admin` - Create & update records (no delete, no user management)
- `district_admin` - Full record management (no user management)
- `master_admin` - Full system access + user invitations

### 5. Update Supabase RLS Policies

Run the migration: `supabase/migrations/20251003_update_rls_for_4_roles.sql`

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire SQL content from the migration file
3. Paste and click **"Run"**

This sets up proper role-based permissions for all 4 roles.

## 🧪 Testing the Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test invite-only mode:**
   - Visit `http://localhost:3002/sign-up` - should show error or redirect
   - Public sign-ups should be disabled

3. **Test authentication as master_admin:**
   - Sign in with your master_admin account
   - Should redirect to `/dashboard`
   - User dropdown should show **"Invite User (Email)"** option

4. **Test invitation flow:**
   - Click **"Invite User (Email)"** in user dropdown
   - Enter email and select a role (viewer, campus_admin, district_admin, master_admin)
   - Click **"Invite User"**
   - Check email for invitation link
   - Click link → user creates password → role is auto-assigned

5. **Test role-based permissions:**
   - **Viewer**: Can only view records, no create/edit/delete buttons
   - **Campus Admin**: Can create and update, no delete
   - **District Admin**: Can create, update, delete records
   - **Master Admin**: Full access + user invitations

## 🔑 Environment Variables Reference

Your `.env.local` should have:

```bash
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Not used anymore, but keep for backup
```

## 📝 Migration Notes

**What Changed:**
- Removed mock authentication from AuthContext
- Removed service role key bypass in server actions
- Now using real Clerk JWT tokens for RLS

**Files Modified:**
- `middleware.ts` - Added Clerk route protection
- `app/layout.tsx` - Added ClerkProvider
- `contexts/AuthContext.tsx` - Uses Clerk hooks
- `lib/supabase/server.ts` - Uses Clerk tokens
- `app/actions/*.ts` - Updated to await createServerClient()

**New Files:**
- `app/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in
- `app/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up

## 🐛 Troubleshooting

**"Invalid JWT" or auth errors:**
- Verify Clerk's native Supabase integration is enabled (Clerk Dashboard → Integrations)
- Ensure Clerk domain is configured in Supabase (Authentication → Providers → Clerk)
- Check user has role in Clerk public metadata: `{ "role": "viewer" }`

**Users can still sign up publicly:**
- Clerk Dashboard → User & Authentication → Ensure "Allow users to sign up" is OFF
- Clear browser cache and try again

**Users can't access data:**
- Verify RLS migration has been run in Supabase
- Check user's role in Clerk public metadata (exact format: `{ "role": "master_admin" }`)
- User must sign out and sign in again after role changes

**"Invite User" button not showing:**
- Only master_admin users see this button
- Verify your role is set to `master_admin` in Clerk public metadata
- Sign out and sign in again to refresh JWT token

**Redirect loops:**
- Ensure middleware.ts public routes include `/sign-in` and `/sign-up`
- Verify NEXT_PUBLIC_CLERK_SIGN_IN_URL matches your route (`/sign-in`)

## ✨ Next Steps

Once Clerk is configured:
1. ✅ Enable Clerk native Supabase integration
2. ✅ Disable public sign-ups (invite-only mode)
3. ✅ Create your first master_admin user
4. ✅ Run RLS migration (`20251003_update_rls_for_4_roles.sql`)
5. ✅ Sign in and test invitation flow
6. Configure additional Clerk settings (2FA, email templates, branding)
7. Invite your team with appropriate roles
8. Test each role's permissions thoroughly

## 📋 Quick Checklist

Before going live:

- [ ] Clerk native Supabase integration enabled
- [ ] Clerk domain configured in Supabase
- [ ] Public sign-ups disabled in Clerk
- [ ] First master_admin user created
- [ ] RLS migration applied in Supabase
- [ ] Tested invitation flow works
- [ ] All 4 roles tested for correct permissions
- [ ] Email templates customized (optional)
- [ ] Production environment variables set
