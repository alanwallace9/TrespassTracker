# Clerk Invite-Only Setup Guide

This guide walks you through configuring Clerk for **invite-only authentication** where users can only sign up via email invitation.

---

## 🎯 What You Want

- ❌ **No public sign-ups** - Random users can't create accounts
- ✅ **Invite-only** - Only invited users can create accounts via email link
- ✅ **Email/password login** - Simple email and password authentication
- ✅ **Sign-in only page** - No "sign up" link visible on login page

---

## 📋 Step-by-Step Configuration

### Step 1: Disable Public Sign-ups in Clerk

1. Go to **Clerk Dashboard** (https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Scroll to **Sign-up modes** section
5. **Disable** the toggle for **"Allow users to sign up"**
   - OR enable **"Invite only"** mode
6. Click **Save**

This prevents anyone from accessing the sign-up page directly.

### Step 2: Configure Authentication Methods

Still in **User & Authentication** → **Email, Phone, Username**:

1. **Enable Email Address** authentication
2. Under **Email address** settings:
   - Enable **"Require email address"**
   - Enable **"Verify at sign-up"** (users must verify email)
3. **Enable Password** authentication
   - Users will sign in with email/password
4. *Optional:* Enable **"Email verification link"** for passwordless login
5. Click **Save**

### Step 3: Set Up JWT Template for Supabase (Required)

This allows Clerk to work with Supabase RLS:

1. Go to **JWT Templates** in Clerk Dashboard
2. Click **New Template** → Select **Supabase**
3. Name it exactly: `supabase` (lowercase, important!)
4. The template should have these claims:
   ```json
   {
     "aud": "authenticated",
     "exp": "{{token.exp}}",
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "user_metadata": {
       "role": "{{user.public_metadata.role}}"
     }
   }
   ```
5. Click **Save**

### Step 4: Configure Sign-in/Sign-up Redirects

In **Clerk Dashboard** → **Paths**:

1. Set **Sign-in URL**: `/sign-in`
2. Set **Sign-up URL**: `/sign-up`
3. Set **After sign-in redirect**: `/dashboard`
4. Set **After sign-up redirect**: `/dashboard`
5. Click **Save**

---

## 👥 How to Invite Users

You have **two options** for inviting users:

### Option A: Manual Invites (Clerk Dashboard)

1. Go to **Clerk Dashboard** → **Users**
2. Click **"Invite User"** button
3. Enter user's email address
4. Click **"Send Invitation"**
5. User receives email with signup link
6. After they sign up, set their role:
   - Click on the user → **Metadata** tab → **Public metadata**
   - Add: `{ "role": "master_admin" }` (or `district_admin`, `user`)

### Option B: Programmatic Invites (From Your App - Master Admin Only)

**Already built into your app!**

1. Sign in as a **master_admin** user
2. Click user dropdown (top right)
3. Click **"Invite User (Email)"**
4. Enter email and select role
5. Click **"Send Invitation"**

The invitation email is sent automatically with the correct role pre-assigned!

---

## 🧪 Testing the Setup

### Test 1: Public Sign-up Blocked
1. Go to `http://localhost:3002/sign-up`
2. You should see an error or be redirected (sign-up is disabled)

### Test 2: Sign-in Works
1. Go to `http://localhost:3002/sign-in`
2. Should see Clerk sign-in form
3. No "sign up" link should be visible

### Test 3: Create Your First User (Bootstrap)

Since sign-ups are disabled, you need to create the first admin user:

**Method 1: Clerk Dashboard**
1. Go to **Clerk Dashboard** → **Users** → **Create User**
2. Enter email/password manually
3. After created, add to **Public metadata**: `{ "role": "master_admin" }`

**Method 2: Enable Sign-ups Temporarily**
1. Enable sign-ups in Clerk Dashboard
2. Sign up at `http://localhost:3002/sign-up`
3. Set role to `master_admin` in Clerk Dashboard
4. Disable sign-ups again
5. Now you can invite others using the app!

### Test 4: Invite Flow
1. Sign in as master_admin
2. Click **"Invite User (Email)"** in user dropdown
3. Enter test email and select role
4. Check email for invitation link
5. Click link → User creates account
6. Role is automatically set from invitation

---

## 🔑 User Roles

Set roles in Clerk **Public metadata** for each user:

```json
{ "role": "master_admin" }
```

**Available roles:**
- `user` - View only, can see records
- `district_admin` - Can manage records and users
- `master_admin` - Full access, can invite users

**How to set role:**
1. **Clerk Dashboard** → **Users** → Select user
2. Click **Metadata** tab
3. Under **Public metadata**, add: `{ "role": "master_admin" }`
4. Click **Save**

---

## 📧 Customizing Invitation Emails

1. Go to **Clerk Dashboard** → **Customization** → **Emails**
2. Find **"Invitation"** template
3. Customize the email content, styling, and branding
4. Click **Save**

---

## 🐛 Troubleshooting

### "Sign-up is disabled" error
✅ This is correct! Public sign-ups should be disabled.

### Users can still sign up
- Check **User & Authentication** → Ensure "Allow users to sign up" is OFF
- Check **Paths** → Ensure sign-up URL is not publicly accessible

### Invitation email not received
- Check spam/junk folder
- Verify email address is correct
- Check Clerk Dashboard → **Users** → **Invitations** for pending invites

### "Invalid JWT" errors
- Ensure JWT template is named exactly `supabase`
- Verify JWT template has correct claims structure
- Check that Supabase and Clerk are properly connected

### Role not working
- Check user's **Public metadata** in Clerk Dashboard
- Ensure format is exactly: `{ "role": "master_admin" }` (JSON)
- Sign out and sign in again to refresh token

---

## ✅ Checklist

Before going live, ensure:

- [ ] Public sign-ups are disabled in Clerk
- [ ] JWT template named `supabase` is configured
- [ ] First master_admin user is created
- [ ] Invitation emails are working
- [ ] Roles are set correctly in public metadata
- [ ] Sign-in redirects to `/dashboard`
- [ ] Invitation redirect URL is correct (change from localhost to your domain in production)

---

## 🚀 Production Checklist

When deploying to production:

1. **Update .env.local → .env.production:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Update Clerk Dashboard:**
   - Go to **Paths** → Update redirect URLs to production domain
   - Update **Allowed Origins** to include production domain

3. **Test invitations** work with production URL

---

## 🔐 Security Notes

- ✅ Service role key is no longer used (replaced with Clerk JWT tokens)
- ✅ Public sign-ups are disabled
- ✅ Only master_admins can invite users
- ✅ Email verification required for new accounts
- ✅ RLS policies enforce role-based access in Supabase

---

## 📝 Summary

Your app now has **invite-only authentication**:

1. Users **cannot** sign up on their own
2. Master admins **invite users** via email
3. Invited users **create accounts** via email link
4. Roles are **automatically assigned** from invitation
5. Sign-in page has **no sign-up link**

Need help? Check troubleshooting section or Clerk documentation.
