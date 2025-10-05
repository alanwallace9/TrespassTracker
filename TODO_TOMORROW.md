# TODO List - October 5, 2025

> **Session:** Morning/Next Work Session
> **Focus:** Testing, Color Adjustments, and Deployment Prep

---

## High Priority

### 1. Color Theme Refinements
- [ ] Review COLOR_REFERENCE.md and identify color inconsistencies
- [ ] Test light theme on actual devices (mobile, tablet, desktop)
- [ ] Test dark theme on actual devices
- [ ] Adjust colors based on visual testing:
  - [ ] Check if card backgrounds have enough contrast from page background
  - [ ] Verify text readability in both themes
  - [ ] Review border visibility (especially `border-muted`)
  - [ ] Check dropdown/popover backgrounds
- [ ] Update `globals.css` with any color adjustments needed
- [ ] Document color changes in COLOR_REFERENCE.md

### 2. Google Form Setup
- [ ] Create Google Form for user feedback
- [ ] Configure form fields:
  - [ ] What do you like?
  - [ ] What needs improvement?
  - [ ] Any bugs/errors found?
  - [ ] General comments
  - [ ] Optional: Email for follow-up
- [ ] Get shareable link
- [ ] Update DashboardLayout.tsx line 258 with real Google Form URL

### 3. Mobile Testing
- [ ] Test power button toggle on mobile devices
- [ ] Verify card hover effects work on touch devices
- [ ] Check dropdown menu usability on mobile
- [ ] Verify all touch targets are ≥44x44px
- [ ] Test theme persistence across page refreshes

### 4. RecordCard Polish (Optional)
- [ ] Review hover animation speed (currently 300ms) - adjust if needed
- [ ] Test card separator visibility in both themes
- [ ] Consider adding subtle hover effect on image section
- [ ] Review card spacing/gaps in grid layout

---

## Medium Priority

### 5. Changelog Implementation Planning
- [ ] Decide on changelog data structure:
  - Track: created_at, created_by, updated_at, updated_by
  - Store: who added/edited/deleted records
  - Format: timestamp + user + action + record details
- [ ] Design changelog modal UI mockup
- [ ] Determine if changelog should be:
  - [ ] Per-record (in RecordDetailDialog)
  - [ ] Global (all changes in one place)
  - [ ] Both options
- [ ] Plan Supabase schema for audit logs (for future implementation)

### 6. QA Testing
- [ ] Take screenshots of light mode:
  - [ ] Dashboard with cards
  - [ ] Dashboard with list view
  - [ ] Record detail modal
  - [ ] Add record modal
  - [ ] Settings dialog
  - [ ] User dropdown menu
- [ ] Take screenshots of dark mode (same views)
- [ ] Create comparison document showing light vs dark
- [ ] Test all CRUD operations:
  - [ ] Create record
  - [ ] View record
  - [ ] Edit record
  - [ ] Delete record
  - [ ] CSV upload
- [ ] Test user management (admin only)
- [ ] Test search functionality
- [ ] Test status filters (active/inactive/all)

### 7. Code Cleanup
- [ ] Review and clean up console.log statements
- [ ] Check for unused imports
- [ ] Run `npm run typecheck` to catch TypeScript errors
- [ ] Review eslint warnings (if any)
- [ ] Add comments to complex logic sections

---

## Low Priority (Nice to Have)

### 8. Documentation Updates
- [ ] Update CLAUDE.md with new color system notes
- [ ] Add note about localStorage theme persistence
- [ ] Document the alphabetical sorting feature
- [ ] Update deployment checklist if needed

### 9. Performance Review
- [ ] Check page load times
- [ ] Review image optimization (if any photos uploaded)
- [ ] Consider lazy loading for large record lists
- [ ] Test with 50+ records to see grid performance

### 10. Accessibility Audit
- [ ] Run axe DevTools or Lighthouse accessibility check
- [ ] Verify all interactive elements have proper labels
- [ ] Test keyboard navigation through all modals
- [ ] Check color contrast ratios with WebAIM tool
- [ ] Verify screen reader compatibility

---

## Deployment Prep (When Ready)

### 11. Pre-Deployment Checklist
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No critical console errors
- [ ] Environment variables configured
- [ ] Google Form URL updated
- [ ] Screenshots taken for documentation

### 12. Git Commit
- [ ] Review all changed files
- [ ] Stage changes to staging branch
- [ ] Write comprehensive commit message:
  - Theme system overhaul (OKLCH)
  - Power button toggle
  - Card improvements
  - Alphabetical sorting
  - Menu reorganization
  - Color reference docs
- [ ] Push to staging branch

### 13. Deployment
- [ ] Deploy to Vercel staging environment
- [ ] Test staging deployment
- [ ] Share staging URL with stakeholders for review
- [ ] Collect feedback before production deployment

---

## Questions to Answer

1. **Color Adjustments:** Which specific colors need adjustment after visual testing?
2. **Changelog Scope:** Should changelog track all changes or just recent ones?
3. **Feedback Form:** Any specific questions beyond the standard ones?
4. **Card Animations:** Is the hover effect too subtle or too dramatic?
5. **Border Separator:** Is the 2px border between image/text visible enough?

---

## Session Goals Summary

**Morning Session Goals:**
- Complete color theme testing and refinements
- Set up Google Form and update link
- Take QA screenshots (light/dark modes)
- Run basic functionality tests

**Stretch Goals:**
- Begin changelog implementation planning
- Run accessibility audit
- Prepare for staging deployment

---

## Notes from Previous Session (October 4, Evening)

**Completed:**
- ✅ Power button theme toggle
- ✅ Simplified OKLCH color system
- ✅ Card hover effects and separator
- ✅ Alphabetical sorting by last name
- ✅ Dropdown menu reorganization
- ✅ COLOR_REFERENCE.md documentation

**Known Issues:**
- Google Form URL is placeholder
- Changelog is placeholder (console.log only)
- Some color combinations may need adjustment after testing

**User Preferences:**
- Default to dark mode
- Default to card view
- Theme persists in localStorage

---

**Last Updated:** October 4, 2025 (End of Day)
**Next Review:** October 5, 2025 (Morning Session)
