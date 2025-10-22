# Clerk Webhooks Setup Guide

This guide shows you how to set up Clerk webhooks to automatically sync user data (role, email, campus_id) to Supabase when users are invited and accept invitations.

---

## 🎯 What This Solves

**Problem:** When you invite a user in Clerk and they accept the invitation, their profile data (role, campus_id) needs to be synced to Supabase's `user_profiles` table.

**Solution:** Clerk webhooks automatically notify your app when users are created/updated, and we sync that data to Supabase immediately.

---

## 📋 Prerequisites

- ✅ Clerk account with users
- ✅ Supabase project with `user_profiles` table
- ✅ Next.js app deployed or accessible via public URL (for development, use ngrok or similar)

---

## 🚀 Setup Steps

### Step 1: Run the Database Migration

First, add the `campus_id` field to your `user_profiles` table:

**In Supabase Dashboard:**
1. Go to **SQL Editor**
2. Copy the contents of: `supabase/migrations/20251003_add_campus_id_to_user_profiles.sql`
3. Paste and click **"Run"**

This adds:
- `campus_id` column (TEXT, nullable)
- Index for faster queries

---

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# NEW: Add Supabase service role key (for webhook admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # From Supabase Dashboard → Settings → API

# NEW: Clerk webhook secret (you'll get this in Step 3)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Where to find Supabase Service Role Key:**
1. Supabase Dashboard → **Settings** → **API**
2. Copy the **`service_role`** secret key
3. ⚠️ **IMPORTANT:** Never expose this in client-side code!

---

### Step 3: Configure Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard** (https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **"Add Endpoint"**

**Webhook Configuration:**

- **Endpoint URL:**
  - Development: Use ngrok or similar to expose localhost
    - Example: `https://abc123.ngrok.io/api/webhooks/clerk`
  - Production: `https://yourdomain.com/api/webhooks/clerk`

- **Events to Subscribe:**
  - ✅ `user.created` - When a user accepts invitation and creates account
  - ✅ `user.updated` - When user data or metadata changes
  - ✅ `user.deleted` - (Optional) When a user is deleted

5. Click **"Create"**

6. **Copy the Signing Secret:**
   - After creating, Clerk shows a signing secret like `whsec_...`
   - Copy this value
   - Add it to your `.env.local` as `CLERK_WEBHOOK_SECRET=whsec_...`

---

### Step 4: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
npm run dev
```

The webhook endpoint is now live at `/api/webhooks/clerk`

---

### Step 5: Test the Webhook

**Option A: Test with Clerk Dashboard (Easiest)**
1. Clerk Dashboard → **Webhooks** → Click your endpoint
2. Click **"Testing"** tab
3. Select `user.created` event
4. Click **"Send Example"**
5. Check your server logs for success messages

**Option B: Test with Real Invitation**
1. Sign in as master_admin
2. Click **"Invite User (Email)"**
3. Enter email, select role (e.g., `campus_admin`)
4. For campus_admin, you'll need to set `campus_id` in Clerk (see below)
5. Send invitation
6. Accept invitation in email
7. Create password
8. Check Supabase `user_profiles` table - user should appear!

---

## 🏫 Setting campus_id for Campus Admins

When inviting a `campus_admin`, you need to add their `campus_id` to Clerk public metadata:

### After Sending Invitation:

1. **Clerk Dashboard** → **Users** → Find the invited user
2. Click **"Metadata"** tab
3. Under **"Public metadata"**, add:
   ```json
   {
     "role": "campus_admin",
     "campus_id": "campus-123"
   }
   ```
4. Click **"Save"**

**Note:** Currently, `campus_id` must be set manually in Clerk Dashboard. In the future, you can add a custom field to your in-app invitation dialog.

---

## 📊 How It Works

### Flow Diagram:

```
1. Master admin invites user
   ↓
2. Clerk sends invitation email
   ↓
3. User clicks link → creates password
   ↓
4. Clerk creates user account
   ↓
5. Clerk fires webhook: user.created
   ↓
6. Your app receives webhook at /api/webhooks/clerk
   ↓
7. Webhook extracts: id, email, role, campus_id
   ↓
8. Data saved to Supabase user_profiles table
   ↓
9. User can now sign in ✅
```

### What Gets Synced:

| Field | Source | Example |
|-------|--------|---------|
| `id` | Clerk user ID | `user_2abc123...` |
| `email` | Clerk email | `john@example.com` |
| `role` | Clerk public metadata | `campus_admin` |
| `campus_id` | Clerk public metadata | `campus-123` |
| `display_name` | Initially `null` | User sets in Settings |
| `theme` | Initially `system` | User sets in Settings |

---

## 🧪 Testing Checklist

- [ ] Webhook endpoint is accessible (test with Clerk Dashboard)
- [ ] `CLERK_WEBHOOK_SECRET` is set in `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- [ ] Database migration for `campus_id` has been run
- [ ] Invited user appears in Supabase after accepting invitation
- [ ] User can sign in successfully
- [ ] Role from Clerk matches role in Supabase
- [ ] "Invite User" button shows for master_admin

---

## 🐛 Troubleshooting

### Webhook not receiving events

**Check:**
- Is your endpoint URL correct and accessible?
- For local development, is ngrok running?
- Check Clerk Dashboard → Webhooks → Your Endpoint → **"Attempts"** tab for errors

**Fix:**
- Verify endpoint URL is correct
- Check server logs for errors
- Ensure webhook secret matches in `.env.local`

### "Invalid webhook signature" error

**Check:**
- Is `CLERK_WEBHOOK_SECRET` in `.env.local`?
- Does it match the secret in Clerk Dashboard?

**Fix:**
- Copy the signing secret from Clerk Dashboard → Webhooks → Your Endpoint
- Update `.env.local` with correct value
- Restart dev server

### User created in Clerk but not in Supabase

**Check:**
- Server logs for errors
- Supabase RLS policies (webhook uses service role key to bypass RLS)
- Database connection

**Fix:**
- Check console logs in your Next.js app
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure `user_profiles` table exists

### Role not syncing correctly

**Check:**
- Is role set in Clerk public metadata?
- Webhook logs show correct role value?

**Fix:**
- Clerk Dashboard → Users → [User] → Metadata → Public metadata
- Ensure format: `{ "role": "campus_admin" }`
- Re-trigger webhook or update user to fire `user.updated` event

---

## 🔐 Security Notes

- ✅ Webhook signature verification prevents unauthorized requests
- ✅ Service role key is server-only (never exposed to client)
- ✅ Webhook endpoint only accepts POST requests
- ✅ All webhook payloads are logged for debugging

**Production Checklist:**
- [ ] Use HTTPS for webhook endpoint
- [ ] Rotate secrets periodically
- [ ] Monitor webhook failures in Clerk Dashboard
- [ ] Set up error alerting for failed syncs

---

## 📝 Code Files

**Files created/modified:**
1. `app/api/webhooks/clerk/route.ts` - Webhook endpoint
2. `supabase/migrations/20251003_add_campus_id_to_user_profiles.sql` - Database migration
3. `lib/supabase.ts` - Updated UserProfile type with `campus_id`

---

## ✨ Next Steps

Once webhooks are working:

1. **Test invitation flow end-to-end**
2. **Invite real users** with different roles
3. **For campus_admins**: Add campus_id in Clerk metadata
4. **Monitor webhook attempts** in Clerk Dashboard
5. **(Optional)** Add campus_id field to in-app invitation dialog

---

## 🆘 Need Help?

**Check webhook logs:**
- Clerk Dashboard → Webhooks → Your Endpoint → **"Attempts"**
- Shows all webhook events, payloads, and responses

**Check server logs:**
```bash
npm run dev
# Watch for webhook messages
```

**Verify webhook is registered:**
- Clerk Dashboard → Webhooks → Should see your endpoint listed

---

**That's it!** Your Clerk users will now automatically sync to Supabase when they accept invitations! 🎉
