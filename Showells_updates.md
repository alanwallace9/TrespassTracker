# Showells Updates - Task Tracking

## Overview
Performance and UX improvements for the TrespassTracker application.

---

## Task 1: Image Optimization
**Goal:** Reduce image file sizes using Supabase bucket optimization (static export compatible)

### Current State Analysis:
**Sample Images Analyzed (4 images):**
- **Sizes:** 6KB - 68KB per image
- **Dimensions:** Inconsistent (209px - 506px wide)
- **Format:** JPEG
- **Issues Found:**
  - Inconsistent dimensions across images
  - Eye alignment varies (some cut off at forehead)
  - No standardization

**Optimization Potential:**
- WebP conversion: ~40-50% size reduction
- Standardized dimensions: Better UI consistency
- Smart cropping: Fixes eye visibility issues
- Expected result: 15-25KB per image (from current 6-68KB range)

### Implementation Plan:

#### Phase 1: One-Time Bucket Optimization (Immediate)
- [ ] Set up optimization script using `sharp` library
  - Install sharp as dev dependency
  - Create script to process all bucket images

- [ ] Configure image processing settings
  - Target size: 400×400px (or 300×300px)
  - Crop position: 'top' or 'entropy' (focuses on faces/eyes)
  - Format: WebP @ 75% quality
  - Maintain aspect ratio with cover fit

- [ ] Process existing Supabase bucket images
  - Download all images from bucket
  - Optimize and resize with eye-centered cropping
  - Convert to WebP format
  - Re-upload optimized versions to bucket

- [ ] Verify optimization results
  - Check file size reduction (~50% savings)
  - Verify eye alignment is corrected
  - Test image quality is acceptable

#### Phase 2: Ongoing Upload Optimization (Future)
- [ ] Create Supabase Edge Function for upload processing
  - Trigger on new image uploads
  - Auto-optimize using same settings as Phase 1
  - Store optimized version in bucket

- [ ] Test automated optimization
  - Upload test images
  - Verify automatic processing
  - Check performance impact

### Expected Results:
- **Bandwidth savings:** ~50% reduction
- **Eye alignment:** Standardized and centered
- **Consistency:** All images 400×400px WebP
- **Load time:** Faster page loads

**Status:** Analysis Complete - Ready for Implementation
**Priority:** High

---

## Task 2: Face Positioning for Eye Visibility
**Goal:** Adjust facial images so all eyes are fully visible

**Note:** This will be handled by Task 1's smart cropping with `position: 'top'` during image optimization. No separate implementation needed.

**Status:** Will be completed via Task 1
**Priority:** Medium

---

## Task 2b: Reposition Former Student Badge
**Goal:** Move "Former Student" badge to lower right of card, same row as age

### Current State:
- Badge position needs to be identified in RecordCard component
- Should align with age display for better visual hierarchy

### Implementation Plan:

- [ ] Locate RecordCard component
  - Find current badge positioning
  - Identify age display location

- [ ] Update badge positioning CSS
  - Move badge to lower right corner
  - Align on same row as age
  - Ensure responsive layout (mobile/desktop)
  - Maintain visual balance

- [ ] Test visual layout
  - Verify alignment with age field
  - Check card spacing and padding
  - Test on different screen sizes
  - Ensure badge doesn't overlap other elements

### Important:
- **Non-breaking change:** Only CSS/layout adjustment
- Maintain current functionality
- Preserve accessibility (badge still readable)

**Status:** Not Started
**Priority:** Low (Visual enhancement)

---

## Task 3: Search Debounce Implementation
**Goal:** Debounce search to trigger after 4-5 letters typed (reduces unnecessary re-renders and improves UX)

### Current State Analysis:
**Current Implementation (DashboardClient.tsx):**
- **Search triggers:** Every keystroke (line 61: `onSearchChange={setSearchQuery}`)
- **Filter method:** Client-side filtering with `.filter()` (lines 31-42)
- **Search fields:** first_name, last_name, location
- **Performance impact:** Re-filters entire dataset on every character typed
- **No minimum character requirement:** Searches even with 1 character

**Issues Found:**
- Unnecessary re-renders on every keystroke
- Poor UX for fast typers (constant re-filtering)
- Wasted CPU cycles filtering incomplete queries
- No visual feedback for "too short" queries

**Important Note:** Since data is already loaded client-side, this does NOT reduce Supabase queries or costs. This is purely a **performance and UX improvement** - reduces re-renders and provides smoother typing experience.

### Implementation Plan:

#### Step 1: Create Debounce Hook
- [ ] Create custom `useDebounce` hook or use lodash
  - Delay: 300-400ms (optimal for search UX)
  - Cancel pending debounce on component unmount

```typescript
// hooks/useDebounce.ts
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

#### Step 2: Implement Minimum Character Threshold
- [ ] Update DashboardClient.tsx filtering logic
  - Add check: only filter if `searchQuery.length >= 4` OR `searchQuery.length === 0`
  - Show helper text: "Type at least 4 characters to search"
  - Apply debounce to search state

#### Step 3: Optimize Filter Logic
- [ ] Review current filtering implementation
  - Already using `.toLowerCase()` for case-insensitive search ✓
  - Consider using `.includes()` vs regex performance
  - Add early return for empty search

#### Step 4: Add UI Feedback
- [ ] Update search input with visual indicators
  - Show "Searching..." when debouncing
  - Display character count when < 4 characters
  - Clear button to reset search

### Expected Results:
- **Reduced re-renders:** 70-80% fewer during typing
- **Better UX:** Smooth typing experience, no lag
- **Cleaner results:** Only searches meaningful queries (4+ chars)
- **Performance gain:** Especially noticeable with 100+ records

**Status:** Analysis Complete - Ready for Implementation
**Priority:** High

---

## Task 4: Lazy Loading with Row Prioritization
**Goal:** Lazy load records, prioritizing top 3 rows (desktop) and top 2 rows (mobile) - CRITICAL for Supabase bandwidth/cost savings

### Current State Analysis:
**Current Implementation (page.tsx + DashboardClient.tsx):**
- **Data fetching:** Server-side, ALL records at once (page.tsx:9-12)
  - Uses `.select('*')` - fetches ALL columns (wasteful)
  - No pagination - loads entire dataset
  - No limit on query
- **Rendering:** All filtered records render immediately (DashboardClient.tsx:72-76)
  - Grid: 2 cols (mobile), 3 (md), 4 (lg)
  - No virtualization or lazy loading
  - All images load at once

**Current Bandwidth Usage (per page load):**
- If 100 records × 30KB average per record = **~3MB per load**
- All images load immediately (no lazy loading)
- Fetches all columns even if not displayed

**Cost Impact:**
- Supabase pricing: Based on database size + bandwidth
- Current approach: Maximum bandwidth usage on every page load
- With 100+ records: Significant unnecessary data transfer

### Supabase Best Practices for Cost Optimization:

#### 1. Select Only Needed Columns (HIGH IMPACT)
```typescript
// ❌ Current (wasteful)
.select('*')

// ✅ Optimized (select only displayed fields)
.select('id, first_name, last_name, photo_url, status, expiration_date, location')
```
**Savings:** ~30-50% bandwidth reduction

#### 2. Implement Pagination (HIGH IMPACT)
```typescript
// Initial load: only first 8-12 records (2-3 rows)
.select('...')
.range(0, 11)  // First 12 records
.order('incident_date', { ascending: false })
```
**Savings:** ~90% bandwidth on initial load (12 vs 100+ records)

#### 3. Use Cursor-Based Loading for Infinite Scroll
```typescript
// Load more with cursor
.select('...')
.range(currentCount, currentCount + 11)
```

#### 4. Lazy Load Images (MEDIUM IMPACT)
```html
<img src={photo_url} loading="lazy" alt="..." />
```
**Savings:** Images only load when visible

### Implementation Plan:

#### Phase 1: Optimize Data Fetching (Supabase Level)
- [ ] Update query to select only needed columns
  - Modify page.tsx query (line 9-12)
  - Remove `select('*')`, specify exact fields
  - Estimated savings: 30-50% per record

- [ ] Implement pagination/range queries
  - Calculate items per row: 2 mobile, 3 tablet, 4 desktop
  - Initial load: 8 records (2 rows mobile) or 12 records (3 rows desktop)
  - Use `.range(0, 11)` for first batch

- [ ] Add "Load More" functionality
  - Button or infinite scroll trigger
  - Fetch next batch: `.range(12, 23)`, etc.
  - Append to existing records

#### Phase 2: Implement Client-Side Lazy Loading
- [ ] Add Intersection Observer for image lazy loading
  - Native `loading="lazy"` attribute
  - Or use Intersection Observer API for more control
  - Load images only when in viewport

- [ ] Calculate responsive row counts
  - Mobile (< 768px): 2 items per row → load 6 items (3 rows initially)
  - Tablet (768-1024px): 3 items per row → load 9 items
  - Desktop (> 1024px): 4 items per row → load 12 items
  - Use matchMedia or Tailwind breakpoints

- [ ] Implement virtual scrolling (optional, for 100+ records)
  - Evaluate: `react-window` or `@tanstack/react-virtual`
  - Renders only visible rows (5-10 at a time)
  - Massive performance boost for large datasets

#### Phase 3: UI/UX Enhancements
- [ ] Add loading states
  - Skeleton loaders for initial load
  - "Loading more..." indicator for pagination
  - Smooth transitions

- [ ] Handle edge cases
  - Empty states
  - End of list indicator
  - Error states for failed loads

#### Phase 4: Advanced Optimization (Future)
- [ ] Implement client-side caching
  - Cache fetched records in React Query or SWR
  - Reduce re-fetching on navigation
  - Set appropriate stale times

- [ ] Consider Supabase Realtime subscriptions (optional)
  - Subscribe only to visible records
  - Update UI when records change
  - Manage subscription lifecycle

### Expected Results:

**Bandwidth Savings:**
- Initial load: **~90% reduction** (12 records vs 100+)
- Column optimization: **~40% reduction per record**
- Combined savings: **~95% total bandwidth reduction**

**Performance Improvements:**
- Initial page load: **3-5x faster**
- Memory usage: **80% reduction** (virtualization)
- Smoother scrolling: 60fps maintained

**Cost Impact:**
- With 1000 page loads/month:
  - Before: ~3GB bandwidth
  - After: ~150MB bandwidth
  - **Savings: ~95% reduction in Supabase egress costs**

### Recommended Approach:

**Quick Win (1-2 hours):**
1. Update query to select specific columns (not `*`)
2. Add `.range(0, 11)` for pagination
3. Add native `loading="lazy"` to images

**Full Implementation (4-6 hours):**
1. Implement pagination with "Load More"
2. Add Intersection Observer for scroll-based loading
3. Responsive row calculation
4. Loading states and skeletons

**Advanced (optional):**
1. Virtual scrolling with react-window
2. React Query for caching
3. Supabase Realtime subscriptions

**Status:** Analysis Complete - Ready for Implementation
**Priority:** High (Critical for cost optimization)

---

## Notes

### General Guidelines
- **NON-BREAKING CHANGES ONLY:** All implementations must preserve existing functionality
- Current code is working - only add improvements, don't modify core logic
- All tasks should maintain compatibility with static export (`output: 'export'`)
- Run `npm run typecheck` before committing changes
- Test on both desktop and mobile viewports thoroughly
- Consider accessibility implications for all changes
- Test existing features after each change to ensure nothing breaks

### Supabase Cost Optimization Best Practices
**Applied across all tasks:**

1. **Select Specific Columns** (not `SELECT *`)
   - Only fetch fields you display
   - Reduces bandwidth by 30-50%
   - Example: `.select('id, first_name, last_name, photo_url')`

2. **Implement Pagination**
   - Use `.range(start, end)` for batched loading
   - Reduces initial load by ~90%
   - Example: `.range(0, 11)` for first 12 records

3. **Lazy Load Images**
   - Use `loading="lazy"` attribute
   - Images load only when visible
   - Saves bandwidth and improves performance

4. **Client-Side Filtering** (when dataset is small)
   - Filter/search locally when possible
   - Avoid unnecessary Supabase queries
   - Debounce to reduce re-renders

5. **Cache Results** (future enhancement)
   - Use React Query or SWR
   - Reduce duplicate fetches
   - Set appropriate stale times

6. **Index Your Queries**
   - Ensure database indexes on frequently queried columns
   - Speeds up queries, reduces compute costs
   - Check: `first_name`, `last_name`, `status`, `incident_date`

### Expected Overall Impact
- **Bandwidth reduction:** ~95% (from ~3MB to ~150KB per load)
- **Cost savings:** ~90-95% reduction in Supabase egress
- **Performance:** 3-5x faster initial page load
- **User experience:** Smoother, more responsive UI

## Progress Summary
- [x] Task 1: Image Optimization - Analysis Complete
- [ ] Task 2: Face Positioning - Covered by Task 1 (smart cropping)
- [ ] Task 2b: Former Student Badge Repositioning - Added
- [x] Task 3: Search Debounce - Analysis Complete (UX only, no Supabase savings)
- [x] Task 4: Lazy Loading - Analysis Complete (CRITICAL for cost savings)

**Last Updated:** 2025-10-09 (All analyses completed, badge task added)
