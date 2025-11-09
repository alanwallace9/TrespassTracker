# Project TODO List
**Project**: DistrictTracker Suite
**Last Updated**: 2025-11-09

---

## ✅ COMPLETED - Security Audit Corrections (2025-11-09)

### Day 1-2: Immediate Security Fixes
- [x] **Verify .env files not in git history**
  - ✅ Verified: No .env files in git history
  - ✅ Files properly in .gitignore
- [x] **Add webhook payload validation** (`app/api/webhooks/clerk/route.ts`)
  - [x] Validate role against whitelist (ALLOWED_ROLES constant)
  - [x] Verify tenant_id exists in database
  - [x] Verify campus_id exists in database
  - [x] Add role-specific validation (campus_admin needs campus_id)
- [x] **Replace localStorage with sessionStorage** (`components/feedback/FeedbackFormPanel.tsx`)
  - [x] Changed to `sessionStorage.setItem('pending_feedback', ...)`
  - [x] Added expiration check (10 minutes)
  - [x] Added cleanup on successful submit

### Day 3-4: High Priority Security
- [x] **Add input validation with Zod**
  - [x] Installed: `npm install zod`
  - [x] Created validation schemas in `lib/validation/schemas.ts`
  - [x] Validated in server actions: `createRecord`, `updateRecord`, `createFeedback`, `createFeedbackComment`
  - [x] Added email, phone, date validations
- [x] **Add CSP headers** (`next.config.js`)
  - [x] Configured Content-Security-Policy
  - [x] Added X-Frame-Options: DENY
  - [x] Added X-Content-Type-Options: nosniff
  - [x] Added Referrer-Policy: strict-origin-when-cross-origin
  - [x] Added X-XSS-Protection
  - [x] Added Permissions-Policy
- [x] **Implement rate limiting**
  - [x] Installed: `npm install @upstash/ratelimit @upstash/redis`
  - [x] Created `lib/rate-limit.ts` utility
  - [x] Added to feedback submission (10 requests/minute)
  - [x] Added to comment submission (10 requests/minute)
  - [x] Added to webhook endpoint (100 requests/minute)
  - [x] Upvote rate limit ready (20 requests/minute)
  - ⚠️ **Note**: Requires Upstash Redis credentials to be configured in production

### Day 5: Medium Priority Security
- [ ] **Add CSRF protection**
  - [ ] Verify Next.js Server Actions protection
  - [ ] Add origin header validation
- [ ] **Sanitize error messages**
  - [ ] Update all `throw new Error(error.message)` to generic messages
  - [ ] Use logger for detailed errors (server-side only)
- [ ] **Complete audit logging**
  - [ ] Add logging for feedback views
  - [ ] Add logging for user profile views
  - [ ] Add logging for bulk operations

---

## 🚀 IN PROGRESS - Pre-Demo Upgrades (2025-11-09)

**Reference**: See `IMPLEMENTATION_PLAN_2025-11-09.md` for complete details

### Phase 1: Secure Tenant Switching ✅ COMPLETED
- [x] Create migration: Add `active_tenant_id` column to user_profiles
- [x] Update `get_my_tenant_id()` RLS function to check active_tenant_id
- [x] Create server action: `switchActiveTenant()` with audit logging
- [x] Update AdminTenantContext to use server action (remove localStorage)
- [x] Test tenant switching with bulk operations
- **Commit**: d0ce87b - feat: implement secure database-backed tenant switching

### Phase 2: Tenants Management Page ✅ COMPLETED
- [x] Create server actions: createTenant, updateTenant, deactivateTenant, reactivateTenant
- [x] Build Tenants admin page (table + create/edit dialogs)
- [x] Add "Tenants" to admin sidebar (master_admin only)
- [x] Subdomain validation and duplicate detection
- [x] Comprehensive audit logging for tenant operations
- [ ] Test full onboarding workflow (Phase 2.1 - Next Session)
- **Commit**: TBD - will be added after commit

### Phase 3: Demo Environment
- [ ] Create demo RLS policies (SELECT, INSERT, UPDATE for all auth users)
- [ ] Build DemoRoleContext (viewer, campus_admin, district_admin switcher)
- [ ] Create DemoBanner component with role dropdown
- [ ] Create demo how-to page (`app/(demo)/demo-guide/page.tsx`)
- [ ] Update demo reset cron (delete records/campuses, preserve user_profiles)

### Phase 4: Feedback UX
- [ ] Install sonner: `npm install sonner`
- [ ] Add toast to UpvoteButton (non-auth users)
- [ ] Update CommentsSection (clean FeedBear design)
- [ ] Add future task: Resend email integration

### Phase 5: Admin Panel Polish
- [ ] Update logo to logo1.svg + "District Tracker" text
- [ ] Allow district_admin access (no tenant dropdown, limited nav)
- [ ] Filter navigation based on role (hide Feedback for district_admin)

---

## 🎯 Week 1: Demo Environment Setup

### Demo Tenant & Data
- [ ] **Create demo tenant in Supabase**
  ```sql
  INSERT INTO tenants (id, name, display_name, subdomain, is_active)
  VALUES ('demo-tenant', 'Demo District', 'Demo District ISD', 'demo', true);
  ```
- [ ] **Create demo campuses**
  - [ ] Elementary School
  - [ ] Middle School
  - [ ] High School
  - [ ] DAEP Campus
- [ ] **Create demo trespass records** (20-30 records)
  - [ ] Mix of active/inactive
  - [ ] Various campuses
  - [ ] Mix of student types
- [ ] **Create demo users**
  - [ ] viewer@demo.districttracker.com
  - [ ] campus_admin@demo.districttracker.com
  - [ ] district_admin@demo.districttracker.com

### Demo UI Components
- [ ] **Create DemoBanner component** (`components/DemoBanner.tsx`)
  ```tsx
  export function DemoBanner() {
    return (
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
        <strong>Demo Environment</strong> - Data resets nightly at midnight.
        <a href="/signup" className="underline ml-2">Create your own account</a>
      </div>
    );
  }
  ```
- [ ] **Add demo mode detection** (`lib/demo.ts`)
  ```typescript
  export const IS_DEMO = process.env.NEXT_PUBLIC_IS_DEMO === 'true';
  export const DEMO_TENANT_ID = 'demo-tenant';
  ```
- [ ] **Update layout to show demo banner**
  - [ ] Add to `app/layout.tsx`
  - [ ] Show only on demo subdomain

### Demo Signup Flow
- [ ] **Enable public signups for demo** (middleware.ts)
  - [ ] Detect demo subdomain
  - [ ] Allow public signup page
  - [ ] Auto-assign demo tenant_id
- [ ] **Create demo signup page** (`app/demo-signup/page.tsx`)
  - [ ] Custom signup form
  - [ ] Explain demo limitations
  - [ ] Auto-assign viewer role
  - [ ] Auto-assign demo tenant
- [ ] **Update Clerk configuration**
  - [ ] Enable public signups for demo subdomain only
  - [ ] Set default metadata: `{ tenant_id: 'demo-tenant', role: 'viewer' }`

### Demo Data Reset
- [ ] **Enhance reset demo cron job** (`app/api/cron/reset-demo/route.ts`)
  - [ ] Add CRON_SECRET authentication
  - [ ] Delete all demo tenant records
  - [ ] Delete all demo users (except system accounts)
  - [ ] Re-insert seed data
  - [ ] Log reset event to audit log
- [ ] **Configure Vercel cron** (vercel.json)
  ```json
  {
    "crons": [{
      "path": "/api/cron/reset-demo",
      "schedule": "0 0 * * *"
    }]
  }
  ```
- [ ] **Create seed data JSON** (`lib/demo-seed-data.ts`)
  - [ ] Export seed records array
  - [ ] Export seed campuses array
  - [ ] Export seed users array

### Demo Deployment
- [ ] **Configure Vercel domain**
  - [ ] Add `demo.districttracker.com` to Vercel project
  - [ ] Set environment variables for demo
    ```
    NEXT_PUBLIC_IS_DEMO=true
    NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant
    ```
- [ ] **Test demo flow**
  - [ ] Visit demo.districttracker.com
  - [ ] See demo banner
  - [ ] Sign up with test account
  - [ ] Verify auto-assigned to demo tenant
  - [ ] Create test record
  - [ ] Wait for nightly reset (or trigger manually)

---

## 🏗️ Week 2: Monorepo Migration

### Day 1: Turborepo Setup
- [ ] **Install Turborepo**
  ```bash
  npm install turbo --save-dev
  npx turbo init
  ```
- [ ] **Create folder structure**
  ```bash
  mkdir -p apps packages
  mkdir -p apps/trespass apps/daep
  mkdir -p packages/ui packages/database packages/auth packages/config
  ```
- [ ] **Create root package.json**
  - [ ] Add workspaces configuration
  - [ ] Add turbo scripts
  - [ ] Configure prettier, eslint at root
- [ ] **Create turbo.json**
  - [ ] Configure build pipeline
  - [ ] Configure dev pipeline
  - [ ] Set up caching

### Day 2-3: Move Current App
- [ ] **Move files to apps/trespass**
  ```bash
  mv app apps/trespass/
  mv components apps/trespass/
  mv lib apps/trespass/
  mv contexts apps/trespass/
  mv public apps/trespass/
  mv styles apps/trespass/
  ```
- [ ] **Update apps/trespass/package.json**
  - [ ] Set name to @district/trespass
  - [ ] Add local package dependencies
  - [ ] Update scripts
- [ ] **Update import paths**
  - [ ] Test build
  - [ ] Fix any broken imports
  - [ ] Update tsconfig paths

### Day 4: Extract Shared Packages
- [ ] **Create packages/ui**
  - [ ] Move components/ui/* to packages/ui/src/
  - [ ] Create package.json
  - [ ] Create tsconfig.json
  - [ ] Export all components from index.ts
- [ ] **Create packages/database**
  - [ ] Move lib/supabase/* to packages/database/src/
  - [ ] Move lib/audit-logger.ts
  - [ ] Create package.json
  - [ ] Export database clients
- [ ] **Create packages/auth**
  - [ ] Move contexts/AuthContext.tsx
  - [ ] Move lib/auth-utils.ts
  - [ ] Create package.json
  - [ ] Export auth components
- [ ] **Create packages/config**
  - [ ] Move shared types
  - [ ] Move constants
  - [ ] Create package.json
- [ ] **Update imports in apps/trespass**
  - [ ] Replace `@/components/ui` with `@district/ui`
  - [ ] Replace `@/lib/supabase` with `@district/database`
  - [ ] Replace `@/contexts/AuthContext` with `@district/auth`

### Day 5: Testing & Verification
- [ ] **Test monorepo build**
  ```bash
  npm run build
  # Should build all packages then apps
  ```
- [ ] **Test development mode**
  ```bash
  npm run dev
  # Should start trespass app on port 3000
  ```
- [ ] **Verify type safety**
  ```bash
  npm run typecheck
  ```
- [ ] **Update documentation**
  - [ ] Update README.md with monorepo structure
  - [ ] Document package dependencies
  - [ ] Add development workflow guide

---

## 🏫 Week 3: DAEP Dashboard Scaffold

### Day 1-2: DAEP App Setup
- [ ] **Create Next.js app in apps/daep**
  ```bash
  cd apps/daep
  npm init -y
  npm install next react react-dom typescript @types/react @types/node
  ```
- [ ] **Configure apps/daep/package.json**
  - [ ] Set name to @district/daep
  - [ ] Add dependencies on shared packages
  - [ ] Set dev script to port 3003
- [ ] **Copy base configuration**
  - [ ] Copy next.config.js from trespass
  - [ ] Copy tsconfig.json
  - [ ] Copy tailwind.config.ts
  - [ ] Copy .eslintrc.json
- [ ] **Create app structure**
  ```bash
  mkdir -p app/dashboard app/students app/reports
  ```

### Day 3: DAEP Layout & Navigation
- [ ] **Create DAEP layout** (`apps/daep/app/layout.tsx`)
  - [ ] Import shared UI components
  - [ ] Create DAEP-specific navigation
  - [ ] Add Clerk authentication
  - [ ] Add tenant selector (for master_admin)
- [ ] **Create DAEP dashboard page** (`apps/daep/app/page.tsx`)
  - [ ] DAEP student count widget
  - [ ] Expiration warnings
  - [ ] Recent placements
  - [ ] Quick actions
- [ ] **Create navigation structure**
  - [ ] Dashboard
  - [ ] Students
  - [ ] Reports
  - [ ] Settings

### Day 4: DAEP Core Features
- [ ] **Students page** (`apps/daep/app/students/page.tsx`)
  - [ ] List all DAEP students (is_daep = true)
  - [ ] Filter by campus
  - [ ] Filter by expiration status
  - [ ] Search by name/ID
- [ ] **Student detail page** (`apps/daep/app/students/[id]/page.tsx`)
  - [ ] Student information
  - [ ] DAEP placement details
  - [ ] Expiration date
  - [ ] Home campus
  - [ ] Edit button
- [ ] **Reports page** (`apps/daep/app/reports/page.tsx`)
  - [ ] DAEP enrollment report
  - [ ] Expiration report
  - [ ] Campus breakdown

### Day 5: Deployment Configuration
- [ ] **Update root vercel.json**
  - [ ] Add daep project configuration
  - [ ] Configure domain: daep.districttracker.com
  - [ ] Set environment variables
- [ ] **Test DAEP deployment**
  - [ ] Build successfully
  - [ ] Deploy to Vercel
  - [ ] Verify domain works
  - [ ] Test authentication
  - [ ] Verify shared components work

---

## 📝 Documentation Tasks

- [ ] **Update CLAUDE.md**
  - [ ] Document monorepo structure
  - [ ] Update file paths
  - [ ] Add DAEP module information
- [ ] **Create MONOREPO.md**
  - [ ] Explain architecture
  - [ ] Package dependencies diagram
  - [ ] Development workflow
  - [ ] Deployment process
- [ ] **Create DAEP.md**
  - [ ] DAEP feature specification
  - [ ] User stories
  - [ ] Database schema for DAEP
  - [ ] API documentation
- [ ] **Update CHANGELOG.md**
  - [ ] Add monorepo migration entry
  - [ ] Add demo environment entry
  - [ ] Add DAEP module entry

---

## 🧪 Testing Tasks

- [ ] **Security testing**
  - [ ] Run OWASP ZAP scan
  - [ ] Test rate limiting
  - [ ] Test CSP headers
  - [ ] Penetration testing (optional)
- [ ] **Demo environment testing**
  - [ ] Test public signup
  - [ ] Test data reset
  - [ ] Test tenant isolation
  - [ ] Load testing
- [ ] **Monorepo testing**
  - [ ] Test shared package updates
  - [ ] Test independent deployments
  - [ ] Test build caching
  - [ ] Integration tests
- [ ] **DAEP testing**
  - [ ] Test DAEP student filtering
  - [ ] Test dual-campus counting
  - [ ] Test expiration calculations
  - [ ] Test reports

---

## 🎯 Future Enhancements (Backlog)

### Modules to Build
- [ ] **Attendance Dashboard**
  - [ ] Daily attendance tracking
  - [ ] Absence reporting
  - [ ] Parent notifications
- [ ] **Gradebook Module**
  - [ ] Grade entry
  - [ ] Standards-based grading
  - [ ] Report cards
- [ ] **Incident Tracking**
  - [ ] Behavioral incidents
  - [ ] Discipline referrals
  - [ ] Parent communications
- [ ] **Transportation Module**
  - [ ] Bus routes
  - [ ] Student assignments
  - [ ] Driver management

### Platform Enhancements
- [ ] **Mobile apps** (React Native)
- [ ] **Offline mode** (PWA)
- [ ] **Advanced analytics**
- [ ] **AI-powered insights**
- [ ] **Parent portal**
- [ ] **Student portal**

---

## ✅ Completed Tasks

### 2025-11-09: Code Quality & Documentation
- [x] Fix all TypeScript errors (27 errors fixed)
- [x] Fix Set iteration errors (Array.from)
- [x] Fix audit logs parameter errors
- [x] Fix admin feedback panel status type
- [x] Fix reports page null/undefined errors
- [x] Fix feedback detail view implicit any
- [x] Fix bugs/features page type props
- [x] Fix comments section type errors
- [x] Fix invite dialog tenant_id error
- [x] Fix settings dialog notification_days
- [x] Production build successful
- [x] Complete security audit
- [x] Update CHANGELOG.md
- [x] Update FEEDBACK.md (Phase 5 complete)
- [x] Update adminpanelv2.md

### 2025-11-09: Feedback System Final Polish
- [x] Hide Name/Email/Terms for authenticated users
- [x] Update changelog page color scheme
- [x] Standardize borders (#828282)
- [x] Blue theme for CTAs
- [x] Clean form layout for logged-in users

---

**Priority Order**:
1. 🔴 Security (This Week)
2. 🎯 Demo Environment (Week 1)
3. 🏗️ Monorepo (Week 2)
4. 🏫 DAEP Module (Week 3)
