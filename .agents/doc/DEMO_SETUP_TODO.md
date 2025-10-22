# Demo Environment Setup - TODO List

This checklist tracks the steps needed to complete the demo environment setup.

## Status: In Progress

### Completed ✅
- [x] Create demo tenant in Supabase (`demo` tenant created)
- [x] Create demo login page (`app/demo-login/page.tsx`)
- [x] Create hourly reset cron job (`app/api/cron/reset-demo/route.ts`)
- [x] Create seed data script (`scripts/seed-demo-data.ts`)
- [x] Add vercel.json for cron configuration
- [x] Install ts-node dependency
- [x] Write comprehensive setup documentation (`DEMO_SETUP.md`)

### To Do 🔲

#### Step 1: Create Clerk Demo Users
- [ ] Login to [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Create User 1:
  - Email: `demo-admin@districttracker.com`
  - Password: `Default1`
  - Public Metadata: `{"role": "district_admin", "tenant_id": "demo"}`
  - **Save User ID**: `user_________________`
- [ ] Create User 2:
  - Email: `demo-viewer@districttracker.com`
  - Password: `Default2`
  - Public Metadata: `{"role": "viewer", "tenant_id": "demo"}`
  - **Save User ID**: `user_________________`

#### Step 2: Update Code with Clerk User IDs
- [ ] Update `app/api/cron/reset-demo/route.ts` line ~67
  - Replace `demo-admin-user-id` with actual admin user ID
  - Replace `demo-viewer-user-id` with actual viewer user ID
- [ ] Update `scripts/seed-demo-data.ts` line ~30
  - Replace `user_REPLACE_WITH_ADMIN_ID` with actual admin user ID
  - Replace `user_REPLACE_WITH_VIEWER_ID` with actual viewer user ID

#### Step 3: Configure Environment Variables
- [ ] Add to Vercel environment variables:
  ```
  CRON_SECRET=<generate with: openssl rand -base64 32>
  ```
- [ ] Verify all Supabase env vars are set in Vercel

#### Step 4: Seed Initial Demo Data
- [ ] Run locally: `npm run seed:demo`
- [ ] Verify in Supabase:
  ```sql
  SELECT COUNT(*) FROM trespass_records WHERE tenant_id = 'demo';
  ```
  Expected: 6 records

#### Step 5: Test Locally
- [ ] Start dev server: `npm run dev`
- [ ] Visit: `http://localhost:3002/demo-login`
- [ ] Test "Try as Admin" button
- [ ] Test "Try as Viewer" button
- [ ] Verify records appear in dashboard
- [ ] Test CRUD operations

#### Step 6: Deploy to Production
- [ ] Commit all changes: `git add . && git commit -m "feat: add demo environment"`
- [ ] Deploy: `vercel --prod`
- [ ] Verify deployment succeeded
- [ ] Check cron job appears in Vercel dashboard

#### Step 7: Test Production Demo
- [ ] Visit: `https://demo.districttracker.com/demo-login`
- [ ] Test admin login
- [ ] Test viewer login
- [ ] Create/edit/delete records
- [ ] Wait 1 hour and verify reset worked

#### Step 8: Monitor & Maintain
- [ ] Check cron job logs in Vercel
- [ ] Verify demo data quality
- [ ] Monitor usage analytics
- [ ] Update demo data as needed

## Notes

### Files Created
- `app/demo-login/page.tsx` - Demo login UI with prefilled credentials
- `app/api/cron/reset-demo/route.ts` - Hourly reset cron job
- `scripts/seed-demo-data.ts` - Manual seed script
- `vercel.json` - Cron job configuration
- `DEMO_SETUP.md` - Complete setup guide

### Key Features
- Hourly automatic resets (every :00)
- Prefilled login buttons (no typing required)
- 6 diverse sample records
- Full CRUD operations allowed
- Multi-tenant isolation

### Security Considerations
- Demo users isolated to `tenant_id='demo'` only
- RLS policies prevent cross-tenant access
- Cron endpoint protected with bearer token
- No production data exposure

## Reference Links
- Setup Guide: `DEMO_SETUP.md`
- Clerk Dashboard: https://dashboard.clerk.com
- Vercel Dashboard: https://vercel.com/dashboard
