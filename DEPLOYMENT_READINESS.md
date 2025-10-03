# Deployment Readiness Checklist

**Last Updated:** October 3, 2025
**Current Branch:** `feature/bolt-mvp-integration`

---

## 🎯 Current Status: READY FOR TESTING

You are **90% complete** with the Bolt MVP migration and ready to proceed to testing and deployment.

---

## ✅ Completed Phases

### Phase 1: Setup & Assessment ✅
- Modern stack installed (Next.js 15.5, React 19, TypeScript 5.9)
- Dependencies updated and configured
- Project architecture assessed

### Phase 2: Database Setup ✅
- Supabase project configured
- All migrations executed successfully
- 65 trespass records imported and normalized
- TypeScript types defined and validated

### Phase 3: Clerk Authentication ✅
- Clerk application created and configured
- Middleware protecting `/dashboard` routes
- Sign-in/sign-up pages created
- Webhook configured for user sync (`user.created`, `user.updated`, `user.deleted`)
- Invite-only mode enabled
- User invitation system implemented

### Phase 4: Code Migration ✅
- Components converted to Server Components (where appropriate)
- Server Actions created for all mutations
- Auth integrated with Clerk
- UI fixes completed (dialogs, dropdowns, display names)

### Phase 5: RLS Integration ✅
- Database-based role checking implemented
- Helper functions created: `get_my_clerk_id()`, `get_my_role_from_db()`
- Complete RLS policies for 4 roles
- Profile updates working correctly

---

## ⏳ Pending: Critical Testing

### Test 1: Full Invitation Flow
**Status:** 🔴 NOT TESTED

**Steps:**
1. Log in as `district_admin` or `master_admin`
2. Click "Invite User" in dropdown menu
3. Fill out invitation form:
   - Email: (use a test email you can access)
   - Role: Select any role (test each)
   - Campus ID: (if role = campus_admin)
4. Submit invitation
5. Check test email for Clerk invitation
6. Click invitation link and sign up
7. Verify webhook creates profile in Supabase `user_profiles` table
8. Log in and verify permissions match assigned role

**Expected Results:**
- [ ] Invitation email received
- [ ] Sign-up flow completes successfully
- [ ] Webhook creates profile with correct `role` and `campus_id`
- [ ] User can log in immediately
- [ ] Permissions match assigned role

---

### Test 2: Role Permissions
**Status:** 🔴 NOT TESTED

Test each role's permissions:

#### Viewer Role
- [ ] Can view trespass records
- [ ] Cannot create records
- [ ] Cannot update records
- [ ] Cannot delete records
- [ ] Cannot invite users
- [ ] Can update own profile (display_name)

#### Campus Admin Role
- [ ] Can view all records
- [ ] Can create records
- [ ] Can update records
- [ ] Cannot delete records
- [ ] Cannot invite users
- [ ] Can update own profile

#### District Admin Role
- [ ] Can view all records
- [ ] Can create records
- [ ] Can update records
- [ ] Can delete records
- [ ] Can invite users
- [ ] Can update own profile

#### Master Admin Role
- [ ] Can view all records
- [ ] Can create records
- [ ] Can update records
- [ ] Can delete records
- [ ] Can invite users
- [ ] Can update own profile
- [ ] (Future: can manage users, delete profiles)

---

### Test 3: Profile Deletion (Webhook)
**Status:** 🔴 NOT TESTED

**Steps:**
1. Create a test user via invitation
2. Log in as test user to verify account works
3. Go to Clerk Dashboard → Users
4. Delete the test user
5. Check Supabase `user_profiles` table
6. Verify profile was deleted automatically

**Expected Results:**
- [ ] User deleted in Clerk
- [ ] Profile deleted in Supabase
- [ ] No orphaned records

---

## 🚀 Deployment to Vercel (When Testing Passes)

### Step 1: Prepare Repository
- [ ] Commit all changes to `feature/bolt-mvp-integration` branch
- [ ] Push to GitHub
- [ ] Create pull request to main (optional, can merge directly)

### Step 2: Configure Vercel
1. Go to https://vercel.com
2. Import repository
3. Configure environment variables:

```bash
# Clerk (use PRODUCTION keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase (same as local)
NEXT_PUBLIC_SUPABASE_URL=https://gnbxdjiibwjaurybohak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URL (will be your Vercel domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 3: Update Clerk for Production
1. Create production Clerk instance (or switch to production mode)
2. Get production keys (`pk_live_...`, `sk_live_...`)
3. Configure paths in Clerk Dashboard:
   - Sign-in URL: `https://your-app.vercel.app/sign-in`
   - Sign-up URL: `https://your-app.vercel.app/sign-up`
   - After sign-in: `https://your-app.vercel.app/dashboard`
4. **Update webhook URL:** `https://your-app.vercel.app/api/webhooks/clerk`
5. Add webhook signing secret to Vercel environment variables

### Step 4: Deploy
- [ ] Push to main branch (or deploy preview first)
- [ ] Vercel auto-deploys
- [ ] Test sign-in/sign-up on production URL
- [ ] Test invitation flow on production
- [ ] Monitor Vercel logs for errors

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] TypeScript compilation passes (`npm run typecheck`)
- [x] Build succeeds (`npm run build`)
- [x] No critical console errors in dev
- [ ] Invitation flow tested and working
- [ ] All 4 roles tested and working

### Security
- [x] Environment variables not committed to repo
- [x] Clerk middleware protecting routes
- [x] Supabase RLS policies enabled
- [x] Webhook signed with secret
- [ ] Production Clerk keys configured

### Database
- [x] All migrations applied
- [x] Real data imported (65 records)
- [x] RLS policies tested locally
- [ ] Webhook tested (user create/delete)

---

## 🔧 Remaining Work

### Critical (Before Deployment)
1. **Test invitation flow** (30 min)
2. **Test all 4 role permissions** (30 min)
3. **Test webhook deletion** (10 min)

### Optional (Can Deploy Without)
1. Campus dropdown (replace text input)
2. User management panel for admins
3. Show pending invitations
4. Customize Clerk invitation emails
5. Audit logs for record changes

---

## 📊 Migration Progress

**Overall:** 90% Complete

- Phase 1: Setup & Assessment → ✅ 100%
- Phase 2: Database Setup → ✅ 100%
- Phase 3: Clerk Authentication → ✅ 100%
- Phase 4: Code Migration → ✅ 100%
- Phase 5: RLS Integration → ✅ 100%
- Phase 6: Vercel Deployment → ⏳ 0% (waiting for testing)
- Phase 7: Testing & Validation → ⏳ 30% (local testing done, invitation flow pending)

---

## 🎯 Next Actions

### Today (If Time)
1. Run invitation flow test (see Test 1 above)
2. Verify webhook creates profile correctly
3. Test at least 2 different roles

### Before Production Deployment
1. Complete all tests in "Pending: Critical Testing" section
2. Fix any issues found during testing
3. Get production Clerk keys
4. Configure Vercel environment variables
5. Update Clerk webhook URL to production
6. Deploy to Vercel
7. Test on production URL
8. Monitor for 24 hours

---

## 📚 Reference Documentation

- `SESSION_SUMMARY_2025-10-03.md` - Complete session log
- `.specify/docs/bolt-mvp-migration-guide.md` - Full migration guide (just updated)
- `CLERK_SETUP_INSTRUCTIONS.md` - Clerk configuration
- `WEBHOOK_SETUP.md` - Webhook details
- `INVITE_ONLY_SETUP.md` - Invitation system guide

---

## 🆘 Troubleshooting

### If invitation doesn't arrive:
- Check Clerk Dashboard → Webhooks → Logs
- Verify email is not in spam
- Check Clerk email settings (sandbox vs production)

### If webhook fails:
- Check Vercel logs (or local terminal for `npm run dev`)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check webhook signing secret matches

### If permissions don't work:
- Check `user_profiles` table for correct `role` value
- Verify RLS helper functions exist (`get_my_role_from_db()`)
- Check Supabase logs for RLS policy errors

---

**You're almost there! Just testing remains before deployment. 🚀**
