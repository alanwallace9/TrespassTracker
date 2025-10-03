# Clerk Role Assignment Guide

This guide shows you how to assign roles to users in Clerk using Public Metadata. This is required for the 4-role permission system to work.

---

## 🎯 The 4 Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **viewer** | Read-only access | Can only view trespass records |
| **campus_admin** | Campus-level administrator | View, Create, Update records (no delete, no user management) |
| **district_admin** | District-level administrator | View, Create, Update, Delete records + manage campus admins |
| **master_admin** | System administrator | Full access to everything including user management |

---

## 📋 How to Assign Roles in Clerk Dashboard

### Method 1: Assign Role to Existing User

1. **Go to Clerk Dashboard** (https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Users** in the left sidebar
4. **Click on the user** you want to assign a role to
5. Click the **"Metadata"** tab
6. Under **"Public metadata"** section, click **"Edit"**
7. Add the following JSON:
   ```json
   {
     "role": "campus_admin"
   }
   ```
   Replace `"campus_admin"` with one of: `"viewer"`, `"campus_admin"`, `"district_admin"`, or `"master_admin"`
8. Click **"Save"**

**Important:** The user must sign out and sign back in for the role change to take effect.

---

### Method 2: Assign Role During User Creation

1. **Go to Clerk Dashboard** → **Users**
2. Click **"Create user"** button
3. Fill in user details (email, password, etc.)
4. Scroll to **"Public metadata"** section
5. Add:
   ```json
   {
     "role": "master_admin"
   }
   ```
6. Click **"Create user"**

---

### Method 3: Assign Role via Invitation (Recommended)

When you invite a user, you can pre-assign their role:

1. **Go to Clerk Dashboard** → **Users**
2. Click **"Invite user"** button
3. Enter the user's email address
4. In the **"Public metadata"** field, add:
   ```json
   {
     "role": "district_admin"
   }
   ```
5. Click **"Send invitation"**

The user will receive an email invitation and when they sign up, their role will already be set!

---

## 🔧 Role Assignment Examples

### Example 1: Creating a Master Admin (First User)

Since you need at least one master admin to manage the system:

```json
{
  "role": "master_admin"
}
```

### Example 2: Creating a District Admin

For someone who manages a school district:

```json
{
  "role": "district_admin"
}
```

### Example 3: Creating a Campus Admin

For someone who manages a single campus/school:

```json
{
  "role": "campus_admin"
}
```

### Example 4: Creating a Read-Only Viewer

For someone who only needs to view records:

```json
{
  "role": "viewer"
}
```

---

## ✅ Verification Steps

After assigning a role, verify it's working:

### 1. Check the Role in Clerk Dashboard
1. Go to **Users** → Select the user
2. Click **"Metadata"** tab
3. Verify **"Public metadata"** shows the correct role

### 2. Check the Role in Your App
1. Have the user sign out and sign in again
2. In the app, check the user dropdown (top right)
3. The role should be displayed next to the user's name

### 3. Test Permissions
- **Viewer**: Should only see records, no create/edit/delete buttons
- **Campus Admin**: Can create and update records, no delete button
- **District Admin**: Can create, update, delete records, manage campus admins
- **Master Admin**: Full access, can manage all users

---

## 🚀 Quick Start: Setting Up Your First Admin

You need at least one **master_admin** to bootstrap the system:

### Step 1: Create Your First Master Admin

**Option A: Create Manually in Clerk**
1. Clerk Dashboard → **Users** → **"Create user"**
2. Email: `your-email@example.com`
3. Set a password
4. Public metadata: `{ "role": "master_admin" }`
5. Click **"Create user"**

**Option B: Enable Sign-ups Temporarily**
1. Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**
2. Enable **"Allow users to sign up"** temporarily
3. Go to your app at `http://localhost:3000/sign-up`
4. Create your account
5. In Clerk Dashboard, add `{ "role": "master_admin" }` to your user's public metadata
6. Disable **"Allow users to sign up"** again
7. Sign out and sign back in

### Step 2: Verify Master Admin Access
1. Sign in to your app
2. You should see:
   - "Invite User (Email)" option in user dropdown
   - Full access to all features
   - Ability to create, update, and delete records

### Step 3: Invite Other Users
1. Click user dropdown → **"Invite User (Email)"**
2. Enter email and select role
3. User receives invitation email
4. They sign up with role pre-assigned

---

## 📧 Customizing Invitation Emails

1. Clerk Dashboard → **Customization** → **Emails**
2. Find **"Invitation"** template
3. Customize subject, body, and branding
4. Click **"Save"**

---

## 🐛 Troubleshooting

### Role not showing in app
- **Solution**: User must sign out and sign in again after role assignment
- JWT tokens are cached, new login fetches fresh token with updated metadata

### "Invalid role" or permission errors
- **Check**: Public metadata format is exactly `{ "role": "master_admin" }`
- **Check**: Role value is one of: `viewer`, `campus_admin`, `district_admin`, `master_admin`
- **Check**: No typos in the role name (case-sensitive)

### User can't access features they should have
- **Check**: Verify role in Clerk Dashboard → Users → [User] → Metadata
- **Check**: User has signed out and signed back in
- **Check**: RLS migration has been applied in Supabase (Step 3)

### Multiple roles or complex permissions
- Public metadata can only have **ONE** role per user
- Use the highest level role needed for the user's responsibilities

---

## 🔐 Security Best Practices

1. **Principle of Least Privilege**: Assign the minimum role needed
   - Most users should be `viewer` or `campus_admin`
   - Only trusted staff should be `district_admin`
   - Very few people need `master_admin`

2. **Regular Audits**: Periodically review user roles in Clerk Dashboard
   - Remove inactive users
   - Downgrade roles when responsibilities change

3. **Don't Over-Assign Master Admin**:
   - Master admins have full access including deleting records
   - Limit to 1-3 trusted administrators

4. **Role Changes Require Re-login**:
   - Always ask users to sign out/in after role changes
   - This ensures JWT token is refreshed with new permissions

---

## 📝 Role Assignment Checklist

Before going live, ensure:

- [ ] At least one `master_admin` user exists
- [ ] All users have roles assigned in Clerk public metadata
- [ ] Role format is correct: `{ "role": "master_admin" }` (JSON)
- [ ] Users have been asked to sign out/in after role assignment
- [ ] Tested each role's permissions in the app
- [ ] Public sign-ups are disabled (invite-only mode)
- [ ] Invitation emails are working correctly

---

## 🆘 Need Help?

**Check if Clerk Native Integration is Active:**
1. Clerk Dashboard → **Integrations**
2. Find **"Supabase"** integration
3. Should show as "Active" or "Connected"

**Verify JWT Contains Role:**
1. Sign in to your app
2. Open browser DevTools → Application/Storage → Cookies
3. Find Clerk session cookie
4. Decode the JWT at https://jwt.io
5. Check `user_metadata.role` exists in the payload

**Still stuck?**
- Check Clerk documentation: https://clerk.com/docs
- Check Supabase RLS policies are applied correctly
