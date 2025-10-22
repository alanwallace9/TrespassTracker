# TrespassTracker Product Roadmap

> **Last Updated:** October 5, 2025
> **Current Version:** 2.0 MVP (Birdville single-tenant)

---

## Version Overview

| Version | Status | Focus | Timeline |
|---------|--------|-------|----------|
| **v2.0** | 🚧 In Progress | Clean theming + Light/Dark modes (Birdville only) | Current Sprint |
| **v2.1** | 📋 Planned | Multi-tenant architecture + subdomain routing | After Birdville feedback |
| **v2.2** | 💭 Future | Advanced theming (logos, fonts, custom colors) | TBD |
| **v3.0** | 💭 Future | Clerk Organizations + advanced features | TBD |

---

## v2.0 - Birdville MVP (Current Sprint)

**Status:** ✅ COMPLETE - Simplified OKLCH theme system implemented

**Goal:** Ship clean, professional design system with Light/Dark themes (removed System mode for simplicity).

### Architecture Decisions
- ✅ Single-tenant (Birdville only)
- ✅ **SIMPLIFIED to OKLCH color system** (changed from HSL)
- ✅ **Power button theme toggle** (localStorage persistence)
- ✅ **Removed System theme** (just Light/Dark for simplicity)
- ✅ **Card view default** (grid layout instead of list)
- ✅ No district_id columns yet (defer to v2.1)
- ✅ No subdomain routing yet (defer to v2.1)

### Features - COMPLETED ✅

#### Design System Overhaul (October 4, 2025)
- ✅ **Simplified OKLCH Color System** (reduced from 317 to ~100 lines):
  - Three-level background system: `--bg-dark`, `--bg`, `--bg-light`
  - Clean semantic tokens using OKLCH for better color consistency
  - Dark mode is now the default (not light mode)
  - Status colors: active (green), error (red), warning (orange), success (green)
  - All shadcn components mapped to new system (background, card, popover, etc.)

- ✅ **Power Button Theme Toggle**:
  - Replaced Settings dialog theme selector with header power button
  - 44px touch-friendly button placed before user dropdown
  - Visual states: Dark mode (yellow glow), Light mode (blue)
  - Theme persists in localStorage (stays across sessions while logged in)
  - Removed Supabase theme storage (client-side only now)

- ✅ **Updated `tailwind.config.ts`**:
  - All colors reference new OKLCH variables
  - Removed old surface/text token system
  - Cleaner, simpler configuration

- ✅ **Component Updates**:
  - `DashboardLayout.tsx`: Power button added, theme logic with localStorage
  - `SettingsDialog.tsx`: Theme selector removed, just displays name now
  - `RecordCard.tsx`: Combined shadow added (layered depth effect)
  - All components: Use simplified bg-background, bg-card, text-foreground classes

- ✅ **Default View Mode**: Card/grid view is now default (not list)

- ✅ **Combined Shadow on Cards**:
  - RecordCard only: `0px 4px 4px rgba(0, 0, 0, 0.19), 0px 12px 12px rgba(0, 0, 0, 0.08)`
  - Creates professional layered depth effect

- ✅ **Accessibility**:
  - `prefers-reduced-motion` support maintained
  - Focus rings visible on all interactive elements
  - 44px minimum touch targets

#### UI Enhancements (October 4, 2025 - Evening Session)
- ✅ **RecordCard Improvements**:
  - Added hover effect: scale-105 with shadow increase
  - Smooth 300ms transition animation
  - Added 2px border separator between image and text sections
  - Creates visual separation and professional feel

- ✅ **Alphabetical Sorting**:
  - Records sorted by last name (A-Z)
  - Secondary sort by first name if last names match
  - Applies to both card view and list view
  - Consistent ordering across all views

- ✅ **Dropdown Menu Reorganization**:
  - Reordered bottom section: Changelog → Send Feedback → Settings → Sign Out
  - Changelog visible to district_admin and master_admin only
  - Send Feedback opens external link (placeholder for Google Form)
  - Cleaner, more logical menu structure

- ✅ **Color Reference Documentation**:
  - Created comprehensive COLOR_REFERENCE.md
  - Component-by-component color breakdown
  - Variable mapping guide for easy updates
  - Testing checklist included

#### Authentication & Infrastructure (October 2025)
- ✅ **Clerk Authentication Fully Integrated**:
  - User sign-up/sign-in flows working
  - Clerk session management
  - Role-based access via Clerk metadata
  - Auto-sync to Supabase user_profiles table

- ✅ **Domain & DNS Setup**:
  - Custom domain configured
  - Cloudflare DNS records set up
  - SSL certificates provisioned
  - Production domain ready

#### Status Color Refinements (October 5, 2025)
- ✅ **Status Color System Updates**:
  - Updated `--status-active` to brighter green: `oklch(0.62 0.19 142)`
  - Added dedicated `--status-former` color: `oklch(0.58 0.18 260)` (purple/blue)
  - Former Student badges now use semantic color instead of generic primary
  - Added `status-former` utility to Tailwind config

- ✅ **Light Mode Color Improvements**:
  - Increased background lightness (0.96, 0.94, 0.98 vs previous 0.90, 0.84, 0.74)
  - Removed color tinting (changed from `oklch(L 0 264)` to `oklch(L 0 0)`)
  - Updated borders to pure neutral grays (0.75, 0.78)
  - Added softer shadows for light mode
  - Fixed input backgrounds to use `--bg-light` for better contrast
  - Added `--primary-foreground` for proper contrast on primary elements

- ✅ **UI Interaction Refinements**:
  - Profile dropdown now scales on hover without color change
  - Theme toggle button uses `bg-input` for consistency
  - Hover effects consistent across header controls

#### Remaining Tasks
- ⏳ **Add user reference photos to project**
- ⏳ **Test Light/Dark theme switching** (user testing on actual devices)
- ⏳ **Test power button on mobile devices**
- ⏳ **Take QA screenshots** (Light mode, Dark mode)
- ⏳ **Deploy to production**
- ⏳ **Get feedback from Birdville users**

### Out of Scope (Deferred to v2.1+)
- ❌ Multi-tenant database changes
- ❌ Subdomain routing
- ❌ District themes table
- ❌ Dynamic theme loading
- ❌ Logo customization
- ❌ Clerk Organizations
- ❌ System theme mode (removed for simplicity)

---

## v2.1 - Multi-Tenant Architecture

**Goal:** Support multiple districts with subdomain-based routing and data isolation.

**Trigger:** When District #2 signs up (or before if proactive)

### Database Migrations

```sql
-- 1. Create districts lookup table
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id TEXT UNIQUE NOT NULL,  -- 'birdville', 'desoto', etc.
  name TEXT NOT NULL,                -- 'Birdville ISD'
  subdomain TEXT UNIQUE NOT NULL,    -- 'birdville' (for URL)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create district_themes table
CREATE TABLE district_themes (
  district_id TEXT PRIMARY KEY REFERENCES districts(district_id),
  name TEXT NOT NULL,
  accent_tokens JSONB NOT NULL,  -- Color ramp in HSL format
  logo_url TEXT,
  font_family TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add district_id to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN district_id TEXT REFERENCES districts(district_id);

-- 4. Add district_id to trespass_records (CRITICAL)
ALTER TABLE trespass_records
  ADD COLUMN district_id TEXT NOT NULL REFERENCES districts(district_id);

-- 5. Backfill existing Birdville data
UPDATE user_profiles SET district_id = 'birdville';
UPDATE trespass_records SET district_id = 'birdville';

-- 6. Add indexes for performance
CREATE INDEX idx_user_profiles_district ON user_profiles(district_id);
CREATE INDEX idx_trespass_records_district ON trespass_records(district_id);
CREATE INDEX idx_trespass_district_status ON trespass_records(district_id, status);
CREATE INDEX idx_trespass_district_created ON trespass_records(district_id, created_at DESC);
```

### RLS Policy Updates

Update all RLS policies to scope by district:

```sql
-- Example: trespass_records
DROP POLICY IF EXISTS "Users can view records" ON trespass_records;

CREATE POLICY "Users can view records in their district"
  ON trespass_records FOR SELECT
  TO authenticated
  USING (
    district_id = (SELECT district_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create records in their district"
  ON trespass_records FOR INSERT
  TO authenticated
  WITH CHECK (
    district_id = (SELECT district_id FROM user_profiles WHERE id = auth.uid())
  );

-- Repeat for UPDATE, DELETE policies
-- Apply similar scoping to user_profiles, campus, etc.
```

### Subdomain Routing

**Implementation:** See `V2_DISTRICT_SUBDOMAIN_ARCHITECTURE.md` for full details.

**Summary:**
1. Extract subdomain from hostname (`birdville.districttracker.com` → `birdville`)
2. Validate subdomain exists in `districts` table
3. Set district context for session
4. All queries filter by `district_id` automatically via RLS

**Files to create:**
- `middleware.ts`: Subdomain extraction + validation
- `contexts/DistrictContext.tsx`: District state management
- `lib/theme/applyDistrictTheme.ts`: Dynamic theme loader

### Dynamic Theme System

Move hardcoded Birdville blue from `theme.css` to database:

```typescript
// lib/theme/applyDistrictTheme.ts
export async function applyDistrictTheme(districtId: string) {
  // 1. Fetch district theme from Supabase
  const { data: theme } = await supabase
    .from('district_themes')
    .select('accent_tokens, logo_url, version')
    .eq('district_id', districtId)
    .single();

  if (!theme) return; // Fallback to default theme

  // 2. Check localStorage cache
  const cacheKey = `theme:${districtId}:${theme.version}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    injectCSS(JSON.parse(cached));
    return;
  }

  // 3. Build CSS from tokens
  const cssVars = buildCSSVariables(theme.accent_tokens);

  // 4. Inject into <style id="district-theme">
  injectCSS(cssVars);

  // 5. Cache for performance
  localStorage.setItem(cacheKey, JSON.stringify(cssVars));
}

function buildCSSVariables(tokens: any): string {
  return `
    :root {
      --accent-300: hsl(${tokens['300'].hsl.h} ${tokens['300'].hsl.s}% ${tokens['300'].hsl.l}%);
      --accent-400: hsl(${tokens['400'].hsl.h} ${tokens['400'].hsl.s}% ${tokens['400'].hsl.l}%);
      --accent-500: hsl(${tokens['500'].hsl.h} ${tokens['500'].hsl.s}% ${tokens['500'].hsl.l}%);
      --accent-600: hsl(${tokens['600'].hsl.h} ${tokens['600'].hsl.s}% ${tokens['600'].hsl.l}%);
      --accent-700: hsl(${tokens['700'].hsl.h} ${tokens['700'].hsl.s}% ${tokens['700'].hsl.l}%);
    }
  `;
}

function injectCSS(css: string) {
  let style = document.getElementById('district-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'district-theme';
    document.head.appendChild(style);
  }
  style.textContent = css;
}
```

### Application Changes

**CSV Upload:** Auto-tag with user's district_id
```typescript
// app/actions/upload-csv.ts
const userProfile = await supabase
  .from('user_profiles')
  .select('district_id')
  .eq('id', userId)
  .single();

const recordsWithDistrict = csvRecords.map(record => ({
  ...record,
  district_id: userProfile.district_id  // Auto-inject
}));
```

**Dashboard Stats:** Scope to district
```typescript
// app/actions/stats.ts
const { count } = await supabase
  .from('trespass_records')
  .select('*', { count: 'exact', head: true })
  .eq('district_id', userDistrictId)  // Add filter
  .eq('status', 'active');
```

**Search/Filters:** RLS handles scoping automatically, but verify queries

### Security Checklist
- [ ] RLS policies prevent cross-district data access
- [ ] Subdomain validation against whitelist
- [ ] Invalid subdomain redirects to error page
- [ ] User's `district_id` matches subdomain (or redirect)
- [ ] All queries include district filter (or rely on RLS)
- [ ] Audit logs track district context
- [ ] Test data leakage between districts

### Vercel/Cloudflare Configuration
- [ ] Add each district subdomain to Vercel manually
- [ ] Set Cloudflare DNS to "DNS only" (gray cloud)
- [ ] Test SSL provisioning for new subdomains
- [ ] Monitor logs for invalid subdomain attempts

### Migration from v2.0 to v2.1
1. Run database migrations (add columns, tables, backfill)
2. Update RLS policies
3. Deploy subdomain routing code
4. Migrate Birdville theme from hardcoded → database
5. Test with staging subdomain
6. Add production district subdomains one at a time
7. Monitor for issues

---

## v2.2 - Advanced Theming & Customization

**Goal:** Full white-label experience per district.

### Features
- [ ] **Logo Upload System**
  - District logo in header
  - District logo on login page
  - Favicon per district
  - Storage: Supabase Storage organized by `{district_id}/logo.png`

- [ ] **Font Customization**
  - Allow districts to choose web fonts (Google Fonts integration)
  - Store `font_family` in `district_themes` table
  - Inject font via CSS `@import` or `next/font`

- [ ] **Advanced Color Customization**
  - UI for district admins to customize accent colors
  - Color picker with real-time preview
  - Accessibility contrast checker (ensure WCAG AA)
  - Store custom ramps in `district_themes.accent_tokens`

- [ ] **OKLCH Color Space**
  - Migrate from HSL to OKLCH for better color interpolation
  - Add OKLCH fallback with `@supports` detection
  - Dual-stack: HSL for compatibility, OKLCH for modern browsers

- [ ] **Chart Theming**
  - Custom chart colors per district
  - Store in `district_themes.chart_tokens`
  - Apply to future analytics/reporting features

- [ ] **Email Customization**
  - District logo in email templates
  - District accent colors in email styling
  - Custom email footer

### Database Schema Additions
```sql
ALTER TABLE district_themes ADD COLUMN font_family TEXT;
ALTER TABLE district_themes ADD COLUMN favicon_url TEXT;
ALTER TABLE district_themes ADD COLUMN chart_tokens JSONB;
ALTER TABLE district_themes ADD COLUMN email_footer TEXT;
```

---

## v3.0 - Clerk Organizations & Advanced Features

**Goal:** Enterprise-grade multi-tenant with Clerk Organizations.

### Clerk Organizations Migration
- [ ] **Enable Clerk Organizations**
  - Each district becomes a Clerk Organization
  - Users can belong to multiple orgs (consultant use case)
  - Switch orgs → switch district context

- [ ] **Role-Based Access Control (RBAC)**
  - Org-level roles: Owner, Admin, Member, Viewer
  - Fine-grained permissions per role
  - Inherit from Clerk's org membership

- [ ] **Invitations via Clerk**
  - Replace custom email invite system
  - Use Clerk's invitation flow
  - Auto-assign to correct org/district

### Advanced Features
- [ ] **Audit Logs**
  - Track all record modifications
  - Include user, timestamp, district, action
  - Filterable, exportable logs

- [ ] **Multi-District Users**
  - Consultant can access multiple districts
  - Switch between districts via UI
  - Store `allowed_districts` array in profile

- [ ] **Advanced Analytics**
  - District-level dashboards
  - Trend analysis, charts, reports
  - Export to PDF/Excel

- [ ] **Mobile App (iOS/Android)**
  - React Native or Flutter
  - Same Supabase backend
  - Offline support for field use

- [ ] **Public Records Portal**
  - Optional: Public-facing lookup (with restrictions)
  - Search by name (limited info shown)
  - District admins control public visibility

---

## Documentation References

| Document | Purpose |
|----------|---------|
| `PRODUCT_ROADMAP.md` | This file - version planning |
| `V2_DISTRICT_SUBDOMAIN_ARCHITECTURE.md` | Technical spec for multi-tenant routing |
| `THEMING.md` | Design system token reference (created in v2.0) |
| `CLAUDE.md` | Development guidelines for Claude Code |
| `DEPLOYMENT_CHECKLIST.md` | Production deployment steps |

---

## Decision Log

### October 4, 2025 - OKLCH Simplification & Power Button Toggle
**Decision:**
1. Simplified color system from HSL to OKLCH (reduced from 317 to ~100 lines)
2. Moved theme toggle from Settings dialog to power button in header
3. Removed "System" theme mode - just Light/Dark
4. Changed theme persistence from Supabase to localStorage
5. Made dark mode the default
6. Made card view the default (not list)

**Rationale:**
- Simpler code is easier to maintain and modify
- Power button is faster to access than Settings dialog
- OKLCH provides better color consistency across themes
- localStorage is simpler than database for UI preferences
- Dark mode is more popular for dashboard apps
- Card view showcases photos better

**Trade-offs:**
- Lost automatic theme sync across devices (acceptable for MVP)
- Theme preference resets if user clears localStorage (acceptable)
- No "follow OS preference" option (can add back later if requested)

**Approved by:** Product Owner

---

### October 4, 2025 - v2.0 Scope Simplification
**Decision:** Ship Birdville MVP with hardcoded theme first, defer multi-tenant to v2.1.

**Rationale:**
- Faster time to feedback (3-4 hours vs 12-14 hours)
- Validate design system before building complex architecture
- Easier to test and debug single-tenant
- Can migrate to multi-tenant without breaking changes

**Trade-offs:**
- Will require migration work for v2.1
- Some code will be temporary
- Cannot onboard District #2 until v2.1

**Approved by:** Product Owner

---

## Success Metrics

### v2.0 Success Criteria
- [x] Birdville users can switch Light/Dark themes via power button
- [x] All hardcoded colors replaced with OKLCH semantic tokens
- [x] Power button is 44×44px touch-friendly
- [x] Theme persists across sessions via localStorage
- [x] Card view is default with professional shadows
- [ ] Mobile experience tested and smooth
- [ ] No accessibility regressions (contrast, focus rings)
- [ ] Positive feedback from Birdville pilot users

### v2.1 Success Criteria
- [ ] 2+ districts running on production
- [ ] Zero cross-district data leakage (verified via testing)
- [ ] Each district has custom accent color
- [ ] Subdomain routing works reliably
- [ ] Performance acceptable with RLS overhead

### v3.0 Success Criteria
- [ ] 10+ districts on platform
- [ ] Clerk Organizations migration complete
- [ ] Users can belong to multiple orgs
- [ ] Mobile app in beta testing
- [ ] Enterprise customers onboarded

---

**Maintained by:** Product Team
**Review Cadence:** After each version release
