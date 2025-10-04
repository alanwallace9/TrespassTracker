# Deployment Setup Checklist

> **Status:** In Progress - Vercel Deployment
> **Date Started:** October 3, 2025
> **Current Phase:** Environment Configuration & Clerk Production Setup

---

## ✅ Completed Tasks

### Git Branch Structure
- ✅ Created three-branch workflow:
  - `main` → Production-ready code
  - `staging` → Testing environment
  - `development` → Active development
- ✅ Created backup: `backup/working-state-2025-10-03`
- ✅ Created git tag: `v1.0-pre-production`
- ✅ Merged all Clerk work into main branch

### Cloudflare DNS Setup
- ✅ Domain transferred from Namecheap to Cloudflare
- ✅ SSL/TLS set to **Full** encryption
- ✅ **Always Use HTTPS** enabled
- ✅ DNS records configured:
  - `districttracker.com` → A record (root)
  - `staging.districttracker.com` → CNAME to Vercel
  - `birdville.districttracker.com` → CNAME to Vercel
  - `www.districttracker.com` → CNAME to Vercel
- ✅ All records set to **DNS only** (gray cloud) for Vercel compatibility

### Vercel Setup
- ✅ Project created and connected to GitHub
- ✅ Domains configured:
  - `districttracker.com`
  - `www.districttracker.com`
  - `staging.districttracker.com`
  - `birdville.districttracker.com`
- ✅ `.env` file prepared with all environment variables

---

## 🔄 Next Session: Immediate Tasks

### 1. Update Clerk for Production URLs

**Problem:** Invitation emails currently redirect to `localhost:3002`

**Solution Steps:**

1. **Go to Clerk Dashboard:** https://dashboard.clerk.com
2. **Select your application**
3. **Navigate to:** Settings → **Paths** (or **Application** section)
4. **Update Application URLs:**

   **Home URL:**
   - Change from: `http://localhost:3002`
   - Change to: `https://birdville.districttracker.com`
   - Or for staging: `https://staging.districttracker.com`

   **Sign-in URL:**
   - Update to: `https://birdville.districttracker.com/sign-in`

   **After sign-in URL:**
   - Update to: `https://birdville.districttracker.com/dashboard`

5. **Save changes**

6. **Verify Email Templates:**
   - Go to: **Customization** → **Emails**
   - Find the **Invitation** email template
   - Verify magic link uses `{{application.home_url}}` variable
   - Preview to confirm it shows production URL, not localhost

### 2. Paste Environment Variables into Vercel

**Current `.env` file location:** `/TrespassTracker/.env`

**Steps:**
1. Open `.env` file in project root
2. Copy entire contents (skip comment lines if desired)
3. In Vercel: **Settings** → **Environment Variables**
4. Click **"Paste .env"** or bulk import option
5. Paste the contents
6. **Select environments:** Production, Preview, Development (all three)
7. Click **Save** or **Import**

**Environment Variables to Import:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gnbxdjiibwjaurybohak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk (currently TEST keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Routes (invite-only)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# App URL
NEXT_PUBLIC_APP_URL=https://birdville.districttracker.com
```

**⚠️ Note:** Currently using **TEST** Clerk keys. Two options:
- **Option A:** Deploy to staging first with test keys, verify, then switch to production keys
- **Option B:** Get production keys (`pk_live_` and `sk_live_`) from Clerk Dashboard and update `.env` before importing

### 3. Deploy to Staging

1. **In Vercel:** Go to **Deployments** tab
2. **Trigger deployment** of `staging` branch
3. **Monitor build logs** for errors
4. **Verify deployment** at: `https://staging.districttracker.com`

### 4. Test Staging Deployment

**Authentication Tests:**
- [ ] Visit `https://staging.districttracker.com`
- [ ] Redirects to sign-in page if not authenticated
- [ ] Can sign in with existing Clerk account
- [ ] After sign-in, redirects to `/dashboard`
- [ ] Dashboard loads without errors

**Invitation Tests:**
- [ ] Send test invitation from Clerk Dashboard
- [ ] Verify invitation email contains production URL (not localhost)
- [ ] Click invitation link
- [ ] Complete account setup
- [ ] Redirects to dashboard after setup

**Data Tests:**
- [ ] Dashboard displays trespass records from Supabase
- [ ] Can view record details
- [ ] Role-based permissions work (viewer can't create, admin can create)
- [ ] User profile displays correctly

### 5. Update Clerk Webhook URL

**Current webhook:** Points to localhost

**Update to production:**
1. **In Clerk Dashboard:** Configure → **Webhooks**
2. **Edit existing webhook** (user.created, user.updated, user.deleted)
3. **Update Endpoint URL:**
   - Change from: `http://localhost:3002/api/webhooks/clerk`
   - Change to: `https://birdville.districttracker.com/api/webhooks/clerk`
   - Or for staging: `https://staging.districttracker.com/api/webhooks/clerk`
4. **Verify signing secret** is in Vercel environment variables (if needed)
5. **Test webhook** by creating a test user in Clerk

---

## 📋 Testing Checklist (from Migration Guide)

### Phase 6: User Interface & Experience

**Layout & Navigation:**
- [ ] Dashboard layout renders correctly
- [ ] Navigation menu works
- [ ] Mobile responsive design works
- [ ] Theme switcher works (if implemented)

**Records Table:**
- [ ] All 65 records display
- [ ] Sorting works (by name, date, status)
- [ ] Filtering works (by status, campus, date range)
- [ ] Search works (by name, ID number)
- [ ] Pagination works (if implemented)

**Record Details:**
- [ ] Can view full record details
- [ ] All fields display correctly
- [ ] Photos display (if any)
- [ ] Status badges show correct colors

**Role-Based UI:**
- [ ] Viewer: Cannot see create/edit/delete buttons
- [ ] Campus Admin: Can create/edit records for their campus
- [ ] District Admin: Can create/edit/delete records for all campuses
- [ ] Master Admin: Can manage users and all records

### Phase 7: Testing & Validation

**Authentication:**
- [ ] Sign-in works with Clerk
- [ ] Invitation-only sign-up works
- [ ] Redirects work correctly
- [ ] Session persists across page reloads
- [ ] Sign-out works

**Authorization (RLS):**
- [ ] Viewers can view but not modify records
- [ ] Campus admins can only modify their campus records
- [ ] District admins can modify all records
- [ ] Master admin has full access
- [ ] Users cannot access other users' data directly via Supabase

**Data Integrity:**
- [ ] All 65 records migrated correctly
- [ ] No duplicate records
- [ ] All fields populated correctly
- [ ] Dates formatted correctly
- [ ] Status values correct (Active, Expired, Revoked)

**Performance:**
- [ ] Dashboard loads in < 2 seconds
- [ ] Search/filter is responsive
- [ ] No console errors
- [ ] No network errors

**Error Handling:**
- [ ] Invalid URLs show 404 page
- [ ] Unauthorized access shows error
- [ ] Network errors show user-friendly message
- [ ] Form validation works

---

## 🚀 Production Deployment (After Staging Verified)

### 1. Switch to Production Clerk Keys

**In Clerk Dashboard:**
1. Get production keys: `pk_live_...` and `sk_live_...`
2. Update in Vercel environment variables for **Production** environment only

### 2. Update Production Environment Variables

**In Vercel:**
1. Settings → Environment Variables
2. Edit these for **Production only:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_...`
   - `CLERK_SECRET_KEY` → `sk_live_...`
   - `NEXT_PUBLIC_APP_URL` → `https://birdville.districttracker.com`

### 3. Deploy to Production

1. **In Vercel:** Deploy `main` branch to production
2. **Assign domain:** `birdville.districttracker.com` to `main` branch
3. **Monitor deployment**
4. **Verify at:** `https://birdville.districttracker.com`

### 4. Final Production Tests

Run full testing checklist above on production domain.

### 5. Update Clerk Webhook for Production

**Separate webhooks for staging vs production:**
- Staging webhook: `https://staging.districttracker.com/api/webhooks/clerk`
- Production webhook: `https://birdville.districttracker.com/api/webhooks/clerk`

---

## 📝 Known Issues / Tech Debt

**From Migration:**
- [ ] CSV import process needs documentation
- [ ] Bulk operations for records not yet implemented
- [ ] Advanced filtering (multiple criteria) not implemented
- [ ] Export functionality not implemented
- [ ] Photo upload for records not implemented

**From Deployment:**
- [ ] Need to document environment variable management
- [ ] Need monitoring/logging setup (consider Sentry or Vercel Analytics)
- [ ] Need backup strategy for Supabase data
- [ ] Need staging data separate from production data

---

## 🔮 Future Enhancements (V2)

See `V2_DISTRICT_SUBDOMAIN_ARCHITECTURE.md` for:
- Multi-district support via subdomains
- District-specific data isolation
- Wildcard subdomain setup
- Enhanced RLS policies

---

## 📚 Reference Documents

- **Migration Guide:** `.specify/docs/bolt-mvp-migration-guide.md` (90% complete)
- **Vercel Deployment Prep:** `VERCEL_DEPLOYMENT_PREP.md`
- **V2 Architecture:** `V2_DISTRICT_SUBDOMAIN_ARCHITECTURE.md`
- **Clerk Setup:** `CLERK_SETUP_INSTRUCTIONS.md`
- **Invite-Only Setup:** `INVITE_ONLY_SETUP.md`
- **Webhook Setup:** `WEBHOOK_SETUP.md`

---

**Last Updated:** October 3, 2025
**Next Session Focus:** Clerk production URLs + Vercel environment variables + Staging deployment
