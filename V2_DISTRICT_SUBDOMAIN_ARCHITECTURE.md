# V2: District Subdomain Handling Architecture

> **Status:** Deferred to V2.1 (post-Birdville MVP)
> **Purpose:** Multi-district support via subdomains (e.g., birdville.districttracker.com, desoto.districttracker.com)
> **Current Version:** V2.0 is single-tenant (Birdville only) with hardcoded theme

## Overview

Single codebase with subdomain-based district isolation using Supabase RLS for data security.

## Architecture

### Subdomain as District Identifier
- Each district gets a subdomain: `keller.districttracker.com`, `dallas.districttracker.com`, etc.
- Single Next.js codebase serves all districts
- Supabase RLS enforces data isolation between districts
- No redirects to www in Vercel

## Implementation Requirements

### 1. Extract Subdomain from Request

Parse hostname to get subdomain (first part before first dot):

```typescript
// Example: middleware.ts or app layout
function getSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');

  // Handle edge cases
  if (parts.length < 3) return null; // root domain
  if (parts[0] === 'www') return null; // www subdomain
  if (parts[0] === 'staging') return 'staging'; // allow staging

  return parts[0]; // district subdomain
}
```

**Edge cases to handle:**
- `www.districttracker.com` → redirect to root or district selector
- `districttracker.com` → show district selector or landing page
- `staging.districttracker.com` → allow (for testing)
- `keller.districttracker.com` → validate and load district

### 2. Validate District Exists

Check subdomain against valid districts in Supabase:

```sql
SELECT id FROM districts
WHERE subdomain = $subdomain
AND active = true
```

**Database schema addition:**
```sql
-- Add districts table
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add district_id to user_profiles
ALTER TABLE user_profiles
ADD COLUMN district_id UUID REFERENCES districts(id);

-- Add district_id to trespass_records
ALTER TABLE trespass_records
ADD COLUMN district_id UUID REFERENCES districts(id);
```

### 3. Fallback for Invalid/Mistyped Subdomains

**Decision tree:**
- Subdomain doesn't exist in database → redirect to main site or show "District not found" page
- No subdomain (root domain) → show district selector or landing page
- `www` → redirect to root domain or district selector
- `staging` → allow (for testing)

```typescript
// Example fallback logic
async function handleSubdomain(subdomain: string | null) {
  if (!subdomain) {
    return redirect('/district-selector');
  }

  if (subdomain === 'staging') {
    // Allow staging environment
    return { districtId: null, isStaging: true };
  }

  const district = await validateDistrict(subdomain);

  if (!district) {
    return redirect('/district-not-found');
  }

  return { districtId: district.id, isStaging: false };
}
```

### 4. Set District Context

Store validated district_id in session/context:

```typescript
// Example: contexts/DistrictContext.tsx
'use client';

import { createContext, useContext } from 'react';

interface DistrictContextType {
  districtId: string;
  districtName: string;
  subdomain: string;
}

const DistrictContext = createContext<DistrictContextType | null>(null);

export function useDistrict() {
  const context = useContext(DistrictContext);
  if (!context) throw new Error('useDistrict must be used within DistrictProvider');
  return context;
}
```

Use in all Supabase queries with RLS policies.

### 5. Supabase RLS Policies

Every table with district data has `district_id` column.

**RLS policies enforce district isolation:**

```sql
-- Example RLS for trespass_records
CREATE POLICY "Users can only view records from their district"
  ON trespass_records
  FOR SELECT
  TO authenticated
  USING (
    district_id = (auth.jwt() -> 'district_id')::UUID
  );

CREATE POLICY "Admins can create records in their district"
  ON trespass_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    district_id = (auth.jwt() -> 'district_id')::UUID
    AND get_my_role_from_db() IN ('campus_admin', 'district_admin', 'master_admin')
  );
```

**Key principle:** Users cannot access data from other districts.

## Vercel Configuration

### Domain Setup
- **Do NOT redirect to www**
- Each district subdomain added manually to Vercel domains:
  - `keller.districttracker.com`
  - `dallas.districttracker.com`
  - `staging.districttracker.com`
  - etc.

### Steps:
1. Vercel Project Settings → Domains
2. Add each subdomain individually
3. Connect to appropriate branch (main for production, staging for testing)

## Cloudflare Configuration

### DNS Records
- **Set to "DNS only" (gray cloud)** for district subdomains
- Let Vercel handle SSL/CDN for subdomains
- Cloudflare proxy can interfere with Vercel's edge routing

### Wildcard CNAME (Optional)
- Can set up `*.districttracker.com` → `cname.vercel-dns.com`
- **Requires validation in code** - always check district exists
- Still need to add each subdomain in Vercel manually

Example DNS records:
```
Type    Name       Target                  Proxy Status
CNAME   keller     cname.vercel-dns.com    DNS only (gray)
CNAME   dallas     cname.vercel-dns.com    DNS only (gray)
CNAME   staging    cname.vercel-dns.com    Proxied (orange)
```

## Security Notes

### Critical Security Measures

1. **Always validate district exists** before allowing access
2. **Log invalid subdomain attempts** for monitoring:
   ```typescript
   // Log suspicious activity
   if (!validDistrict) {
     console.warn('[Security] Invalid subdomain attempt:', {
       subdomain,
       ip: request.ip,
       timestamp: new Date().toISOString()
     });
   }
   ```
3. **RLS policies are mandatory** - never trust client-side district context
4. **JWT must include district_id** - Clerk metadata or Supabase auth.users
5. **Test cross-district data leakage** before production

### Clerk Integration
Update Clerk webhook to assign `district_id` to user metadata:

```typescript
// app/api/webhooks/clerk/route.ts
// Add district_id to user profile on creation
await supabase
  .from('user_profiles')
  .insert({
    id: clerkUserId,
    email: user.emailAddresses[0].emailAddress,
    role: 'viewer',
    district_id: getDistrictIdFromEmail(user.emailAddresses[0].emailAddress)
  });
```

## Migration Path from V2.0 to V2.1

**Prerequisites:** V2.0 Birdville MVP complete with clean theme system

1. **Add districts table** and seed with Birdville as first district
2. **Add district_id columns** to all relevant tables (user_profiles, trespass_records)
3. **Backfill existing data** with Birdville district_id
4. **Update RLS policies** to include district checks
5. **Move Birdville theme** from hardcoded globals.css to district_themes table
6. **Create dynamic theme loader** (lib/theme/applyDistrictTheme.ts)
7. **Add subdomain detection** to middleware/layout
8. **Test thoroughly** with multiple test subdomains
9. **Configure Cloudflare DNS** for first production district
10. **Add Vercel domains** one district at a time
11. **Monitor logs** for invalid subdomain attempts

**Detailed migration steps:** See PRODUCT_ROADMAP.md v2.1 section

## Testing Checklist

- [ ] User from District A cannot view District B data
- [ ] Invalid subdomain shows appropriate error page
- [ ] Root domain shows district selector
- [ ] Staging subdomain works for testing
- [ ] www redirects correctly
- [ ] RLS policies prevent data leakage
- [ ] Logs capture invalid subdomain attempts
- [ ] SSL certificates provision correctly for new subdomains
- [ ] Performance is acceptable with RLS overhead

---

**Created:** October 3, 2025
**For:** TrespassTracker V2
**Related Migration:** `bolt-mvp-migration-guide.md` (current MVP work)
