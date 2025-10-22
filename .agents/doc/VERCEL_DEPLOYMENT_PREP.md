# Vercel Deployment Preparation

**Date:** October 3, 2025
**Status:** Ready to Deploy
**Current Branch:** `feature/bolt-mvp-integration`

---

## Prerequisites Checklist

Before deploying to Vercel, complete these tasks:

### 1. Get Production Clerk Keys

**Action Required:**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Either:**
   - **Option A:** Switch your existing app to Production mode
   - **Option B:** Create a new Production instance (recommended for safety)
3. Navigate to **API Keys**
4. Copy the following keys:
   - ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - ✅ `CLERK_SECRET_KEY` (starts with `sk_live_...`)

**Store these safely** - you'll need them in step 3.

---

### 2. Get Clerk Webhook Signing Secret

**Action Required:**

1. In Clerk Dashboard → **Webhooks**
2. You'll update the webhook URL after Vercel deployment (we'll get the domain first)
3. Copy the **Signing Secret** (starts with `whsec_...`)

**Store this safely** - you'll need it in step 3.

---

### 3. Prepare Environment Variables

You'll need to add these to Vercel. Copy this template and **fill in your values**:

```bash
# ==================== CLERK (PRODUCTION) ====================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ==================== SUPABASE ====================
NEXT_PUBLIC_SUPABASE_URL=https://gnbxdjiibwjaurybohak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYnhkamlpYndqYXVyeWJvaGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3MzAyNzQsImV4cCI6MjA0MzMwNjI3NH0.2QZFqYnGhEr82cCNLR6gQbgXQ7qMBY5oOV1lJNR3ItE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYnhkamlpYndqYXVyeWJvaGFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzczMDI3NCwiZXhwIjoyMDQzMzA2Mjc0fQ.gPxqvPO1OEfJ9-T7p6vKztdyF_j3KJbPBFYPTlEGMok

# ==================== APP ====================
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
# ⬆️ You'll update this AFTER you get your Vercel domain
```

---

## Vercel Deployment Steps

### Step 1: Push Code to GitHub

**Your code is ready!** Just needs to be pushed to your repository.

We'll do this together in the next step.

---

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in (or create account)
3. Click **"Add New Project"**
4. **Import your GitHub repository:**
   - Select: `TrespassTracker` (or your repo name)
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)

---

### Step 3: Configure Environment Variables

In the Vercel project setup screen:

1. Click **"Environment Variables"**
2. Add **ALL** variables from step 3 above
3. **Important:** Leave `NEXT_PUBLIC_APP_URL` blank for now (we'll update it)
4. Select which environments: **Production, Preview, Development** (check all 3)

---

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Copy your production URL (will be something like `https://trespass-tracker-xxx.vercel.app`)

---

### Step 5: Update Environment Variables

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update it to your Vercel domain: `https://your-actual-domain.vercel.app`
4. **Redeploy** (Vercel → Deployments → Click "..." → Redeploy)

---

### Step 6: Update Clerk Webhook URL

1. Go to Clerk Dashboard → **Webhooks**
2. Find your webhook endpoint (or create new one)
3. Update **Endpoint URL** to:
   ```
   https://your-actual-domain.vercel.app/api/webhooks/clerk
   ```
4. Ensure these events are selected:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Save webhook

---

### Step 7: Update Clerk Redirect URLs

In Clerk Dashboard → **Paths**:

Update these URLs to match your Vercel domain:

- **Sign-in URL:** `https://your-domain.vercel.app/sign-in`
- **Sign-up URL:** `https://your-domain.vercel.app/sign-up`
- **After sign-in redirect:** `https://your-domain.vercel.app/dashboard`
- **After sign-up redirect:** `https://your-domain.vercel.app/dashboard`

---

### Step 8: Test Production Deployment

1. Visit your Vercel URL: `https://your-domain.vercel.app`
2. **Test Sign-In:**
   - Should redirect to Clerk sign-in
   - Sign in with your admin account
   - Should redirect to `/dashboard`
3. **Test Invitation Flow:**
   - Send invite to test email
   - Sign up via invitation link
   - Verify webhook creates profile in Supabase
4. **Test Permissions:**
   - Verify role-based access works

---

## Troubleshooting

### If sign-in doesn't work:
- Check Clerk production keys are correct
- Verify redirect URLs match your Vercel domain
- Check browser console for errors

### If webhook fails:
- Verify webhook URL is correct
- Check webhook signing secret is set
- View Vercel logs: Vercel Dashboard → Your Project → Deployments → Click deployment → Logs

### If database queries fail:
- Check Supabase keys are correct
- Verify RLS policies allow authenticated users
- Check Clerk + Supabase integration is active

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Sign-in works on production URL
- [ ] Dashboard loads with user data
- [ ] Can create/edit/delete records
- [ ] Invitation flow works end-to-end
- [ ] Webhook creates user profiles correctly
- [ ] All 4 roles have correct permissions
- [ ] Settings dialog works
- [ ] No errors in Vercel logs

---

## Custom Domain (Optional)

To use your own domain (e.g., `trespass.bisd.us`):

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Update DNS records (Vercel will show instructions)
4. Update all URLs above to use your custom domain
5. Redeploy

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Clerk Deployment Guide:** https://clerk.com/docs/deployments/overview
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## Questions?

If anything is unclear or you run into issues:

1. Check Vercel deployment logs first
2. Check Clerk webhook logs
3. Check browser console for client-side errors
4. Review this document for missed steps

**You're ready to deploy! 🚀**
