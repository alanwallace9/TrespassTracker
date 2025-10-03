# Quick Start Guide - TrespassTracker Setup

## 🚀 5-Minute Setup

### Prerequisites
- Clerk account (https://clerk.com)
- Supabase project (https://supabase.com)
- Environment variables configured in `.env.local`

---

## Step 1: Enable Clerk ↔ Supabase Integration (2 min)

**In Clerk Dashboard:**
1. Go to **Integrations** → **Supabase**
2. Click **"Enable"**
3. **Copy the Clerk domain** (e.g., `clerk-abc123.clerk.accounts.dev`)

**In Supabase Dashboard:**
1. Go to **Authentication** → **Sign In / Up**
2. Click **"Add provider"** → Select **"Clerk"**
3. Paste Clerk domain → **Save**

✅ Done! Roles automatically sync from Clerk to Supabase.

---

## Step 2: Disable Public Sign-ups (30 sec)

**In Clerk Dashboard:**
1. **User & Authentication** → **Email, Phone, Username**
2. **Sign-up modes** → **Turn OFF** "Allow users to sign up"
3. **Save**

✅ Now invite-only!

---

## Step 3: Create Your First Master Admin (1 min)

**In Clerk Dashboard:**
1. **Users** → **"Create User"**
2. Enter your email + password
3. After created, click user → **"Metadata"**
4. **Public metadata** → Add:
   ```json
   {
     "role": "master_admin"
   }
   ```
5. **Save**

✅ You're now a master admin!

---

## Step 4: Run Database Migration (1 min)

**In Supabase Dashboard:**
1. **SQL Editor** → New query
2. Copy content from: `supabase/migrations/20251003_update_rls_for_4_roles.sql`
3. Paste and **Run**

✅ 4-role permissions are now active!

---

## Step 5: Test It! (1 min)

```bash
npm run dev
```

1. Visit `http://localhost:3002/sign-in`
2. Sign in with your master_admin account
3. Click user dropdown → **"Invite User (Email)"** should be visible
4. Invite a test user with any role

✅ Everything works!

---

## 🎯 What You Get

### 4 Roles:
- **Viewer** - Read-only
- **Campus Admin** - Create & update records
- **District Admin** - Create, update, delete records
- **Master Admin** - Full access + invite users

### Invite-Only:
- No public sign-ups
- Master admins invite via email
- Role pre-assigned in invitation

### In-App Management:
- "Invite User (Email)" button for master admins
- Role selection via dropdown
- Automatic role assignment

---

## 📚 Need More Details?

- **Complete setup:** `CLERK_SETUP_INSTRUCTIONS.md`
- **Role management:** `CLERK_ROLE_ASSIGNMENT_GUIDE.md`
- **Invite-only guide:** `INVITE_ONLY_SETUP.md`
- **Full summary:** `SETUP_SUMMARY.md`

---

## 🐛 Something Wrong?

**"Invite User" button not showing?**
→ Check your role is `master_admin` in Clerk public metadata

**Users can still sign up?**
→ Turn off "Allow users to sign up" in Clerk Dashboard

**Permissions not working?**
→ Run the RLS migration in Supabase SQL Editor

**Role changes not taking effect?**
→ User must sign out and sign in again

---

That's it! You're ready to go! 🎉
