# Changelog

All notable changes to TrespassTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Photo gallery component with lightbox viewer
- Document upload and viewer components
- File upload utilities with validation
- Database migrations for record_photos and record_documents tables
- Storage buckets and RLS policies for secure file access

### Changed
- Enhanced RecordDetailDialog with photo/document tabs
- Responsive search box with flex layout (min-width 150px, expands on desktop)

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
