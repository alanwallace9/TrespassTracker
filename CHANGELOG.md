# Changelog

All notable changes to TrespassTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (2025-11-09)
- **Secure Tenant Switching for Master Admins (Phase 1)**:
  - Database-backed tenant switching with `active_tenant_id` column in user_profiles
  - Server action `switchActiveTenant()` with master_admin validation
  - Complete FERPA-compliant audit trail for all tenant switches
  - Updated `get_my_tenant_id()` RLS function to prioritize active_tenant_id
  - AdminTenantContext now uses database as source of truth (removed localStorage)
  - Optimistic UI updates with error handling and rollback
  - New audit event type: `tenant.switched`
  - Commit: d0ce87b - feat: implement secure database-backed tenant switching
- **Tenants Management Page (Phase 2)**:
  - Full CRUD operations for tenant management (create, update, activate/deactivate)
  - Tenants admin page at `/admin/tenants` with table view and search
  - Server actions: `createTenant()`, `updateTenant()`, `deactivateTenant()`, `reactivateTenant()`
  - Subdomain validation (lowercase alphanumeric and hyphens only)
  - Duplicate subdomain and tenant ID detection
  - Create and edit dialogs with form validation
  - Status toggle buttons for activating/deactivating tenants
  - Sortable columns (display name, subdomain, ID, status, created date)
  - Master admin-only access with role-based navigation filtering
  - Comprehensive audit logging for all tenant operations
  - Display full subdomain URLs (e.g., "greenville.districttracker.com")

### Security (2025-11-09)
- **Comprehensive Security Enhancements**:
  - **Input Validation**: Added Zod validation schemas for all user inputs
    - Email format validation, phone number validation (10 digits)
    - ZIP code validation, date format validation
    - String length limits to prevent buffer overflow attacks
    - Prevents SQL injection and malformed data
  - **Content Security Policy (CSP)**: Added comprehensive security headers
    - Prevents XSS (Cross-Site Scripting) attacks
    - Blocks unauthorized resource loading
    - Clickjacking protection (X-Frame-Options: DENY)
    - MIME-type sniffing protection
    - Enforces HTTPS connections
  - **Rate Limiting**: Implemented request throttling (production-ready)
    - Feedback submissions: 10 requests/minute per user
    - Comments: 10 requests/minute per user
    - Webhooks: 100 requests/minute per IP
    - Protects against spam, brute force, and DoS attacks
  - **Webhook Security**: Enhanced Clerk webhook validation
    - Role whitelist validation
    - Database verification for tenant_id and campus_id
    - Prevents unauthorized user creation and privilege escalation
  - **Data Storage**: Migrated from localStorage to sessionStorage
    - Reduces PII exposure window
    - Auto-cleanup on successful submission
    - 10-minute expiration for pending data

### Added (2025-11-09)
- **Feedback System - Authentication UX Improvements**:
  - Hidden Name, Email, and Terms checkbox fields for authenticated users
  - Streamlined feedback submission form for logged-in users
  - Implicit terms agreement for authenticated users (agreed during initial signup)
  - Conditional validation logic based on authentication state
  - Enhanced user experience with cleaner form layout
- **Feedback System - Visual Consistency**:
  - Changelog page color scheme updated to match feedback system standards
  - Standardized border colors (#828282) across all feedback components
  - White backgrounds for filters, cards, and content areas
  - Blue theme for buttons and call-to-action sections
  - Consistent hover states and transitions
  - Improved visual hierarchy and readability

### Added
- **Public Feedback System (Feedbear-style)**:
  - Two-panel layout with form on left (380px), list on right
  - Separate pages for feature requests (`/feedback/features`) and bug reports (`/feedback/bugs`)
  - Top navigation bar with DistrictTracker logo, dropdown menu, and auth button
  - Blue gradient hero sections on feedback pages
  - Upvoting system with optimistic UI updates
  - Filter dropdowns with icons (TrendingUp, colored status dots)
  - Sort by: Trending, Most votes, Recent
  - Status filters with color-coded badges (Purple, Blue, Yellow, Green, Red)
  - View filters: All, My ideas, Voted for
  - Roadmap page with 3-column layout (Planned | In Progress | Done)
  - Changelog page grouped by month
  - Admin feedback management panel with full CRUD operations
  - Service role authentication for admin panel access
- **Feedback System - Individual Post Pages (2025-11-09)**:
  - New URL structure: `/boards/[type]/post/[slug]` (e.g., `/boards/feature-request/post/test-this-app`)
  - FeedBear-inspired layout with vote counter on LEFT, content flowing RIGHT
  - Blue vote counter styling (bg-blue-50, border-blue-200, text-blue-900)
  - Vote counter displays as card element with count and "vote/votes" label
  - Removed breadcrumbs from individual feedback pages for cleaner UI
  - Right sidebar simplified to Share section only (removed voter list/avatars)
  - Sticky sidebar behavior for better UX on scroll
  - Admin response and roadmap notes sections display full-width below content
- **Enhanced Social Sharing (2025-11-09)**:
  - Open Graph metadata for rich social media previews (Facebook, LinkedIn, Twitter)
  - Twitter sharing with pre-filled text mentioning @DistrictTracker
  - LinkedIn sharing with title and summary using official shareArticle API
  - Facebook sharing using official sharer.php with Open Graph preview
  - Email sharing with pre-filled subject and detailed body text
  - Copy link functionality with visual confirmation
  - All share dialogs open in popup windows (626x436px)
- **Comments System (2025-11-09)**:
  - Created `feedback_comments` database table with full audit trail
  - Comment submission form with 5000 character limit and counter
  - Login requirement - redirects to `/login` if user not authenticated
  - Real-time comment display with formatted timestamps (e.g., "2 hours ago")
  - User attribution with display name, role, and organization
  - Server actions: `createFeedbackComment`, `getFeedbackComments`
  - RLS policies adapted for Clerk authentication (using service role for user lookups)
  - Empty state message: "No comments yet. Be the first to share your thoughts!"
  - Placeholder for future image attachment support in comments
- **Enhanced User Role Display (2025-11-09)**:
  - Campus admins display as "Campus Admin • [Campus Name]" (e.g., "Campus Admin • Birdville ES")
  - District admins display as "District Admin • [District Name]" (e.g., "District Admin • Birdville ISD")
  - Master admins display as "District Admin • [District Name]" for consistency
  - Updated `getFeedbackComments` to fetch tenant and campus names via JOIN queries
  - Updated `getFeedbackBySlug` to include tenant/campus data for feedback authors
  - Consistent role formatting across feedback posts, comments, and all views
- **Feedback System - Roadmap Redesign (Phase 4 - IN PROGRESS)**:
  - Integrated upvote button into card border (left side, blue styling)
  - Image attachment support with drag-and-drop upload
  - Supabase Storage integration for feedback images
  - Facebook share button added to social sharing options
  - Enhanced Clerk auth flow for feedback-only users (TODO)
  - Email verification and password setup for new feedback users (TODO)
  - Tenant isolation preventing feedback users from accessing tenant dashboards (TODO)
- **Admin Panel Styling Enhancements**:
  - Consistent #F9FAFB background across all admin pages
  - White rounded boxes with slate borders
  - Standardized button hover states (slate-100 background, slate-900 text)
  - Drag-and-drop CSV upload for bulk user and feedback imports
  - Compact modals without unnecessary scrolling
- **Master Admin Tenant Isolation & User Management**:
  - Tenant-aware user invitation system for master_admin
  - Master admin can use tenant selector when inviting single users
  - Bulk CSV upload now supports `tenant_id` column for master_admin
  - Master admin users visible across all tenants in user list (OR query)
  - Tenant validation ensures only active tenants can be specified
  - Admin getCampuses() function with tenant parameter support
- Photo gallery component with lightbox viewer
- Document upload and viewer components
- File upload utilities with validation
- Database migrations for record_photos and record_documents tables
- Storage buckets and RLS policies for secure file access

### Changed
- **Feedback UI Enhancements**:
  - Form contact section (Name, Email, Terms) now has grey background box
  - All input fields have white backgrounds (#FFFFFF) and grey borders (#CBCFD4)
  - Navigation dropdown shows current page ("Bug Reports" vs "Feature Requests")
  - Status filter text remains black, only dots are colored
  - Filter dropdown modals have white backgrounds
  - Page background updated to #f9fafb
- Enhanced RecordDetailDialog with photo/document tabs
- Responsive search box with flex layout (min-width 150px, expands on desktop)
- **User Invitation Security Model**:
  - District/campus admins: Strict subdomain-based tenant isolation (existing security)
  - Master admin: Flexible tenant specification via selector or CSV column
  - InviteUserDialog now uses admin getCampuses() instead of RLS version
  - BulkUserUploadDialog template includes tenant_id column and documentation
  - CSV template updated: `email,role,campus_id,tenant_id`

### Fixed
- **InviteUserDialog Context Error**: Added `useAdminTenantOptional()` hook to support InviteUserDialog usage in both admin panel (with tenant selector) and regular dashboard (without AdminTenantProvider)
- **AddRecordDialog Select Error**: Fixed empty string value in campus Select.Item that caused runtime error; changed to use "none" placeholder value that converts to null on submission

### Security
- Enhanced tenant isolation with master_admin flexibility while maintaining strict security for non-master roles
- Subdomain-based tenant detection enforced for district_admin and campus_admin
- Validation ensures master_admin can only invite to existing, active tenants
- Audit logs capture tenant_id for all user invitations
- Master admin visibility improvements prevent cross-tenant data leakage

## [1.10.0] - 2025-11-02

### Added
- **DAEP (Disciplinary Alternative Education Program) Tracking**:
  - Added `is_daep` boolean and `daep_expiration_date` fields to trespass_records
  - DAEP checkbox and expiration date picker in record forms
  - Automatic expiration trigger to uncheck expired DAEP assignments
  - DAEP students maintain their home campus while also being counted for DAEP campus (006)
  - Special campus counting logic: DAEP campus shows all students where is_daep = true
- **Campus Management Enhancements (Phase 4 Complete)**:
  - Clickable record rows in campus modal that open RecordDetailDialog
  - Pagination for both users and records modals (50 items per page)
  - FERPA warning banner in records modal highlighting protected data
  - Export buttons (Excel, PDF) positioned correctly in records modal
  - Empty state messages for campuses with no users or records
  - Improved loading states with spinners
- **Master Admin Features (Phase 5)**:
  - Tenant selector dropdown in admin header for viewing multiple districts
  - Tenant selection persisted to localStorage
  - Building icon next to tenant selector for visual clarity
  - Server actions for listing and fetching tenants

### Changed
- Updated `get_campuses_with_counts` SQL function to handle DAEP dual-counting
- Campus records query now has special case for DAEP campus (006) to show all DAEP students
- Record forms now support DAEP fields in creation and updates
- CSV upload supports DAEP fields
- Campus modals now display paginated data instead of showing all items at once

### Fixed
- Resolved SQL function ambiguous column reference errors by qualifying all table columns
- Fixed Select.Item empty value error by using placeholder value pattern
- Fixed React hydration mismatch for theme attribute with suppressHydrationWarning
- Corrected RecordDetailDialog import to use named export instead of default export

## [1.9.0] - 2025-11-01

### Added
- **Admin Console** with dedicated panel for master_admin users
- **FERPA-Compliant Audit Trail** tracking all record access and modifications
- **Reports System** with six pre-built report types:
  - FERPA Access Report (who viewed which records)
  - User Activity Summary
  - Record Access Frequency with anomaly detection
  - Campus Activity Report with campus filtering
  - Modification History with before/after change tracking
  - Custom Report builder with advanced filters
- **Report Preview Modal** - preview data before choosing export format (CSV or PDF)
- **Quick Lookup Feature** - autocomplete search for instant record access history
- **Anomaly Detection** - automatic flagging of unusual access patterns:
  - High frequency access alerts
  - Multiple user access warnings
  - After-hours access detection (before 6am or after 10pm)
- **Enhanced User Management**:
  - Bulk CSV user invite with automatic Clerk integration
  - Last login tracking via Clerk API
  - User search and filtering
  - User details modal with campus and role information
- **Campus Management Enhancements**:
  - Campus search functionality
  - User count per campus with drill-down modal
  - Record count per campus with drill-down modal
  - Removed abbreviation column for cleaner UI
- **Audit Log Enhancements**:
  - Added `record_school_id` field to capture actual student IDs
  - Added `record_subject_name` for searchable student names
  - Added `tenant_id` for multi-tenant filtering
  - Full-text search with GIN indexes using pg_trgm extension
  - Advanced filtering by user, event type, date range, and campus
  - Export capabilities (CSV, Excel, PDF)
  - Pagination with configurable page sizes
- **Admin Overview Dashboard**:
  - Real-time stats for users, campuses, and records
  - Tenant-scoped data with proper RLS bypass

### Changed
- Audit logging now captures complete student information including school_id
- Record actions (create, update, delete, view) now automatically log to audit trail
- Reports display actual student IDs instead of internal UUIDs
- Modification history shows formatted before/after changes
- Campus Activity Report requires campus selection for targeted reporting
- Admin layout with tabbed navigation (Overview, Users, Campuses, Audit Logs, Reports)
- Scroll-to-top behavior when selecting report types for better UX

### Security
- Enhanced FERPA compliance with comprehensive access tracking
- All record views are now logged for compliance auditing
- Audit logs include detailed change tracking for record modifications
- Tenant isolation enforced across all admin operations

## [1.8.1] - 2025-10-15

### Fixed
- Fixed search debounce performance issue
- Corrected redirect behavior after login
- Fixed session timing issues with Clerk authentication

### Changed
- Added database indexes for improved query performance
- Organized documentation structure

## [1.8.0] - 2025-10-14

### Added
- Admin audit logging system for compliance tracking
- Changelog viewer for district and master admins
- User activity tracking across critical operations

### Security
- Fixed critical auth security issue with role-based access control
- Enhanced RLS policies for user_profiles table

## [1.7.0] - 2025-10-10

### Added
- CSV bulk upload functionality
- Data validation and error reporting for imports
- Template download for CSV uploads

### Changed
- Optimized dashboard rendering performance
- Improved record filtering logic

## [1.6.0] - 2025-10-05

### Added
- Advanced search with debounce (300ms delay)
- Status filter dropdown (All, Active, Inactive)
- Card/List view toggle for records display

### Changed
- Refactored DashboardLayout for better prop management
- Improved mobile responsiveness for filters

## [1.5.0] - 2025-09-28

### Added
- Settings dialog for user preferences
- Display name customization
- Theme persistence to localStorage

### Changed
- Enhanced user dropdown menu with stats display
- Improved theme toggle with power button icon

## [1.4.0] - 2025-09-20

### Added
- Record detail dialog with full CRUD operations
- Edit existing trespass records
- Delete records with confirmation
- Status toggle (Active/Inactive)

### Changed
- Improved form validation for record creation
- Enhanced date picker UX

## [1.3.0] - 2025-09-12

### Added
- Add new trespass record functionality
- Form validation for required fields
- Date picker for incident dates
- Auto-calculation of expiration dates

### Changed
- Standardized dialog components using shadcn/ui
- Improved error handling and user feedback

## [1.2.0] - 2025-09-05

### Added
- User role management (viewer, district_admin, master_admin)
- Role-based UI element visibility
- Invite user functionality for admins
- User profiles with Supabase integration

### Security
- Implemented Row Level Security (RLS) policies
- Role-based data access controls

## [1.1.0] - 2025-08-25

### Added
- Dashboard with trespass records table
- Real-time stats display (Total, Active, Inactive)
- Record filtering by status
- Responsive card layout for mobile

### Changed
- Migrated to Next.js App Router (13.5)
- Implemented static export configuration
- Optimized image handling for static hosting

## [1.0.0] - 2025-08-15

### Added
- Initial project setup with Next.js 13.5
- Supabase authentication integration
- AuthContext for client-side auth state
- Login page with email/password authentication
- Basic dashboard layout with header
- Theme toggle (dark/light mode)
- Responsive design with Tailwind CSS
- shadcn/ui component library integration
- Database schema for trespass_records table
- Environment configuration for Supabase

### Infrastructure
- TypeScript configuration
- ESLint and code quality tools
- Build and deployment scripts
- Git repository initialization

---

## Version Numbering Guide

**X.Y.Z** (Major.Minor.Patch)

- **Major (X)**: Breaking changes, major architecture changes, database schema overhauls
- **Minor (Y)**: New features, new components, significant enhancements (backwards-compatible)
- **Patch (Z)**: Bug fixes, UI tweaks, performance improvements, documentation updates

### Examples:
- Add photo gallery → **Minor** version bump (1.8.0 → 1.9.0)
- Fix search box width → **Patch** version bump (1.8.0 → 1.8.1)
- Migrate from Supabase to different auth → **Major** version bump (1.8.0 → 2.0.0)
